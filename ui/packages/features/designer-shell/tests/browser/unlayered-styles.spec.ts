// 宿主应用多引有层的组件皮肤 @xihan-ui/styles 配 style.css，文档站引无层的 @xihan-ui/styles/index.unlayered.css 配 style.unlayered.css。
// 两种搭配下外壳零件要算出同一套计算样式：同一份 DOM 分别装进只引其中一种搭配的 iframe，逐元素比对，任何一处不一致都报出元素与属性。
// 无层规则不论特指度都压过有层规则：无层皮肤配有层的 style.css 时，外壳与皮肤写在同一元素上的同一属性一律输掉，
// JSON 编辑框的定高塌成两行、等宽字体退回正文字体，外框分隔条变回圆角。
import type { JsonValue } from '@xihan-ui/core/json'
import type { ApplyOperation } from '@xihan-ui/designer-kit'
import type { DesignerSettingsSection } from '../../src'
import { createHistory, snapshotHistory } from '@xihan-ui/designer-kit'
import shellUnlayeredUrl from '@xihan-ui/designer-shell/style.unlayered.css?url'
import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell, DESIGNER_FRAME_REGIONS } from '../../src'
import shellUrl from '../../style.css?url'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

const SHEETS = {
  layered: [tokensUrl, layeredUrl, shellUrl],
  unlayered: [tokensUrl, unlayeredUrl, shellUnlayeredUrl],
} as const

const PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'row-gap',
  'column-gap',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'align-self',
  'justify-content',
  'grid-template-columns',
  'grid-template-rows',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'white-space',
  'text-overflow',
  'overflow-x',
  'overflow-y',
  'color',
  'background-color',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-top-left-radius',
  'opacity',
  'visibility',
  'text-align',
  'resize',
] as const

let mounted: HTMLElement[] = []
let frames: HTMLIFrameElement[] = []

afterEach(() => {
  for (const element of mounted)
    element.remove()
  mounted = []
  for (const frame of frames)
    frame.remove()
  frames = []
})

async function nextFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等进场动画播完。 */
async function settle(): Promise<void> {
  await nextFrames()
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await nextFrames()
}

/** 把标记装进只引一种搭配的 iframe，样式表装载完再交出文档。 */
async function stage(markup: string, sheets: readonly string[], width = 1280): Promise<Document> {
  const frame = document.createElement('iframe')
  frame.style.cssText = `position: fixed; inset: 0 auto auto 0; width: ${width}px; height: 800px; border: 0; visibility: hidden`
  document.body.append(frame)
  frames.push(frame)
  const doc = frame.contentDocument!
  doc.documentElement.setAttribute('data-theme', 'light')
  doc.documentElement.setAttribute('lang', 'en')
  const loaded = sheets.map(href => new Promise<void>((resolve, reject) => {
    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.addEventListener('load', () => resolve())
    link.addEventListener('error', () => reject(new Error(`样式表装不上：${href}`)))
    doc.head.append(link)
  }))
  const still = doc.createElement('style')
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
  doc.head.append(still)
  doc.body.style.margin = '0'
  doc.body.innerHTML = markup
  await Promise.all(loaded)
  return doc
}

/** 元素的称呼：标签加 data-scope / data-part，前面是最近的带 data-scope 的祖先。 */
function nameOf(element: Element): string {
  const own = (el: Element): string => {
    const scope = el.getAttribute('data-scope')
    const part = el.getAttribute('data-part') ?? el.getAttribute('data-xh-part')
    return `${el.localName}${scope ? `[${scope}]` : ''}${part ? `[${part}]` : ''}`
  }
  const owner = element.parentElement?.closest('[data-scope]')
  return owner ? `${own(owner)} › ${own(element)}` : own(element)
}

/** 同一份标记在两种搭配下逐元素比对计算样式，交出不一致的「元素 属性：有层 → 无层」。 */
async function compare(markup: string): Promise<string[]> {
  const layered = await stage(markup, SHEETS.layered)
  const unlayered = await stage(markup, SHEETS.unlayered)
  const a = [...layered.body.querySelectorAll('*')]
  const b = [...unlayered.body.querySelectorAll('*')]
  expect(a.length).toBe(b.length)
  const diffs: string[] = []
  a.forEach((element, index) => {
    const left = layered.defaultView!.getComputedStyle(element)
    const right = unlayered.defaultView!.getComputedStyle(b[index]!)
    for (const property of PROPERTIES) {
      const x = left.getPropertyValue(property)
      const y = right.getPropertyValue(property)
      if (x !== y)
        diffs.push(`${nameOf(element)} ${property}: ${x} → ${y}`)
    }
  })
  return diffs
}

function mount<T extends HTMLElement>(element: T): T {
  document.body.append(element)
  mounted.push(element)
  return element
}

const doc: JsonValue = { nodes: Array.from({ length: 40 }, (_, index) => ({ id: `n${index}`, label: `Node ${index}` })) }

async function openJsonEditor(): Promise<string> {
  const editor = mount(document.createElement('xh-designer-json-editor'))
  editor.value = doc
  editor.validate = () => [{ issue: { code: 'required', path: ['nodes', 3, 'label'] }, message: 'Node 3 needs a label' }]
  editor.show()
  await editor.updateComplete
  await settle()
  return document.body.innerHTML
}

const section: DesignerSettingsSection = {
  id: 'flow',
  label: 'Flow',
  order: 100,
  items: [
    { path: ['grid'], label: 'Grid', control: { kind: 'boolean' }, default: true, meta: { description: 'Show the grid on the canvas' } },
    { path: ['snap'], label: 'Snap distance', control: { kind: 'number', min: 0, unit: 'px' }, default: 8 },
  ],
}

