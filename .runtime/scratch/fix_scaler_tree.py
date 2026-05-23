import re
from pathlib import Path

path = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace/pipeline_scaler/README.md")
content = path.read_text(encoding='utf-8')

new_tree = """```
pipeline_scaler/
├── .scaler_identity/                             # 🧠 logic, routing, runbooks
│   ├── SCALER_CONTRACTS.yaml                     # pre/post-flight gates
│   ├── Scaler-Architecture.md                    # Structural rules
│   ├── Scaler-Discovery-Logic.md                 # Intake protocol
│   ├── Scaler-Event-Vocabulary.md                # Event structure
│   ├── Scaler-Gateway.md                         # Proposal checks
│   ├── Scaler-Operational-Rules.md               # Pipeline laws
│   └── Scaler-Workflows.md                       # Execution flow
│
├── .scaler_db/                                   # 🗃️ tracking databases
│   ├── .scaler_db_shemas_db/                     # Strict schema definitions
│   └── *.sources.yaml / *.proposals.yaml         # per-pillar ledger state
│
├── .scaler_milestones/                           # 🎯 active and completed goals
│
├── .scaler_runtime/                              # 🔋 ephemeral
│   ├── .scaler_archive/YYYY-QQ/                  # integrated cards, date-bucketed
│   └── .scaler_scratch/                          # transient drafts
│
├── _SCALER-EXTERNAL_SOURCES/                     # 📥 inbound
│   ├── _Foundational_Integrity_inbox/
│   ├── _Operational_Muscles_inbox/
│   ├── _Value_Generation_inbox/
│   ├── .scaler_mixed_inbox/                      # untyped drops
│   ├── Foundational_Integrity_discoveries/
│   ├── Operational_Muscles_discoveries/
│   ├── Value_Generation_discoveries/
│   └── .scaler_USER-SPACE/                       # user-only — Scaler never scans
│
├── Foundational_Integrity_external_proposals/    # 🚪 gateway folders (flat, at root)
├── Foundational_Integrity_internal_proposals/
├── Operational_Muscles_external_proposals/
├── Operational_Muscles_internal_proposals/
├── Value_Generation_external_proposals/
└── Value_Generation_internal_proposals/
```"""

# Find the tree block
content = re.sub(r'```\npipeline_scaler/\n├── \.scaler_identity/.*?\n```', new_tree, content, flags=re.DOTALL)

path.write_text(content, encoding='utf-8')
print("Updated pipeline_scaler README.md tree!")
