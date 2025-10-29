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

  return await writeData(data);
}

export { readData, writeData, appendEntry };