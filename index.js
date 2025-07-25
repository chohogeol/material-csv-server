const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

// ✅ 정규화 함수
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

    // ✅ 헤더 false로 파싱 후, 2번째 줄을 열 제목으로 재매핑
    const parsed = Papa.parse(csvText, { header: false });
    const rows = parsed.data;

    const headers = rows[1]; // 2번째 줄이 진짜 열 제목
    const dataRows = rows.slice(2); // 3번째 줄부터가 진짜 데이터

    // ✅ 행을 객체 배열로 변환
    const data = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = row[i]?.trim();
      });
      return obj;
    });

    // ✅ 확인용 로그
    console.log('✅ 정제된 데이터 앞 3줄:', data.slice(0, 3));

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
