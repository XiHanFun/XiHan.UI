// 横向控件带排不下时不许顶出容器。
//
// tabs / toolbar / menubar / navigation-menu / toggle-group / segmented 六条带子都是一行 flex，
// 条目一律 white-space: nowrap，条目多了整条就从容器里顶出去——末尾几项既看不见也点不到。
// 兜底是折行，一条规则同时管住窄视口与窄容器两种情形，不掺任何宽度查询。
//
// 宿主视口固定在一个宽度上改不动，这里套 iframe：宽度由这边的 width 说了算，
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 在给定宽度的视口里挂一段标记，返回 iframe 的文档。wrapWidth 给了就再套一层定宽容器。 */
function mount(width: number, html: string, wrapWidth?: number): Document {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 400px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = wrapWidth ? `<div data-probe="box" style="width:${wrapWidth}px">${html}</div>` : html
  return doc
}

/** 整份文档横向顶出视口多少像素。 */
function pageOverflow(width: number, html: string): number {
  return mount(width, html).documentElement.scrollWidth - width
}

/** 塞进定宽容器后横向顶出容器多少像素。 */
function boxOverflow(wrapWidth: number, html: string): number {
  const doc = mount(1280, html, wrapWidth)
  const box = doc.querySelector('[data-probe="box"]') as HTMLElement
  return box.scrollWidth - box.clientWidth
}

/**
 * 一段标记里某个部件占了几行：按块向的带子数，块向上有重叠的算同一行。
 *
 * 走 getBoundingClientRect 而非 offsetTop——有些部件的外层就是定位元素，offsetTop 恒为 0。
 * 只比顶边也不够：同一行里高矮不一的条目被 align-items: center 一居中，顶边就各不相同。
 */
function rowsOf(doc: Document, part: string): number {
  const nodes = [...doc.querySelectorAll(`[data-part="${part}"]`)] as HTMLElement[]
  const rects = nodes.map(node => node.getBoundingClientRect()).sort((a, b) => a.top - b.top)
  let rows = 0
  let edge = Number.NEGATIVE_INFINITY
  for (const rect of rects) {
    if (rect.top >= edge)
      rows += 1
    edge = Math.max(edge, rect.bottom)
  }
  return rows
}

/** 某个部件所有节点在给定边上的位置（取整到像素）。 */
function edgesOf(doc: Document, part: string, edge: 'top' | 'left'): number[] {
  const nodes = [...doc.querySelectorAll(`[data-part="${part}"]`)] as HTMLElement[]
  return nodes.map(node => Math.round(node.getBoundingClientRect()[edge]))
}

function items(labels: string[], render: (label: string) => string): string {
  return labels.map(render).join('')
}

const TABS = `<div data-scope="tabs" data-part="root" data-orientation="horizontal">
  <div data-scope="tabs" data-part="list" role="tablist">
    ${items(['概览', '账号设置', '通知偏好', '安全与隐私', '计费与订阅', '开发者选项'], t => `<button data-scope="tabs" data-part="trigger" role="tab">${t}</button>`)}
  </div>
  <div data-scope="tabs" data-part="content">内容</div>
</div>`

const TOOLBAR = `<div data-scope="toolbar" data-part="root" data-orientation="horizontal" role="toolbar">
  ${items(['撤销', '重做', '加粗', '倾斜', '下划线', '删除线', '左对齐', '居中', '右对齐', '插入链接', '插入图片'], t => `<button data-scope="toolbar" data-part="item">${t}</button>`)}
</div>`

const MENUBAR = `<div data-scope="menubar" data-part="root" data-orientation="horizontal" role="menubar">
  ${items(['文件', '编辑', '选择', '视图', '转到', '运行', '终端', '帮助'], t => `<button data-scope="menubar" data-part="trigger" role="menuitem">${t}</button>`)}
</div>`

