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
    1 — refresh failed; manual `notebooklm login` required on a GUI machine

Usage:
    python scripts/refresh_auth.py [--profile muscle-meta] [--timeout 30]
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

NOTEBOOKLM_URL = "https://notebooklm.google.com/"


def notebooklm_home(profile: str) -> Path:
    base = Path(os.environ.get("NOTEBOOKLM_HOME", Path.home() / ".notebooklm"))
    return base / "profiles" / profile


def run_auth_check(profile: str) -> bool:
    cmd = ["notebooklm"]
    if profile:
        cmd += ["-p", profile]
    cmd += ["auth", "check"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  auth check: OK")
        return True
    print(f"  auth check: FAILED — {result.stderr.strip() or result.stdout.strip()}")
    return False


def refresh_with_playwright(storage_state_path: Path, timeout: int) -> bool:
    """Use Playwright to navigate to NotebookLM and save updated cookies."""
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        print("ERROR: playwright not installed. Run: pip install playwright", file=sys.stderr)
        return False

    print(f"  Launching headless Chromium (timeout: {timeout}s)...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                storage_state=str(storage_state_path) if storage_state_path.exists() else None
            )
            page = context.new_page()
            page.goto(NOTEBOOKLM_URL, timeout=timeout * 1000, wait_until="networkidle")
            print(f"  Page loaded: {page.url}")
            # Save refreshed cookies
            context.storage_state(path=str(storage_state_path))
            print(f"  storage_state saved: {storage_state_path}")
            browser.close()
        return True
    except PWTimeout:
        print(f"  ERROR: timed out loading {NOTEBOOKLM_URL}", file=sys.stderr)
        return False
    except Exception as exc:
        print(f"  ERROR: {exc}", file=sys.stderr)
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Refresh NotebookLM auth cookies headlessly")
    parser.add_argument("--profile", default=os.environ.get("NOTEBOOKLM_PROFILE", "muscle-meta"))
    parser.add_argument("--timeout", type=int, default=30, help="Browser timeout in seconds")
    args = parser.parse_args()

    print(f"NotebookLM Auth Refresh (profile: {args.profile})")
    print("=" * 50)

    profile_dir = notebooklm_home(args.profile)
    storage_path = profile_dir / "storage_state.json"

    # If NOTEBOOKLM_AUTH_JSON is set (CI/CD), write it to the profile path first
    auth_json = os.environ.get("NOTEBOOKLM_AUTH_JSON", "").strip()
    if auth_json:
        print(f"  Using NOTEBOOKLM_AUTH_JSON env var → writing to {storage_path}")
        profile_dir.mkdir(parents=True, exist_ok=True)
        storage_path.write_text(auth_json)

    if not storage_path.exists():
        print(
            f"ERROR: No storage_state.json found at {storage_path}\n"
            "Run 'notebooklm login' on a machine with a browser first, then copy\n"
            "~/.notebooklm/profiles/{profile}/storage_state.json here.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Step 1: pre-check
    print("\n[1/3] Pre-refresh auth check:")
    pre_ok = run_auth_check(args.profile)
    if not pre_ok:
        print("  Auth already invalid — will attempt Playwright refresh anyway.")

    # Step 2: Playwright refresh
    print("\n[2/3] Playwright headless refresh:")
    refresh_ok = refresh_with_playwright(storage_path, args.timeout)
    if not refresh_ok:
        print("\nRefresh FAILED. Manual `notebooklm login` required.", file=sys.stderr)
        sys.exit(1)

    # Step 3: post-check
    print("\n[3/3] Post-refresh auth check:")
    post_ok = run_auth_check(args.profile)
    if not post_ok:
        print("\nAuth check failed after refresh. Manual `notebooklm login` required.", file=sys.stderr)
        sys.exit(1)

    print("\nAuth refresh complete.")


if __name__ == "__main__":
    main()
