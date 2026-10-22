// promote-latest 各证几件事：版本比较按语义化版本走；每个包按 npm 现状判等、对上、不动、补上；
// 逐轮核对时取不到这一版的等下一轮、latest 不对的补上并在下一轮核过才算对上，超时还有没对上的就失败；
// dry-run 只看一轮、不等不改；版本不一致或带后缀却不在预发布模式时直接报错。npm 用内存里的假源代替。
import { describe, expect, it } from 'vitest'
import { compareVersions, decide, promoteLatest } from '../../../scripts/release/promote-latest.mjs'

describe('compareVersions', () => {
  it.each([
    ['5.1.0', '5.0.0', 1],
    ['5.0.0', '5.1.0', -1],
    ['5.10.0', '5.9.0', 1],
    ['5.1.0', '5.1.0', 0],
    ['5.1.0-rc.1', '5.1.0', -1],
    ['5.1.0', '5.1.0-rc.1', 1],
    ['5.1.0-rc.10', '5.1.0-rc.9', 1],
    ['5.1.0-beta.2', '5.1.0-rc.1', -1],
    ['5.1.0-rc', '5.1.0-rc.1', -1],
    ['1.0.0-alpha.1', '1.0.0-alpha.beta', -1],
  ])('%s 比 %s 得 %i', (a, b, expected) => {
    expect(compareVersions(a, b)).toBe(expected)
  })
})

describe('decide', () => {
  it('npm 上还取不到这一版：等', () => {
    expect(decide({ version: '5.2.0', prerelease: false, versions: ['5.1.0'], latest: '5.1.0' })).toEqual({ action: 'wait' })
  })

  it('latest 已是这一版：对上', () => {
    expect(decide({ version: '5.2.0', prerelease: false, versions: ['5.1.0', '5.2.0'], latest: '5.2.0' })).toEqual({ action: 'done' })
  })

  it('正式版取得到、latest 还是旧版：补上', () => {
    expect(decide({ version: '5.2.0', prerelease: false, versions: ['5.1.0', '5.2.0'], latest: '5.1.0' })).toEqual({ action: 'tag' })
  })

  it('重跑旧标签：npm 上已有更高的正式版，latest 不往回挪', () => {
    expect(decide({ version: '5.1.0', prerelease: false, versions: ['5.1.0', '5.2.0'], latest: '5.2.0' }).action).toBe('skip')
  })

  it('预发布且 npm 上还没有正式版：latest 指过来', () => {
    expect(decide({ version: '1.0.0-rc.2', prerelease: true, versions: ['1.0.0-rc.1', '1.0.0-rc.2'], latest: '1.0.0-rc.1' })).toEqual({ action: 'tag' })
    expect(decide({ version: '1.0.0-rc.1', prerelease: true, versions: ['1.0.0-rc.1'], latest: undefined })).toEqual({ action: 'tag' })
  })

  it('预发布但 npm 上已有正式版：latest 不动', () => {
    expect(decide({ version: '6.0.0-rc.1', prerelease: true, versions: ['5.1.0', '6.0.0-rc.1'], latest: '5.1.0' }).action).toBe('skip')
  })

  it('预发布、latest 已是更高的预发布版：不往回挪', () => {
    expect(decide({ version: '1.0.0-rc.1', prerelease: true, versions: ['1.0.0-rc.1', '1.0.0-rc.2'], latest: '1.0.0-rc.2' }).action).toBe('skip')
  })
})

/** 内存里的 npm：每个包的已发版本与 latest；`arrivals` 记某个版本要到第几次查看才取得到。 */
function fakeRegistry(packages, arrivals = {}) {
  const views = new Map()
  const tags = []
  return {
    tags,
    view(name) {
      const seen = (views.get(name) ?? 0) + 1
      views.set(name, seen)
      const pkg = packages[name]
      const versions = pkg.versions.filter(version => (arrivals[`${name}@${version}`] ?? 1) <= seen)
      return { versions, latest: pkg.latest }
    },
    addTag(name, version) {
      tags.push(`${name}@${version}`)
      packages[name].latest = version
    },
  }
}

function run(options) {
  const logs = []
  const waits = []
  let clock = 0
  return {
    logs,
    waits,
    result: promoteLatest({
      wait: (ms) => {
        waits.push(ms)
        clock += ms
        return Promise.resolve()
      },
      now: () => clock,
      log: line => logs.push(line),
      intervalMs: 30_000,
      timeoutMs: 10 * 60_000,
      ...options,
    }),
  }
}

