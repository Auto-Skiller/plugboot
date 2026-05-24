const fs = require('fs');
const path = require('path');

let indexYaml = fs.readFileSync('.db/.toolboxes.yaml', 'utf8');

const DB_DIR = '.db/toolboxes_db';
const cats = fs.readdirSync(DB_DIR);

for (let cat of cats) {
    if (!cat.endsWith('_db')) continue;
    let catDir = path.join(DB_DIR, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    
    let domainFiles = fs.readdirSync(catDir);
    for (let f of domainFiles) {
        if (!f.endsWith('.yaml')) continue;
        let domain = f.replace('.yaml', '');
        let domainPath = path.join(catDir, f);
        
        let content = fs.readFileSync(domainPath, 'utf8');
        
        let agentCountMatch = content.match(/agent_count:\s*(\d+)/);
        let skillCountMatch = content.match(/skill_count:\s*(\d+)/);
        
        let ac = agentCountMatch ? agentCountMatch[1] : '0';
        let sc = skillCountMatch ? skillCountMatch[1] : '0';
        
        // Update indexYaml
        // We look for domain:\n  status: ...\n  agent_count: ...\n  skill_count: ...
        // We use string replacement to be extremely reliable without regex wildcards across newlines
        let searchString1 = `agent_count: `;
        let searchString2 = `skill_count: `;
        
        let regex = new RegExp(`(\\n\\s+${domain}:\\s*\\n\\s+status:[^\\n]*\\n\\s+agent_count:)\\s*\\d+(\\s*\\n\\s+skill_count:)\\s*\\d+`);
        indexYaml = indexYaml.replace(regex, `$1 ${ac}$2 ${sc}`);
    }
}

fs.writeFileSync('.db/.toolboxes.yaml', indexYaml, 'utf8');
console.log('Successfully rolled up counts into .db/.toolboxes.yaml');
