const esbuild = require('../frontend/node_modules/esbuild');
const path = require('path');
const fs = require('fs');

async function bundle() {
  const rootApiDir = path.join(__dirname, '..', 'api');
  const frontendApiDir = path.join(__dirname, '..', 'frontend', 'api');

  // Clean old conflicting files
  for (const dir of [rootApiDir, frontendApiDir]) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.endsWith('.cjs') || f.includes('[...path]')) {
          fs.unlinkSync(path.join(dir, f));
          console.log(`Deleted conflicting file: ${path.join(dir, f)}`);
        }
      }
    } else {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Ensure data directory exists with seed json files
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

  console.log('Bundling root api/index.js (CommonJS single file)...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'backend', 'serverless.js')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(rootApiDir, 'index.js'),
  });

  console.log('Bundling frontend/api/index.js (ESM single file)...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'backend', 'serverless.js')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: path.join(frontendApiDir, 'index.js'),
  });

  console.log('✓ Successfully generated single non-conflicting files:');
  console.log('   - api/index.js (Root CommonJS)');
  console.log('   - frontend/api/index.js (Frontend ESM)');
}

bundle().catch(err => {
  console.error('Bundle failed:', err);
  process.exit(1);
});
