import json
import os

transcript_path = r"C:\Users\BAB AL SAFA\.gemini\antigravity\brain\40353542-e836-4d15-bb72-7a7de210ce8a\.system_generated\logs\transcript.jsonl"

def extract_files():
    with open(transcript_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        try:
            data = json.loads(line)
        except:
            continue
            
        if data.get("type") == "TOOL_RESPONSE" and data.get("tool_name") == "view_file":
            output = data.get("tool_response", {}).get("output", "")
            if "File Path: " in output:
                # Parse out the file path and the content
                filepath_line = [l for l in output.split('\n') if l.startswith("File Path: ")][0]
                filepath = filepath_line.replace("File Path: `file:///", "").replace("`", "").replace("%20", " ")
                
                # The content starts after "The following code has been modified..."
                content_lines = []
                capture = False
                for out_line in output.split('\n'):
                    if out_line.startswith("The following code has been modified"):
                        capture = True
                        continue
                    if out_line.startswith("The above content shows the entire"):
                        capture = False
                        break
                    if capture:
                        # strip the line number (e.g., "1: ")
                        if ": " in out_line:
                            content_lines.append(out_line.split(": ", 1)[1])
                        else:
                            content_lines.append(out_line)
                
                # save it
                save_path = filepath.replace("/", "\\")
                save_path += ".bak"
                with open(save_path, "w", encoding='utf-8') as sf:
                    sf.write("\n".join(content_lines))
                print(f"Restored: {save_path}")

if __name__ == "__main__":
    extract_files()
