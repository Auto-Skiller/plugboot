# 🛠️ Bootstrap Protocol

This protocol defines the exact steps an agent must take to scaffold a new Pipeline or Project within the Agentic OS v5 architecture.

## Adding a New Pipeline

```
1. Create execution workspace:     _pipelines/[name]/
2. Create scope:                   .scope/pipelines/[name]/
3. Create scope internals:         .scope/pipelines/[name]/.registry/    (leave empty, add .gitkeep)
                                   .scope/pipelines/[name]/.context/
                                   .scope/pipelines/[name]/.missions/definitions/
                                   .scope/pipelines/[name]/.missions/runs/
4. Create context registry:        .brain/.context.control/pipelines.context.registry/[name].context.registry
5. Create missions registry:       .brain/.missions.control/pipelines.missions.registry/[name].missions.registry
6. Update BOARD.yaml:              Add [name] to scopes.pipelines[]
                                   Add a new goal to active_goals
7. Run Engine Chain:               Execute Navigator → Cataloger on the new scope to populate the registries.
```

## Adding a New Project

```
1. Create execution workspace:     _projects/[name]/
2. Create scope:                   .scope/projects/[name]/
3. Create scope internals:         .scope/projects/[name]/.registry/    (leave empty, add .gitkeep)
                                   .scope/projects/[name]/.context/
                                   .scope/projects/[name]/.missions/definitions/
                                   .scope/projects/[name]/.missions/runs/
4. Create context registry:        .brain/.context.control/projects.context.registry/[name].context.registry
5. Create missions registry:       .brain/.missions.control/projects.missions.registry/[name].missions.registry
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
3. Move .brain/.context.control/[type].context.registry/[name].context.registry
                                                        → archive/.brain/[name].context.registry
4. Move .brain/.missions.control/[type].missions.registry/[name].missions.registry
                                                        → archive/.brain/[name].missions.registry
5. Remove from BOARD.yaml:         Remove [name] from scopes.[scope_type][]
6. Move goal in BOARD.yaml:        Move goal to completed_goals
```
