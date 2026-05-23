const fs = require('fs');

function fixEncoding(text) {
    return text.replace(/â€”/g, '—')
               .replace(/ðŸŸ¢/g, '🟢')
               .replace(/ðŸš€/g, '🚀')
               .replace(/ðŸ‡©ðŸ‡¿/g, '🇩🇿')
               .replace(/ðŸŸ /g, '🟠')
               .replace(/ðŸ”´/g, '🔴');
}

let core = fs.readFileSync('.db/.core.yaml', 'utf8');
core = fixEncoding(core);
fs.writeFileSync('.db/.core.yaml', core, 'utf8');