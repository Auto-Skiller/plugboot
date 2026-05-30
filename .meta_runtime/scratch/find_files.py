import os

def scan_workspace(root):
    all_dirs = []
    all_files = []
    exclusions = {'.git', '.venv', 'auth', '_SCALER-EXTERNAL_SOURCES', '_HUSTLER-EXTERNAL_SOURCES'}
    for dirpath, dirnames, filenames in os.walk(root):
        # Modify dirnames in place to prevent os.walk from entering excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclusions]
        
        rel_dir = os.path.relpath(dirpath, root)
        if rel_dir != '.':
            all_dirs.append(rel_dir.replace('\\', '/'))
        for f in filenames:
            rel_file = os.path.relpath(os.path.join(dirpath, f), root)
            all_files.append(rel_file.replace('\\', '/'))
    return all_dirs, all_files

if __name__ == '__main__':
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    dirs, files = scan_workspace(root_dir)
    print(f"Scanned Root: {root_dir}")
    print(f"Total Folders (Excluding temp/venv/auth): {len(dirs)}")
    print(f"Total Files (Excluding temp/venv/auth): {len(files)}")
    print("\nFolders (all):")
    for d in sorted(dirs):
        print(f"  - {d}")
    print("\nFiles (all):")
    for f in sorted(files):
        print(f"  - {f}")

