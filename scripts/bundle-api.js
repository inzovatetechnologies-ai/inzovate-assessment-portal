const esbuild = require('../frontend/node_modules/esbuild');
const path = require('path');
const fs = require('fs');

async function bundle() {
  const apiDir = path.join(__dirname, '..', 'frontend', 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Also copy seed data files to frontend/api/data so they are guaranteed present
  const dataDir = path.join(apiDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const srcData = path.join(__dirname, '..', 'backend', 'data');
  if (fs.existsSync(srcData)) {
    for (const f of fs.readdirSync(srcData)) {
      if (f.endsWith('.json')) {
        fs.copyFileSync(path.join(srcData, f), path.join(dataDir, f));
      }
    }
  }

  console.log('Bundling backend serverless API into frontend/api/index.js...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'backend', 'serverless.js')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(apiDir, 'index.cjs'),
  });

  // Create index.js in frontend/api that re-exports index.cjs
  fs.writeFileSync(
    path.join(apiDir, 'index.js'),
    `import app from './index.cjs';\nexport default app;\n`,
    'utf8'
  );

  console.log('✓ Successfully generated frontend/api/index.js & index.cjs');
}

bundle().catch(err => {
  console.error('Bundle failed:', err);
  process.exit(1);
});
