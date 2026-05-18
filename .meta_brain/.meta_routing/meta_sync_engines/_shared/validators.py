"""
Shared Validators (Agentic OS v5.3)
====================================
Single source of truth for the schema validator and the schema-from-yaml loader
used by every sync engine. Lifted from the 5 near-duplicate copies that lived
in milestones_sync, toolboxes_sync, pipelines_sync, projects_sync, and
meta_runtime_sync.

All engines MUST import these instead of re-declaring their own copies.
"""
from __future__ import annotations

import pathlib
from typing import Any, Tuple

from ruamel.yaml import YAML

_yaml = YAML()
_yaml.preserve_quotes = True


def validate(data: Any, schema: Any) -> Tuple[bool, str]:
    """
    Validate `data` against `schema`. Schemas are loaded from the Part 2 block
    of each router YAML and may contain:
      - dict mappings (with optional "[DYNAMIC]" placeholder keys for free-form ids)
      - list-of-one-element type definitions
      - string-typed primitives: "string", "timestamp", "string | dict", or
        a pipe-delimited enum like "active | paused | done"

    Returns (is_valid, error_message).
    """
    if isinstance(schema, dict):
        if not isinstance(data, dict):
            return False, f"Expected dict, got {type(data).__name__}"

        # Free-form key support: schema with "[NAME]" placeholder accepts any key.
        dynamic_key = None
        for k in schema.keys():
            if str(k).startswith("[") and str(k).endswith("]"):
                dynamic_key = k
                break

        if dynamic_key is not None:
            type_def = schema[dynamic_key]
            for k, v in data.items():
                ok, err = validate(v, type_def)
                if not ok:
                    return False, f"{k} -> {err}"
            return True, ""

        for key, type_def in schema.items():
            if key not in data:
                return False, f"Missing required key: {key}"
            ok, err = validate(data[key], type_def)
            if not ok:
                return False, f"{key} -> {err}"
        return True, ""

    if isinstance(schema, list):
        if not isinstance(data, list):
            return False, f"Expected list, got {type(data).__name__}"
        if schema:
            type_def = schema[0]
            for i, item in enumerate(data):
                ok, err = validate(item, type_def)
                if not ok:
                    return False, f"Index {i} -> {err}"
        return True, ""

    if isinstance(schema, str):
        if schema == "string":
            if not isinstance(data, str):
                return False, f"Expected string, got {type(data).__name__}"
            if not data.strip():
                return False, "Field is empty"
            return True, ""
        if schema == "timestamp":
            if not isinstance(data, str):
                return False, f"Expected timestamp string, got {type(data).__name__}"
            return True, ""
        if schema == "string | dict":
            if not isinstance(data, (str, dict)):
                return False, f"Expected string or dict, got {type(data).__name__}"
            return True, ""

        if "|" in schema:
            allowed = [s.strip() for s in schema.split("|")]
            if str(data) not in allowed:
                return False, f"Value '{data}' not in allowed list: {allowed}"
            return True, ""

        return True, ""

    return True, ""


def load_schema_from_yaml(yaml_path: pathlib.Path, schema_key: str, *,
                          alt_keys: tuple[str, ...] = (),
                          warn: bool = True):
    """Read a Part-2 schema string from a router YAML and parse it as YAML.

    GAP-SCHEMA-LOAD-SILENT fix: the previous implementation returned ``None``
    silently whenever ``schema_key`` was missing. That meant a rename inside
    a router file (e.g. ``pipeline_schema`` → ``pipeline_inner_schema``)
    silently disabled validation for that whole engine — caught only in
    code review. The new behaviour:

      * Accept ``alt_keys`` so callers can declare known historical names.
      * Print a [WARN] line when none of the requested keys are present
        (suppressible via ``warn=False`` for callers that legitimately
        treat the schema as optional).

    Returns the parsed schema dict, or ``None`` if no key matches.
    """
    if not yaml_path.exists():
        return None
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = _yaml.load(f)
    if not data:
        return None

    candidate_keys = (schema_key, *alt_keys)
    schema_str = None
    matched_key = None
    for key in candidate_keys:
        if key and key in data and data[key]:
            schema_str = data[key]
            matched_key = key
            break

    if schema_str is None:
        if warn:
            tried = ", ".join(repr(k) for k in candidate_keys if k)
            print(f"  [WARN] schema lookup miss in {yaml_path.name}: tried {tried} — validation disabled.")
        return None

    safe = YAML(typ="safe")
    # Schema_str arrives as a ruamel.yaml LiteralScalarString when the parent
    # router YAML is loaded with the round-trip parser. YAML(typ="safe").load
    # only accepts plain str / stream, so coerce here.
    parsed = safe.load(str(schema_str))
    if warn and matched_key != schema_key:
        print(f"  [INFO] schema key drift in {yaml_path.name}: using alt key '{matched_key}' (canonical is '{schema_key}').")
    return parsed
