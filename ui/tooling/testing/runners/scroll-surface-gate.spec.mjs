// check-scrollbar-hosts 的滚动面归档规则（⑦-⑩）：用临时夹具各证一条判据真的会红。
// 写法照 touch-target-gates.spec.ts：在临时根下铺出脚本读的那几个目录，把脚本当子进程跑。
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const GATE = fileURLToPath(new URL('../../scripts/check-scrollbar-hosts.mjs', import.meta.url))

const temporaryRoots = []

function write(root, path, contents) {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
}

/** 脚本会 readdir 的目录都得在；三端组件目录留空，夹具里没有任何自绘条宿主。 */
function createFixture({ css, registry }) {
  const root = mkdtempSync(join(tmpdir(), 'xihan-scroll-surface-gate-'))
  temporaryRoots.push(root)
  for (const dir of [
    'packages/adapters/vue/src/components',
    'packages/adapters/react/src/components',
    'packages/adapters/web-components/src/elements',
    'tooling/testing/src/suites',
  ]) {
    mkdirSync(join(root, dir), { recursive: true })
  }
  write(root, 'packages/design/styles/css/demo.css', css)
  write(root, 'packages/design/styles/family/field-chrome.css', '')
  write(root, 'tooling/scripts/scroll-surface-registry.json', JSON.stringify({ surfaces: {}, backlog: {}, ...registry }))
  return root
}

function run(cwd) {
  return spawnSync(process.execPath, [GATE], { cwd, encoding: 'utf8' })
}

const BODY_SCROLLS = `
[data-scope='demo'][data-part='body'] {
  overflow: auto;
}
`

const NATIVE_BODY = { mode: 'native', overscroll: false, gutter: false, why: '夹具里的页内结构容器' }

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

describe('滚动面归档门禁', () => {
  it('登记齐全的原生面通过', () => {
    const root = createFixture({
      css: BODY_SCROLLS,
      registry: { surfaces: { 'demo:body': NATIVE_BODY } },
    })

    const result = run(root)

    expect(result.status, String(result.stderr)).toBe(0)
    expect(result.stdout).toContain('滚动面 1 个全部归档')
  })

  it('皮肤里有 overflow: auto 却没登记的面判红', () => {
    const root = createFixture({ css: BODY_SCROLLS, registry: {} })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('demo:body')
    expect(result.stderr).toContain('新滚动面必须归档')
  })

  it('登记了却扫不到的面判红为名单过期', () => {
    const root = createFixture({
      css: BODY_SCROLLS,
      registry: { surfaces: { 'demo:body': NATIVE_BODY, 'demo:footer': NATIVE_BODY } },
    })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('demo:footer')
    expect(result.stderr).toContain('名单过期')
  })

  it('登记 gutter=true 却没有带守卫的 scrollbar-gutter: stable 判红', () => {
    const root = createFixture({
      css: BODY_SCROLLS,
      registry: { surfaces: { 'demo:body': { ...NATIVE_BODY, gutter: true } } },
    })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('demo:body')
    expect(result.stderr).toContain(':not([data-xh-scrollbar]) 守卫的 scrollbar-gutter: stable')
  })

  it('带守卫的 scrollbar-gutter: stable 满足 gutter=true', () => {
    const root = createFixture({
      css: `${BODY_SCROLLS}
[data-scope='demo'][data-part='body']:not([data-xh-scrollbar]) {
  scrollbar-gutter: stable;
}
`,
      registry: { surfaces: { 'demo:body': { ...NATIVE_BODY, gutter: true } } },
    })

    const result = run(root)

    expect(result.status, String(result.stderr)).toBe(0)
  })

  it('登记 overscroll=false 却写了 overscroll-behavior: contain 判红', () => {
    const root = createFixture({
      css: `
[data-scope='demo'][data-part='body'] {
  overflow: auto;
  overscroll-behavior: contain;
}
`,
      registry: { surfaces: { 'demo:body': NATIVE_BODY } },
    })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('却写了 overscroll-behavior: contain')
  })

  it('原生面自己写 scrollbar-width 判红', () => {
    const root = createFixture({
      css: `
[data-scope='demo'][data-part='body'] {
  overflow: auto;
  scrollbar-width: none;
}
`,
      registry: { surfaces: { 'demo:body': NATIVE_BODY } },
    })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('登记为原生细条，皮肤里却写了 scrollbar-width')
  })

  it('不是任何宿主的壳却声明 --xh-scrollbar-track-bg 判红为死声明', () => {
    const root = createFixture({
      css: `${BODY_SCROLLS}
[data-scope='demo'][data-part='positioner'] {
  --xh-scrollbar-track-bg: transparent;
}
`,
      registry: { surfaces: { 'demo:body': NATIVE_BODY } },
    })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('demo:positioner')
    expect(result.stderr).toContain('死声明')
  })

  it('登记为自绘条却三端都没接线的面要进 backlog，登记了就放过', () => {
    const drawn = { mode: 'drawn', overscroll: false, gutter: false, why: '夹具里的定高小列表' }
    const bare = run(createFixture({ css: BODY_SCROLLS, registry: { surfaces: { 'demo:body': drawn } } }))
    expect(bare.status).toBe(1)
    expect(bare.stderr).toContain('三端都没接 useScrollbars / ScrollbarsController')

    const excused = run(createFixture({
      css: BODY_SCROLLS,
      registry: { surfaces: { 'demo:body': drawn }, backlog: { 'demo:body': { unwired: '夹具：随后接线' } } },
    }))
    expect(excused.status, String(excused.stderr)).toBe(0)
    expect(excused.stdout).toContain('backlog 待办 1 条')
  })

  it('backlog 里登记了却不再命中的豁免判红为过期', () => {
    const root = createFixture({
      css: BODY_SCROLLS,
      registry: { surfaces: { 'demo:body': NATIVE_BODY }, backlog: { 'demo:body': { gutter: '夹具：早已补上' } } },
    })

    const result = run(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('backlog demo:body.gutter 已经不再命中')
  })
})
