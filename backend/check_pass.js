const bcrypt = require('bcryptjs');

const hash = '$2a$10$hqByJf0nWFtPgxfm77ie/.aS5He6XodZeW8dSfFjumYRHjXRkKvWy';
const candidates = ['password', 'password123', 'Password123', 'admin123', 'test123', 'Demo@123', 'demo123', 'admin', '123456', 'tourguardian', 'sentinel', 'Sentinel@123', 'password1'];

(async () => {
  for (const p of candidates) {
    const ok = await bcrypt.compare(p, hash);
    if (ok) { console.log(`✅ MATCH: "${p}"`); return; }
  }
  console.log('❌ No match found among candidates');
})();
