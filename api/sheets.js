const GS_URL = 'https://script.google.com/macros/s/AKfycbwxoFJYVFx3PHrG6uTBaB2pb7OKgmAlCOThDG_tVahPo3VXDrQnnJ0MPORzwPcHWW8/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const action = req.query.action;
      if (!action) return res.status(400).json({ error: 'Missing action' });

      const url = `${GS_URL}?action=${encodeURIComponent(action)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        console.error('GS response not JSON:', text.slice(0, 200));
        return res.status(500).json({ error: 'Invalid response from Google', raw: text.slice(0, 200) });
      }
    }

    if (req.method === 'POST') {
      const body = req.body;
      const response = await fetch(GS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body),
        redirect: 'follow'
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        console.error('GS POST response not JSON:', text.slice(0, 200));
        return res.status(500).json({ error: 'Invalid response from Google', raw: text.slice(0, 200) });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
