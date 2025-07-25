const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 네 공개된 Google Sheet CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

app.get('/search', async (req, res) => {
  const query = req.query.검색어?.trim().toLowerCase();
  if (!query) {
    return res.status(400).json({ error: '검색어 쿼리 파라미터가 필요합니다.' });
  }

  try {
    const response = await axios.get(CSV_URL);
    const csvText = response.data;

    const { data } = Papa.parse(csvText, { header: true });

    // 검색 대상 필드: Description, Model No., Specification
    const result = data.filter(row => {
      const description = row['Description']?.toLowerCase().trim() || '';
      const modelNo = row['Model No.']?.toLowerCase().trim() || '';
      const specification = row['Specification']?.toLowerCase().trim() || '';

      return (
        description.includes(query) ||
        modelNo.includes(query) ||
        specification.includes(query)
      );
    });

    if (result.length > 0) {
      res.json(result);
    } else {
      res.json({ 메시지: `'${req.query.검색어}'와 일치하는 자재를 찾을 수 없습니다.` });
    }
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    res.status(500).json({ error: '서버 오류: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
