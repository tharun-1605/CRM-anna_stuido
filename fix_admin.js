const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminPanel.jsx', 'utf8');
content = content.replace(/\\n/g, '\n');
fs.writeFileSync('frontend/src/pages/AdminPanel.jsx', content);
console.log('Fixed \\n syntax error in AdminPanel.jsx');
