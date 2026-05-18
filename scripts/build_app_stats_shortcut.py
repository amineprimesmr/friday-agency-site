#!/usr/bin/env python3
"""Build App Stats.shortcut (binary plist) from public app metrics JSON."""

from __future__ import annotations

import plistlib
import platform
import shutil
import subprocess
import sys
from pathlib import Path

# Object Replacement Character — placeholder for magic variables in Shortcuts
ORC = "\uFFFC"


def text_token_string(text: str, ranges: dict[str, dict]) -> dict:
    """WFTextTokenString Value dict with attachmentsByRange keys like '{0, 1}'."""
    return {
        "Value": {
            "attachmentsByRange": ranges,
            "string": text,
        },
        "WFSerializationType": "WFTextTokenString",
    }


def var_attachment(name: str) -> dict:
    return {"Type": "Variable", "VariableName": name}


def build_workflow() -> dict:
    # URL base length for appending appId (must match attachment range in plist)
    url_base = "https://app.sensortower.com/api/ios/apps?app_ids="
    # One ORC at end of url_base for variable insertion
    url_display = url_base + ORC
    url_attach = {"{%d, 1}" % len(url_base): var_attachment("appId")}

    alert_msg = f"{ORC} downloads & {ORC} revenue last month"
    # First ORC at 0, second after " downloads & " (length of prefix including first ORC)
    idx2 = len(f"{ORC} downloads & ")
    alert_attach = {
        "{0, 1}": var_attachment("dlString"),
        "{%d, 1}" % idx2: var_attachment("revString"),
    }

    actions: list[dict] = [
        # 1) Extraire les URL depuis la fiche App Store / la page Safari / le texte du presse-papiers
        # 2) Mettre l’URL en variable puis regex dessus (évite toute action « Texte » + Entrée brute)
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.detect.link",
            "WFWorkflowActionParameters": {},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getitemfromlist",
            "WFWorkflowActionParameters": {"WFItemSpecifier": "First Item"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
            "WFWorkflowActionParameters": {"WFVariableName": "storeUrl"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.text.match",
            "WFWorkflowActionParameters": {
                "WFMatchTextPattern": "[0-9]{8,}",
                "WFInput": {
                    "Value": var_attachment("storeUrl"),
                    "WFSerializationType": "WFTextTokenAttachment",
                },
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getitemfromlist",
            "WFWorkflowActionParameters": {"WFItemSpecifier": "First Item"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
            "WFWorkflowActionParameters": {"WFVariableName": "appId"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.url",
            "WFWorkflowActionParameters": {
                "WFURLActionURL": text_token_string(url_display, url_attach),
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.downloadurl",
            "WFWorkflowActionParameters": {"WFHTTPMethod": "GET"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getvalueforkey",
            "WFWorkflowActionParameters": {
                "WFDictionaryKey": text_token_string("apps", {}),
                "WFGetDictionaryValueType": "Value",
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getitemfromlist",
            "WFWorkflowActionParameters": {"WFItemSpecifier": "First Item"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
            "WFWorkflowActionParameters": {"WFVariableName": "stApp"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getvalueforkey",
            "WFWorkflowActionParameters": {
                "WFDictionaryKey": text_token_string(
                    "humanized_worldwide_last_month_revenue", {}
                ),
                "WFGetDictionaryValueType": "Value",
                "WFInput": {
                    "Value": var_attachment("stApp"),
                    "WFSerializationType": "WFTextTokenAttachment",
                },
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
            "WFWorkflowActionParameters": {"WFVariableName": "revString"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.getvalueforkey",
            "WFWorkflowActionParameters": {
                "WFDictionaryKey": text_token_string(
                    "humanized_worldwide_last_month_downloads", {}
                ),
                "WFGetDictionaryValueType": "Value",
                "WFInput": {
                    "Value": var_attachment("stApp"),
                    "WFSerializationType": "WFTextTokenAttachment",
                },
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.setvariable",
            "WFWorkflowActionParameters": {"WFVariableName": "dlString"},
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.alert",
            "WFWorkflowActionParameters": {
                "WFAlertActionTitle": text_token_string("App Stats", {}),
                "WFAlertActionMessage": text_token_string(alert_msg, alert_attach),
                "WFAlertActionCancelButtonShown": False,
            },
        },
    ]

    return {
        "WFWorkflowActions": actions,
        "WFWorkflowClientVersion": "1300.0.1",
        "WFWorkflowIcon": {
            "WFWorkflowIconGlyphNumber": 59511,
            "WFWorkflowIconStartColor": 4292093695,  # green (Shortcuts palette)
        },
        "WFWorkflowInputContentItemClasses": [
            "WFAppStoreAppContentItem",
            "WFURLContentItem",
            "WFSafariWebPageContentItem",
            "WFStringContentItem",
        ],
        "WFWorkflowMinimumClientVersion": 900,
        "WFWorkflowMinimumClientVersionString": "900",
        "WFWorkflowName": "Trackapp · App Stats (import test mai 2026)",
        "WFWorkflowNoInputBehavior": {"Name": "GetClipboard", "Parameters": {}},
        "WFWorkflowTypes": ["ActionExtension"],
    }


def _sign_shortcut(unsigned: Path, signed: Path) -> None:
    """macOS only: `shortcuts sign` is required to import .shortcut on iOS 15+ / recent macOS."""
    if platform.system() != "Darwin" or not shutil.which("shortcuts"):
        print(
            "Skipping sign (needs macOS /usr/bin/shortcuts). "
            f"Import {unsigned.name} via an older device or sign locally.",
            file=sys.stderr,
        )
        return
    subprocess.run(
        [
            "shortcuts",
            "sign",
            "--mode",
            "anyone",
            "--input",
            str(unsigned),
            "--output",
            str(signed),
        ],
        check=True,
    )


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out = root / "public" / "trackapp-app-stats.shortcut"
    signed = root / "public" / "trackapp-app-stats-signed.shortcut"
    data = build_workflow()
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("wb") as f:
        plistlib.dump(data, f, fmt=plistlib.FMT_BINARY)
    print(f"Wrote {out}")
    try:
        _sign_shortcut(out, signed)
    except subprocess.CalledProcessError as e:
        print(f"sign failed (exit {e.returncode}): import may require signing manually.", file=sys.stderr)
        raise SystemExit(e.returncode) from e
    print(f"Signed {signed} (use this file to import in Raccourcis)")


if __name__ == "__main__":
    main()
