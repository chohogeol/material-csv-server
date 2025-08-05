// api/search.js
import fetch from 'node-fetch';
import { GOOGLE_SCRIPT_URL } from '../config.js';

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter `q`' });
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from GAS:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
