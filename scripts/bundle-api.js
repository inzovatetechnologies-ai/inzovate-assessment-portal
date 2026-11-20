const esbuild = require('../frontend/node_modules/esbuild');
const path = require('path');
const fs = require('fs');

async function bundle() {
  const rootApiDir = path.join(__dirname, '..', 'api');
  const frontendApiDir = path.join(__dirname, '..', 'frontend', 'api');

  for (const dir of [rootApiDir, frontendApiDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const dataDir = path.join(dir, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const srcData = path.join(__dirname, '..', 'backend', 'data');
    if (fs.existsSync(srcData)) {
      for (const f of fs.readdirSync(srcData)) {
        if (f.endsWith('.json')) {
          fs.copyFileSync(path.join(srcData, f), path.join(dataDir, f));
        }
      }
    }
  }

  console.log('Bundling backend serverless API with esbuild...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'backend', 'serverless.js')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(rootApiDir, 'index.cjs'),
  });

  // Copy bundle to frontend/api as well
  fs.copyFileSync(path.join(rootApiDir, 'index.cjs'), path.join(frontendApiDir, 'index.cjs'));

  // Root api directory (CommonJS based)
  const rootIndexContent = `const app = require('./index.cjs');\nmodule.exports = app;\n`;
  fs.writeFileSync(path.join(rootApiDir, 'index.js'), rootIndexContent, 'utf8');
  fs.writeFileSync(path.join(rootApiDir, '[...path].js'), rootIndexContent, 'utf8');

  // Frontend api directory (ESM based because frontend/package.json has "type": "module")
  const frontendIndexContent = `import app from './index.cjs';\nexport default app;\n`;
  fs.writeFileSync(path.join(frontendApiDir, 'index.js'), frontendIndexContent, 'utf8');
  fs.writeFileSync(path.join(frontendApiDir, '[...path].js'), frontendIndexContent, 'utf8');

  console.log('✓ Successfully generated:');
  console.log('   - api/index.cjs, api/index.js, api/[...path].js (root)');
  console.log('   - frontend/api/index.cjs, frontend/api/index.js, frontend/api/[...path].js');
}

bundle().catch(err => {
  console.error('Bundle failed:', err);
  process.exit(1);
});
