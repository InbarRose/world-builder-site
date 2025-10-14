#!/usr/bin/env python3
"""
Quality Gate script - runs tests and enforces coverage threshold
"""
import subprocess
import sys

COVERAGE_MIN = 80

def run(cmd):
    print(f"Running: {' '.join(cmd)}")
    return subprocess.call(cmd)

def main():
    rc = run(["poetry", "run", "pytest", "--maxfail=1", "-q"])
    if rc != 0:
        print("Tests failed")
        sys.exit(rc)
    rc = run(["poetry", "run", "pytest", "--maxfail=1", "--cov=src", "--cov-fail-under", str(COVERAGE_MIN)])
    if rc != 0:
        print("Coverage gate failed")
        sys.exit(rc)
    print("Quality gate passed")
    sys.exit(0)

if __name__ == "__main__":
    main()
