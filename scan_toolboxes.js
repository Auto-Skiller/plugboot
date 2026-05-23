const fs = require('fs');
const path = require('path');

const TOOLBOXES_DIR = '_toolboxes';
const DB_DIR = '.db/toolboxes_db';

function parseYaml(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
}

function updateDomainYaml(dbPath, domain, category, agents, skills) {
    let content = parseYaml(dbPath);
    if (!content) return;

    // Update metadata counts
    content = content.replace(/agent_count:\s*\d+/, `agent_count: ${agents.length}`);
    content = content.replace(/skill_count:\s*\d+/, `skill_count: ${skills.length}`);
    
    // Update agent_names
    let agentNamesStr = agents.length > 0 ? '\n' + agents.map(a => `  - ${a.name}`).join('\n') : ' []';
    content = content.replace(/agent_names:.*(\n\s+-.*)*/, `agent_names:${agentNamesStr}`);

    // Update skill_names
    let skillNamesStr = skills.length > 0 ? '\n' + skills.map(s => `  - ${s.name}`).join('\n') : ' []';
    content = content.replace(/skill_names:.*(\n\s+-.*)*/, `skill_names:${skillNamesStr}`);

    // Replace agents block
    let agentsBlock = 'agents:';
    if (agents.length > 0) {
        agentsBlock += '\n' + agents.map(a => `  ${a.name}:\n    path: ${a.path.replace(/\\/g, '/')}`).join('\n');
    }
    content = content.replace(/agents:[\s\S]*?(?=\nskills:)/, agentsBlock + '\n');

    // Replace skills block
    let skillsBlock = 'skills:';
    if (skills.length > 0) {
        skillsBlock += '\n' + skills.map(s => `  ${s.name}:\n    path: ${s.path.replace(/\\/g, '/')}`).join('\n');
    }
    content = content.replace(/skills:[\s\S]*$/, skillsBlock + '\n');

    fs.writeFileSync(dbPath, content, 'utf8');
}

function scan() {
    let mainIndex = parseYaml('.db/.toolboxes.yaml');
    
    const categories = fs.readdirSync(TOOLBOXES_DIR).filter(d => fs.statSync(path.join(TOOLBOXES_DIR, d)).isDirectory());
    
    for (const cat of categories) {
        const catDbDir = path.join(DB_DIR, cat + '_db');
        if (!fs.existsSync(catDbDir)) continue;
        
        const domains = fs.readdirSync(path.join(TOOLBOXES_DIR, cat)).filter(d => fs.statSync(path.join(TOOLBOXES_DIR, cat, d)).isDirectory());
        
        for (const domain of domains) {
            const domainPath = path.join(TOOLBOXES_DIR, cat, domain);
            const agentsDir = path.join(domainPath, 'agents');
            const skillsDir = path.join(domainPath, 'skills');
            
            let agents = [];
            let skills = [];
            
            if (fs.existsSync(agentsDir)) {
                fs.readdirSync(agentsDir).forEach(f => {
                    if (f !== '.gitkeep') {
                        agents.push({
                            name: f.replace(/\.[^/.]+$/, ""), // remove extension
                            path: path.join(agentsDir, f)
                        });
                    }
                });
            }
            
            if (fs.existsSync(skillsDir)) {
                fs.readdirSync(skillsDir).forEach(f => {
                    if (f !== '.gitkeep') {
                        skills.push({
                            name: f.replace(/\.[^/.]+$/, ""),
                            path: path.join(skillsDir, f)
                        });
                    }
                });
            }
            
            const dbPath = path.join(catDbDir, domain + '.yaml');
            if (fs.existsSync(dbPath)) {
                updateDomainYaml(dbPath, domain, cat, agents, skills);
                
                // Update mainIndex string for this domain
                // E.g. 
                //     analysis:
                //       status: active # (in)
                //       agent_count: 0
                //       skill_count: 0
                const regex = new RegExp(`(\\s+${domain}:\\s*\\n\\s+status:.*?\\n\\s+agent_count:)\\s*\\d+(\\s*\\n\\s+skill_count:)\\s*\\d+`);
                mainIndex = mainIndex.replace(regex, `$1 ${agents.length}$2 ${skills.length}`);
            }
        }
    }
    
    fs.writeFileSync('.db/.toolboxes.yaml', mainIndex, 'utf8');
}

scan();
console.log('Toolboxes scan and update completed!');
