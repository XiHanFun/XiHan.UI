// @xihan-ui/styles/vite —— 按用到的组件自动注入皮肤的 Vite 插件。
//
//   // vite.config.ts
//   plugins: [XiHanUIStyles()]
//   // 应用入口
//   import 'virtual:xihan-ui/styles'
//
// 扫描源码里写到的组件（XhButton、XhSelectRoot 这类导出名，<xh-button>、<xh-select> 这类标签），
// 拼出一份只含这些皮肤的样式：层序、令牌、公共层（focus / label / description / pointer）与其余与组件
// 无关的层总在，家族配方与被引的皮肤按皮肤头上的 @import 补齐，组件内部借来的组件（分页里的每页条数下拉）
// 按 dist/manifest.json 的 uses 补齐。先后取自全量入口里各文件真正落下的顺序，所以注入的就是全量入口的子集，
// 渲染与全量引入一致。开发态另挂漏引探测：页面上出现了没注入皮肤的组件就在控制台报一条。
//
// 扫的是磁盘上的文件而不是模块图：样式模块被请求时，用到组件的模块未必都已转换过，按模块图拼会在构建里
// 漏掉后到的那些。代价是写在扫描范围之外的组件（别的包渲染的）要在 include 里补上，漏引探测会指出来。
// 注入的是有层的一份；宿主带无层 reset 时改用全量的 @xihan-ui/styles/index.unlayered.css。

import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PKG_ROOT = path.dirname(fileURLToPath(import.meta.url))

/** 应用入口引这一个：JS 模块，引入样式并在开发态挂漏引探测。 */
const ENTRY_ID = 'virtual:xihan-ui/styles'
/** 样式本身；带 ?inline 等查询照常交给 Vite 的 CSS 管线。 */
const CSS_ID = 'virtual:xihan-ui/styles.css'
const RESOLVED_ENTRY = '\0virtual:xihan-ui/styles'
/** 以 .css 结尾、不带 \0：Vite 的 CSS 插件按文件名认样式模块，带 \0 的虚拟模块它不接。 */
const RESOLVED_CSS = '/__xihan-ui-styles.css'

const DEFAULT_SCAN = ['index.html', 'src']
const DEFAULT_EXTENSIONS = ['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.html', '.md', '.svelte', '.astro']
const SKIP_DIRS = new Set(['node_modules', 'dist'])

/** 读随包发布的清单：全量入口里各文件的先后、组件皮肤、文件头上的相对 @import 与组件借用的皮肤。 */
export function readStyleManifest() {
  return JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'dist/manifest.json'), 'utf8'))
}

/** PascalCase 换成短横线：SelectRoot → select-root。 */
function kebab(name) {
  return name.replace(/[A-Z]/g, (char, index) => `${index > 0 ? '-' : ''}${char.toLowerCase()}`)
}

/**
 * 一段源码里写到的组件。认两种写法：Xh 前缀的导出名与 xh- 前缀的标签（含 Vue 模板的短横线写法）；
 * 换成短横线后按最长的组件名前缀归属——XhTagsInputRoot 归 tags-input 而不是 tag，XhSelectTrigger 归 select。
 * 多认几个（注释里提到、令牌名里带着）只是多注入一点样式。
 */
export function scopesIn(source, manifest = readStyleManifest()) {
  const names = manifest.skins
  const found = new Set()
  const claim = (word) => {
    const parts = word.split('-')
    for (let size = parts.length; size > 0; size--) {
      const candidate = parts.slice(0, size).join('-')
      if (Object.hasOwn(names, candidate)) {
        found.add(candidate)
        return
      }
    }
  }
  for (const match of source.matchAll(/\bXh([A-Z][A-Za-z0-9]*)/g))
    claim(kebab(match[1]))
  for (const match of source.matchAll(/\bxh-([a-z][a-z0-9-]*)/g))
    claim(match[1])
  return [...found].sort()
}