const NAVIGATION_MENU = `<nav data-scope="navigation-menu" data-part="root">
  <ul data-scope="navigation-menu" data-part="list" data-orientation="horizontal">
    ${items(['产品概览', '解决方案', '开发者文档', '定价方案', '客户案例', '关于我们'], t => `<li data-scope="navigation-menu" data-part="item"><button data-scope="navigation-menu" data-part="trigger">${t}</button></li>`)}
  </ul>
</nav>`

const TOGGLE_GROUP = `<div data-scope="toggle-group" data-part="root" data-orientation="horizontal" role="group">
  ${items(['左对齐', '水平居中', '右对齐', '两端对齐', '分散对齐'], t => `<button data-scope="toggle-group" data-part="item">${t}</button>`)}
</div>`

const SEGMENTED = `<div data-scope="segmented" data-part="root" data-orientation="horizontal" role="radiogroup">
  ${items(['日视图', '周视图', '月视图', '季度视图', '年度视图'], t => `<label data-scope="segmented" data-part="item"><span data-scope="segmented" data-part="item-text">${t}</span></label>`)}
</div>`

// [名字, 标记, 数行数用的部件]
const BARS: [string, string, string][] = [
  ['tabs', TABS, 'trigger'],
  ['toolbar', TOOLBAR, 'item'],
  ['menubar', MENUBAR, 'trigger'],
  ['navigation-menu', NAVIGATION_MENU, 'trigger'],
  ['toggle-group', TOGGLE_GROUP, 'item'],
  ['segmented', SEGMENTED, 'item'],
]

afterEach(() => {
  frame?.remove()
  frame = null
})

describe('横向控件带排不下时的兜底', () => {
  it.each(BARS)('%s 在 375 / 768 / 1280 三档视口里都不顶出页面', (_name, html) => {
    expect(pageOverflow(375, html)).toBe(0)
    expect(pageOverflow(768, html)).toBe(0)
    expect(pageOverflow(1280, html)).toBe(0)
  })

  it.each(BARS)('%s 塞进 260px 的窄栏也不顶出栏', (_name, html) => {
    expect(boxOverflow(260, html)).toBe(0)
  })

  it.each(BARS)('%s 收得住靠的是折行，不是把条目压没', (_name, html, part) => {
    const narrow = mount(260, html)
    expect(rowsOf(narrow, part)).toBeGreaterThan(1)
    // 条目一个不少，每个都还有宽度
    const nodes = [...narrow.querySelectorAll(`[data-part="${part}"]`)] as HTMLElement[]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.offsetWidth).toBeGreaterThan(0)
  })

  it.each(BARS)('%s 排得下时仍是一行', (_name, html, part) => {
    expect(rowsOf(mount(1280, html), part)).toBe(1)
  })
})

describe('折行不改单行时的几何', () => {
  it('segmented 排得下时轨道仍是一档控件高，折了行每行仍是同一个段高', () => {
    const wide = mount(1280, SEGMENTED)
    const track = wide.querySelector('[data-scope="segmented"][data-part="root"]') as HTMLElement
    const segment = wide.querySelector('[data-scope="segmented"][data-part="item"]') as HTMLElement
    const trackHeight = track.offsetHeight
    const segmentHeight = segment.offsetHeight
    // 一档控件高：min-block-size 与原先的 block-size 在这一档上逐值相同
    expect(trackHeight).toBe(32)
    expect(segmentHeight).toBe(26)

    const narrow = mount(260, SEGMENTED)
    const segments = [...narrow.querySelectorAll('[data-scope="segmented"][data-part="item"]')] as HTMLElement[]
    for (const seg of segments)
      expect(seg.offsetHeight).toBe(segmentHeight)
    // 轨道跟着往下长，不是把两行挤进原来那一档高度里
    expect(narrow.querySelector('[data-scope="segmented"][data-part="root"]')!.clientHeight)
      .toBeGreaterThan(trackHeight)
  })

  it('tabs 排得下时列表高度与标签行位不变', () => {
    const wide = mount(1280, TABS)
    const list = wide.querySelector('[data-scope="tabs"][data-part="list"]') as HTMLElement
    expect(list.offsetHeight).toBe(33)
    expect(rowsOf(wide, 'trigger')).toBe(1)
  })
})

