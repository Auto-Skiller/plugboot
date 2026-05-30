import os
import re
import yaml
import json

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

EXCLUDED_DIRS = {'.git', '.venv', 'auth', '_SCALER-EXTERNAL_SOURCES', '_HUSTLER-EXTERNAL_SOURCES'}

# Gather all physical files and folders
def get_physical_manifest(root):
    physical_files = set()
    physical_dirs = set()
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        
        rel_dir = os.path.relpath(dirpath, root).replace('\\', '/')
        if rel_dir != '.':
            physical_dirs.add(rel_dir)
        for f in filenames:
            rel_file = os.path.relpath(os.path.join(dirpath, f), root).replace('\\', '/')
            physical_files.add(rel_file)
    return physical_dirs, physical_files

# Check if a path exists relative to root or relative to the source file
def resolve_path(path, src_file_rel, physical_files, physical_dirs):
    # Normalize path
    path_clean = path.replace('\\', '/').strip()
    
    # Strip quotes if present
    if (path_clean.startswith("'") and path_clean.endswith("'")) or (path_clean.startswith('"') and path_clean.endswith('"')):
        path_clean = path_clean[1:-1].strip()
        
    # Strip file:/// protocol if present
    if path_clean.startswith('file:///'):
        path_clean = path_clean[8:]
        
    # Strip any markdown anchor (e.g. #L123-L145 or #section)
    if '#' in path_clean:
        path_clean = path_clean.split('#')[0]
        
    if not path_clean:
        return True, None, "empty"
        
    # Skip obvious non-paths: multi-line strings, things with spaces (unless double quoted file paths, but we normalized),
    # very short strings (<= 4 chars like '1.0'), or purely numeric/symbol strings without alphanumeric path components.
    if '\n' in path_clean or '\r' in path_clean:
        return True, None, "not_a_path"
    if len(path_clean) <= 4:
        # Check if it exists exactly, else it's a false positive (like version numbers)
        if path_clean not in physical_files and path_clean not in physical_dirs:
            return True, None, "not_a_path"
            
    # Check if absolute path inside workspace
    if os.path.isabs(path_clean) or path_clean.startswith('c:/') or path_clean.startswith('C:/'):
        # convert absolute workspace path to relative
        for root_prefix in [WORKSPACE_ROOT.replace('\\', '/'), 'c:/Users/BAB AL SAFA/Desktop/open-workspace', 'C:/Users/BAB AL SAFA/Desktop/open-workspace']:
            if path_clean.lower().startswith(root_prefix.lower()):
                path_clean = path_clean[len(root_prefix):].lstrip('/')
                break
                
    # 1. Try relative to workspace root
    if path_clean in physical_files:
        return True, path_clean, "file"
    if path_clean in physical_dirs:
        return True, path_clean, "dir"
        
    # 2. Try relative to the source file's directory
    src_dir = os.path.dirname(src_file_rel)
    rel_resolved = os.path.normpath(os.path.join(src_dir, path_clean)).replace('\\', '/')
    if rel_resolved in physical_files:
        return True, rel_resolved, "file"
    if rel_resolved in physical_dirs:
        return True, rel_resolved, "dir"
        
    # 3. Try to strip leading dots/slashes
    path_stripped = path_clean.lstrip('./').lstrip('/')
    if path_stripped in physical_files:
        return True, path_stripped, "file"
    if path_stripped in physical_dirs:
        return True, path_stripped, "dir"
        
    # If the string doesn't even contain slash or dot, it's highly likely a false positive
    if '/' not in path_clean and '\\' not in path_clean and '.' not in path_clean:
        return True, None, "not_a_path"
        
    # Not found
    return False, path_clean, None


# Parse string to find potential path references
def extract_potential_paths_from_text(text):
    # Matches strings that look like relative/absolute paths:
    # e.g., something/something.extension or .something/something
    # Must contain at least one slash or end with a common file extension.
    # Exclude anything with whitespace, newlines, or very long strings
    extensions = r'\.(?:md|yaml|yml|py|json|sh|ps1|txt|png|jpg|exe|cfg|pid|dat)'
    pattern = r'(?:"|\')?((?:\.?\.?\/[a-zA-Z0-9_\-\.]+)+[\/\\_][a-zA-Z0-9_\-\.]+(?:' + extensions + r')?|[a-zA-Z0-9_\-\.\/]+' + extensions + r')(?:"|\')?'
    candidates = re.findall(pattern, text)
    valid_cands = set()
    for c in candidates:
        if isinstance(c, tuple):
            c = c[0]
        c = c.strip().strip("'\"")
        # Paths shouldn't contain spaces, newlines, or be extremely long
        if ' ' not in c and '\n' not in c and len(c) < 120 and (('/' in c or '\\' in c) or any(c.endswith(ext) for ext in ['.md', '.yaml', '.yml', '.py', '.json'])):
            valid_cands.add(c)
    return valid_cands

# Extract markdown links [text](destination)
def extract_markdown_links(text):
    # Matches [text](destination)
    pattern = r'\[[^\]]*\]\(([^)]+)\)'
    links = re.findall(pattern, text)
    valid_links = []
    for link in links:
        link = link.strip().strip("'\"")
        if not (link.startswith('http://') or link.startswith('https://') or link.startswith('mailto:')):
            valid_links.append(link)
    return valid_links

