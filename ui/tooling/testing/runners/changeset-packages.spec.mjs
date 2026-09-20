// check-changeset-packages 各证几件事：头部混写 ignore 表里的包会红、只写 ignore 表里的包也会红、
// 写了不在工作区的包会红、头部读不成「包名: 档位」会红、ignore 表登记了不存在的包会红；
// 空头部与只写发布包的放行，当前仓库放行。
// 写法照 focus-outline-reset-gate.spec.mjs：在临时根下铺出脚本读的工作区与 .changeset，把脚本当子进程跑；
// 脚本只读不写，真仓库那条直接以仓库根为 cwd 跑。
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const GATE = join(ROOT, 'tooling/scripts/check-changeset-packages.mjs')
/** 当前仓库有六百多份 changeset 要逐份读，显式给超时，不依赖 vitest 默认 5s。 */
const SPAWN_TIMEOUT = 20_000

const temporaryRoots = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

function write(root, path, contents) {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
}

const WORKSPACE = `packages:\n  - 'packages/*/*'\n  - 'tooling/*'\n`

/**
 * 铺一个两包工作区：发布包 @demo/pub 与私有包 @demo/testing，后者登在 ignore 表；
 * `changesets` 是 { 文件名: 内容 }，`ignore` 可覆盖 ignore 表。
 */
function createFixture({ changesets = {}, ignore = ['@demo/testing'] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'xihan-changeset-packages-'))
  temporaryRoots.push(root)
  write(root, 'pnpm-workspace.yaml', WORKSPACE)
  write(root, 'packages/engine/pub/package.json', JSON.stringify({ name: '@demo/pub', version: '0.0.0' }))
  write(root, 'tooling/testing/package.json', JSON.stringify({ name: '@demo/testing', version: '0.0.0', private: true }))
  write(root, '.changeset/config.json', JSON.stringify({ baseBranch: 'dev', ignore }))
  write(root, '.changeset/README.md', '# 说明\n')
  for (const [name, contents] of Object.entries(changesets))
    write(root, `.changeset/${name}.md`, contents)
  return root
}

function run(cwd) {
  return spawnSync(process.execPath, [GATE], { cwd, encoding: 'utf8' })
}

const HEADER = lines => `---\n${lines.map(l => `${l}\n`).join('')}---\n\n正文。\n`

describe('check-changeset-packages.mjs', () => {
  it('当前仓库放行', () => {
    const result = run(ROOT)
    expect(result.status, String(result.stderr)).toBe(0)
    expect(result.stdout).toContain('通过')
    expect(result.stdout).toContain('@xihan-ui/testing')
  }, SPAWN_TIMEOUT)

  it('只写发布包、空头部与 none 档位放行', () => {
    const root = createFixture({
      changesets: {
        'pub-minor': HEADER(['"@demo/pub": minor']),
        'pub-none': HEADER(['\'@demo/pub\': none']),
        'empty': '---\n---\n\n只作说明的一份。\n',
      },
    })
    const result = run(root)
    expect(result.status, String(result.stderr)).toBe(0)
    expect(result.stdout).toContain('3 份 changeset')
    expect(result.stdout).toContain('空头部 1 份')
  }, SPAWN_TIMEOUT)

  it('头部把 ignore 表里的包与发布包混写判红，报出文件、包名与 Mixed changesets', () => {
    const root = createFixture({
      changesets: {
        mixed: HEADER(['"@demo/pub": minor', '"@demo/testing": patch']),
        clean: HEADER(['"@demo/pub": patch']),
      },
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('.changeset/mixed.md')
    expect(result.stderr).toContain('@demo/testing')
    expect(result.stderr).toContain('Mixed changesets')
    expect(result.stderr).not.toContain('.changeset/clean.md')
  }, SPAWN_TIMEOUT)

  it('头部只写 ignore 表里的包同样判红，说明整份会被丢掉', () => {
    const root = createFixture({
      changesets: { 'testing-only': HEADER(['\'@demo/testing\': minor']) },
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('.changeset/testing-only.md')
    expect(result.stderr).toContain('整份在 changeset version 时会被丢掉')
  }, SPAWN_TIMEOUT)

  it('头部写了不在工作区的包判红', () => {
    const root = createFixture({
      changesets: { typo: HEADER(['"@demo/pub": minor', '"@demo/pubb": minor']) },
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('.changeset/typo.md')
    expect(result.stderr).toContain('@demo/pubb')
    expect(result.stderr).toContain('not in the workspace')
  }, SPAWN_TIMEOUT)

  it('头部读不成「包名: 档位」或档位不在四档之内判红，带行号', () => {
    const root = createFixture({
      changesets: {
        'garbled': HEADER(['"@demo/pub" minor']),
        'bad-type': HEADER(['"@demo/pub": big']),
      },
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('.changeset/garbled.md —— 第 2 行读不成')
    expect(result.stderr).toContain('.changeset/bad-type.md —— 第 2 行 @demo/pub 的档位 big')
  }, SPAWN_TIMEOUT)

  it('ignore 表登记了不在工作区的包判红，名单不会悄悄过期', () => {
    const root = createFixture({
      ignore: ['@demo/testing', '@demo/gone'],
      changesets: { clean: HEADER(['"@demo/pub": patch']) },
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('ignore 表过期')
    expect(result.stderr).toContain('@demo/gone')
    expect(result.stderr).not.toContain('@demo/testing —— ')
  }, SPAWN_TIMEOUT)
})
