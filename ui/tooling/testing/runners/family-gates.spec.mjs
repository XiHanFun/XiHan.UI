// 七条家族门禁各证三件事：一处新违规会红、当前仓库放行、豁免表里过期的条目会红。
//
// 这些门禁大多带着按组件登记的名单（EXPECTED / SEMANTIC / IDENTITY / PRESSABLE / FIELD_LABEL），
// 空夹具会把整张名单判成过期，所以夹具从真实仓库复制门禁读的那几份输入（皮肤、家族配方、
// connect / anatomy、登记表、豁免表），再在副本上动一刀；脚本当子进程在临时根下跑。
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const SCRIPTS = join(ROOT, 'tooling/scripts')
const BACKLOG = 'tooling/scripts/family-backlog.json'
/** 每条用例都要复制皮肤与 connect 再 spawn 一次门禁，显式给超时，不依赖 vitest 默认 5s。 */
const SPAWN_TIMEOUT = 20_000

const temporaryRoots = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

/** 复制门禁读的输入到临时根：皮肤、家族配方、每个组件的 connect 与 anatomy、登记表与豁免表。 */
function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'xihan-family-gates-'))
  temporaryRoots.push(root)
  cpSync(join(ROOT, 'packages/design/styles/css'), join(root, 'packages/design/styles/css'), { recursive: true })
  cpSync(join(ROOT, 'packages/design/styles/family'), join(root, 'packages/design/styles/family'), { recursive: true })
  const headless = join(ROOT, 'packages/engine/headless/src')
  for (const comp of readdirSync(headless, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)) {
    for (const file of [`${comp}.connect.ts`, `${comp}.anatomy.ts`]) {
      try {
        const source = readFileSync(join(headless, comp, file), 'utf8')
        mkdirSync(join(root, 'packages/engine/headless/src', comp), { recursive: true })
        writeFileSync(join(root, 'packages/engine/headless/src', comp, file), source)
      }
      catch {}
    }
  }
  mkdirSync(join(root, 'tooling/scripts'), { recursive: true })
  for (const file of ['family-backlog.json', 'scroll-surface-registry.json'])
    cpSync(join(SCRIPTS, file), join(root, 'tooling/scripts', file))
  return root
}

function run(gate, cwd) {
  return spawnSync(process.execPath, [join(SCRIPTS, gate)], { cwd, encoding: 'utf8' })
}

function write(root, path, contents) {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
}

function append(root, path, contents) {
  const target = join(root, path)
  writeFileSync(target, readFileSync(target, 'utf8') + contents, 'utf8')
}

/** 往豁免表某段塞一条不会命中的键。 */
function addStale(root, section, key = 'demo:root') {
  const path = join(root, BACKLOG)
  const json = JSON.parse(readFileSync(path, 'utf8'))
  json[section] = { ...(json[section] ?? {}), [key]: '夹具：早已迁走' }
  writeFileSync(path, JSON.stringify(json, null, 2))
}

/**
 * 三件事一起证：`红` 是动一刀后的皮肤片段（append 到某份皮肤或新建 demo.css），
 * `红文案` 是期望出现在 stderr 里的话，`段` 是豁免表分段。
 */
function gateSuite(gate, { section, red, redText, at = 'packages/design/styles/css/demo.css', staleKey = 'demo:root', staleText = '已经不再命中' }) {
  describe(gate, () => {
    it('当前仓库放行', () => {
      const result = run(gate, createFixture())
      expect(result.status, String(result.stderr)).toBe(0)
      expect(result.stdout).toContain('通过')
    }, SPAWN_TIMEOUT)

    it('一处新违规判红', () => {
      const root = createFixture()
      if (at.endsWith('demo.css'))
        write(root, at, red)
      else
        append(root, at, red)
      const result = run(gate, root)
      expect(result.status).toBe(1)
      expect(result.stderr).toContain(redText)
    }, SPAWN_TIMEOUT)

    it('豁免表里过期的条目判红', () => {
      const root = createFixture()
      addStale(root, section, staleKey)
      const result = run(gate, root)
      expect(result.status).toBe(1)
      expect(result.stderr).toContain(staleText)
    }, SPAWN_TIMEOUT)
  })
}

const LAYER = css => `@layer xihan.components {\n${css}\n}\n`

