const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Google Sheet CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgKBimBQbM7HCElyq26kEoRP07HdYscaFDuP3Kb35dQNpbKKOJqwsmUdn2k2YgW-ZZ3J5qHgpyiyth/pub?gid=0&single=true&output=csv';

// ✅ 문자열 정규화 함수: 소문자화 + 공백 제거 + 특수문자 제거
const normalize = (str) =>
  str?.toLowerCase().replace(/[\s\u200B-\u200D\uFEFF]/g, '').trim() || '';

app.get('/search', async (req, res) => {
  const rawQuery = req.query.q; // ✅ 여기만 수정됨
  console.log("🔍 요청 받은 검색어:", rawQuery);

  const query = normalize(rawQuery);

  if (!query) {
    return res.status(400).json({ error: '검색어 쿼리 파라미터가 필요합니다.' });
  }

  try {
    const response = await axios.get(CSV_URL);
    const csvText = response.data;

    // ✅ CSV를 헤더 없이 파싱 (header: false)
    const parsed = Papa.parse(csvText, { header: false });
    const rows = parsed.data;

    // ✅ 시트 구조에 맞춰 헤더는 3행 (index 2), 데이터는 4행부터
    const headers = rows[2];
    const dataRows = rows.slice(3);

    // ✅ 행을 객체로 재구성
    const data = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        if (header) obj[header.trim()] = row[i]?.trim();
      });
      return obj;
    });

    console.log('✅ 파싱된 첫 3개:', data.slice(0, 3));

    // ✅ 검색 조건 필터링
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
      // ✅ 보기 좋게 포맷 재구성
      const formatted = result.map(row => ({
        'Model No': `${row['Description']} / ${row['Model No.']} / ${row['Specification']}`,
        'Supplier': row['Supplier'],
        '재고': row['재고'],
        '자재번호': row['자재번호'],
        'Location': row['Location']
      }));
      res.json(formatted);
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
