export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GS_URL = 'https://script.google.com/a/macros/mercadolibre.com.mx/s/AKfycbzbBi8dkuvfwxDlDYxkaUyAKyIZ-Xtb6a-AoaFtlrrpH9uL4oKMAe8ZfnkgwTHUMwcf/exec';

  try {
    if (req.method === 'GET') {
      const action = req.query.action;
      const response = await fetch(`${GS_URL}?action=${action}`);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const response = await fetch(GS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
