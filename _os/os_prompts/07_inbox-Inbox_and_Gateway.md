# Inbox & Gateway

The inbox is where the user drops data for the system to learn from or act on: competitor data, references, research material, source documents, anything.

## Disk layout
<entity>-inbox/                          raw user drops (IMMUTABLE source, never edited/moved)
<entity>-inbox/.<entity>-inbox_gateway/  agent-curated:
  <Pillar>/                              pillar folders (dynamic; match runtime pillars)
    <functional_group>/                  items grouped by what they DO (not by source)

Concrete for the OS entity: _os/os-inbox/ (raw) and _os/os-inbox/.os-inbox_gateway/ (curated).
For a project: project_x/project_x-inbox/ and project_x/project_x-inbox/.project_x-inbox_gateway/.

## The flow
1. User drops raw items into the inbox folder.
2. Daemon detects them, stamps structure in `<entity>-inbox.yaml -> raw`, flags fill_queue.inbox.
3. Agent describes each raw item (description/contains/when_to_use).
4. Agent delivers (copies, never moves) relevant items into .<entity>-inbox_gateway/<Pillar>/<functional_group>/, recording extracted_concern + source_raw_item. Raw stays untouched.
5. INBOX evolution runs consume gateway items per pillar/aspect.

## The inbox YAML is the tracker + brain
Its `gateway:` section describes everything in the gateway folder (description, contains, when_to_use) and its `processed:` section tracks which INBOX evolutions have processed which gateway items under which aspects, so nothing is reprocessed blindly.

## Functional groups
Name groups by what items DO, not where they came from. Same-pillar only. Sub-grouping optional and unbounded. Before creating a group, check siblings for a functional match (avoid fragmentation).
