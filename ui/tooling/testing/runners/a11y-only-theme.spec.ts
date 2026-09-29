// @vitest-environment jsdom
// runA11y 按主题拆成几份文件（onlyTheme）时：每份只注册自己那个主题的分组，
// 登记表的两条核对只在 themes 第一个主题那份里出现，各份合起来与不拆时一条不差。
import type { AdapterHarness, ConformanceSuite, TestHooks } from '../src'
import type { A11yRunOptions } from '../src/a11y'
import { describe, expect, it } from 'vitest'
import { runA11y } from '../src/a11y'

// 只注册、不执行用例体：用不到挂载那几项
const harness = { adapterName: 'fake' } as unknown as AdapterHarness
const suites = [
  { component: 'alpha', cases: [] },
  { component: 'beta', cases: [] },
] as unknown as ConformanceSuite[]

/** 只记下注册了哪些分组与用例，不执行用例体。 */
function registered(options: A11yRunOptions): string[] {
  const names: string[] = []
  let group = ''
  const hooks: TestHooks = {
    describe: (name, body) => {
      group = name
      names.push(name)
      body()
    },
    it: (name) => {
      names.push(`${group} › ${name}`)
    },
  }
  runA11y(harness, suites, hooks, options)
  return names
}

const baseline: A11yRunOptions = {
  known: { alpha: { 'color-contrast': '存量' } },
  knownEverywhere: { region: '夹具不带地标' },
}

describe('runA11y 的 onlyTheme', () => {
  it('只注册指定主题的分组：dark 那份没有 light 的分组，也不核对登记表', () => {
    const names = registered({ ...baseline, onlyTheme: 'dark' })
    expect(names.some(n => n.includes('· light'))).toBe(false)
    expect(names.some(n => n.startsWith('a11y 登记表'))).toBe(false)
    expect(names).toContain('a11y: alpha (fake · dark)')
    expect(names).toContain('a11y 通用登记 (fake · dark)')
  })

  it('登记表只在 themes 第一个主题那份里核对', () => {
    const names = registered({ ...baseline, onlyTheme: 'light' })
    expect(names.filter(n => n.startsWith('a11y 登记表 (fake) ›'))).toHaveLength(2)
    expect(names.some(n => n.includes('· dark'))).toBe(false)
  })

  it('各份合起来与不拆时注册的一条不差', () => {
    const whole = registered(baseline).sort()
    const parts = [...registered({ ...baseline, onlyTheme: 'light' }), ...registered({ ...baseline, onlyTheme: 'dark' })].sort()
    expect(parts).toEqual(whole)
  })

  it('onlyTheme 不在 themes 里时直接报错，不静默扫空', () => {
    expect(() => registered({ ...baseline, themes: ['light'], onlyTheme: 'dark' })).toThrow(/onlyTheme「dark」/)
  })
})
