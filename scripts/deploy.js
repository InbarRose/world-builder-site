#!/usr/bin/env node
const { spawn } = require('child_process')

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, Object.assign({ stdio: 'inherit', shell: true }, opts))
    p.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function main() {
  console.log('Local deploy script — running CI-like steps: install, build, deploy')

  const nodeVer = process.versions.node
  const [major, minor] = nodeVer.split('.')
  if (parseInt(major, 10) < 22) {
    console.warn(`Detected Node ${nodeVer}. Recommended Node >= 22.12.0 for best compatibility.`)
  }

  try {
    console.log('\n1) Installing frontend dependencies (npm ci)')
    await run('npm', ['ci'], { cwd: 'frontend' })

    console.log('\n2) Building frontend (npm run build)')
    await run('npm', ['run', 'build'], { cwd: 'frontend' })

    console.log('\n3) Deploying to Vercel (npx vercel@latest --prod --yes)')
    const vercelToken = process.env.VERCEL_TOKEN
    const args = ['vercel@latest', '--prod', '--yes']
    if (vercelToken) {
      args.push('--token', vercelToken)
    }
    await run('npx', args)

    console.log('\nDone — deployment command completed.')
  } catch (err) {
    console.error('\nDeployment failed:', err.message)
    process.exit(1)
  }
}

main()
