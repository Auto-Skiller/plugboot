
## Architecture

```
open-workspace/
├── .brain/                    # IDENTITY & INSTRUCTIONS
│   ├── Core Architecture.md   # This file — the full structural map
│   ├── Hierarchy.md           # Multi-layer inheritance rules
│   ├── Modes.md               # STRICT / COLLAB / AUTO behavioral modes
│   ├── Persona.md             # Agent name, role, tone, mission
│   ├── Core Capabilities.md   # Cognitive loop & operational protocols
│   ├── Decision-Making.md     # Escalation & uncertainty handling rules
│   ├── Orchestration & Flow.md# Engine-driven execution sequence
│   ├── Board-Guide.md         # How to read/write BOARD.yaml
│   ├── Communication-Style.md # Response tone & formatting rules
│   ├── Quick Start.md         # Onboarding checklist for agents & humans
│   ├── Rules & Considerations.md # Global + domain-specific rules
│   └── .toolbox.control/      # TOOLBOX REGISTRY (Index & Control)
│       └── .toolbox.registry/ # Structural maps of the .toolbox
│           ├── core_toolbox.registry    # Index of .agentic_toolbox
│           └── extended_toolbox.registry# Index of all domain toolboxes
│
├── .toolbox/                  # CAPABILITIES (The Skill Stack)
│   ├── .agentic_toolbox/      # Core Cognitive Loop (Always-On)
│   │   ├── analysis/
│   │   ├── benchmarking/
│   │   ├── brainstorming/
│   │   ├── documentation/
│   │   ├── evaluation/
│   │   ├── planning/
│   │   └── research/
│   ├── business_toolbox/      # Business Domains
│   │   ├── branding/, finance/, hr-and-talent/, legal-and-compliance/
│   │   ├── market-intelligence/, marketing/, operations/, product-management/
│   │   ├── sales/, strategy/, customer-success-and-support/
│   │   ├── data-and-analytics/, outreach-and-partnerships/
│   ├── engineering_toolbox/   # Technical Domains
│   │   ├── ai-and-ml/, architecture/, backend/, coding/
│   │   ├── debugging/, devops/, frontend/, infrastructure/
│   │   ├── maintenance/, mobile/, performance/, refactoring/
│   │   ├── security/, testing/, validation/
│   ├── life_toolbox/          # Personal & Lifestyle Domains
│   │   ├── ISLAM/, education/, finance/, food-and-cooking/
│   │   ├── health/, hobbies/, home-and-garden/, legal/
│   │   ├── life-skills/, personal-growth/, sport/, travel/, wealth/, work/
│   └── studio_toolbox/        # Creative & Production Domains
│       ├── 3d/, animation/, audio-and-voice/, copywriting/
│       ├── creativity/, design/, distribution/, image-production/
│       ├── post-production/, ux-logic/, video-production/
│
├── BOARD.yaml                 # UNIFIED STATE BOARD (The Memory)
│   # Tracks: session mode, active goals, backlog, events, comms, scratchpad
│
├── _pipelines/                # EXECUTION PIPELINES (The Agents)
│   ├── hustler/               # Hustler Pipeline Workspace
│   │   ├── _discoveries/      # Raw opportunity discoveries
│   │   └── algerian-ecommerce/# Active project workspace
│   └── scaler/                # Scaler Pipeline Workspace
│       ├── _discoveries/      # Scaler-level research & discoveries
│       └── _proposals/        # Structured proposals for scaling
│
├── _projects/                 # CUSTOM PROJECTS (Direct Builds)
├── archive/                   # Archived content (never delete, move here)
└── scratch/                   # Temporary scripts, drafts, test files
```

### Core Philosophy
We are not building "an agent" — we are building the **Substrate** (The Agentic OS) that allows any world-class agent (Claude, Gemini, Hermes, etc.) to land in this workspace and immediately become 10x more autonomous and capable.

The "Perfect System" is one where the workspace provides the **Senses** (Toolbox Registry), the **Memory** (BOARD.yaml), and the **Muscles** (Toolbox Skills), while the agents provide the "Brain."

### The Three Pillars

#### 🧠 IDENTITY (.brain)
- **Function:** Defines tone, strategic constraints, persona, and all operating rules.
- **Agents read this first.** It is the "Mind" of the system.

#### 🛠️ CAPABILITIES (.toolbox)
- **Function:** Modular skill folders organized by domain. The "Muscles" of the system.
- **Registry:** `.brain/.toolbox.control/.toolbox.registry/` provides the structural index.

#### 📋 STATE (BOARD.yaml)
- **Function:** The unified, real-time source of truth for session mode, active goals, events, and agent-user communication. The "Memory."

### Operational Flow
1. **Global Scan**: Read `AGENTS.md` + `.brain/` files for identity and rules.
2. **State Check**: Read `BOARD.yaml` for current mode, active goals, and messages.
3. **Toolbox Navigation**: Use `.brain/.toolbox.control/.toolbox.registry/` to locate relevant skills.
4. **Execution**: Load and apply skills from the appropriate `.toolbox/` subdirectory.
5. **State Update**: Write progress back to `BOARD.yaml` immediately after each step.

