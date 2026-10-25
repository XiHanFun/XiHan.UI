// @xihan-ui/vue/nuxt —— Nuxt 模块：nuxt.config 里写 modules: ['@xihan-ui/vue/nuxt'] 即可。
//
//   - 组件自动注册：模板里直接写 <XhButton> / <xh-button>，按用到的组件从主入口导入，照常摇树；
//   - 注入令牌与皮肤：缺省引 @xihan-ui/styles（有层），宿主带无层 reset 时选无层的一份；
//   - SSR 首帧主题：服务端把八轴视觉环境写在 <html> 上，head 里一段脚本在首帧前读回读者存过的偏好，
//     客户端插件随后接管成视觉环境控制器，经 useNuxtApp().$xhVisual 交给应用切换明暗、密度等。
//
// 不依赖 @nuxt/kit：只用 Nuxt 的钩子与 options，模块函数的形状与 defineNuxtModule 的产物一致
// （Nuxt 调用 (inlineOptions, nuxt)，读 getMeta()）。本模块只在 Nuxt 的构建进程里运行，不进应用产物，
// 所以手写成包根下的 ESM，与组件源码分开：组件源码的类型检查不带 Node 的类型。

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASELINE_VISUAL_ENVIRONMENT, createVisualEnvironmentController, toVisualEnvironmentAttrs } from '@xihan-ui/core/visual-environment'

const PKG_ROOT = dirname(fileURLToPath(import.meta.url))
const DEFAULTS = { components: true, styles: 'layered', visualEnvironment: {} }
const STYLE_ENTRIES = { layered: '@xihan-ui/styles', unlayered: '@xihan-ui/styles/index.unlayered.css' }
const SERVER_PLUGIN = 'xihan-ui-visual.server.mjs'
const CLIENT_PLUGIN = 'xihan-ui-visual.client.mjs'

/** 存进 localStorage 的偏好里各轴的合法取值（brand 是任意非空字符串），与视觉环境控制器的校验一致。 */
const AXIS_VALUES = {
  mode: ['light', 'dark', 'system'],
  density: ['comfortable', 'compact'],
  dir: ['ltr', 'rtl'],
  contrast: ['default', 'more', 'system'],
  motion: ['default', 'reduce', 'system'],
  transparency: ['default', 'reduce', 'system'],
  material: ['standard', 'liquid'],
}

const kebab = name => name.replace(/[A-Z]/g, (char, index) => `${index > 0 ? '-' : ''}${char.toLowerCase()}`)
/** 内联进 <script> 的 JSON：`<` 转义，配置里写了 </script> 也截不断脚本。 */
const inline = value => JSON.stringify(value).replace(/</g, '\\u003c')

/**
 * 主入口全部 Xh 前缀的组件，按 Nuxt 组件目录的写法登记：从主入口按名字导入。
 * @returns {Promise<import('./nuxt').XiHanUINuxtComponent[]>} 登记给 components:extend 的条目
 */
export async function xihanUINuxtComponents() {
  const entry = await import('./dist/index.js')
  return Object.keys(entry)
    .filter(name => /^Xh[A-Z]/.test(name) && entry[name] !== null && typeof entry[name] === 'object')
    .sort()
    .map(name => ({
      pascalName: name,
      kebabName: kebab(name),
      export: name,
      filePath: '@xihan-ui/vue',
      shortPath: '@xihan-ui/vue',
      chunkName: `@xihan-ui/vue/${name}`,
      prefetch: false,
      preload: false,
      global: false,
      mode: 'all',
      priority: 0,
    }))
}

/**
 * 首帧脚本：先合并读者存过的偏好与 initial（initial 压过存的值），再按媒体查询解出四个系统轴，
 * 在首帧绘制前把八个属性写到 <html> 上。存的值与控制器同一套校验：读不出、解析失败或有一项不合法，
 * 整份不用，只按 initial 来。脚本出错不影响页面。
 * @param {import('./nuxt').XiHanUINuxtVisualEnvironment} visual 存储键与初始偏好
 * @returns {string} 内联进 head 的脚本
 */
export function xihanUIFirstFrameScript(visual) {
  const base = toVisualEnvironmentAttrs(BASELINE_VISUAL_ENVIRONMENT)
  return [
    '(function(){try{',
    `var k=${inline(visual.storageKey ?? null)},p={},s=null,i=${inline(visual.initial ?? {})},b=${inline(base)},V=${inline(AXIS_VALUES)};`,
    'if(k){try{s=JSON.parse(localStorage.getItem(k)||"null")}catch(e){}}',
    'function ok(o){if(!o||typeof o!=="object"||Array.isArray(o))return false;for(var x in o){var t=o[x];',
    'if(x==="brand"?typeof t!=="string"||!t.trim():!Object.prototype.hasOwnProperty.call(V,x)||V[x].indexOf(t)<0)return false}return true}',
    'if(ok(s))for(var x in s)p[x]=s[x];for(var y in i)p[y]=i[y];',
    'function q(m){return !!(window.matchMedia&&window.matchMedia(m).matches)}',
    'function v(a,m,on,off){var t=p[a];return t==="system"?(q(m)?on:off):t}',
    'var a={"data-theme":v("mode","(prefers-color-scheme: dark)","dark","light"),"data-brand":p.brand,"data-density":p.density,',
    '"data-contrast":v("contrast","(prefers-contrast: more)","more","default"),"data-motion":v("motion","(prefers-reduced-motion: reduce)","reduce","default"),',
    '"data-transparency":v("transparency","(prefers-reduced-transparency: reduce)","reduce","default"),"data-material":p.material,"dir":p.dir};',
    'var d=document.documentElement;for(var n in a)d.setAttribute(n,typeof a[n]==="string"?a[n]:b[n])',
    '}catch(e){}})()',
  ].join('')
}