gateSuite('check-surface-edge.mjs', {
  section: 'edge',
  red: LAYER(`
  [data-scope='demo'][data-part='root'] {
    border: var(--xh-stroke-thin) solid var(--xh-demo-border, var(--xh-border-subtle));
    background: var(--xh-demo-bg, var(--xh-bg-surface));
  }`),
  redText: '它只作内部分隔',
})

describe('check-surface-edge.mjs ⑤ 四边边色', () => {
  it('非根面部件的禁用态 border-color 落分隔色判红', () => {
    const root = createFixture()
    write(root, 'packages/design/styles/css/demo.css', LAYER(`
  [data-scope='demo'][data-part='item-checkbox'][data-disabled] {
    border-color: var(--xh-demo-checkbox-border-disabled, var(--xh-border-subtle));
  }`))
    const result = run('check-surface-edge.mjs', root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('四边外边（含禁用态）取 --xh-border-default')
  }, SPAWN_TIMEOUT)

  it('单边分隔线仍放行', () => {
    const root = createFixture()
    write(root, 'packages/design/styles/css/demo.css', LAYER(`
  [data-scope='demo'][data-part='item'] {
    border-block-start: var(--xh-stroke-thin) solid var(--xh-demo-row-border, var(--xh-border-subtle));
  }`))
    const result = run('check-surface-edge.mjs', root)
    expect(result.status, String(result.stderr)).toBe(0)
  }, SPAWN_TIMEOUT)
})

gateSuite('check-elevation-role.mjs', {
  section: 'edge',
  // edge 段由两条门禁共用：三选一管普通键，raised 登记管以 :raised 结尾的键
  staleKey: 'demo:root:raised',
  red: LAYER(`
  [data-scope='demo'][data-part='root'] {
    box-shadow: var(--xh-demo-shadow, var(--xh-elevation-raised));
  }`),
  redText: '用了 raised 却没登记',
})

gateSuite('check-selection-marker.mjs', {
  section: 'selection',
  at: 'packages/design/styles/css/breadcrumb.css',
  red: LAYER(`
  [data-scope='breadcrumb'][data-part='link'][data-current] {
    color: var(--xh-breadcrumb-fg-current, var(--xh-fg-brand));
  }`),
  redText: '面包屑当前页是不可点位置',
})

gateSuite('check-state-ladder.mjs', {
  section: 'ladder',
  red: LAYER(`
  [data-scope='demo'][data-part='root']:hover {
    background: var(--xh-demo-bg-hover, var(--xh-bg-subtle-active));
  }`),
  redText: '300 只留给 pressed',
})

gateSuite('check-shape-scale.mjs', {
  section: 'shape',
  red: LAYER(`
  [data-scope='demo'][data-part='root'] {
    border-radius: var(--xh-demo-radius, var(--xh-shape-pill));
  }`),
  redText: '却没在 IDENTITY 登记',
})

gateSuite('check-press-feedback.mjs', {
  section: 'press',
  red: LAYER(`
  [data-scope='demo'][data-part='root'] {
    cursor: pointer;
  }`),
  redText: '未登记：demo:root',
})

describe('check-press-feedback.mjs 条件块', () => {
  it('forced-colors 分支里的 :active 补救不当作按压规则：接了家族按压块的部件仍放行', () => {
    const root = createFixture()
    // pagination 的页码接 Action Control，按压由家族给；皮肤里只剩 forced-colors 分支的一条 :active 补救
    append(root, 'packages/design/styles/css/pagination.css', `
@layer xihan.components {
  @media (forced-colors: active) {
    [data-scope='pagination'][data-part='item']:not([data-disabled]):is(:active, [data-pressed]) {
      outline-color: Highlight;
    }
  }
}
`)
    const result = run('check-press-feedback.mjs', root)
    expect(result.status, String(result.stderr)).toBe(0)
  }, SPAWN_TIMEOUT)
})

describe('check-press-feedback.mjs ⑧ data-pressed 投影', () => {
  /** 摘掉 press 段的总豁免，⑧ 才会逐部件报出来。 */
  function dropPressedExcuse(root) {
    const path = join(root, BACKLOG)
    const json = JSON.parse(readFileSync(path, 'utf8'))
    delete json.press['*:data-pressed']
    writeFileSync(path, JSON.stringify(json, null, 2))
  }

  /** 改一份 connect：把 from 换成 to，找不到 from 就让用例直接失败，免得夹具改空了还判通过。 */
  function rewriteConnect(root, comp, from, to) {
    const path = join(root, 'packages/engine/headless/src', comp, `${comp}.connect.ts`)
    const source = readFileSync(path, 'utf8')
    expect(source, `${comp}.connect.ts 里找不到 ${from}`).toContain(from)
    writeFileSync(path, source.replace(from, to), 'utf8')
  }

  it('字面量与 press(part) 展开两种写法都认作投影', () => {
    const root = createFixture()
    dropPressedExcuse(root)
    const result = run('check-press-feedback.mjs', root)
    // button 直接写 'data-pressed' 字面量；dialog / popconfirm 经 ...press('trigger') 展开；
    // floating-panel 的形态钮经模板串 ...press(`window-state:…`) 展开
    for (const line of ['button 的 root', 'dialog 的 trigger', 'dialog 的 close-trigger', 'popconfirm 的 confirm-trigger', 'floating-panel 的 window-state-trigger'])
      expect(result.stderr).not.toContain(line)
  }, SPAWN_TIMEOUT)

  it('展开的本地辅助没写 data-pressed 判红', () => {
    const root = createFixture()
    dropPressedExcuse(root)
    rewriteConnect(root, 'dialog', '\'data-pressed\': dataAttr(pressed === part),', '')
    const result = run('check-press-feedback.mjs', root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dialog 的 trigger 登记为可按，connect 的 getter 却没投影 data-pressed')
    expect(result.stderr).toContain('dialog 的 close-trigger 登记为可按')
  }, SPAWN_TIMEOUT)

  it('只展开处理器（pressHandlers）不算投影', () => {
    const root = createFixture()
    dropPressedExcuse(root)
    // 展开的是 shared/press 的处理器，不是本地返回 data-pressed 的辅助
    rewriteConnect(root, 'button', '\'data-pressed\': dataAttr(context.get(\'pressed\')),', '...pressHandlers(service),')
    const result = run('check-press-feedback.mjs', root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('button 的 root 登记为可按，connect 的 getter 却没投影 data-pressed')
  }, SPAWN_TIMEOUT)
})

gateSuite('check-text-role.mjs', {
  section: 'text',
  red: LAYER(`
  [data-scope='demo'][data-part='root'] {
    --xh-icon-size: var(--xh-demo-icon-size, var(--xh-glyph-size-text));
  }`),
  redText: '随文字形只给纯行内文字组件',
})

describe('check-family-parity.mjs', () => {
  it('当前仓库放行', () => {
    const result = run('check-family-parity.mjs', createFixture())
    expect(result.status, String(result.stderr)).toBe(0)
  }, SPAWN_TIMEOUT)

  it('同族成员分叉判红', () => {
    const root = createFixture()
    append(root, 'packages/design/styles/css/menubar.css', LAYER(`
  [data-scope='menubar'][data-part='separator'] {
    margin-block: var(--xh-space-4);
  }`))
    const result = run('check-family-parity.mjs', root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('菜单族')
  }, SPAWN_TIMEOUT)

  it('读豁免表的家族：成员还挂着豁免时不参与比对，全部迁走后才比', () => {
    // 内容面族里 code-view 与 log 已迁走（根面都是无影），这里再把两家残留的豁免键（若有）清掉；
    // 给 log 的根面动一刀（抬回 raised 落影）就该红
    const root = createFixture()
    const json = JSON.parse(readFileSync(join(root, BACKLOG), 'utf8'))
    for (const section of Object.keys(json)) {
      if (section === '$description')
        continue
      for (const key of Object.keys(json[section])) {
        if (key.startsWith('log:') || key.startsWith('code-view:'))
          delete json[section][key]
      }
    }
    writeFileSync(join(root, BACKLOG), JSON.stringify(json, null, 2))
    append(root, 'packages/design/styles/css/log.css', LAYER(`
  [data-scope='log'][data-part='root'] {
    box-shadow: var(--xh-log-shadow, var(--xh-elevation-raised));
  }`))
    const result = run('check-family-parity.mjs', root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('内容面族')
  }, SPAWN_TIMEOUT)
})
