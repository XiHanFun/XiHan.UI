import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 宿主登记与「横幅只打一次」的记账都挂在模块上，逐条用例重取一份模块拿出厂状态
let m: typeof import('../src/metadata')

beforeEach(async () => {
  vi.resetModules()
  m = await import('../src/metadata')
  m.setMetadataAutoPrint(true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('框架元数据', () => {
  it('版本从 package.json 派生并拆出主/次/修订号', () => {
    expect(m.XIHAN_UI_VERSION.version).toMatch(/^\d+\.\d+\.\d+(?:-.+)?$/)
    expect(m.XIHAN_UI_METADATA.version).toBe(m.XIHAN_UI_VERSION.version)
    expect(m.XIHAN_UI_METADATA.majorVersion).toBe(m.XIHAN_UI_VERSION.major)
    expect(m.XIHAN_UI_METADATA.minorVersion).toBe(m.XIHAN_UI_VERSION.minor)
    expect(m.XIHAN_UI_METADATA.patchVersion).toBe(m.XIHAN_UI_VERSION.patch)
    expect(m.XIHAN_UI_METADATA.prerelease).toBe(m.XIHAN_UI_VERSION.prerelease)
  })

  it('静态常量与 Framework 侧同源,仓库/文档/许可齐全', () => {
    expect(m.XIHAN_UI_METADATA.name).toBe('XiHan.UI')
    expect(m.XIHAN_UI_METADATA.displayName).toBe('曦寒视图组件')
    expect(m.XIHAN_UI_METADATA.author).toBe('XiHanFun and contributors')
    expect(m.XIHAN_UI_METADATA.organizationUrl).toBe('https://github.com/XiHanFun')
    expect(m.XIHAN_UI_METADATA.repositoryUrl).toBe('https://github.com/XiHanFun/XiHan.UI')
    expect(m.XIHAN_UI_METADATA.documentationUrl).toBe('https://ui.docs.xihanfun.com')
    expect(m.XIHAN_UI_METADATA.license).toBe('MIT')
    expect(m.XIHAN_UI_METADATA.keywords).toContain('headless-ui')
    expect(m.XIHAN_UI_METADATA.supportedPlatforms).toContain('Safari')
    expect(m.XIHAN_UI_METADATA.adapters).toEqual(['vue', 'web-components'])
  })

  it('元数据对象被冻结,集中维护点不可被消费方改坏', () => {
    expect(Object.isFrozen(m.XIHAN_UI_METADATA)).toBe(true)
    expect(Object.isFrozen(m.XIHAN_UI_METADATA.keywords)).toBe(true)
  })

  it('未登记宿主时运行时信息报出环境与空宿主,详情写「未登记」', () => {
    const info = m.getRuntimeInfo()
    expect(info.mode).toBe('development')
    expect(typeof info.ssr).toBe('boolean')
    expect(info.host).toBeNull()
    expect(m.getRuntimeHost()).toBeNull()
    expect(m.getMetadataDetails()).toContain('未登记')
  })

  it('适配器登记宿主后,摘要与详情都报出宿主', () => {
    m.registerRuntimeHost('vue', m.XIHAN_UI_METADATA.version)
    expect(m.getRuntimeHost()).toEqual({ name: 'vue', version: m.XIHAN_UI_METADATA.version })

    const summary = m.getMetadataSummary()
    expect(summary).toContain(`XiHan.UI 曦寒视图组件 v${m.XIHAN_UI_METADATA.version}`)
    expect(summary).toContain('宿主:vue')

    const details = m.getMetadataDetails()
    expect(details).toContain('作者: XiHanFun and contributors')
    expect(details).toContain('仓库: https://github.com/XiHanFun/XiHan.UI')
    expect(details).toContain('环境: development')
  })

  it('宿主版本按登记的原样报出', () => {
    m.registerRuntimeHost('vue', '9.9.9')
    const details = m.getMetadataDetails()
    expect(details).toContain('宿主:vue v9.9.9')
  })

  it('print 版只在 dev 出声,且不抛错', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    m.printMetadataSummary()
    m.printMetadataDetails()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('浏览器横幅默认不打:标志与寄语归开发者的终端,不发给访问者', async () => {
    // 上面的 beforeEach 已经把开关拨开了,再取一份模块才看得到出厂值
    vi.resetModules()
    const fresh = await import('../src/metadata')
    expect(fresh.isMetadataAutoPrint()).toBe(false)

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    fresh.printMetadataBannerOnce()
    expect(spy).not.toHaveBeenCalled()
  })

  it('标志与寄语单独导出,不并进元数据对象', () => {
    // 并进那个对象就摇不掉了:它被整体引用,字段会跟着浏览器产物发到每个访问者手上
    expect(m.XIHAN_UI_METADATA).not.toHaveProperty('logo')
    expect(m.XIHAN_UI_METADATA).not.toHaveProperty('sendWord')
    expect(m.getMetadataSummary()).not.toContain('致她')
    expect(m.getMetadataDetails()).not.toContain('致她')

    expect(m.XIHAN_UI_LOGO).toContain('_/|_/___/_/')
    expect(m.XIHAN_UI_SEND_WORD).toContain('致她')
  })

  it('开着的时候整页只打一次摘要', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    m.printMetadataBannerOnce()
    m.printMetadataBannerOnce()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]![0]).toContain(m.XIHAN_UI_METADATA.name)
  })

  it('setMetadataAutoPrint(false) 关掉自动横幅,手动 print 不受影响', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    m.setMetadataAutoPrint(false)
    m.printMetadataBannerOnce()
    expect(spy).not.toHaveBeenCalled()

    m.printMetadataSummary()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
