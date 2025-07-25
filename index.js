const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

// 공통 문자열 정규화 함수
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

    // header 없이 파싱 후 수동으로 3행을 헤더로 지정
    const parsed = Papa.parse(csvText, { header: false });
    const rows = parsed.data;

    const headers = rows[2];      // ✅ 3행 (index 2): 열 제목
    const dataRows = rows.slice(3); // ✅ 4행부터 데이터

    const data = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        if (header) obj[header.trim()] = row[i]?.trim();
      });
      return obj;
    });

    // 로그로 확인
    console.log('✅ 파싱된 첫 3개:', data.slice(0, 3));

    const result = data.filter(row => {
      const desc = normalize(row['Description']);
      const model = normalize(row['Model No.']);
      const spec = normalize(row['Specification']);

      return (
        desc.includes(query) ||
        model.includes(query) ||
        spec.includes(query)
      );
    });

    if (result.length > 0) {
      res.json(result);
    } else {
      res.json({ 메시지: `'${rawQuery}'와 일치하는 자재를 찾을 수 없습니다.` });
    }

  } catch (err) {
    console.error('❌ 오류:', err.message);
    res.status(500).json({ error: '서버 오류: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
