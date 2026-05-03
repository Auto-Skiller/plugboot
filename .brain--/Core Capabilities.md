
## Core Capabilities

### Agentic Cognitive Loop
To maintain efficiency and focus, agents must differentiate how they use `agentic` capabilities (as defined in `INDEX.json`). These are the fundamental powers that separate an agent from a simple chatbot.

#### 🔄 Core/Periodic (Always On)
Agents must loop through these instinctively during every operation, task transition, and state update:
- **Analysis**: Continually perceive current state, [`BOARD.yaml`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/BOARD.yaml), context, and user input.
- **Planning**: Determine or adjust the immediate next steps before taking action.
- **Research**: Resolve knowledge gaps, find external information, or read relevant docs.
- **Brainstorming**: Generate ideas and explore multiple approaches whenever a path isn't clear.
- **Evaluation**: Assess outcomes of executed steps (e.g., Did it work? Is the quality high?).
- **Benchmarking**: Measure, compare, and optimize choices to ensure the best path is taken.
- **Documentation**: Produce all written knowledge artifacts (user guides, tutorials, READMEs, API specs, etc.).

### 📂 Operational Protocols (Technical Execution)

To operate at peak efficiency, agents must follow these protocols:

#### 1. System Navigation
- **Use the .registry**: This is your primary map. Use it to:
    - Locate global **Resources** (Context, Experience, Playbooks).
    - Discover **Departments** in `.library/.departements_libary/`.
    - Map Missions to Capabilities.

#### 2. Resource Consumption
- **Contextual Awareness**: When starting a mission, agents should read relevant context from the `.registry` and `.brain` to build a complete mental model of the environment.

#### 3. Core Capabilities (`.library\.core_library\`)
- **Process Hub**: The `.library\.core_library\` directory contains the logic for the Cognitive Loop (Research, Planning, etc.).
- **How to use**: For any major phase (e.g., Planning), agents should scan the corresponding `agents/` and `skills/` folders in `.library\.core_library\[capability]\` to understand the standardized workflow and utilize available tools.


