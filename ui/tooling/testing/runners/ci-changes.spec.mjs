// ci-changes 证几件事：全是正文的改动跳过；夹杂一个非 .md、生成的组件页或测试夹具就跑全套；
// 空列表与取不到比较基点时跑全套；真仓库里拿两个相邻提交跑得通。
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isProse, needsFullSuite } from '../../scripts/ci-changes.mjs'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const SCRIPT = join(ROOT, 'tooling/scripts/ci-changes.mjs')

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, GITHUB_OUTPUT: '' } })
}

describe('ci-changes.mjs', () => {
  it('指南、设计页、技能、changeset 与包说明都算正文', () => {
    for (const path of ['docs/guide/testing.md', 'docs/design/colors.md', 'AGENTS.md', '.agents/skills/commit-msg/SKILL.md', 'ui/.changeset/foo.md', 'ui/packages/engine/core/README.md', 'ui/packages/engine/headless/src/select/select.doc.md'])
      expect(isProse(path), path).toBe(true)
  })

  it('生成的组件页、测试夹具与非 .md 都不算', () => {
    for (const path of ['docs/components/select.md', 'ui/packages/tools/cli/tests/fixtures/data/a.md', 'ui/tooling/testing/__fixtures__/x.md', 'docs/examples/select/01-basic.vue', 'docs/.vitepress/config.ts', '.github/workflows/ci.yml'])
      expect(isProse(path), path).toBe(false)
  })

  it('全是正文才跳过，夹杂一个就跑全套', () => {
    expect(needsFullSuite(['docs/guide/testing.md', 'AGENTS.md']).full).toBe(false)
    const mixed = needsFullSuite(['docs/guide/testing.md', 'docs/examples/select/01-basic.vue'])
    expect(mixed.full).toBe(true)
    expect(mixed.blockers).toEqual(['docs/examples/select/01-basic.vue'])
  })

  it('空列表跑全套', () => {
    expect(needsFullSuite([]).full).toBe(true)
  })

  it('取不到比较基点时跑全套', () => {
    for (const base of ['', '0000000000000000000000000000000000000000', 'ffffffffffffffffffffffffffffffffffffffff']) {
      const result = run([`--base=${base}`, '--head=HEAD'])
      expect(result.status, String(result.stderr)).toBe(0)
      expect(result.stdout).toContain('跑全套')
    }
  })

  it('真仓库里拿相邻两个提交跑得通', () => {
    const result = run(['--base=HEAD~1', '--head=HEAD'])
    expect(result.status, String(result.stderr)).toBe(0)
    expect(result.stdout).toMatch(/\[ci-changes\] .*(跑全套|跳过单测与浏览器态)/)
  })
})
