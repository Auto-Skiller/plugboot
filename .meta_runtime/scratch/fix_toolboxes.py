import os

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TOOLBOXES_DB_DIR = os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_db', 'toolboxes_db')

OLD_PATH = '.db/.db_shemas_db/toolboxes_shemas.yaml'
NEW_PATH = '.meta_os/meta_db/.db_shemas_db/toolboxes_shemas.yaml'

def fix_toolboxes():
    repaired_count = 0
    for root, dirs, files in os.walk(TOOLBOXES_DB_DIR):
        for f in files:
            if f.endswith('.yaml') or f.endswith('.yml'):
                abs_path = os.path.join(root, f)
                with open(abs_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                if OLD_PATH in content:
                    new_content = content.replace(OLD_PATH, NEW_PATH)
                    # Atomic write using temp file
                    tmp_path = abs_path + '.tmp'
                    with open(tmp_path, 'w', encoding='utf-8') as tmp_file:
                        tmp_file.write(new_content)
                    os.replace(tmp_path, abs_path)
                    repaired_count += 1
                    print(f"[+] Repaired: {os.path.relpath(abs_path, WORKSPACE_ROOT)}")
                    
    print(f"\nSuccessfully repaired {repaired_count} toolbox database files.")

if __name__ == '__main__':
    fix_toolboxes()
