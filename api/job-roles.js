const jobRoles = require('./data/job_roles.json');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const domainId = urlObj.searchParams.get('domainId');
  const filtered = domainId ? jobRoles.filter(r => r.domainId === domainId) : jobRoles;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(filtered));
};
