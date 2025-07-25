const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 네 실제 시트 CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

// ✅ 문자열 정규화 함수: 소문자화 + 공백/보이지 않는 문자 제거 + trim
const normalize = (str) =>
  str?.toLowerCase().replace(/[\s\u200B-\u200D\uFEFF]/g, '').trim() || '';

app.get('/search', async (req, res) => {
  const rawQuery = req.query.검색어;
  const query = normalize(rawQuery);

  if (!query) {
    return res.status(400).json({ error: '검색어 쿼리 파라미터가 필요합니다.' });
  }

  try {
    const response = await axios.get(CSV_URL);
    const csvText = response.data;

    const { data } = Papa.parse(csvText, { header: true });

    // 🔍 디버깅용: 첫 3줄 로그 찍기
    console.log('📦 CSV 첫 3줄 확인:', data.slice(0, 3));

    const result = data.filter(row => {
      const description = normalize(row['Description']);
      const modelNo = normalize(row['Model No.']);
      const specification = normalize(row['Specification']);

      return (
        description.includes(query) ||
        modelNo.includes(query) ||
        specification.includes(query)
      );
    });

    if (result.length > 0) {
      res.json(result);
    } else {
      res.json({ 메시지: `'${rawQuery}'와 일치하는 자재를 찾을 수 없습니다.` });
    }
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    res.status(500).json({ error: '서버 오류: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
