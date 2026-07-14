#!/usr/bin/env python3
"""
Headless NotebookLM auth refresh.

Launches headless Chromium with the saved browser profile, navigates to
notebooklm.google.com to refresh the Google session cookies, saves the
updated storage_state.json, then verifies with `notebooklm auth check`.

Designed to run on a cron schedule every 3-5 days.

Cron example (every 3 days at 9am):
    0 9 */3 * * cd /path/to/muscle-meta-assets && python scripts/refresh_auth.py

Exit codes:
    0 — refresh succeeded and auth check passed
    1 — refresh failed; re-run `notebooklm login --browser-cookies chrome` on a local machine

Usage:
    python scripts/refresh_auth.py [--profile default] [--timeout 30]
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

NOTEBOOKLM_URL = "https://notebooklm.google.com/"


def profile_storage_path(profile: str) -> Path:
    base = Path(os.environ.get("NOTEBOOKLM_HOME", Path.home() / ".notebooklm"))
    return base / "profiles" / profile / "storage_state.json"


def run_auth_check(profile: str) -> bool:
    result = subprocess.run(
        ["notebooklm", "-p", profile, "auth", "check"],
        capture_output=True, text=True,
    )
    if result.returncode == 0:
        print("  auth check: OK")
        return True
    print(f"  auth check: FAILED — {result.stderr.strip() or result.stdout.strip()}")
    return False


def refresh_with_playwright(storage_path: Path, timeout: int) -> bool:
    """Use Playwright to navigate to NotebookLM and save updated cookies."""
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        print("ERROR: playwright not installed. Run: pip install 'notebooklm-py[browser]'", file=sys.stderr)
        return False

    print(f"  Launching headless Chromium (timeout: {timeout}s)...")
    try:
        with sync_playwright() as p:
            context = p.chromium.launch(headless=True).new_context(
                storage_state=str(storage_path) if storage_path.exists() else None
            )
            page = context.new_page()
            page.goto(NOTEBOOKLM_URL, timeout=timeout * 1000, wait_until="networkidle")
            print(f"  Page loaded: {page.url}")
            context.storage_state(path=str(storage_path))
            print(f"  storage_state saved: {storage_path}")
            context.browser.close()
        return True
    except PWTimeout:
        print(f"  ERROR: timed out loading {NOTEBOOKLM_URL}", file=sys.stderr)
        return False
    except Exception as exc:
        print(f"  ERROR: {exc}", file=sys.stderr)
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Refresh NotebookLM auth cookies headlessly")
    parser.add_argument(
        "-p", "--profile",
        default=os.environ.get("NOTEBOOKLM_PROFILE", "default"),
        help="notebooklm-py profile name",
    )
    parser.add_argument("--timeout", type=int, default=30, help="Browser timeout in seconds")
    args = parser.parse_args()

    print(f"NotebookLM Auth Refresh (profile: {args.profile})")
    print("=" * 50)

    storage_path = profile_storage_path(args.profile)

    # If NOTEBOOKLM_AUTH_JSON is set (CI/CD), write it to the profile path first
    auth_json = os.environ.get("NOTEBOOKLM_AUTH_JSON", "").strip()
    if auth_json:
        print(f"  Using NOTEBOOKLM_AUTH_JSON env var → writing to {storage_path}")
        storage_path.parent.mkdir(parents=True, exist_ok=True)
        storage_path.write_text(auth_json)

    if not storage_path.exists():
        print(
            f"ERROR: No storage_state.json found at {storage_path}\n"
            "Run on a local machine with Chrome installed:\n"
            "  pip install 'notebooklm-py[cookies]'\n"
            f"  notebooklm -p {args.profile} login --browser-cookies chrome",
            file=sys.stderr,
        )
        sys.exit(1)

    print("\n[1/3] Pre-refresh auth check:")
    pre_ok = run_auth_check(args.profile)
    if not pre_ok:
        print("  Auth already invalid — will attempt Playwright refresh anyway.")

    print("\n[2/3] Playwright headless refresh:")
    refresh_ok = refresh_with_playwright(storage_path, args.timeout)
    if not refresh_ok:
        print(
            "\nRefresh FAILED. Re-run on a local machine:\n"
            "  notebooklm login --browser-cookies chrome",
            file=sys.stderr,
        )
        sys.exit(1)

    print("\n[3/3] Post-refresh auth check:")
    post_ok = run_auth_check(args.profile)
    if not post_ok:
        print(
            "\nAuth check failed after refresh. Re-run on a local machine:\n"
            "  notebooklm login --browser-cookies chrome",
            file=sys.stderr,
        )
        sys.exit(1)

    print("\nAuth refresh complete.")


if __name__ == "__main__":
    main()
