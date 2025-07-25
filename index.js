const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 네 실제 시트 CSV 주소로 교체 완료
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

app.get('/search', async (req, res) => {
  const query = req.query.검색어?.trim();
  if (!query) {
    return res.status(400).json({ error: '검색어 쿼리 파라미터가 필요합니다.' });
  }

  try {
    const response = await axios.get(CSV_URL);
    const csvText = response.data;

    const { data } = Papa.parse(csvText, { header: true });

    const result = data.filter(row => {
      return (
        row['Description']?.includes(query) ||
        row['Model No.']?.includes(query) ||
        row['Specification']?.includes(query)
      );
    });

    if (result.length > 0) {
      res.json(result);
    } else {
      res.json({ 메시지: `'${query}'와 일치하는 자재를 찾을 수 없습니다.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
