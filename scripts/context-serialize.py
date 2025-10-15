#!/usr/bin/env python3
"""
Context Serialization for Agentic Development
Generates structured JSON context files for agents
"""
import json
import os
import yaml
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

class ContextSerializer:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.context_file = self.project_root / "docs" / "agent-context.json"
        
    def load_yaml_frontmatter(self, file_path: Path) -> Dict[str, Any]:
        """Load YAML frontmatter from markdown files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        return yaml.safe_load(parts[1]) or {}
        except Exception as e:
            print(f"Warning: Could not load frontmatter from {file_path}: {e}")
        return {}
    
    def get_phase_info(self) -> Dict[str, Any]:
        """Extract current phase information"""
        session_state = self.project_root / "docs" / "SESSION_STATE.md"
        progress_file = self.project_root / "docs" / "PROGRESS.md"
        
        phase_info = {
            "current_phase": "unknown",
            "status": "unknown",
            "progress_percentage": 0,
            "next_steps": []
        }
        
        # Load session state
        if session_state.exists():
            frontmatter = self.load_yaml_frontmatter(session_state)
            phase_info.update({
                "current_phase": frontmatter.get("title", "unknown"),
                "status": frontmatter.get("status", "unknown")
            })
            
            # Extract progress percentage
            try:
                with open(session_state, 'r') as f:
                    content = f.read()
                    if "Progress:" in content:
                        for line in content.split('\n'):
                            if "Progress:" in line and "%" in line:
                                import re
                                match = re.search(r'(\d+)%', line)
                                if match:
                                    phase_info["progress_percentage"] = int(match.group(1))
                                    break
            except Exception:
                pass
        
        return phase_info
    
    def get_task_status(self) -> Dict[str, Any]:
        """Extract task completion status"""
        tasks = {
            "phase_0": {"completed": [], "pending": [], "in_progress": []},
            "phase_1": {"completed": [], "pending": [], "in_progress": []},
            "phase_2": {"completed": [], "pending": [], "in_progress": []},
            "phase_3": {"completed": [], "pending": [], "in_progress": []},
            "phase_4": {"completed": [], "pending": [], "in_progress": []}
        }
        
        # Scan phase specification files
        for phase_file in self.project_root.glob("docs/phase-*-specifications.md"):
            try:
                with open(phase_file, 'r') as f:
                    content = f.read()
                    phase_num = phase_file.stem.split('-')[1]
                    phase_key = f"phase_{phase_num}"
                    
                    # Extract checkboxes
                    import re
                    checkbox_pattern = r'- \[([ x])\] (.+)'
                    matches = re.findall(checkbox_pattern, content)
                    
                    for checked, task in matches:
                        if checked == 'x':
                            tasks[phase_key]["completed"].append(task.strip())
                        else:
                            tasks[phase_key]["pending"].append(task.strip())
            except Exception as e:
                print(f"Warning: Could not parse {phase_file}: {e}")
        
        return tasks
    
    def get_project_structure(self) -> Dict[str, Any]:
        """Get current project structure"""
        structure = {
            "directories": [],
            "files": [],
            "missing_files": []
        }
        
        # Expected structure
        expected_dirs = ["docs", "scripts", "src", "frontend", "tests", ".github/workflows"]
        expected_files = [
            "pyproject.toml", "LICENSE", "README.md", "PROJECT_CONTEXT.md",
            "src/app/main.py", "tests/conftest.py", "tests/factories.py"
        ]
        
        for dir_path in expected_dirs:
            full_path = self.project_root / dir_path
            if full_path.exists():
                structure["directories"].append(dir_path)
            else:
                structure["missing_files"].append(dir_path)
        
        for file_path in expected_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                structure["files"].append(file_path)
            else:
                structure["missing_files"].append(file_path)
        
        return structure
    
    def get_dependencies_status(self) -> Dict[str, Any]:
        """Check dependency and environment status"""
        status = {
            "python_version": "unknown",
            "poetry_available": False,
            "dependencies_installed": False,
            "env_file_exists": False,
            "secrets_configured": False
        }
        
        # Check Python version
        try:
            import sys
            status["python_version"] = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        except Exception:
            pass
        
        # Check Poetry
        try:
            import subprocess
            result = subprocess.run(["poetry", "--version"], capture_output=True, text=True)
            status["poetry_available"] = result.returncode == 0
        except Exception:
            pass
        
        # Check if dependencies are installed
        try:
            result = subprocess.run(["poetry", "check"], capture_output=True, text=True)
            status["dependencies_installed"] = result.returncode == 0
        except Exception:
            pass
        
        # Check for .env file
        env_file = self.project_root / ".env"
        status["env_file_exists"] = env_file.exists()
        
        # Check for GitHub secrets (basic check)
        secrets_file = self.project_root / ".github" / "secrets.md"
        status["secrets_configured"] = secrets_file.exists()
        
        return status
    
    def generate_context(self) -> Dict[str, Any]:
        """Generate complete context for agents"""
        context = {
            "timestamp": datetime.now().isoformat(),
            "project": {
                "name": "world-builder-site",
                "version": "0.1.0",
                "description": "Collaborative world-building web application"
            },
            "phase_info": self.get_phase_info(),
            "task_status": self.get_task_status(),
            "project_structure": self.get_project_structure(),
            "dependencies": self.get_dependencies_status(),
            "agent_instructions": {
                "current_phase_only": True,
                "quality_gates_required": True,
                "test_coverage_minimum": 80,
                "commit_convention": "conventional"
            }
        }
        
        return context
    
    def save_context(self, context: Dict[str, Any]) -> None:
        """Save context to JSON file"""
        self.context_file.parent.mkdir(exist_ok=True)
        with open(self.context_file, 'w', encoding='utf-8') as f:
            json.dump(context, f, indent=2, ensure_ascii=False)
        print(f"Context saved to {self.context_file}")
    
    def print_summary(self, context: Dict[str, Any]) -> None:
        """Print a human-readable summary"""
        print("🚀 world-builder-site: Agent Context Summary")
        print("=" * 50)
        print(f"📅 Generated: {context['timestamp']}")
        print(f"📋 Current Phase: {context['phase_info']['current_phase']}")
        print(f"📊 Progress: {context['phase_info']['progress_percentage']}%")
        print(f"🐍 Python: {context['dependencies']['python_version']}")
        print(f"📦 Poetry: {'✅' if context['dependencies']['poetry_available'] else '❌'}")
        print(f"🔧 Dependencies: {'✅' if context['dependencies']['dependencies_installed'] else '❌'}")
        print(f"🔐 Environment: {'✅' if context['dependencies']['env_file_exists'] else '❌'}")
        print(f"📁 Missing Files: {len(context['project_structure']['missing_files'])}")
        
        if context['project_structure']['missing_files']:
            print("\n⚠️  Missing Files:")
            for file in context['project_structure']['missing_files'][:5]:  # Show first 5
                print(f"   - {file}")
            if len(context['project_structure']['missing_files']) > 5:
                print(f"   ... and {len(context['project_structure']['missing_files']) - 5} more")

def main():
    serializer = ContextSerializer()
    context = serializer.generate_context()
    serializer.save_context(context)
    serializer.print_summary(context)

if __name__ == "__main__":
    main()