describe('竖排不跟着折行', () => {
  const VERTICAL: [string, string][] = [
    ['tabs', `<div data-scope="tabs" data-part="root" data-orientation="vertical"><div data-scope="tabs" data-part="list" role="tablist" aria-orientation="vertical" style="block-size:60px">${items(['概览', '账号设置', '通知偏好', '安全与隐私'], t => `<button data-scope="tabs" data-part="trigger" role="tab">${t}</button>`)}</div></div>`],
    ['toolbar', `<div data-scope="toolbar" data-part="root" data-orientation="vertical" role="toolbar" style="block-size:60px">${items(['撤销', '重做', '加粗', '倾斜'], t => `<button data-scope="toolbar" data-part="item">${t}</button>`)}</div>`],
    ['menubar', `<div data-scope="menubar" data-part="root" data-orientation="vertical" role="menubar" style="block-size:60px">${items(['文件', '编辑', '选择', '视图'], t => `<button data-scope="menubar" data-part="trigger" role="menuitem">${t}</button>`)}</div>`],
    ['toggle-group', `<div data-scope="toggle-group" data-part="root" data-orientation="vertical" role="group" style="block-size:60px">${items(['左对齐', '水平居中', '右对齐', '两端对齐'], t => `<button data-scope="toggle-group" data-part="item">${t}</button>`)}</div>`],
  ]

  // 竖排的主轴是块轴，容器被作者定高时 wrap 会把条目甩成好几列，
  // 一列一列地读与方向键的走法全对不上——竖排一律 nowrap
  it.each(VERTICAL)('%s 竖排被定高时不分列', (name, html) => {
    const doc = mount(1280, html)
    const part = name === 'toolbar' || name === 'toggle-group' ? 'item' : 'trigger'
    expect(new Set(edgesOf(doc, part, 'left')).size).toBe(1)
  })
})

describe('按钮组不折行也不自己翻竖排', () => {
  // 段与段共边焊成一条，两端圆角只补在首末两段上：折了行，中间那两个角就是直角。
  // 皮肤自己翻竖排则会与 data-orientation 脱钩——合边收哪个轴、圆角补哪一对角、
  // 连接层给分隔线派的朝向，三处都由它决定。朝向是使用者的事。
  const BUTTON_GROUP = (orientation: string): string => `<div data-scope="button-group" data-part="root" data-orientation="${orientation}" role="group">
    ${items(['新建文档', '从模板新建', '导入文件', '更多操作'], t => `<button data-scope="button" data-part="root">${t}</button>`)}
  </div>`

  it('横排在窄栏里仍是一条：段不换行、也没被翻成竖排', () => {
    const doc = mount(1280, BUTTON_GROUP('horizontal'), 260)
    const segments = [...doc.querySelectorAll('[data-scope="button"][data-part="root"]')] as HTMLElement[]
    expect(new Set(segments.map(seg => seg.offsetTop)).size).toBe(1)
    // 顶出窄栏是这一档的既定行为：收窄的出口是使用者显式改朝向
    expect(boxOverflow(260, BUTTON_GROUP('horizontal'))).toBeGreaterThan(0)
  })

  it('使用者显式给竖排就收得住', () => {
    expect(boxOverflow(260, BUTTON_GROUP('vertical'))).toBe(0)
    const doc = mount(1280, BUTTON_GROUP('vertical'), 260)
    const segments = [...doc.querySelectorAll('[data-scope="button"][data-part="root"]')] as HTMLElement[]
    expect(new Set(segments.map(seg => seg.offsetLeft)).size).toBe(1)
  })
})
