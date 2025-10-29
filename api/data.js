const BIN_ID = '690183fdd0ea881f40c3ddf8';
const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

/** READ */
async function readData() {
  try {
    const res = await fetch(`${BASE_URL}/latest`, {
      headers: { 'X-Access-Key': MASTER_KEY }
    });
    if (!res.ok) {
      alert('❌ Error al leer el bin:', res.status, res.statusText);
      return null;
    }
    const json = await res.json();
    alert('📥 Datos leídos del bin:', json.record);
    return json.record;
  } catch (err) {
    console.error('❌ Error al leer el bin:', err);
    return null;
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
  const BIN_ID = '690183fdd0ea881f40c3ddf8';
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
  const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
  try {
    const { mode, tlx, tly, pxx, pxy } = req.query;

    // Validación básica
    if (!mode || !tlx || !tly || !pxx || !pxy) {
      console.warn('⚠️ Parámetros faltantes:', { mode, tlx, tly, pxx, pxy });
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const tileKey = `${tlx}-${tly}`;
    const zoneKey = `${Math.floor(pxx / 250)}-${Math.floor(pxy / 250)}`;

    const data = await readData();
    if (!data || typeof data !== 'object') {
      console.error('❌ Data inválida o vacía');
      return res.status(500).json({ success: false, message: 'Failed to read bin data' });
    }

    console.log('📦 Data completa recibida:', data);
    console.log('🔑 Claves disponibles:', Object.keys(data));
    console.log('🔍 TileKey buscado:', tileKey);
    console.log('🔍 ZoneKey buscado:', zoneKey);

    if (mode === 'read') {
      const tile = data[tileKey];
      if (!tile) {
        return res.status(404).json({ success: false, message: 'Tile not found' });
      }

      const zone = tile[zoneKey];
      if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
      }

      return res.status(200).json({ success: true, zone });
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
    console.error('❌ Error inesperado en handler:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error', process.env.JSONBIN_MASTER_KEY });
  }
}
