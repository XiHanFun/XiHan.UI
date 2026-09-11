import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const CONTROL_HEIGHT_GATE = fileURLToPath(new URL('../../scripts/check-control-height.mjs', import.meta.url))
const COARSE_TARGET_GATE = fileURLToPath(new URL('../../scripts/check-coarse-target.mjs', import.meta.url))

const temporaryRoots: string[] = []

function write(root: string, path: string, contents: string): void {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
}

function createFixture(css: string): string {
  const root = mkdtempSync(join(tmpdir(), 'xihan-touch-target-gate-'))
  temporaryRoots.push(root)
  write(root, 'packages/design/styles/css/demo.css', css)
  // check-control-height 的正式例外表会反查 slider；夹具保留这条真实存在的不上尺声明。
  write(root, 'packages/design/styles/css/slider.css', `
[data-scope='slider'][data-part='control'] {
  block-size: 2px;
}
`)
  write(root, 'packages/design/tokens/src/generated/tokens.ts', `
export const tokens = {
  "--xh-control-action-size": "24px",
  "--xh-control-box-lg": "48px",
}
`)
  write(root, 'packages/engine/headless/src/demo/demo.connect.ts', `
export function connectDemo(normalize, parts) {
  return {
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
    }),
  }
}
`)
  write(root, 'tooling/scripts/coarse-target-registry.json', JSON.stringify({
    exempt: {},
    inlineMark: {},
    backlog: {},
    coarseTargets: {
      'demo:trigger': {
        px: 24,
        why: '测试夹具里的按钮由手指直接操作',
      },
    },
  }))
  return root
}

function run(script: string, cwd: string): ReturnType<typeof spawnSync> {
  return spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' })
}

function baseTriggerCss(coarseRule = ''): string {
  return `
[data-scope='demo'][data-part='trigger'] {
  inline-size: var(--xh-control-action-size);
  block-size: var(--xh-control-action-size);
}
${coarseRule}
`
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

describe('触摸目标门禁', () => {
  it('允许 coarse 媒体以两个逻辑轴的最小尺寸放大真实按钮盒', () => {
    const root = createFixture(baseTriggerCss(`
@media (pointer: coarse) {
  [data-scope='demo'][data-part='trigger'] {
    min-inline-size: var(--xh-control-box-lg);
    min-block-size: var(--xh-control-box-lg);
  }
}
`))

    const height = run(CONTROL_HEIGHT_GATE, root)
    const coarse = run(COARSE_TARGET_GATE, root)

    expect(height.status, String(height.stderr)).toBe(0)
    expect(coarse.status, String(coarse.stderr)).toBe(0)
  })

  it('拒绝任一轴小于 44px 的真实触摸盒', () => {
    const root = createFixture(baseTriggerCss(`
@media (pointer: coarse) {
  [data-scope='demo'][data-part='trigger'] {
    min-inline-size: 40px;
    min-block-size: 40px;
  }
}
`))

    const result = run(COARSE_TARGET_GATE, root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('真实触摸盒这一轴不足 44px')
  })

  it('非聚焦 control 的粗指针最小高度也必须达到 44px', () => {
    const root = createFixture(baseTriggerCss(`
@media (pointer: coarse) {
  [data-scope='demo'][data-part='control'] {
    min-block-size: 40px;
  }

  [data-scope='demo'][data-part='trigger'] {
    min-inline-size: var(--xh-control-box-lg);
    min-block-size: var(--xh-control-box-lg);
  }
}
`))

    const result = run(COARSE_TARGET_GATE, root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('[control] min-block-size: 40px = 40px')
  })

  it('仍拒绝桌面缺省块误用 lg 高度档', () => {
    const root = createFixture(`
[data-scope='demo'][data-part='control'] {
  min-block-size: var(--xh-control-box-lg);
}
`)

    const result = run(CONTROL_HEIGHT_GATE, root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('缺省块里引了 lg 档，该是 md')
  })

  it('登记的粗指针目标没有放大机制时继续失败', () => {
    const root = createFixture(baseTriggerCss())

    const result = run(COARSE_TARGET_GATE, root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('粗指针下命中区 24px')
  })

  it('触摸目标只放大一个不足轴时继续失败', () => {
    const root = createFixture(baseTriggerCss(`
@media (pointer: coarse) {
  [data-scope='demo'][data-part='trigger'] {
    min-inline-size: var(--xh-control-box-lg);
  }
}
`))

    const result = run(COARSE_TARGET_GATE, root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('粗指针下命中区 24px')
  })

  it('不会把互斥尺寸选择器里的两个轴合成一只触摸盒', () => {
    const root = createFixture(baseTriggerCss(`
@media (pointer: coarse) {
  [data-scope='demo'][data-part='trigger'][data-size='sm'] {
    min-inline-size: var(--xh-control-box-lg);
  }

  [data-scope='demo'][data-part='trigger'][data-size='lg'] {
    min-block-size: var(--xh-control-box-lg);
  }
}
`))

    const result = run(COARSE_TARGET_GATE, root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('粗指针下命中区 24px')
  })
})