/** 插件从本包所在位置引 core：pnpm 下应用解析不到适配器的传递依赖，用适配器自己那一份。 */
const coreRuntime = () => fileURLToPath(import.meta.resolve('@xihan-ui/core/visual-environment')).replaceAll('\\', '/')

/**
 * 服务端插件：每个请求一个控制器（没有媒体查询与存储，system 轴按基线出），<html> 上的八个属性跟着它走；
 * 首帧脚本放进 head。两样都只在服务端登记——客户端的 head 管理器不认领它们，
 * 水合后不会把首帧脚本按读者偏好改好的属性改回服务端的值。
 */
function serverPluginTemplate(visual) {
  return [
    `import { defineNuxtPlugin, useHead } from '#imports'`,
    `import { shallowRef } from 'vue'`,
    `import { createVisualEnvironmentController, toVisualEnvironmentAttrs } from ${JSON.stringify(coreRuntime())}`,
    '',
    'export default defineNuxtPlugin(() => {',
    `  const visual = createVisualEnvironmentController({ initial: ${JSON.stringify(visual.initial ?? {})} })`,
    '  const htmlAttrs = shallowRef(toVisualEnvironmentAttrs(visual.getState()))',
    '  visual.subscribe((state) => { htmlAttrs.value = toVisualEnvironmentAttrs(state) })',
    '  useHead({',
    '    htmlAttrs,',
    `    script: [{ key: 'xihan-ui-first-frame', innerHTML: ${JSON.stringify(xihanUIFirstFrameScript(visual))}, tagPosition: 'head', tagPriority: 'critical' }],`,
    '  })',
    '  return { provide: { xhVisual: visual } }',
    '})',
    '',
  ].join('\n')
}

/** 客户端插件：创建根作用域的视觉环境控制器，接管首帧脚本写好的属性。 */
function clientPluginTemplate(visual) {
  return [
    `import { defineNuxtPlugin } from '#imports'`,
    `import { createVisualEnvironmentController } from ${JSON.stringify(coreRuntime())}`,
    '',
    'export default defineNuxtPlugin(() => {',
    '  const visual = createVisualEnvironmentController({',
    '    root: document.documentElement,',
    `    initial: ${JSON.stringify(visual.initial ?? {})},`,
    ...(visual.storageKey
      ? [
          `    storageKey: ${JSON.stringify(visual.storageKey)},`,
          `    onStorageError: detail => console.warn('[xh] visual environment storage failed', detail),`,
        ]
      : []),
    '  })',
    '  return { provide: { xhVisual: visual } }',
    '})',
    '',
  ].join('\n')
}

/** 合并选项：缺省 < nuxt.config 的 xihanUI < 模块元组的第二项。写错的值在这里就报。 */
async function getOptions(inlineOptions, nuxt) {
  const options = { ...DEFAULTS, ...nuxt?.options.xihanUI, ...inlineOptions }
  if (options.styles !== false && !Object.hasOwn(STYLE_ENTRIES, options.styles))
    throw new TypeError(`[xh] xihanUI.styles 只能是 'layered'、'unlayered' 或 false，收到 ${JSON.stringify(options.styles)}`)
  // initial 借控制器自己的校验（无 window 时不碰 DOM 与存储），构建时就报，不在页面里才抛
  if (options.visualEnvironment)
    createVisualEnvironmentController({ initial: options.visualEnvironment.initial }).dispose()
  return options
}

async function setup(inlineOptions, nuxt) {
  const options = await getOptions(inlineOptions, nuxt)

  if (options.components) {
    const components = await xihanUINuxtComponents()
    nuxt.hook('components:extend', (registered) => {
      const taken = new Set(registered.map(component => component.pascalName))
      registered.push(...components.filter(component => !taken.has(component.pascalName)))
    })
  }

  // 皮肤排在应用自己的样式之前：应用的覆盖写在后面才压得住
  if (options.styles)
    nuxt.options.css.unshift(STYLE_ENTRIES[options.styles])

  if (options.visualEnvironment) {
    const visual = options.visualEnvironment
    for (const [filename, mode, render] of [[SERVER_PLUGIN, 'server', serverPluginTemplate], [CLIENT_PLUGIN, 'client', clientPluginTemplate]]) {
      nuxt.options.build.templates.push({ filename, getContents: () => render(visual) })
      nuxt.options.plugins.push({ src: join(nuxt.options.buildDir, filename), mode })
    }
    // useNuxtApp().$xhVisual 的类型：随包一份声明，只在 Nuxt 应用里引用（'#app' 由 Nuxt 生成）
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: join(PKG_ROOT, 'nuxt-app.d.ts') })
    })
  }
}

/**
 * Nuxt 模块：modules: ['@xihan-ui/vue/nuxt']，选项写在 nuxt.config 的 xihanUI 下或模块元组的第二项。
 * @type {import('./nuxt').XiHanUINuxtModule}
 */
const XiHanUINuxt = Object.assign(setup, {
  getOptions,
  getMeta: async () => ({ name: '@xihan-ui/vue', configKey: 'xihanUI', compatibility: { nuxt: '>=3.0.0' } }),
})

export default XiHanUINuxt
