#!/usr/bin/env python3
"""
Error Recovery and Rollback Manager for world-builder-site
Provides automated error recovery and safe rollback capabilities
"""
import json
import os
import subprocess
import sys
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import git

class ErrorRecoveryManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.backup_dir = self.project_root / ".backups"
        self.error_log = self.project_root / "docs" / "error-log.json"
        self.recovery_log = self.project_root / "docs" / "recovery-log.json"
        
    def log_error(self, error_type: str, error_message: str, context: Dict[str, Any] = None) -> None:
        """Log error for analysis and recovery"""
        error_entry = {
            "timestamp": datetime.now().isoformat(),
            "error_type": error_type,
            "error_message": error_message,
            "context": context or {},
            "resolved": False
        }
        
        # Load existing error log
        errors = []
        if self.error_log.exists():
            with open(self.error_log, 'r') as f:
                errors = json.load(f)
        
        errors.append(error_entry)
        
        # Save updated error log
        with open(self.error_log, 'w') as f:
            json.dump(errors, f, indent=2)
        
        print(f"❌ Error logged: {error_type} - {error_message}")
    
    def create_backup(self, backup_name: str = None) -> str:
        """Create backup of current state"""
        if not backup_name:
            backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        backup_path = self.backup_dir / backup_name
        backup_path.mkdir(parents=True, exist_ok=True)
        
        # Backup critical files
        critical_files = [
            "src/",
            "tests/",
            "docs/",
            "scripts/",
            "pyproject.toml",
            "README.md"
        ]
        
        for file_path in critical_files:
            source = self.project_root / file_path
            if source.exists():
                if source.is_dir():
                    shutil.copytree(source, backup_path / file_path)
                else:
                    shutil.copy2(source, backup_path / file_path)
        
        # Create backup metadata
        backup_metadata = {
            "timestamp": datetime.now().isoformat(),
            "backup_name": backup_name,
            "git_commit": self._get_current_commit(),
            "files_backed_up": critical_files
        }
        
        with open(backup_path / "backup_metadata.json", 'w') as f:
            json.dump(backup_metadata, f, indent=2)
        
        print(f"✅ Backup created: {backup_name}")
        return backup_name
    
    def restore_backup(self, backup_name: str) -> bool:
        """Restore from backup"""
        backup_path = self.backup_dir / backup_name
        
        if not backup_path.exists():
            print(f"❌ Backup not found: {backup_name}")
            return False
        
        try:
            # Load backup metadata
            metadata_file = backup_path / "backup_metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                print(f"📋 Restoring backup from: {metadata['timestamp']}")
            
            # Restore files
            for item in backup_path.iterdir():
                if item.name == "backup_metadata.json":
                    continue
                
                target = self.project_root / item.name
                if target.exists():
                    if target.is_dir():
                        shutil.rmtree(target)
                    else:
                        target.unlink()
                
                if item.is_dir():
                    shutil.copytree(item, target)
                else:
                    shutil.copy2(item, target)
            
            print(f"✅ Backup restored: {backup_name}")
            return True
            
        except Exception as e:
            print(f"❌ Error restoring backup: {e}")
            return False
    
    def rollback_git_commit(self, commit_hash: str = None) -> bool:
        """Rollback to specific git commit"""
        try:
            repo = git.Repo(self.project_root)
            
            if not commit_hash:
                # Rollback to previous commit
                commits = list(repo.iter_commits(max_count=2))
                if len(commits) < 2:
                    print("❌ No previous commit to rollback to")
                    return False
                commit_hash = commits[1].hexsha
            
            # Reset to specified commit
            repo.git.reset("--hard", commit_hash)
            print(f"✅ Rolled back to commit: {commit_hash[:8]}")
            return True
            
        except Exception as e:
            print(f"❌ Error rolling back git commit: {e}")
            return False
    
    def analyze_error_patterns(self) -> Dict[str, Any]:
        """Analyze error patterns for prevention"""
        if not self.error_log.exists():
            return {"error_count": 0, "patterns": []}
        
        with open(self.error_log, 'r') as f:
            errors = json.load(f)
        
        # Analyze error types
        error_types = {}
        unresolved_errors = []
        
        for error in errors:
            error_type = error["error_type"]
            error_types[error_type] = error_types.get(error_type, 0) + 1
            
            if not error.get("resolved", False):
                unresolved_errors.append(error)
        
        # Find common patterns
        patterns = []
        if len(errors) > 5:
            # Look for recurring error types
            for error_type, count in error_types.items():
                if count > 2:
                    patterns.append({
                        "type": "recurring_error",
                        "error_type": error_type,
                        "count": count,
                        "recommendation": self._get_error_recommendation(error_type)
                    })
        
        return {
            "error_count": len(errors),
            "unresolved_count": len(unresolved_errors),
            "error_types": error_types,
            "patterns": patterns,
            "recent_errors": errors[-5:] if errors else []
        }
    
    def _get_error_recommendation(self, error_type: str) -> str:
        """Get recommendation for error type"""
        recommendations = {
            "dependency_error": "Check pyproject.toml and run 'poetry install'",
            "test_failure": "Review test code and fix failing assertions",
            "linting_error": "Run 'poetry run ruff check .' and fix issues",
            "formatting_error": "Run 'poetry run black .' to format code",
            "import_error": "Check import paths and module structure",
            "configuration_error": "Validate configuration files and environment variables",
            "database_error": "Check database connection and schema",
            "api_error": "Review API endpoint implementation and validation"
        }
        return recommendations.get(error_type, "Review error logs and fix underlying issue")
    
    def _get_current_commit(self) -> str:
        """Get current git commit hash"""
        try:
            repo = git.Repo(self.project_root)
            return repo.head.commit.hexsha
        except:
            return "unknown"
    
    def auto_recover(self, error_type: str, error_message: str) -> bool:
        """Attempt automatic recovery based on error type"""
        print(f"🔄 Attempting automatic recovery for: {error_type}")
        
        recovery_actions = {
            "dependency_error": self._recover_dependency_error,
            "test_failure": self._recover_test_failure,
            "linting_error": self._recover_linting_error,
            "formatting_error": self._recover_formatting_error,
            "import_error": self._recover_import_error,
            "configuration_error": self._recover_configuration_error
        }
        
        recovery_func = recovery_actions.get(error_type)
        if recovery_func:
            try:
                success = recovery_func(error_message)
                if success:
                    print(f"✅ Automatic recovery successful for: {error_type}")
                    self._log_recovery(error_type, "automatic", True)
                    return True
                else:
                    print(f"❌ Automatic recovery failed for: {error_type}")
                    self._log_recovery(error_type, "automatic", False)
                    return False
            except Exception as e:
                print(f"❌ Error during automatic recovery: {e}")
                return False
        else:
            print(f"⚠️  No automatic recovery available for: {error_type}")
            return False
    
    def _recover_dependency_error(self, error_message: str) -> bool:
        """Recover from dependency errors"""
        try:
            subprocess.run(["poetry", "install"], check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def _recover_linting_error(self, error_message: str) -> bool:
        """Recover from linting errors"""
        try:
            subprocess.run(["poetry", "run", "ruff", "check", ".", "--fix"], check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def _recover_formatting_error(self, error_message: str) -> bool:
        """Recover from formatting errors"""
        try:
            subprocess.run(["poetry", "run", "black", "."], check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def _recover_test_failure(self, error_message: str) -> bool:
        """Recover from test failures"""
        # Test failures usually require manual intervention
        return False
    
    def _recover_import_error(self, error_message: str) -> bool:
        """Recover from import errors"""
        # Import errors usually require manual intervention
        return False
    
    def _recover_configuration_error(self, error_message: str) -> bool:
        """Recover from configuration errors"""
        try:
            subprocess.run(["python3", "scripts/config-validator.py", "validate"], check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def _log_recovery(self, error_type: str, recovery_type: str, success: bool) -> None:
        """Log recovery attempt"""
        recovery_entry = {
            "timestamp": datetime.now().isoformat(),
            "error_type": error_type,
            "recovery_type": recovery_type,
            "success": success
        }
        
        # Load existing recovery log
        recoveries = []
        if self.recovery_log.exists():
            with open(self.recovery_log, 'r') as f:
                recoveries = json.load(f)
        
        recoveries.append(recovery_entry)
        
        # Save updated recovery log
        with open(self.recovery_log, 'w') as f:
            json.dump(recoveries, f, indent=2)
    
    def cleanup_old_backups(self, keep_count: int = 5) -> None:
        """Clean up old backups, keeping only the most recent ones"""
        if not self.backup_dir.exists():
            return
        
        backups = []
        for backup_path in self.backup_dir.iterdir():
            if backup_path.is_dir():
                metadata_file = backup_path / "backup_metadata.json"
                if metadata_file.exists():
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                    backups.append((metadata["timestamp"], backup_path))
        
        # Sort by timestamp (newest first)
        backups.sort(key=lambda x: x[0], reverse=True)
        
        # Remove old backups
        for timestamp, backup_path in backups[keep_count:]:
            shutil.rmtree(backup_path)
            print(f"🗑️  Removed old backup: {backup_path.name}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 error-recovery.py <command> [args]")
        print("Commands:")
        print("  backup [name]           - Create backup")
        print("  restore <name>          - Restore from backup")
        print("  rollback [commit]       - Rollback git commit")
        print("  analyze                 - Analyze error patterns")
        print("  auto-recover <type>     - Attempt automatic recovery")
        print("  cleanup                 - Clean up old backups")
        sys.exit(1)
    
    manager = ErrorRecoveryManager()
    command = sys.argv[1]
    
    if command == "backup":
        backup_name = sys.argv[2] if len(sys.argv) > 2 else None
        manager.create_backup(backup_name)
    
    elif command == "restore":
        if len(sys.argv) < 3:
            print("❌ Backup name required for restore command")
            sys.exit(1)
        backup_name = sys.argv[2]
        success = manager.restore_backup(backup_name)
        sys.exit(0 if success else 1)
    
    elif command == "rollback":
        commit_hash = sys.argv[2] if len(sys.argv) > 2 else None
        success = manager.rollback_git_commit(commit_hash)
        sys.exit(0 if success else 1)
    
    elif command == "analyze":
        analysis = manager.analyze_error_patterns()
        print("📊 Error Analysis:")
        print(f"  Total errors: {analysis['error_count']}")
        print(f"  Unresolved: {analysis['unresolved_count']}")
        print(f"  Error types: {analysis['error_types']}")
        if analysis['patterns']:
            print("  Patterns found:")
            for pattern in analysis['patterns']:
                print(f"    - {pattern['type']}: {pattern['recommendation']}")
    
    elif command == "auto-recover":
        if len(sys.argv) < 3:
            print("❌ Error type required for auto-recover command")
            sys.exit(1)
        error_type = sys.argv[2]
        success = manager.auto_recover(error_type, "")
        sys.exit(0 if success else 1)
    
    elif command == "cleanup":
        manager.cleanup_old_backups()
    
    else:
        print(f"❌ Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()

