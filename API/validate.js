export default async function handler(req, res) {
  const BIN_ID = "68fe541aae596e708f2e4d3c";
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const data = await r.json();

    if (!r.ok) return res.status(500).json({ valid: false });

    const input = req.query.credential;
    const valid = data.record.credential === input;

    res.status(200).json({ valid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}