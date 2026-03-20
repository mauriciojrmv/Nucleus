const sharp = require('sharp');
const fs = require('fs');

console.log('🎨 Generating Nucleus icons...');

// ─── Icon (purple background + wallet) ─────────────────
const iconSvg = Buffer.from(`
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333EA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4C1D95;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#grad)" rx="220"/>

  <!-- Wallet body -->
  <rect x="160" y="320" width="700" height="460" rx="60" fill="white" opacity="0.95"/>

  <!-- Wallet top flap -->
  <rect x="160" y="280" width="700" height="120" rx="60" fill="white" opacity="0.80"/>

  <!-- Coin pocket (right side) -->
  <rect x="620" y="420" width="200" height="220" rx="40" fill="#7C3AED" opacity="0.9"/>

  <!-- Coin inside pocket -->
  <circle cx="720" cy="530" r="60" fill="#F59E0B"/>
  <text
    x="720"
    y="548"
    font-size="64"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    fill="#92400E"
    font-weight="800"
  >$</text>

  <!-- Card lines on wallet -->
  <rect x="200" y="440" width="360" height="28" rx="14" fill="#E9D5FF"/>
  <rect x="200" y="490" width="260" height="22" rx="11" fill="#DDD6FE"/>
  <rect x="200" y="535" width="300" height="22" rx="11" fill="#EDE9FE"/>
</svg>
`);

// ─── Splash screen ──────────────────────────────────────
const splashSvg = Buffer.from(`
<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E1040;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333EA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4C1D95;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1284" height="2778" fill="url(#bg)"/>

  <!-- Glow behind icon -->
  <circle cx="642" cy="1200" r="340" fill="#7C3AED" opacity="0.12"/>
  <circle cx="642" cy="1200" r="260" fill="#7C3AED" opacity="0.10"/>

  <!-- Icon container -->
  <rect x="342" y="940" width="600" height="520" rx="130" fill="url(#card)"/>

  <!-- Wallet body inside icon -->
  <rect x="412" y="1060" width="460" height="300" rx="40" fill="white" opacity="0.95"/>

  <!-- Wallet flap -->
  <rect x="412" y="1034" width="460" height="80" rx="40" fill="white" opacity="0.75"/>

  <!-- Coin pocket -->
  <rect x="720" y="1110" width="120" height="145" rx="26" fill="#7C3AED" opacity="0.9"/>

  <!-- Coin -->
  <circle cx="780" cy="1182" r="38" fill="#F59E0B"/>
  <text
    x="780"
    y="1196"
    font-size="40"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    fill="#92400E"
    font-weight="800"
  >$</text>

  <!-- Card lines -->
  <rect x="440" y="1130" width="240" height="18" rx="9" fill="#E9D5FF"/>
  <rect x="440" y="1162" width="180" height="16" rx="8" fill="#DDD6FE"/>
  <rect x="440" y="1192" width="200" height="16" rx="8" fill="#EDE9FE"/>

  <!-- App name -->
  <text
    x="642"
    y="1580"
    font-size="130"
    font-weight="800"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    fill="#F8FAFC"
    letter-spacing="-3"
  >Nucleus</text>

  <!-- Tagline -->
  <text
    x="642"
    y="1680"
    font-size="52"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    fill="#94A3B8"
  >Tu centro de control personal</text>

  <!-- Divider line -->
  <rect x="492" y="1730" width="300" height="2" rx="1" fill="#334155"/>

  <!-- Author credit -->
  <text
    x="642"
    y="1800"
    font-size="40"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    fill="#475569"
  >by Mauricio Mattinen</text>

  <!-- Bottom dots decoration -->
  <circle cx="572" cy="2600" r="6" fill="#334155"/>
  <circle cx="612" cy="2600" r="6" fill="#7C3AED"/>
  <circle cx="652" cy="2600" r="6" fill="#334155"/>
  <circle cx="692" cy="2600" r="6" fill="#334155"/>
  <circle cx="732" cy="2600" r="6" fill="#334155"/>
</svg>
`);

// ─── Generate all files ────────────────────────────────
if (!fs.existsSync('./assets')) fs.mkdirSync('./assets');

sharp(iconSvg)
  .png()
  .toFile('./assets/icon.png')
  .then(() => console.log('✅ icon.png'))
  .catch(err => console.error('❌ icon.png:', err.message));

sharp(iconSvg)
  .png()
  .toFile('./assets/adaptive-icon.png')
  .then(() => console.log('✅ adaptive-icon.png'))
  .catch(err => console.error('❌ adaptive-icon.png:', err.message));

sharp(splashSvg)
  .resize(1284, 2778)
  .png()
  .toFile('./assets/splash-icon.png')
  .then(() => console.log('✅ splash-icon.png'))
  .catch(err => console.error('❌ splash-icon.png:', err.message));

sharp(iconSvg)
  .resize(32, 32)
  .png()
  .toFile('./assets/favicon.png')
  .then(() => console.log('✅ favicon.png'))
  .catch(err => console.error('❌ favicon.png:', err.message));

console.log('⏳ Please wait...');