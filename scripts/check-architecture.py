#!/usr/bin/env python3
"""
Simple architecture checks placeholder. Expand as rules are defined.
"""
import os
import sys

def check_fastapi_app():
    # Ensure src/app/main.py exists
    if not os.path.exists("src/app/main.py"):
        print("Missing src/app/main.py")
        return False
    return True

def main():
    ok = True
    if not check_fastapi_app():
        ok = False
    if not ok:
        print("Architecture validation failed")
        sys.exit(1)
    print("Architecture validation passed")
    sys.exit(0)

if __name__ == "__main__":
    main()
