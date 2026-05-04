
## Core Capabilities

### Agentic Cognitive Loop
To maintain efficiency and focus, agents must differentiate how they use `agentic` capabilities (as defined in the toolbox registry). These are the fundamental powers that separate an agent from a simple chatbot.

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
- **Use the Toolbox Registry**: Located at `.brain/.toolbox.control/.toolbox.registry/`. Use it to:
    - Locate the correct skill folder in `.toolbox/` for any given task.
    - Identify relevant domain toolboxes (business, engineering, life, studio).
    - Map active goals from `BOARD.yaml` to specific capabilities.

#### 2. Resource Consumption
- **Contextual Awareness**: When starting a mission, agents should read `BOARD.yaml` and scan `.brain/` files to build a complete mental model of the environment.

#### 3. Core Capabilities (`.toolbox\.agentic_toolbox\`)
- **Process Hub**: `.toolbox/.agentic_toolbox/` contains the logic for the Cognitive Loop (Research, Planning, Analysis, etc.).
- **How to use**: For any major phase (e.g., Planning), agents should scan the corresponding folder in `.toolbox/.agentic_toolbox/[capability]/` to understand the standardized workflow and available skills.

#### 4. Domain Capabilities (`.toolbox\*_toolbox\`)
- **Specialized Skills**: Business, engineering, life, and studio domains each have their own toolbox.
- **How to use**: Identify the domain from the task context, then navigate to the relevant subfolder under `.toolbox/[domain]_toolbox/[skill]/`.

