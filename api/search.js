const axios = require('axios');
const { GOOGLE_SCRIPT_URL } = require('../config');

module.exports = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: '검색어가 없습니다' });
  }

  try {
    const response = await axios.get(`${GOOGLE_SCRIPT_URL}?q=${encodeURIComponent(q)}`);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({
      error: 'Google Apps Script 요청 실패',
      detail: err.message
    });
  }
};
