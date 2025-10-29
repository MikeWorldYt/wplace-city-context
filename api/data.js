const BIN_ID = '690183fdd0ea881f40c3ddf8';
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
    return json.record;
  } catch (err) {
    console.error('❌ Error al leer el bin:', err);
    return null;
  }
}

/** WRITE
 * @param {Object} newData - Objeto JSON completo a guardar
 */
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
    console.log('📬 Respuesta del servidor:', json); // TESTING
    return json;
  } catch (err) {
    console.error('❌ Error al escribir en el bin:', err);
    return null;
  }
}

/**
 * Agregar una entrada a una subzona específica
 * @param {Object} entry - Objeto con px, py, title, date, comment
 * @param {string} tlx
 * @param {string} tly
 */
async function appendEntry(entry, tlx, tly) {
  const tileKey = `${tlx}-${tly}`;
  const sector = `${Math.floor(entry.px / 250)}-${Math.floor(entry.py / 250)}`;

  const data = await readData();
  if (!data) return null;

  if (!data[tileKey]) data[tileKey] = {};
  if (!data[tileKey][sector]) data[tileKey][sector] = [];

  data[tileKey][sector].push(entry);
  console.log('📤 Datos que se intentan guardar:', data); // TESTING

  return await writeData(data);
}

export { readData, writeData, appendEntry };


export default async function handler(req, res) {
  const { mode, tlx, tly, pxx, pxy } = req.query;

  if (mode === 'read') {
    const tileKey = `${tlx}-${tly}`;
    const zoneKey = `${Math.floor(pxx / 250)}-${Math.floor(pxy / 250)}`;
    console.log(data)
    const data = await readData();
    if (!data || !data["620-1227"]) {
      return res.status(404).json({ success: false, message: 'Tile not found' });
    }

    // 🔍 Aquí ves toda la zona antes de filtrar
    console.log('🔍 Zona encontrada:', data[tileKey][zoneKey]);

    const zone = data[tileKey][zoneKey];
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    // Si quieres devolver toda la zona:
    return res.status(200).json({ success: true, zone });

    // Si quieres filtrar por coordenadas específicas:
    // const entry = zone.find(e => e.px === parseInt(pxx) && e.py === parseInt(pxy));
    // return res.status(200).json({ success: true, result: entry || null });
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
    return res.status(200).json({ success: true, result });
  }

  return res.status(400).json({ success: false, message: 'Invalid mode' });
}

