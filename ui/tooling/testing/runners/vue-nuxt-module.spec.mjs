// @vitest-environment jsdom
// Nuxt 模块（@xihan-ui/vue/nuxt）：用一个只带 options 与 hook 的假 nuxt 跑模块，核对它交给 Nuxt 的东西；
// 首帧脚本与视觉环境控制器逐项对拍——两边各解一次读者偏好，写到 <html> 上的八个属性必须一样，
// 否则水合后控制器接管时页面会跳一下。真实 Nuxt 的构建与 SSR 由 tooling/scripts/adapter/check-nuxt-example.mjs 核对。
import { createVisualEnvironmentController, VISUAL_ENVIRONMENT_ATTRIBUTES } from '@xihan-ui/core/visual-environment'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import XiHanUINuxt, { xihanUIFirstFrameScript } from '../../../packages/adapters/vue/nuxt.js'

function fakeNuxt(config) {
  const hooks = {}
  return {
    hooks,
    options: { css: ['~/assets/app.css'], app: { head: {} }, build: { templates: [] }, plugins: [], buildDir: '/app/.nuxt', ...config },
    hook: (name, fn) => {
      hooks[name] = fn
    },
  }
}

async function install(inlineOptions, config) {
  const nuxt = fakeNuxt(config)
  await XiHanUINuxt(inlineOptions, nuxt)
  return nuxt
}

// 主入口的产物就是模块自己读的那一份：对照它，不另抄一张组件名单。整库转译要好几秒，先载进来
let vue
beforeAll(async () => {
  vue = await import('../../../packages/adapters/vue/dist/index.js')
}, 60_000)

const template = (nuxt, suffix) => nuxt.options.build.templates.find(t => t.filename.endsWith(suffix))?.getContents() ?? ''

