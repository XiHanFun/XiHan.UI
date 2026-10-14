import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runCli } from '../src/cli'
import { detectProject, versionNotice } from '../src/project'

const dataDir = fileURLToPath(new URL('./fixtures/data', import.meta.url))
let project: string

beforeEach(() => {
  project = mkdtempSync(join(tmpdir(), 'xihan-ui-cli-'))
})

afterEach(() => {
  rmSync(project, { recursive: true, force: true })
})

function installAdapter(name: string, version: string): void {
  writeFileSync(join(project, 'package.json'), JSON.stringify({ dependencies: { [name]: `^${version}` } }))
  const dir = join(project, 'node_modules', ...name.split('/'))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, version }))
}

async function run(...argv: string[]): Promise<{ code: number, stdout: string, stderr: string }> {
  const out: string[] = []
  const err: string[] = []
  const code = await runCli(argv, { stdout: t => out.push(t), stderr: t => err.push(t), dataDir, cwd: project })
  return { code, stdout: out.join('\n'), stderr: err.join('\n') }
}

describe('runCli', () => {
  it('打印版本与帮助', async () => {
    expect(await run('--version')).toMatchObject({ code: 0, stdout: '4.1.0' })
    expect((await run()).stdout).toContain('用法：xihan-ui <命令>')
  })

  it('json 输出可解析', async () => {
    const { code, stdout } = await run('info', 'XhButton', '--format', 'json')
    expect(code).toBe(0)
    expect(JSON.parse(stdout).id).toBe('button')
  })

  it('demo 缺省写法取项目里装的适配器', async () => {
    installAdapter('@xihan-ui/react', '4.1.0')
    expect((await run('demo', 'button', '1')).stdout).toContain('```tsx')
    expect((await run('demo', 'button', '1', '--framework', 'wc')).stdout).toContain('```html')
  })

  it('项目版本与数据版本不一致时在 stderr 提示', async () => {
    installAdapter('@xihan-ui/vue', '4.0.0')
    const { code, stderr } = await run('info', 'button')
    expect(code).toBe(0)
    expect(stderr).toContain('npx -y @xihan-ui/cli@4.0.0')
  })

  it('查不到返回 1 并给候选，用法错误返回 2', async () => {
    const missing = await run('info', 'buton')
    expect(missing.code).toBe(1)
    expect(missing.stderr).toContain('Button（button）')
    expect((await run('nope')).code).toBe(2)
    expect((await run('info')).code).toBe(2)
    expect((await run('list', '--bogus')).code).toBe(2)
    expect((await run('list', '--format', 'xml')).code).toBe(2)
  })

  it('setup --dry-run 不写文件，--check 未配置时返回 1', async () => {
    installAdapter('@xihan-ui/vue', '4.0.0')
    const dry = await run('setup', '--client', 'cursor', '--mode', 'mcp', '--dry-run')
    expect(dry.code).toBe(0)
    expect(dry.stdout).toContain('@xihan-ui/cli@4.0.0')
    expect((await run('setup', '--client', 'cursor', '--mode', 'mcp', '--check')).code).toBe(1)
    expect((await run('setup', '--client', 'cursor', '--mode', 'mcp')).code).toBe(0)
    expect((await run('setup', '--client', 'cursor', '--mode', 'mcp', '--check')).code).toBe(0)
  })
})

describe('detectProject', () => {
  it('项目没装 XiHan.UI 时只识别到根目录', () => {
    writeFileSync(join(project, 'package.json'), JSON.stringify({ dependencies: { vue: '^3.5.0' } }))
    expect(detectProject(project)).toEqual({ root: project, framework: undefined, installedVersion: undefined })
  })

  it('识别适配器与安装版本', () => {
    installAdapter('@xihan-ui/web-components', '4.1.0')
    expect(detectProject(project)).toEqual({ root: project, framework: 'web-components', installedVersion: '4.1.0' })
    expect(versionNotice(detectProject(project), '4.1.0')).toBeUndefined()
  })
})
