#!/usr/bin/env python3
"""Inlines tokens.css into power-check.src.html -> ../power-check.html (self-contained)."""
import pathlib
d = pathlib.Path(__file__).parent
src = (d / "power-check.src.html").read_text()
(d.parent / "power-check.html").write_text(src.replace("/*TOKENS*/", (d / "tokens.css").read_text()))
print("built", d.parent / "power-check.html")
