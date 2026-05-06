# 🛠️ Bootstrap Protocol

This protocol defines the exact steps an agent must take to scaffold a new Pipeline or Project within the Agentic OS v5 architecture.

## Adding a New Pipeline

```
1. Create execution workspace:     _pipelines/[name]/
2. Create scope:                   .scope/pipelines/[name]/
3. Create scope internals:         .scope/pipelines/[name]/.index/    (leave empty, add .gitkeep)
                                   .scope/pipelines/[name]/.knowledge/
                                   .scope/pipelines/[name]/.missions/definitions/
                                   .scope/pipelines/[name]/.missions/runs/
4. Create context index:        .brain/.knowledge.context_control/pipelines.context.index/[name].context.catalog.yaml
5. Create missions index:       .brain/.missions.context_control/pipelines/[name].missions.catalog.yaml
6. Update BOARD.yaml:              Add [name] to scopes.pipelines[]
                                   Add a new goal to active_goals
7. Run Engine Chain:               Execute Navigator → Cataloger on the new scope to populate the registries.
```

## Adding a New Project

```
1. Create execution workspace:     _projects/[name]/
2. Create scope:                   .scope/projects/[name]/
3. Create scope internals:         .scope/projects/[name]/.index/    (leave empty, add .gitkeep)
                                   .scope/projects/[name]/.knowledge/
                                   .scope/projects/[name]/.missions/definitions/
                                   .scope/projects/[name]/.missions/runs/
4. Create context index:        .brain/.knowledge.context_control/projects.context.index/[name].context.catalog.yaml
5. Create missions index:       .brain/.missions.context_control/projects/[name].missions.catalog.yaml
6. Update BOARD.yaml:              Add [name] to scopes.projects[]
                                   Add a new goal to active_goals
7. Run Engine Chain:               Execute Navigator → Cataloger on the new scope to populate the registries.
```

## Archiving a Scope

Never delete data. Always move it to the `archive/`.

```
1. Move _pipelines/[name]/                              → archive/pipelines/[name]/
   (or _projects/[name]/                                → archive/projects/[name]/)
2. Move .scope/[scope_type]/[name]/                     → archive/.scope/[scope_type]/[name]/
3. Move .brain/.knowledge.context_control/[type].context.index/[name].context.catalog.yaml
                                                        → archive/.brain/[name].context.catalog.yaml
4. Move .brain/.missions.context_control/[type].missions.index/[name].missions.catalog.yaml
                                                        → archive/.brain/[name].missions.catalog.yaml
5. Remove from BOARD.yaml:         Remove [name] from scopes.[scope_type][]
6. Move goal in BOARD.yaml:        Move goal to completed_goals
```
