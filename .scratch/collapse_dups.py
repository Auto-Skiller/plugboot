import os, subprocess

GW = r"C:\Users\BAB AL SAFA\Desktop\plugboot\_os\os-inbox\.os-inbox_gateway\capability_and_skill_library\Capabilities"
def git(args): 
    return subprocess.run(["git"]+args, cwd=GW, capture_output=True, text=True)

# (file, copy_to_remove, keep_location)
removals = [
 # OUT-OF-SCOPE: keep AOC security_and_boundaries (function-correct); triage is issue-triage, not security
 ("triage/OUT-OF-SCOPE.md", "triage FG (issue triage, not a security boundary)"),
 # code-explorer / code-simplifier: keep coding_standards (function-correct); dev_utilities keeps other tools
 ("dev_utilities/code-explorer.md", "dev_utilities"),
 ("dev_utilities/code-simplifier.md", "dev_utilities"),
 # code-reviewer: keep system_reviewers (its whole purpose); dev_utilities keeps build-error-resolver etc.
 ("dev_utilities/code-reviewer.md", "dev_utilities"),
 # AGENT-BRIEF: keep execution_orchestration (it authored the brief spec); triage reuses it
 ("triage/AGENT-BRIEF.md", "triage FG"),
 # SKILL.md nested copy: keep standalone triage/SKILL.md; remove stray exec_orch/triage/
 ("execution_orchestration/triage", "execution_orchestration/triage (stray nested dup of triage FG)"),
 # slides-* : keep slides/references/slide-*.md; remove from interface_design/design/references/
 ("interface_design/design/references/slides-copywriting-formulas.md", "interface_design/design/references"),
 ("interface_design/design/references/slides-create.md", "interface_design/design/references"),
 ("interface_design/design/references/slides-html-template.md", "interface_design/design/references"),
 ("interface_design/design/references/slides-layout-patterns.md", "interface_design/design/references"),
 ("interface_design/design/references/slides-strategies.md", "interface_design/design/references"),
]

ok=0; fail=0
for path, why in removals:
    full=os.path.join(GW,path)
    if os.path.exists(full) or os.path.isdir(full):
        r=git(["rm","-r","--quiet",path])
        if r.returncode==0:
            print(f"REMOVED {path}  ({why})"); ok+=1
        else:
            print(f"FAIL {path}: {r.stderr.strip()}"); fail+=1
    else:
        print(f"ALREADY GONE {path}"); ok+=1
print(f"\nDone: removed={ok} failed={fail}")
