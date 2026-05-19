# `.complex_inboxes/` — Strong-Source-Identity Parking Lot

> **What is this?** A user-only parking lot for external drops that the Scaler rejected from the standard External path because they are coherent pieces of a single named ecosystem (Claude Code extensions, Hermes Agent bundles, named system plugins, etc.).

## Why items land here

The Scaler's **strong-source-identity rejection** (P-LAW-022 in `Scaler-Operational-Rules.md`) detects when a drop is bound to one external ecosystem and would lose its coherence if split across our pillars. Rather than misclassify it, the Scaler moves the whole drop here and lets the user decide.

Detection thresholds (count + complexity + size + cross-reference coherence) live in `Scaler-Operational-Rules.md §10. Tuneable Constants`.

## The contract

This folder is inside `.scaler_USER-SPACE/`, which is **never scanned by the Scaler** (P-LAW-015). The single narrow exception: Scaler **writes** here when rejection triggers. Scaler **never reads back**.

That means:
- Items stay here until the user re-routes them
- Scaler will never auto-extract individual concerns from these drops
- Re-routing means: user picks the parts they want and drops them into `.scaler_mixed_inbox/` or a typed `_<Pillar>_inbox/` for normal processing

## Structure

```
.complex_inboxes/
├── <source-name-1>/                # one folder per identified ecosystem
│   ├── <items moved from inbox>
│   └── .rejection.yaml             # rejection marker (signature, trigger, reasoning)
└── <source-name-2>/
    └── ...
```

Each `<source-name>/` folder gets a `.rejection.yaml` written atomically with the move. That file is the audit trail — it documents what the Scaler saw and why it bounced the drop.

## Re-routing workflow (user-driven)

When you decide what to extract:
1. Read the `.rejection.yaml` to understand what the Scaler observed.
2. Pick the items you want to land in our pillars.
3. Move them out — into `.scaler_mixed_inbox/` (if you want Scaler to classify) or directly into `_<Pillar>_inbox/<group>/` (if you already know the pillar and group).
4. Run the next Scaler EXTERNAL cycle. Items will go through normal Classification + Categorisation.
5. Items you don't want, leave here or delete.