type Doc = readonly string[]
type Op = { readonly type: 'push', readonly value: string } | { readonly type: 'pop' }

const apply: ApplyOperation<Doc, Op> = (value, op) => (op.type === 'push'
  ? { document: [...value, op.value], inverse: [{ type: 'pop' }] }
  : { document: value.slice(0, -1), inverse: [{ type: 'push', value: value.at(-1)! }] })

describe('外壳零件在有层与无层两种搭配下算出同一套计算样式', () => {
  it('编辑 JSON 的对话框', async () => {
    expect(await compare(await openJsonEditor())).toEqual([])
  })

  it('设置对话框', async () => {
    const settings = mount(document.createElement('xh-designer-settings'))
    settings.general = { brands: [{ value: 'blue', color: '#1677ff' }] }
    settings.sections = [section]
    await settings.updateComplete
    settings.show()
    await settings.updateComplete
    await settle()
    expect(await compare(document.body.innerHTML)).toEqual([])
  })

  it('导入字段对话框', async () => {
    const dialog = mount(document.createElement('xh-designer-field-import'))
    dialog.contents = ['text', 'image', 'barcode', 'qrcode']
    dialog.show()
    await dialog.updateComplete
    await settle()
    expect(await compare(document.body.innerHTML)).toEqual([])
  })

  it('外框与物料、属性、问题、页面结构、历史记录各块面板', async () => {
    const frame = mount(document.createElement('xh-designer-frame'))
    frame.style.cssText = 'display: block; inline-size: 1200px; block-size: 760px'
    frame.regions = DESIGNER_FRAME_REGIONS
    const palette = document.createElement('xh-designer-palette')
    palette.slot = 'palette'
    palette.groups = [{ id: 'g', label: 'Elements', items: [{ id: 'text', label: 'Text' }, { id: 'image', label: 'Image' }] }]
    const properties = document.createElement('xh-designer-properties')
    properties.slot = 'properties'
    properties.targets = [{
      kind: 'column',
      id: 'c1',
      value: { width: 80, span: 2, title: 'Name' },
      descriptors: [
        { path: ['title'], control: { kind: 'string' }, label: 'Title' },
        { path: ['width'], control: { kind: 'number', exclusiveMin: 0 }, label: 'Width' },
        { path: ['span'], control: { kind: 'number', integer: true, min: 1, max: 4 }, label: 'Span' },
      ],
    }]
    const issues = document.createElement('xh-designer-issues')
    issues.slot = 'issues'
    issues.items = [{ issue: { code: 'graph.no-end', path: [] }, message: 'No end node' }]
    frame.append(palette, properties, issues)
    const outline = mount(document.createElement('xh-designer-outline'))
    outline.style.cssText = 'display: flex; flex-direction: column; inline-size: 280px; block-size: 240px'
    outline.searchable = true
    outline.nodes = [{ id: 'a', label: 'Name', description: 'name' }, { id: 'g', label: 'Grid', children: [{ id: 'b', label: 'Phone' }] }]
    outline.selection = ['b']
    const history = createHistory<Doc, Op>({ document: [], apply })
    for (const value of ['a', 'b', 'c'])
      history.execute([{ type: 'push', value }], { label: `Add ${value}` })
    history.undo()
    const panel = mount(document.createElement('xh-designer-history'))
    panel.style.cssText = 'display: flex; flex-direction: column; inline-size: 288px; block-size: 240px'
    panel.snapshot = snapshotHistory(history)
    await frame.updateComplete
    await properties.updateComplete
    await outline.updateComplete
    await panel.updateComplete
    await settle()
    expect(await compare(document.body.innerHTML)).toEqual([])
  })

  it('标尺与变换覆盖层', async () => {
    const ruler = mount(document.createElement('xh-designer-ruler'))
    ruler.style.cssText = 'display: block; position: relative; inline-size: 620px; block-size: 420px'
    ruler.viewport = { x: 30, y: 10, zoom: 1 }
    const canvas = mount(document.createElement('div'))
    canvas.style.cssText = 'position: relative; inline-size: 600px; block-size: 400px'
    const overlay = document.createElement('xh-designer-transform')
    overlay.viewport = { x: 50, y: 40, zoom: 2 }
    overlay.items = [{ id: 'a', rect: { x: 10, y: 20, width: 100, height: 50 }, rotatable: true }]
    canvas.append(overlay)
    await ruler.updateComplete
    await overlay.updateComplete
    await settle()
    expect(await compare(document.body.innerHTML)).toEqual([])
  })
})

describe('无层搭配下的 JSON 编辑框', () => {
  it('编辑框照规定定高、等宽字体、不折行：宽屏 24rem，窄屏 16rem', async () => {
    const markup = await openJsonEditor()
    for (const [width, token] of [[1280, '--xh-viewport-h-lg'], [375, '--xh-viewport-h-md']] as const) {
      const doc = await stage(markup, SHEETS.unlayered, width)
      const view = doc.defaultView!
      const textarea = doc.querySelector<HTMLTextAreaElement>('[data-scope="designer-json-editor"][data-part="input"] textarea')!
      const probe = doc.createElement('div')
      probe.style.blockSize = `var(${token})`
      doc.body.append(probe)
      const expected = probe.getBoundingClientRect().height
      probe.remove()
      const style = view.getComputedStyle(textarea)
      expect(expected).toBeGreaterThan(200)
      expect([Math.round(textarea.getBoundingClientRect().height), style.fontFamily.includes('monospace'), style.whiteSpace]).toEqual([Math.round(expected), true, 'pre'])
    }
  })
})
