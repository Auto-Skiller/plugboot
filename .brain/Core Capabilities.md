
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

To operate at peak efficiency, agents must follow these data-loading protocols:

#### 1. System Indexing
- **Read [`INDEX.json`](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/INDEX.json)**: This is your primary map. Use it to:
    - Locate global **Resources** (Context, Experience, Playbooks).
    - Identify available **Tools** in the root `_tools/` directory.
    - Discover **Departments** and their respective `.md` personas and `.json` resource indexes.

#### 2. Resource Consumption
- **Recursive Loading**: When reading resources (`_context`, `_experience`, `_playbooks`), agents should read **all** files listed in the `INDEX.json` arrays for those categories to build a complete mental model of the environment and mission.
- **Contextual Tools**: Always check the root `_tools` list in the index to see what automation scripts are available for use.

#### 3. Core Capabilities (`_core/`)
- **Process Hub**: The `_core/` directory contains the logic for the Cognitive Loop (Research, Planning, etc.).
- **How to use**: For any major phase (e.g., Planning), agents should read the corresponding `.md` and `.json` files in `_core/[phase]/` to understand the standardized workflow, required outputs, and available tools for that specific capability.

