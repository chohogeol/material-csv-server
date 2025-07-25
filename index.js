const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 허용 및 헤더 로그 확인용 미들웨어
app.use(cors());
app.use((req, res, next) => {
  console.log('Request from:', req.headers['user-agent']);
  next();
});

// 검색 API
app.get('/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const results = [];

  const filePath = path.join(__dirname, 'data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const rowString = Object.values(row).join(' ').toLowerCase();
      if (rowString.includes(query)) {
        results.push(row);
      }
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error('CSV read error:', err);
      res.status(500).json({ error: 'Failed to read CSV file' });
    });
});

// 기본 루트 확인용
app.get('/', (req, res) => {
  res.send('CSV Search Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
