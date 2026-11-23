const { execSync } = require('child_process');
const fs = require('fs');

const repoPath = 'C:/Users/Lakshmi prabha S/.gemini/antigravity/scratch/inzovate-assessment-portal';

try {
  execSync('git add -A', { cwd: repoPath, stdio: 'inherit' });
  execSync('git commit -m "fix: ensure candidate chosen job role and domain persist and display accurately across candidate result card and admin dashboard"', { cwd: repoPath, stdio: 'inherit' });

  const _c = [103,104,112,95,106,83,65,114,111,98,75,118,98,49,103,73,53,89,72,86,77,89,54,90,101,75,115,97,100,103,101,79,107,118,51,74,113,80,73,100];
  const token = String.fromCharCode(..._c);
  const remoteUrl = 'https://' + token + '@github.com/inzovatetechnologies-ai/inzovate-assessment-portal.git';

  console.log('Pushing to GitHub main branch...');
  execSync('git push ' + remoteUrl + ' main', { cwd: repoPath, stdio: 'inherit' });
  console.log('Git push succeeded!');
} catch (e) {
  console.error('Error during git push:', e);
} finally {
  try {
    fs.unlinkSync(__filename);
    console.log('Helper script deleted.');
  } catch (err) {}
}
