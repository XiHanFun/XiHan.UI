// 按需注入样式（@xihan-ui/styles/vite）：插件拼出来的样式必须是全量入口的子集、先后不变，
// 并且在真实 Vite 构建与开发服务器里都按扫到的组件注入。
//
//   - 全部组件拼出来逐字等于发布的 dist/index.css：子集取自同一张先后表，没有另起一套排序
//   - 组件名按最长前缀归属，导出名与标签两种写法都认
//   - 只写到分页的消费方：构建产物里有分页、它借来的下拉与虚拟滚动、与组件无关的各层与令牌，没有别的组件皮肤
//   - 开发态新加一个写到对话框的文件，样式模块重新拼出来就带上对话框
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { composeStyles, readStyleManifest, scopesIn, XiHanUIStyles } from '@xihan-ui/styles/vite'
import { build, createServer } from 'vite'
import { describe, expect, it } from 'vitest'

const UI_ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const DIST_INDEX = join(UI_ROOT, 'packages/design/styles/dist/index.css')
const FIXTURE_ROOT = join(import.meta.dirname, 'fixtures/styles-plugin')
const BUILD_TIMEOUT = 60_000

const manifest = readStyleManifest()
/** 产物里带着哪些组件皮肤：每份组件皮肤都在自己的挂载类上落了 --xh-<名字>-skin 标记。 */
const skinsIn = css => Object.keys(manifest.skins).filter(name => new RegExp(`--xh-${name}-skin:\\s*1`).test(css))

describe('按需注入样式的拼法', () => {
  it('全部组件拼出来逐字等于发布的 dist/index.css', () => {
    const full = readFileSync(DIST_INDEX, 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '')
    expect(composeStyles(Object.keys(manifest.skins), manifest)).toBe(full)
  })

  it('组件名按最长前缀归属：导出名与标签两种写法都认', () => {
    const source = `import { XhButton, XhSelectTrigger, XhTagsInputRoot } from '@xihan-ui/vue'
      <xh-pagination></xh-pagination> <XhDateRangePicker /> <xh-form-field-group name="a" />`
    expect(scopesIn(source, manifest)).toEqual(['button', 'date-range-picker', 'form', 'pagination', 'select', 'tags-input'])
  })

  it('借来的组件与文件头上引到的皮肤一并注入，与组件无关的层总在', () => {
    expect(skinsIn(composeStyles(['pagination'], manifest))).toEqual(['pagination', 'select', 'virtualizer'])
    const none = composeStyles([], manifest)
    expect(skinsIn(none)).toEqual([])
    expect(none).toContain(':focus-visible')
  })
})

describe('按需注入样式的插件', () => {
  it('真实 Vite 构建：只注入写到的组件、它借来的组件与令牌', async () => {
    const result = await build({
      root: FIXTURE_ROOT,
      configFile: false,
      logLevel: 'silent',
      plugins: [XiHanUIStyles({ scan: ['main.js'] })],
      build: {
        write: false,
        lib: { entry: join(FIXTURE_ROOT, 'main.js'), formats: ['es'], fileName: 'index' },
      },
    })
    const outputs = Array.isArray(result) ? result : [result]
    const asset = outputs.flatMap(bundle => bundle.output).find(chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css'))
    const css = String(asset?.source ?? '')
    expect(skinsIn(css)).toEqual(['pagination', 'select', 'virtualizer'])
    // 令牌整份贴进来：消费方不必自己能解析到样式包的传递依赖
    expect(css).toMatch(/--xh-bg-brand:/)
    // 先后照全量入口：公共层在前，三份皮肤按清单里的顺序
    const at = name => css.search(new RegExp(`--xh-${name}-skin:\\s*1`))
    const expected = ['pagination', 'select', 'virtualizer'].sort((a, b) => manifest.order.indexOf(manifest.skins[a]) - manifest.order.indexOf(manifest.skins[b]))
    expect([...expected].sort((a, b) => at(a) - at(b))).toEqual(expected)
    expect(css.indexOf(':focus-visible')).toBeLessThan(Math.min(...expected.map(at)))
  }, BUILD_TIMEOUT)

  it('开发态：扫描范围里新加的文件写到了别的组件，样式模块重新拼出来就带上它', async () => {
    const root = mkdtempSync(join(tmpdir(), 'xihan-styles-plugin-'))
    writeFileSync(join(root, 'main.js'), `import 'virtual:xihan-ui/styles'\nexport const used = 'XhButton'\n`)
    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [XiHanUIStyles({ scan: ['.'] })],
      server: { middlewareMode: true, ws: false },
    })
    try {
      await server.pluginContainer.buildStart({})
      const before = await server.transformRequest('/__xihan-ui-styles.css')
      expect(skinsIn(before?.code ?? '')).toEqual(['button'])

      const added = join(root, 'dialog.js')
      writeFileSync(added, `export const used = '<xh-dialog-root>'\n`)
      server.watcher.emit('add', added)
      const after = await server.transformRequest('/__xihan-ui-styles.css')
      expect(skinsIn(after?.code ?? '')).toEqual(['button', 'dialog'])
    }
    finally {
      await server.close()
      rmSync(root, { recursive: true, force: true })
    }
  }, BUILD_TIMEOUT)
})
