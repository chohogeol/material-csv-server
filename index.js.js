const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 너의 시트 CSV 공개 주소로 아래 값 바꿔!
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

app.get('/search', async (req, res) => {
  const query = req.query.검색어;
  if (!query) {
    return res.status(400).json({ error: '검색어 쿼리 파라미터가 필요합니다.' });
  }

  try {
    const response = await axios.get(CSV_URL);
    const csvText = response.data;

    const { data } = Papa.parse(csvText, { header: true });

    const found = data.find(row => row.자재명 === query);

    if (found) {
      res.json({
        자재명: found.자재명,
        위치: found.위치,
        수량: found.수량
      });
    } else {
      res.json({ 메시지: `${query} 자재를 찾을 수 없습니다.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
