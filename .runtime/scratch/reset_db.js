const fs = require('fs');
const path = require('path');

const DB_DIR = '.db/toolboxes_db';
const cats = fs.readdirSync(DB_DIR);

for (let cat of cats) {
    if (!cat.endsWith('_db')) continue;
    let catDir = path.join(DB_DIR, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    
    let domainFiles = fs.readdirSync(catDir);
    for (let f of domainFiles) {
        if (!f.endsWith('.yaml')) continue;
        let domainPath = path.join(catDir, f);
        
        let content = fs.readFileSync(domainPath, 'utf8');
        
        // Match everything from start of file up to but NOT including 'agents:'
        let match = content.match(/^([\s\S]*?\n)(?=agents:)/);
        if (match) {
            content = match[1] + "agents:\n\nskills:\n";
            fs.writeFileSync(domainPath, content, 'utf8');
        }
    }
}