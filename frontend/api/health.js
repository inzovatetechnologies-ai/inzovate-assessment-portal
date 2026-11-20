module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ONLINE',
    organization: 'INZOVATE TECHNOLOGIES PRIVATE LIMITED',
    portal: 'INZOVATE TALENT ASSESSMENT PORTAL',
    timestamp: new Date().toISOString(),
    environment: 'production-serverless',
    mode: 'Vercel Native File-System Route'
  }));
};
