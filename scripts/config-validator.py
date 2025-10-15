#!/usr/bin/env python3
"""
Configuration Validator for world-builder-site
Validates configuration files and environment variables
"""
import os
import sys
import yaml
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ValidationError

class DatabaseConfig(BaseModel):
    """Database configuration schema"""
    url: str
    echo: bool = False
    pool_size: int = 5
    max_overflow: int = 10
    ssl_mode: Optional[str] = None

class APIConfig(BaseModel):
    """API configuration schema"""
    title: str
    version: str
    docs_url: Optional[str] = "/docs"
    redoc_url: Optional[str] = "/redoc"
    cors_origins: List[str] = []

class AuthConfig(BaseModel):
    """Authentication configuration schema"""
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    password_min_length: int = 8

class SupabaseConfig(BaseModel):
    """Supabase configuration schema"""
    url: str
    service_role_key: str
    anon_key: str

class GameConfig(BaseModel):
    """Game configuration schema"""
    default_grid_width: int = 20
    default_grid_height: int = 12
    max_moves_per_session: int = 1000
    rules_version: str

class RateLimitingConfig(BaseModel):
    """Rate limiting configuration schema"""
    enabled: bool = True
    requests_per_minute: int = 60
    burst_limit: int = 100

class AppConfig(BaseModel):
    """Complete application configuration schema"""
    environment: str
    debug: bool
    log_level: str
    database: DatabaseConfig
    api: APIConfig
    auth: AuthConfig
    supabase: SupabaseConfig
    game: GameConfig
    rate_limiting: RateLimitingConfig

class ConfigValidator:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.config_dir = self.project_root / "config"
        self.errors: List[str] = []
        self.warnings: List[str] = []
    
    def validate_environment_file(self, env_file: str) -> bool:
        """Validate environment-specific configuration file"""
        config_path = self.config_dir / "environments" / f"{env_file}.yaml"
        
        if not config_path.exists():
            self.errors.append(f"Configuration file not found: {config_path}")
            return False
        
        try:
            with open(config_path, 'r') as f:
                config_data = yaml.safe_load(f)
            
            # Replace environment variables
            config_data = self._replace_env_vars(config_data)
            
            # Validate against schema
            try:
                AppConfig(**config_data)
                print(f"✅ {env_file}.yaml configuration is valid")
                return True
            except ValidationError as e:
                self.errors.append(f"Validation error in {env_file}.yaml: {e}")
                return False
                
        except Exception as e:
            self.errors.append(f"Error loading {env_file}.yaml: {e}")
            return False
    
    def _replace_env_vars(self, data: Any) -> Any:
        """Replace environment variable placeholders"""
        if isinstance(data, dict):
            return {k: self._replace_env_vars(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._replace_env_vars(item) for item in data]
        elif isinstance(data, str) and data.startswith("${") and data.endswith("}"):
            env_var = data[2:-1]
            value = os.getenv(env_var)
            if value is None:
                self.warnings.append(f"Environment variable {env_var} not set")
                return data
            return value
        else:
            return data
    
    def validate_environment_variables(self) -> bool:
        """Validate required environment variables"""
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_ANON_KEY"
        ]
        
        optional_vars = [
            "VERCEL_TOKEN",
            "JWT_SECRET",
            "DATABASE_URL",
            "FRONTEND_URL"
        ]
        
        missing_required = []
        missing_optional = []
        
        for var in required_vars:
            if not os.getenv(var):
                missing_required.append(var)
        
        for var in optional_vars:
            if not os.getenv(var):
                missing_optional.append(var)
        
        if missing_required:
            self.errors.append(f"Missing required environment variables: {', '.join(missing_required)}")
            return False
        
        if missing_optional:
            self.warnings.append(f"Missing optional environment variables: {', '.join(missing_optional)}")
        
        print("✅ Environment variables validated")
        return True
    
    def validate_config_structure(self) -> bool:
        """Validate configuration directory structure"""
        required_files = [
            "environments/development.yaml",
            "environments/testing.yaml",
            "environments/production.yaml"
        ]
        
        missing_files = []
        for file_path in required_files:
            full_path = self.config_dir / file_path
            if not full_path.exists():
                missing_files.append(file_path)
        
        if missing_files:
            self.errors.append(f"Missing configuration files: {', '.join(missing_files)}")
            return False
        
        print("✅ Configuration structure validated")
        return True
    
    def validate_all(self) -> bool:
        """Validate all configurations"""
        print("🔍 Validating configuration...")
        
        all_valid = True
        
        # Validate structure
        if not self.validate_config_structure():
            all_valid = False
        
        # Validate environment files
        environments = ["development", "testing", "production"]
        for env in environments:
            if not self.validate_environment_file(env):
                all_valid = False
        
        # Validate environment variables
        if not self.validate_environment_variables():
            all_valid = False
        
        # Print warnings
        if self.warnings:
            print("\n⚠️  Warnings:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        # Print errors
        if self.errors:
            print("\n❌ Errors:")
            for error in self.errors:
                print(f"  - {error}")
            all_valid = False
        
        if all_valid:
            print("\n✅ All configurations are valid")
        else:
            print("\n❌ Configuration validation failed")
        
        return all_valid
    
    def generate_config_schema(self) -> None:
        """Generate JSON schema for configuration validation"""
        schema = AppConfig.model_json_schema()
        schema_file = self.config_dir / "schemas" / "app-config.schema.json"
        
        schema_file.parent.mkdir(exist_ok=True)
        with open(schema_file, 'w') as f:
            json.dump(schema, f, indent=2)
        
        print(f"✅ Configuration schema generated: {schema_file}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 config-validator.py <command> [environment]")
        print("Commands:")
        print("  validate [env] - Validate configuration (all or specific environment)")
        print("  schema        - Generate configuration schema")
        sys.exit(1)
    
    validator = ConfigValidator()
    command = sys.argv[1]
    
    if command == "validate":
        if len(sys.argv) > 2:
            env = sys.argv[2]
            success = validator.validate_environment_file(env)
        else:
            success = validator.validate_all()
        sys.exit(0 if success else 1)
    
    elif command == "schema":
        validator.generate_config_schema()
        sys.exit(0)
    
    else:
        print(f"❌ Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()