describe('nuxt 模块', () => {
  it('元信息：配置键 xihanUI', async () => {
    expect(await XiHanUINuxt.getMeta()).toMatchObject({ name: '@xihan-ui/vue', configKey: 'xihanUI' })
  })

  it('主入口的组件全部登记，从主入口按名字导入；应用自己同名的组件不被顶掉', async () => {
    const nuxt = await install(undefined, {})
    const own = { pascalName: 'XhButton', filePath: '~/components/XhButton.vue' }
    const registered = [own]
    nuxt.hooks['components:extend'](registered)
    const names = Object.keys(vue).filter(name => /^Xh[A-Z]/.test(name) && typeof vue[name] === 'object').sort()
    expect(registered.map(c => c.pascalName).sort()).toEqual(names)
    expect(registered[0]).toBe(own)
    expect(registered.find(c => c.pascalName === 'XhButtonGroup')).toMatchObject({
      kebabName: 'xh-button-group',
      export: 'XhButtonGroup',
      filePath: '@xihan-ui/vue',
      mode: 'all',
    })
  })

  it('皮肤排在应用样式之前；可换无层的一份或不注入', async () => {
    expect((await install(undefined, {})).options.css).toEqual(['@xihan-ui/styles', '~/assets/app.css'])
    expect((await install({ styles: 'unlayered' }, {})).options.css).toEqual(['@xihan-ui/styles/index.unlayered.css', '~/assets/app.css'])
    expect((await install({ styles: false }, {})).options.css).toEqual(['~/assets/app.css'])
  })

  it('视觉环境：两端各建一个控制器，服务端插件另写 <html> 属性与首帧脚本；类型声明随包引用', async () => {
    const visualEnvironment = { storageKey: 'app-visual', initial: { mode: 'system', brand: 'ocean', density: 'compact' } }
    const nuxt = await install(undefined, { xihanUI: { visualEnvironment } })
    expect(nuxt.options.plugins.map(p => [p.src.replaceAll('\\', '/'), p.mode])).toEqual([
      ['/app/.nuxt/xihan-ui-visual.server.mjs', 'server'],
      ['/app/.nuxt/xihan-ui-visual.client.mjs', 'client'],
    ])
    const server = template(nuxt, '.server.mjs')
    expect(server).toContain(`createVisualEnvironmentController({ initial: ${JSON.stringify(visualEnvironment.initial)} })`)
    expect(server).toContain('provide: { xhVisual: visual }')
    expect(server).toContain(JSON.stringify(xihanUIFirstFrameScript(visualEnvironment)))
    const client = template(nuxt, '.client.mjs')
    expect(client).toMatch(/import \{ createVisualEnvironmentController \} from ".+\/visual-environment\.js"/)
    expect(client).toContain('storageKey: "app-visual"')
    const references = []
    nuxt.hooks['prepare:types']({ references })
    expect(references[0].path.replaceAll('\\', '/')).toMatch(/\/packages\/adapters\/vue\/nuxt-app\.d\.ts$/)
  })

  it('模块元组的选项压过 nuxt.config 的 xihanUI；关掉的部分什么都不登记', async () => {
    const nuxt = await install({ components: false, visualEnvironment: false }, { xihanUI: { styles: 'unlayered' } })
    expect(nuxt.hooks['components:extend']).toBeUndefined()
    expect(nuxt.hooks['prepare:types']).toBeUndefined()
    expect(nuxt.options.plugins).toEqual([])
    expect(nuxt.options.css[0]).toBe('@xihan-ui/styles/index.unlayered.css')
  })

  it('getOptions 给出合并后的选项，Nuxt 从它推出 nuxt.config 里 xihanUI 的类型', async () => {
    const nuxt = fakeNuxt({ xihanUI: { components: false, styles: 'unlayered' } })
    expect(await XiHanUINuxt.getOptions({ styles: false }, nuxt)).toEqual({ components: false, styles: false, visualEnvironment: {} })
    expect(await XiHanUINuxt.getOptions()).toEqual({ components: true, styles: 'layered', visualEnvironment: {} })
  })

  it('选项写错在构建时就报', async () => {
    await expect(install({ styles: 'bogus' }, {})).rejects.toThrow(/xihanUI\.styles/)
    await expect(install({ visualEnvironment: { initial: { mode: 'blue' } } }, {})).rejects.toThrow(/initial\.mode/)
  })

  it('配置里的 </script> 截不断首帧脚本', () => {
    expect(xihanUIFirstFrameScript({ storageKey: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })
})

describe('首帧脚本与视觉环境控制器对拍', () => {
  const KEY = 'xh-visual'
  const root = document.documentElement
  const media = new Set()
  window.matchMedia = query => ({
    matches: media.has(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })

  const clear = () => {
    for (const name of VISUAL_ENVIRONMENT_ATTRIBUTES)
      root.removeAttribute(name)
  }
  const attrs = () => Object.fromEntries(VISUAL_ENVIRONMENT_ATTRIBUTES.map(name => [name, root.getAttribute(name)]))

  afterEach(() => {
    clear()
    localStorage.clear()
    media.clear()
  })

  const STORED = [
    null,
    '{"mode":"dark","density":"compact"}',
    '{"mode":"system","contrast":"system","motion":"system","transparency":"system","brand":"forest","dir":"rtl","material":"liquid"}',
    // 有一项不合法、带了不认识的键、品牌是空串、不是对象、不是 JSON：整份不用
    '{"mode":"dark","density":"huge"}',
    '{"mode":"dark","accent":"red"}',
    '{"brand":"  "}',
    '["dark"]',
    '{oops',
  ]
  const INITIAL = [undefined, { mode: 'system' }, { density: 'comfortable', brand: 'ocean' }, { contrast: 'more', motion: 'reduce' }]
  const MEDIA = [
    [],
    ['(prefers-color-scheme: dark)', '(prefers-contrast: more)', '(prefers-reduced-motion: reduce)', '(prefers-reduced-transparency: reduce)'],
  ]

  const cases = STORED.flatMap(stored => INITIAL.flatMap(initial => MEDIA.map(queries => ({ stored, initial, queries }))))
  it.each(cases)('存 $stored · initial $initial · 媒体 $queries', ({ stored, initial, queries }) => {
    for (const query of queries)
      media.add(query)
    if (stored !== null)
      localStorage.setItem(KEY, stored)

    // eslint-disable-next-line no-new-func -- 首帧脚本是内联进 head 的字符串，按原样执行
    new Function(xihanUIFirstFrameScript({ storageKey: KEY, initial }))()
    const fromScript = attrs()
    clear()

    const controller = createVisualEnvironmentController({ root, storageKey: KEY, initial, onStorageError: () => {} })
    const fromController = attrs()
    controller.dispose()

    expect(fromScript).toEqual(fromController)
  })

  it('不给存储键：只按 initial 与系统偏好', () => {
    localStorage.setItem(KEY, '{"mode":"dark"}')
    media.add('(prefers-color-scheme: dark)')
    // eslint-disable-next-line no-new-func -- 同上
    new Function(xihanUIFirstFrameScript({ initial: { mode: 'system' } }))()
    expect(root.getAttribute('data-theme')).toBe('dark')
    media.clear()
    clear()
    // eslint-disable-next-line no-new-func -- 同上
    new Function(xihanUIFirstFrameScript({}))()
    expect(root.getAttribute('data-theme')).toBe('light')
  })
})
