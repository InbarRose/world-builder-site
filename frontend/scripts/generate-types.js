#!/usr/bin/env node
/**
 * Cross-platform script to generate TypeScript types from Supabase
 * Works on Windows, macOS, and Linux
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const envFile = join(rootDir, '.env.local')
const typesFile = join(rootDir, 'src/lib/database.types.ts')

// Read project reference from .env.local
let projectRef = null
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, 'utf-8')
  const match = envContent.match(/SUPABASE_PROJECT_REF=(.+)/)
  if (match) {
    projectRef = match[1].trim()
  }
}

// Try to get project ref from Supabase config
if (!projectRef) {
  try {
    const configPath = join(rootDir, '..', 'supabase', 'config.toml')
    if (existsSync(configPath)) {
      const config = readFileSync(configPath, 'utf-8')
      const match = config.match(/project_id\s*=\s*["'](.+?)["']/)
      if (match) {
        projectRef = match[1].trim()
      }
    }
  } catch (e) {
    // Ignore
  }
}

console.log('🔧 Generating TypeScript types from Supabase...\n')

try {
  let command
  if (projectRef) {
    console.log(`📡 Using remote project: ${projectRef}`)
    command = `supabase gen types typescript --project-id ${projectRef}`
  } else {
    console.log('🏠 Using local Supabase instance')
    command = 'supabase gen types typescript --local'
  }

  const types = execSync(command, { 
    cwd: rootDir,
    encoding: 'utf-8',
    stdio: 'pipe'
  })

  writeFileSync(typesFile, types)
  console.log(`✅ Types generated successfully: ${typesFile}`)
  console.log(`\n📊 Generated ${types.split('\n').length} lines of type definitions`)
  
} catch (error) {
  console.error('❌ Error generating types:')
  console.error(error.message)
  
  if (!projectRef) {
    console.log('\n💡 Tip: Add SUPABASE_PROJECT_REF to .env.local to use remote database')
    console.log('   Or start local Supabase: supabase start')
  }
  
  process.exit(1)
}

