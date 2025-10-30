const BIN_ID = '6902aa91ae596e708f36b5f7';
const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

/** READ */
async function readData() {
  try {
    const res = await fetch(`${BASE_URL}/latest`, {
      headers: {
        'X-Access-Key': MASTER_KEY
      }
    });

    const json = await res.json();

    return {
      status: res.status,
      ok: res.ok,
      full: json,
      record: json.record || null
    };
  } catch (err) {
    return {
      status: 500,
      ok: false,
      error: err.message,
      record: null
    };
  }
}


/** WRITE */
async function writeData(newData) {
  try {
    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': MASTER_KEY
      },
      body: JSON.stringify(newData)
    });
    const json = await res.json();
    console.log('📬 Respuesta del servidor:', json);
    return json;
  } catch (err) {
    console.error('❌ Error al escribir en el bin:', err);
    return null;
  }
}

/** APPEND ENTRY */
async function appendEntry(entry, tlx, tly) {
  const tileKey = `${tlx}-${tly}`;
  const sector = `${Math.floor(entry.px / 250)}-${Math.floor(entry.py / 250)}`;

  const data = await readData();
  if (!data) return null;

  if (!data[tileKey]) data[tileKey] = {};
  if (!data[tileKey][sector]) data[tileKey][sector] = [];

  data[tileKey][sector].push(entry);
  console.log('📤 Datos que se intentan guardar:', data);

  return await writeData(data);
}

/** API HANDLER */
export default async function handler(req, res) {
  const BIN_ID = '6902aa91ae596e708f36b5f7';
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
  const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
  res.setHeader('Access-Control-Allow-Origin', 'https://wplace.live');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  
  try {
    const { mode, tlx, tly, pxx, pxy } = req.query;

    // Validación básica
    if (!mode || !tlx || !tly || !pxx || !pxy) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const response = await readData();
    if (!response.ok || !response.record) {
      return res.status(500).json({
        success: false,
        message: 'Failed to read bin data',
        status: response.status,
        full: response.full,
        error: response.error || null
      });
    }
    
    const data = response.record;

    const tileKey = `${tlx}-${tly}`;
    const zoneKey = `${Math.floor(pxx / 250)}-${Math.floor(pxy / 250)}`;

    //const data = await readData();
    if (!data || typeof data !== 'object') {
      return res.status(500).json({ success: false, message: 'Failed to read bin data', });
    }

    if (mode === 'read') {
      const tile = data[tileKey];
      if (!tile) {
        return res.status(404).json({ success: false, message: 'Tile not found' });
      }

      const zone = tile[zoneKey];
      if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
      }

      return res.status(200).json({
        success: true,
        [tileKey]: {
          [zoneKey]: zone
        }
      });

    }

    if (mode === 'write') {
      const entry = {
        px: parseInt(pxx),
        py: parseInt(pxy),
        title: 'Auto',
        date: new Date().toISOString(),
        comment: 'Generado desde API'
      };

      const result = await appendEntry(entry, tlx, tly);
      if (!result) {
        return res.status(500).json({ success: false, message: 'Failed to write entry' });
      }

      return res.status(200).json({ success: true, result });
    }

    return res.status(400).json({ success: false, message: 'Invalid mode' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
