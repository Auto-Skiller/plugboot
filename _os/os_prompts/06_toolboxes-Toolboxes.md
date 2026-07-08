# Toolboxes (the muscles)

Hierarchy: domain -> toolbox -> (agents + skills). Declared and controlled in `*-toolboxes.yaml`. Files are plain Markdown; metadata lives in the YAML so users see what's available and agents pick actives without reading every file.

## Maturity ladder
stub -> functional -> hardened -> battle-tested. Metrics roll up per toolbox, per domain, per entity.

## Activation
User controls status: true|false at domain and toolbox level. Agents only use actives. The bottom dashboard bar shows toolbox metrics + top-level control; clicking opens the full control popup driven by this YAML.

## Aspects mapping
Toolboxes are the Capabilities aspect. Evolution runs targeting Capabilities operate here — adding/hardening skills and agents.

## Building a capability
1. Add the skill/agent markdown under the toolbox folder.
2. The daemon detects it and flags fill_queue.toolboxes.
3. The agent fills metadata (role, when_to_use, triggers, inputs, outputs, maturity).
4. User flips status: true to activate.