describe('promoteLatest', () => {
  it('正式版：晚到的包等到取得到，latest 没指过来的补上，下一轮核过才算对上', async () => {
    const registry = fakeRegistry({
      '@xihan-ui/core': { versions: ['5.1.0', '5.2.0'], latest: '5.2.0' },
      '@xihan-ui/vue': { versions: ['5.1.0', '5.2.0'], latest: '5.1.0' },
    }, { '@xihan-ui/vue@5.2.0': 3 })
    const { result, waits } = run({
      packages: [{ name: '@xihan-ui/core', version: '5.2.0' }, { name: '@xihan-ui/vue', version: '5.2.0' }],
      preMode: false,
      view: registry.view,
      addTag: registry.addTag,
    })
    expect(await result).toEqual({ ok: true, version: '5.2.0', pending: [] })
    expect(registry.tags).toEqual(['@xihan-ui/vue@5.2.0'])
    // 第 1、2 轮 vue 还取不到，第 3 轮补上，第 4 轮核过
    expect(waits).toHaveLength(3)
  })

  it('超时还有取不到的包：失败，并列出没对上的包', async () => {
    const registry = fakeRegistry({
      '@xihan-ui/core': { versions: ['5.2.0'], latest: '5.2.0' },
      '@xihan-ui/vue': { versions: ['5.2.0'], latest: '5.1.0' },
    }, { '@xihan-ui/vue@5.2.0': Number.POSITIVE_INFINITY })
    const { result, logs } = run({
      packages: [{ name: '@xihan-ui/core', version: '5.2.0' }, { name: '@xihan-ui/vue', version: '5.2.0' }],
      preMode: false,
      view: registry.view,
      addTag: registry.addTag,
    })
    expect(await result).toEqual({ ok: false, version: '5.2.0', pending: ['@xihan-ui/vue'] })
    expect(registry.tags).toEqual([])
    expect(logs.at(-1)).toContain('@xihan-ui/vue')
  })

  it('补了几次 latest 都核不过：不再反复补，超时失败', async () => {
    const tags = []
    const { result } = run({
      packages: [{ name: '@xihan-ui/vue', version: '5.2.0' }],
      preMode: false,
      view: () => ({ versions: ['5.1.0', '5.2.0'], latest: '5.1.0' }),
      addTag: (name, version) => tags.push(`${name}@${version}`),
    })
    expect((await result).ok).toBe(false)
    expect(tags).toHaveLength(3)
  })

  it('dry-run 只看一轮：不等、不改，打印要做什么', async () => {
    const registry = fakeRegistry({
      '@xihan-ui/core': { versions: ['5.2.0'], latest: '5.1.0' },
      '@xihan-ui/vue': { versions: ['5.2.0'], latest: '5.1.0' },
    }, { '@xihan-ui/vue@5.2.0': 2 })
    const { result, logs, waits } = run({
      packages: [{ name: '@xihan-ui/core', version: '5.2.0' }, { name: '@xihan-ui/vue', version: '5.2.0' }],
      preMode: false,
      view: registry.view,
      addTag: registry.addTag,
      dryRun: true,
    })
    expect((await result).ok).toBe(true)
    expect(registry.tags).toEqual([])
    expect(waits).toEqual([])
    expect(logs.join('\n')).toMatch(/core：会把 latest 从 5\.1\.0 改到 5\.2\.0（dry-run，没改）/)
    expect(logs.join('\n')).toMatch(/vue：npm 上还取不到 5\.2\.0（dry-run，不等）/)
  })

  it('预发布：npm 上已有正式版的包不动，没有正式版的包 latest 跟过来', async () => {
    const registry = fakeRegistry({
      '@xihan-ui/core': { versions: ['5.1.0', '6.0.0-rc.1'], latest: '5.1.0' },
      '@xihan-ui/brand-new': { versions: ['6.0.0-rc.1'], latest: undefined },
    })
    const { result } = run({
      packages: [{ name: '@xihan-ui/core', version: '6.0.0-rc.1' }, { name: '@xihan-ui/brand-new', version: '6.0.0-rc.1' }],
      preMode: true,
      view: registry.view,
      addTag: registry.addTag,
    })
    expect((await result).ok).toBe(true)
    expect(registry.tags).toEqual(['@xihan-ui/brand-new@6.0.0-rc.1'])
  })

  it('库包版本不一致、带后缀却不在预发布模式：直接报错', async () => {
    const registry = fakeRegistry({})
    await expect(run({
      packages: [{ name: '@xihan-ui/core', version: '5.2.0' }, { name: '@xihan-ui/vue', version: '5.1.0' }],
      preMode: false,
      view: registry.view,
      addTag: registry.addTag,
    }).result).rejects.toThrow(/版本不一致/)
    await expect(run({
      packages: [{ name: '@xihan-ui/core', version: '6.0.0-rc.1' }],
      preMode: false,
      view: registry.view,
      addTag: registry.addTag,
    }).result).rejects.toThrow(/pre\.json/)
  })
})
