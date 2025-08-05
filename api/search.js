// api/search.js
import { GOOGLE_SCRIPT_URL } from '../../config';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('[API ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
