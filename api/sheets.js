const GS_URL = 'https://script.google.com/macros/s/AKfycbyWbVahx0a6lAP08_GLPYo5PMo6OIhZKe39acuoZmWx8ttHvlncDpGVCi4Pvb3xsws/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const action = req.query.action;
      if (!action) return res.status(400).json({ error: 'Missing action' });

      // Follow all redirects manually
      let url = `${GS_URL}?action=${encodeURIComponent(action)}`;
      let response;
      let maxRedirects = 10;
      
      while (maxRedirects-- > 0) {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0'
          },
          redirect: 'manual'
        });
        
        if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
          url = response.headers.get('location');
          if (!url) break;
          continue;
        }
        break;
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        return res.status(500).json({ error: 'Invalid JSON', raw: text.slice(0, 300) });
      }
    }

    if (req.method === 'POST') {
      let url = GS_URL;
      let response;
      let maxRedirects = 10;
      const body = JSON.stringify(req.body);

      while (maxRedirects-- > 0) {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'User-Agent': 'Mozilla/5.0'
          },
          body: body,
          redirect: 'manual'
        });

        if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
          url = response.headers.get('location');
          if (!url) break;
          // For redirects after POST, use GET
          if (response.status === 301 || response.status === 302) {
            response = await fetch(url, {
              method: 'GET',
              headers: { 'User-Agent': 'Mozilla/5.0' },
              redirect: 'follow'
            });
            break;
          }
          continue;
        }
        break;
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        return res.status(500).json({ error: 'Invalid JSON', raw: text.slice(0, 300) });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
