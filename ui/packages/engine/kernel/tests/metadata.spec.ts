import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getMetadataDetails,
  getMetadataSummary,
  getRuntimeHost,
  getRuntimeInfo,
  printMetadataBannerOnce,
  printMetadataDetails,
  printMetadataSummary,
  registerRuntimeHost,
  resetMetadataBanner,
  resetRuntimeHost,
  setMetadataAutoPrint,
  XIHAN_UI_LOGO,
  XIHAN_UI_METADATA,
  XIHAN_UI_SEND_WORD,
  XIHAN_UI_VERSION,
} from '../src/metadata'

beforeEach(() => {
  resetRuntimeHost()
  resetMetadataBanner()
  setMetadataAutoPrint(true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('框架元数据', () => {
  it('版本从 package.json 派生并拆出主/次/修订号', () => {
    expect(XIHAN_UI_VERSION.version).toMatch(/^\d+\.\d+\.\d+(?:-.+)?$/)
    expect(XIHAN_UI_METADATA.version).toBe(XIHAN_UI_VERSION.version)
    expect(XIHAN_UI_METADATA.majorVersion).toBe(XIHAN_UI_VERSION.major)
    expect(XIHAN_UI_METADATA.minorVersion).toBe(XIHAN_UI_VERSION.minor)
    expect(XIHAN_UI_METADATA.patchVersion).toBe(XIHAN_UI_VERSION.patch)
    expect(XIHAN_UI_METADATA.prerelease).toBe(XIHAN_UI_VERSION.prerelease)
  })

  it('静态常量与 Framework 侧同源,仓库/文档/许可齐全', () => {
    expect(XIHAN_UI_METADATA.name).toBe('XiHan.UI')
    expect(XIHAN_UI_METADATA.displayName).toBe('曦寒视图组件')
    expect(XIHAN_UI_METADATA.author).toBe('XiHanFun and contributors')
    expect(XIHAN_UI_METADATA.organizationUrl).toBe('https://github.com/XiHanFun')
    expect(XIHAN_UI_METADATA.repositoryUrl).toBe('https://github.com/XiHanFun/XiHan.UI')
    expect(XIHAN_UI_METADATA.documentationUrl).toBe('https://ui.docs.xihanfun.com')
    expect(XIHAN_UI_METADATA.license).toBe('MIT')
    expect(XIHAN_UI_METADATA.keywords).toContain('headless-ui')
    expect(XIHAN_UI_METADATA.supportedPlatforms).toContain('Safari')
    expect(XIHAN_UI_METADATA.adapters).toEqual(['vue', 'web-components'])
  })

  it('元数据对象被冻结,集中维护点不可被消费方改坏', () => {
    expect(Object.isFrozen(XIHAN_UI_METADATA)).toBe(true)
    expect(Object.isFrozen(XIHAN_UI_METADATA.keywords)).toBe(true)
  })

  it('未登记宿主时运行时信息报出环境与空宿主', () => {
    const info = getRuntimeInfo()
    expect(info.mode).toBe('development')
    expect(typeof info.ssr).toBe('boolean')
    expect(info.host).toBeNull()
    expect(getRuntimeHost()).toBeNull()
  })

  it('适配器登记宿主后,摘要与详情都报出宿主', () => {
    registerRuntimeHost('vue', XIHAN_UI_METADATA.version)
    expect(getRuntimeHost()).toEqual({ name: 'vue', version: XIHAN_UI_METADATA.version })

    const summary = getMetadataSummary()
    expect(summary).toContain(`XiHan.UI 曦寒视图组件 v${XIHAN_UI_METADATA.version}`)
    expect(summary).toContain('宿主:vue')

    const details = getMetadataDetails()
    expect(details).toContain('作者: XiHanFun and contributors')
    expect(details).toContain('仓库: https://github.com/XiHanFun/XiHan.UI')
    expect(details).toContain('环境: development')
  })

  it('宿主版本按登记的原样报出', () => {
    registerRuntimeHost('vue', '9.9.9')
    const details = getMetadataDetails()
    expect(details).toContain('宿主:vue v9.9.9')
  })

  it('print 版只在 dev 出声,且不抛错', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    printMetadataSummary()
    printMetadataDetails()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('resetRuntimeHost 清掉登记', () => {
    registerRuntimeHost('web-components', XIHAN_UI_METADATA.version)
    resetRuntimeHost()
    expect(getRuntimeHost()).toBeNull()
    expect(getMetadataDetails()).toContain('未登记')
  })

  it('浏览器横幅默认不打:标志与寄语归开发者的终端,不发给访问者', async () => {
    // 上面的 beforeEach 已经把开关拨开了,重新取一份模块才看得到出厂值
    vi.resetModules()
    const fresh = await import('../src/metadata')
    expect(fresh.isMetadataAutoPrint()).toBe(false)

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    fresh.printMetadataBannerOnce()
    expect(spy).not.toHaveBeenCalled()
  })

  it('标志与寄语单独导出,不并进元数据对象', () => {
    // 并进那个对象就摇不掉了:它被整体引用,字段会跟着浏览器产物发到每个访问者手上
    expect(XIHAN_UI_METADATA).not.toHaveProperty('logo')
    expect(XIHAN_UI_METADATA).not.toHaveProperty('sendWord')
    expect(getMetadataSummary()).not.toContain('致她')
    expect(getMetadataDetails()).not.toContain('致她')

    expect(XIHAN_UI_LOGO).toContain('_/|_/___/_/')
    expect(XIHAN_UI_SEND_WORD).toContain('致她')
  })

  it('开着的时候整页只打一次摘要,reset 后可再打', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    printMetadataBannerOnce()
    printMetadataBannerOnce()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]![0]).toContain(XIHAN_UI_METADATA.name)

    resetMetadataBanner()
    printMetadataBannerOnce()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('setMetadataAutoPrint(false) 关掉自动横幅,手动 print 不受影响', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    setMetadataAutoPrint(false)
    resetMetadataBanner()
    printMetadataBannerOnce()
    expect(spy).not.toHaveBeenCalled()

    printMetadataSummary()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
