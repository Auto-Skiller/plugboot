const fs = require('fs');

function fixEncoding(text) {
    return text.replace(/â€”/g, '—')
               .replace(/ðŸŸ¢/g, '🟢')
               .replace(/ðŸš€/g, '🚀')
               .replace(/ðŸ‡©ðŸ‡¿/g, '🇩🇿')
               .replace(/ðŸŸ /g, '🟠')
               .replace(/ðŸ”´/g, '🔴');
}

function extractPayload(text) {
    // Find where metadata: starts
    const match = text.match(/^metadata:\s*\n/m);
    if (!match) return text;
    // We keep the word 'metadata:' for toolboxes, but for the others we might not need it?
    // Wait, let's keep the exact text from "metadata:" onwards, but we'll trim the "metadata:\n" part 
    // depending on the file if we want. Actually, for core/pipelines/projects, the user wants 
    // the whole file content to be placed directly under the key.
    
    // Let's just strip the entire system_metadata block.
    // The system_metadata block is at the top until metadata:
    const idx = match.index;
    return text.substring(idx);
}

function indent(text, spaces) {
    const prefix = ' '.repeat(spaces);
    return text.split('\n').map(line => line ? prefix + line : line).join('\n');
}

// 1. Fix toolboxes
let toolboxes = fs.readFileSync('.db/.toolboxes.yaml', 'utf8');
toolboxes = fixEncoding(toolboxes);
// It was accidentally named system_metadata at the top, let's change it back to metadata
toolboxes = toolboxes.replace(/^system_metadata:/m, 'metadata:');
fs.writeFileSync('.db/.toolboxes.yaml', toolboxes, 'utf8');

// 2. Read and prepare all DB contents
let core = extractPayload(fs.readFileSync('.db/.core.yaml', 'utf8'));
let scaler = extractPayload(fs.readFileSync('.db/pipeline_scaler.yaml', 'utf8'));
let hustler = extractPayload(fs.readFileSync('.db/pipeline_hustler.yaml', 'utf8'));
let projects = extractPayload(fs.readFileSync('.db/projects.yaml', 'utf8'));

// Toolboxes payload (also from metadata: downwards)
let toolboxesPayload = extractPayload(toolboxes);

// Read original CONTROLER.yaml header
let controler = fs.readFileSync('CONTROLER.yaml', 'utf8');
controler = fixEncoding(controler);
const headerMatch = controler.match(/^(system_metadata:[\s\S]*?\nmetadata:[\s\S]*?\n\n)/m);
let header = headerMatch ? headerMatch[1] : '';

// 3. Construct the new CONTROLER.yaml
let out = header;
out += 'core: # OUT — from .db/.core.yaml metadata\n';
// Remove the string "metadata:\n\n" from core, because the items (modes, system) should be direct children of core
core = core.replace(/^metadata:\s*\n\s*/m, '');
out += indent(core, 2) + '\n';

out += 'pipelines:\n';
out += '  scaler: # OUT — from .db/pipeline_scaler.yaml metadata\n';
scaler = scaler.replace(/^metadata:\s*\n\s*/m, '');
out += indent(scaler, 4) + '\n';

out += '  hustler: # OUT — from .db/pipeline_hustler.yaml metadata\n';
hustler = hustler.replace(/^metadata:\s*\n\s*/m, '');
out += indent(hustler, 4) + '\n';

out += 'projects: # OUT — from .db/projects.yaml metadata\n';
projects = projects.replace(/^metadata:\s*\n\s*/m, '');
out += indent(projects, 2) + '\n';

out += 'toolboxes: # OUT — from .db/.toolboxes.yaml metadata\n';
// We do NOT strip metadata from toolboxes, we keep it as is
out += indent(toolboxesPayload, 2) + '\n';

out += 'scratchpad: [] # (in-out) — free-form agent scratch area\n';

fs.writeFileSync('CONTROLER.yaml', out, 'utf8');
console.log('Successfully rolled up all complete payloads to CONTROLER.yaml');
