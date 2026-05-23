import re
from pathlib import Path

path = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace/pipeline_hustler/README.md")
content = path.read_text(encoding='utf-8')

new_tree = """```
pipeline_hustler/
├── .hustler_identity/                            # 🧠 logic, routing, runbooks
│   ├── HUSTLER_CONTRACTS.yaml                    # pre/post-flight gates
│   ├── Hustler-Architecture.md                   # layout, tracker schemas, lineage graph
│   ├── Hustler-Workflows.md                      # 5-phase flow + audit pass
│   ├── Hustler-Operational-Rules.md              # 15 H-LAWs
│   ├── Hustler-Cascading-Logic.md                # decision tree + checklist
│   ├── Hustler-Tagging-System.md                 # tag taxonomy + transitions
│   └── Hustler-Event-Vocabulary.md               # Hustler-private event names
│
├── .hustler_db/                                  # 🗃️ tracking databases
│   ├── [focus].focus_ledger.yaml                 # strategic rollup + market context
│   ├── [focus].sources_ledger.yaml               # per-focus anti-duplication
│   └── .hustler_mixed_inbox.ledger.yaml          # inbox anti-duplication
│
├── .hustler_milestones/                          # 🎯 active and completed goals
│
├── .hustler_runtime/                             # 🔋 ephemeral
│   ├── .hustler_archive/YYYY-QQ/                 # retired focuses/products/features
│   └── .hustler_scratch/                         # transient drafts
│
├── _HUSTLER-EXTERNAL_SOURCES/                    # 📥 inbound
│   ├── .hustler_mixed_inbox/                     # untyped drops (you put files here)
│   ├── _[focus]_inbox/                           # typed staging per focus
│   ├── [focus]_discoveries/                      # post-cascade typed hubs
│   └── .hustler_USER-SPACE/                      # user-only — Hustler never scans
│
└── [focus-name]/                                 # ✅ a validated Focus folder
    ├── [focus-name]-PRODUCTS.yaml                # focus-level tracker
    ├── _[focus-name]-discovery/                  # holding for product candidates
    │
    └── [product-name]/                           # ✅ a validated Product folder
        ├── [product-name]-FEATURES.yaml          # product-level tracker
        ├── _[product-name]-discovery/            # holding for feature candidates
        │
        └── [feature-name]/                       # ✅ a validated Feature folder
            ├── [feature-name].yaml               # definitions + needs + tags
            ├── 00-data/                          # raw + scraped data, all tagged
            └── 01-requirements/                  # extracted assets ready for build
```"""

# Replace the tree block
content = re.sub(r'```\npipeline_hustler/\n├── \.hustler_identity/.*?\n```', new_tree, content, flags=re.DOTALL)

path.write_text(content, encoding='utf-8')
print("Updated pipeline_hustler README.md tree!")