/** 去掉压缩产物头上的那行注释与文件头的 @import：被引的文件按清单单独落位。 */
function bodyOf(file) {
  const css = fs.readFileSync(path.join(PKG_ROOT, 'dist', file), 'utf8')
  return css.replace(/^\/\*[\s\S]*?\*\/\s*/, '').replace(/^(?:@import\s*(['"])[^'"]*\1\s*;\s*)+/, '').trim()
}

/**
 * 按组件名拼出注入的样式：与组件无关的层总在；组件皮肤补上借来的组件与头上 @import 引到的文件；
 * 先后照全量入口。令牌缺省仍是一条 @import（与全量入口逐字相同）；inlineTokens 时把令牌文件整份贴进来——
 * 插件走这条：pnpm 下应用解析不到样式包的传递依赖 @xihan-ui/tokens，从样式包这边读最稳。
 */
export function composeStyles(scopes, manifest = readStyleManifest(), options = {}) {
  const componentFiles = new Set(Object.values(manifest.skins))
  const wanted = new Set()
  const addFile = (file) => {
    if (wanted.has(file))
      return
    wanted.add(file)
    for (const dep of manifest.imports[file] ?? []) addFile(dep)
  }
  const seen = new Set()
  const addScope = (scope) => {
    if (seen.has(scope) || !Object.hasOwn(manifest.skins, scope))
      return
    seen.add(scope)
    addFile(manifest.skins[scope])
    for (const borrowed of manifest.uses[scope] ?? []) addScope(borrowed)
  }
  for (const file of manifest.order) {
    if (!file.startsWith('@') && !componentFiles.has(file) && !file.startsWith('family/'))
      addFile(file)
  }
  for (const scope of scopes) addScope(scope)

  const out = []
  for (const file of manifest.order) {
    if (file.startsWith('@'))
      out.push(options.inlineTokens ? fs.readFileSync(createRequire(import.meta.url).resolve(file), 'utf8') : `@import '${file}';`)
    else if (wanted.has(file))
      out.push(bodyOf(file))
  }
  return `${out.join('')}\n`
}

/**
 * 开发态的漏引探测：与 @xihan-ui/core/skin-check 同一判据（组件皮肤在自己的 [data-scope] 上落了
 * --xh-<scope>-skin 标记，取不到就是没注入），文案改成插件这边的补法。每个 scope 只探一次。
 */
const SKIN_CHECK = `
if (typeof document !== 'undefined') {
  const probed = new Set()
  const probe = (element) => {
    const scope = element.getAttribute('data-scope')
    if (!scope || probed.has(scope))
      return
    probed.add(scope)
    if (getComputedStyle(element).getPropertyValue('--xh-' + scope + '-skin').trim() === '')
      console.warn('[xihan-ui/styles] ' + scope + ' 的皮肤没注入：用到它的源码不在扫描范围里（或者是别的包渲染的），在 XiHanUIStyles({ include: [' + JSON.stringify(scope) + '] }) 里补上')
  }
  const visit = (node) => {
    if (node.nodeType !== 1)
      return
    if (node.hasAttribute('data-scope'))
      probe(node)
    for (const element of node.querySelectorAll('[data-scope]')) probe(element)
  }
  const start = () => {
    visit(document.documentElement)
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(visit)))
      .observe(document.documentElement, { childList: true, subtree: true })
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true })
  else
    start()
}
`

/**
 * 按用到的组件自动注入皮肤。
 * @param {import('./vite').XiHanUIStylesOptions} [options] 扫描范围、另外注入或排除的组件、开发态漏引探测
 * @returns {import('./vite').XiHanUIStylesPlugin} 放进 Vite 配置 plugins 的插件对象
 */
export function XiHanUIStyles(options = {}) {
  const scan = options.scan ?? DEFAULT_SCAN
  const extensions = new Set(options.extensions ?? DEFAULT_EXTENSIONS)
  const include = options.include ?? []
  const exclude = new Set(options.exclude ?? [])
  const skinCheck = options.skinCheck ?? true

  let root = process.cwd()
  let serve = false
  let manifest
  /** 每个扫到的文件写到的组件；文件改动时只重扫那一个。 */
  const byFile = new Map()
  let composed = ''

  const scanRoots = () => scan.map(entry => path.resolve(root, entry))
  const scannable = file => extensions.has(path.extname(file))
  const inScan = file => scannable(file) && scanRoots().some(entry => file === entry || file.startsWith(entry + path.sep))

  const readFile = (file) => {
    try {
      byFile.set(file, scopesIn(fs.readFileSync(file, 'utf8'), manifest))
    }
    catch {
      byFile.delete(file)
    }
  }
  const walk = (entry) => {
    let stat
    try {
      stat = fs.statSync(entry)
    }
    catch {
      return
    }
    if (stat.isFile()) {
      if (scannable(entry))
        readFile(entry)
      return
    }
    for (const dirent of fs.readdirSync(entry, { withFileTypes: true })) {
      if (dirent.name.startsWith('.') || SKIP_DIRS.has(dirent.name))
        continue
      walk(path.join(entry, dirent.name))
    }
  }
  const compose = () => {
    const scopes = new Set(include)
    for (const found of byFile.values()) {
      for (const scope of found) scopes.add(scope)
    }
    for (const scope of exclude) scopes.delete(scope)
    composed = composeStyles([...scopes].sort(), manifest, { inlineTokens: true })
    return composed
  }

  return {
    name: 'xihan-ui:styles',
    enforce: 'pre',
    configResolved(config) {
      root = config.root
      serve = config.command === 'serve'
    },
    buildStart() {
      manifest = readStyleManifest()
      byFile.clear()
      for (const entry of scanRoots()) walk(entry)
      compose()
      // vite build --watch：扫到的文件不在模块图里，登记上它们改动才会触发重建
      if (!serve) {
        for (const file of byFile.keys()) this.addWatchFile(file)
      }
    },
    resolveId(id) {
      if (id === ENTRY_ID)
        return RESOLVED_ENTRY
      if (id === CSS_ID || id.startsWith(`${CSS_ID}?`))
        return RESOLVED_CSS + id.slice(CSS_ID.length)
      // 开发态浏览器拿着解析后的地址回来请求
      if (id === RESOLVED_CSS || id.startsWith(`${RESOLVED_CSS}?`))
        return id
      return undefined
    },
    load(id) {
      if (id === RESOLVED_ENTRY)
        return `import ${JSON.stringify(CSS_ID)}\n${serve && skinCheck ? SKIN_CHECK : ''}`
      if (id === RESOLVED_CSS || id.startsWith(`${RESOLVED_CSS}?`))
        return composed
      return undefined
    },
    configureServer(server) {
      const refresh = (file, removed) => {
        if (!inScan(file))
          return
        if (removed)
          byFile.delete(file)
        else
          readFile(file)
        const before = composed
        if (compose() === before)
          return
        // 拼出来的样式变了：让样式模块重新加载，CSS 模块自己接住热更新，页面不整页刷新
        const environment = server.environments?.client
        const graph = environment?.moduleGraph ?? server.moduleGraph
        for (const module of graph.getModulesByFile?.(RESOLVED_CSS) ?? [graph.getModuleById(RESOLVED_CSS)].filter(Boolean)) {
          graph.invalidateModule(module)
          if (environment?.reloadModule)
            environment.reloadModule(module)
          else
            server.reloadModule(module)
        }
      }
      server.watcher.on('add', file => refresh(file, false))
      server.watcher.on('change', file => refresh(file, false))
      server.watcher.on('unlink', file => refresh(file, true))
    },
  }
}