# Process files
def analyze_files(root, physical_dirs, physical_files):
    results = {}
    
    for rel_file in sorted(physical_files):
        abs_path = os.path.join(root, rel_file)
        
        # Skip certain binary or very large files if any
        if rel_file.endswith(('.png', '.jpg', '.gitkeep', '.pid')):
            continue
            
        try:
            with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {rel_file}: {e}")
            continue
            
        file_results = []
        
        # 1. Parse YAML specifically if YAML file
        if rel_file.endswith('.yaml') or rel_file.endswith('.yml'):
            try:
                data = yaml.safe_load(content)
                # Helper to recursively scan dict/list values for paths
                def scan_yaml_val(val, current_key=""):
                    if isinstance(val, str):
                        # Filter to only check values that look like paths or are under path keys
                        val_clean = val.strip().strip("'\"")
                        last_key = current_key.split('.')[-1].lower() if current_key else ""
                        is_path_key = any(x in last_key for x in ['path', 'file', 'dir', 'venv', 'script', 'source', 'target', 'entry_point', 'schema'])
                        is_path_val = ('/' in val_clean or '\\' in val_clean or any(val_clean.endswith(ext) for ext in ['.md', '.yaml', '.yml', '.py', '.json', '.sh', '.ps1'])) and ' ' not in val_clean
                        if (is_path_key or is_path_val) and '\n' not in val_clean and '\r' in val_clean:
                            pass # already filtered by resolve_path, but let's be double safe
                        if is_path_key or is_path_val:
                            # Skip long descriptions or spaces
                            if ' ' in val_clean and not (val_clean.startswith('c:/') or val_clean.startswith('C:/') or val_clean.startswith('file:///')):
                                return
                            exists, resolved, ptype = resolve_path(val, rel_file, physical_files, physical_dirs)
                            file_results.append({
                                "source": "yaml",
                                "key": current_key,
                                "path_string": val,
                                "resolved_path": resolved,
                                "exists": exists,
                                "type": ptype
                            })
                    elif isinstance(val, dict):
                        for k, v in val.items():
                            scan_yaml_val(v, f"{current_key}.{k}" if current_key else k)
                    elif isinstance(val, list):
                        for idx, item in enumerate(val):
                            scan_yaml_val(item, f"{current_key}[{idx}]")

                scan_yaml_val(data)
            except Exception as e:
                # Fallback to regex if yaml fails
                pass
                
        # 2. Extract markdown links if Markdown file
        if rel_file.endswith('.md'):
            links = extract_markdown_links(content)
            for link in links:
                exists, resolved, ptype = resolve_path(link, rel_file, physical_files, physical_dirs)
                file_results.append({
                    "source": "markdown_link",
                    "path_string": link,
                    "resolved_path": resolved,
                    "exists": exists,
                    "type": ptype
                })
                
        # 3. Regex lookup for potential paths in comments or scripts (only files in core OS, not venv/git)
        # We only do regex for files in identity, pipeline configs, and root markdown to avoid too much noise,
        # but let's do it for all `.py`, `.sh`, `.ps1` and `.md` files as well.
        if rel_file.endswith(('.md', '.py', '.sh', '.ps1')):
            candidates = extract_potential_paths_from_text(content)
            for cand in candidates:
                # Skip if already captured by markdown_link
                if any(r['path_string'] == cand for r in file_results):
                    continue
                exists, resolved, ptype = resolve_path(cand, rel_file, physical_files, physical_dirs)
                # Only log regex-found candidates if they don't exist (to find broken refs) or if they do exist and are file/dir paths
                # To minimize false positives, we only count them if they are definitely paths
                if exists or any(x in cand for x in ['.meta_os', 'pipeline_scaler', 'pipeline_hustler', 'projects', '.toolboxes']):
                    file_results.append({
                        "source": "regex",
                        "path_string": cand,
                        "resolved_path": resolved,
                        "exists": exists,
                        "type": ptype
                    })
                    
        # Filter results to keep unique combinations
        seen = set()
        unique_results = []
        for r in file_results:
            key = (r['source'], r['path_string'], r['exists'])
            if key not in seen:
                seen.add(key)
                unique_results.append(r)
                
        if unique_results:
            results[rel_file] = unique_results
            
    return results


if __name__ == '__main__':
    physical_dirs, physical_files = get_physical_manifest(WORKSPACE_ROOT)
    analysis = analyze_files(WORKSPACE_ROOT, physical_dirs, physical_files)
    
    # Save findings
    output_path = os.path.join(WORKSPACE_ROOT, '.meta_runtime', 'scratch', 'path_analysis_report.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2)
        
    print(f"Analysis complete. Written to {output_path}")
    
    # Summary
    total_refs = 0
    broken_refs = []
    for file, refs in analysis.items():
        for r in refs:
            total_refs += 1
            if not r['exists'] and r['type'] != 'empty':
                broken_refs.append((file, r))
                
    print(f"Total path references found: {total_refs}")
    print(f"Broken path references found: {len(broken_refs)}")
    print("\nBroken references:")
    for src_file, ref in sorted(broken_refs, key=lambda x: x[0]):
        print(f"  - In {src_file} ({ref['source']}): '{ref['path_string']}' does not exist!")
