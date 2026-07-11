#!/usr/bin/env python3
import json
import re
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parent
RESULTS = ROOT / "results"
FIELDS = ROOT / "fields.yaml"
OUTPUT = ROOT / "evidence-audit-report.md"

OBJECT_FIELDS = {
    "repository_state",
    "intended_users",
    "contribution_evidence",
    "collaborators",
    "architecture",
    "technology_stack",
    "reliability_security_evidence",
}

LIST_FIELDS = {
    "live_urls",
    "canonical_product_flow",
    "standout_engineering_decisions",
    "shipped_features",
    "external_validation",
    "repository_proof",
    "available_media",
    "evidence_gaps",
    "recommended_evidence_sequence",
    "case_study_outline",
    "limitations_and_no_go_claims",
}


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def contains_uncertain(value) -> bool:
    if isinstance(value, str):
        return "[uncertain]" in value
    if isinstance(value, list):
        return any(contains_uncertain(item) for item in value)
    if isinstance(value, dict):
        return any(contains_uncertain(item) for item in value.values())
    return False


def normalize_for_report(data):
    """Normalize independently authored audit records at the report boundary."""
    normalized = dict(data)
    for field in OBJECT_FIELDS:
        value = normalized.get(field)
        if value is not None and not isinstance(value, dict):
            normalized[field] = {"items": value} if isinstance(value, list) else {"summary": value}

    for field in LIST_FIELDS:
        value = normalized.get(field)
        if value is None or isinstance(value, list):
            continue
        if isinstance(value, dict):
            normalized[field] = [
                {"group": key, "items": item}
                for key, item in value.items()
            ]
        else:
            normalized[field] = [value]
    return normalized


def format_scalar(value) -> str:
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return str(value)


def render(value, indent=0):
    prefix = "  " * indent
    if value is None or value == "":
        return []
    if isinstance(value, dict):
        lines = []
        for key, item in value.items():
            label = key.replace("_", " ").title()
            if isinstance(item, (dict, list)):
                lines.append(f"{prefix}- **{label}:**")
                lines.extend(render(item, indent + 1))
            else:
                lines.append(f"{prefix}- **{label}:** {format_scalar(item)}")
        return lines
    if isinstance(value, list):
        lines = []
        for item in value:
            if isinstance(item, (dict, list)):
                lines.append(f"{prefix}-")
                lines.extend(render(item, indent + 1))
            else:
                lines.append(f"{prefix}- {format_scalar(item)}")
        return lines
    return [format_scalar(value)]


def short(value):
    if isinstance(value, dict):
        score = value.get("score")
        out_of = value.get("out_of")
        if score is not None and out_of is not None:
            return f"{score}/{out_of}"
        return next((str(v) for v in value.values() if isinstance(v, (str, int, float))), "")
    text = str(value)
    return text if len(text) <= 60 else text[:57].rstrip() + "..."


def main():
    schema = yaml.safe_load(FIELDS.read_text(encoding="utf-8"))
    categories = schema.get("field_categories", [])
    defined = {
        field["name"]
        for category in categories
        for field in category.get("fields", [])
    }

    entries = []
    for path in sorted(RESULTS.glob("*.json")):
        data = normalize_for_report(json.loads(path.read_text(encoding="utf-8")))
        name = data.get("project_name", path.stem.replace("_", " ").title())
        entries.append((name, path.name, data))

    out = [
        "# Flagship Evidence Audit",
        "",
        "Internal current-state evidence inventory through 11 July 2026. It supports the portfolio narrative; it is not public-facing copy and does not grade student or hackathon work against a production-company standard. Values explicitly marked uncertain are omitted; consult the source JSON for audit notes.",
        "",
        "Wildan's owner attestation is valid provenance for his own roles, leadership, decisions, and private or coordination work. Public artifacts illustrate scope and preserve collaborator credit; they do not veto his account.",
        "",
        "Raw source records retain an internal evidence-readiness field for asset planning; it is intentionally omitted from this narrative report and is not a public project rating.",
        "",
        "Independent audit records are normalized to stable object/list shapes at this report boundary; the source JSON preserves each researcher's richer raw structure.",
        "",
        "## Contents",
        "",
    ]

    for name, _, data in entries:
        maturity = short(data.get("product_maturity", ""))
        suffix_parts = [part for part in (maturity,) if part]
        suffix = " — " + " | ".join(suffix_parts) if suffix_parts else ""
        out.append(f"- [{name}](#{slug(name)}){suffix}")

    for name, source_file, data in entries:
        uncertain = set(data.get("uncertain", []))
        out.extend(["", f"## {name}", "", f"Source record: `{source_file}`", ""])

        for category in categories:
            rendered = []
            for field in category.get("fields", []):
                key = field["name"]
                if key == "readiness_score":
                    continue
                if key in uncertain or key not in data or contains_uncertain(data[key]):
                    continue
                body = render(data[key])
                if body:
                    label = field.get("label", key.replace("_", " ").title())
                    rendered.extend([f"#### {label}", "", *body, ""])
            if rendered:
                out.extend([f"### {category['category']}", "", *rendered])

        extras = {
            key: value
            for key, value in data.items()
            if key not in defined and key not in {"uncertain", "_source_file"}
        }
        if extras:
            out.extend(["### Other Info", "", *render(extras), ""])

        if uncertain:
            out.extend(["### Uncertain Fields", "", *[f"- `{item}`" for item in sorted(uncertain)], ""])

    OUTPUT.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
