#!/usr/bin/env python3
import subprocess
import sys

def run_unit():
    return subprocess.call(["poetry", "run", "pytest", "-m", "unit"])

def run_integration():
    return subprocess.call(["poetry", "run", "pytest", "-m", "integration"])

def run_all():
    rc = run_unit()
    if rc != 0:
        return rc
    rc = run_integration()
    return rc

if __name__ == "__main__":
    sys.exit(run_all())
