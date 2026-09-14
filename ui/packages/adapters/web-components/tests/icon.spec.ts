// @vitest-environment jsdom

import type { DiagnosticRecord, IconRecord } from '@xihan-ui/core'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface IconHost extends HTMLElement {
  updateComplete: Promise<unknown>
  requestUpdate: () => void
  icon?: IconRecord
  label?: string
}

const CHECK: IconRecord = {
  name: 'check',
  viewBox: '0 0 24 24',
  attrs: { 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' },
  nodes: [{ tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } }],
}

const CLOSE: IconRecord = {
  name: 'close',
  viewBox: '0 0 24 24',
  nodes: [
    { tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } },
    { tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } },
  ],
}

const CLIPPED: IconRecord = {
  name: 'clipped',
  viewBox: '0 0 24 24',
  nodes: [
    {
      tag: 'defs',
      children: [{
        tag: 'clipPath',
        attrs: { id: 'xh-clipped-1', clipPathUnits: 'userSpaceOnUse' },
        children: [{ tag: 'rect', attrs: { x: '0', y: '0', width: '24', height: '24' } }],
      }],
    },
    {
      tag: 'g',
      attrs: { 'clip-path': 'url(#xh-clipped-1)' },
      children: [{ tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } }],
    },
  ],
}

const SHELL = '<svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>'

let seen: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  seen = []
  onDiagnostic(r => void seen.push(r))
})

afterEach(() => {
  document.body.innerHTML = ''
  resetDiagnostics()
})

/** 建一个未连接的 `<xh-icon>` 并写好作者的 Light DOM。 */
function create(markup: string, props: Partial<IconHost> = {}): IconHost {
  const el = document.createElement('xh-icon') as IconHost
  el.innerHTML = markup
  Object.assign(el, props)
  return el
}

async function mount(el: IconHost): Promise<IconHost> {
  document.body.appendChild(el)
  await el.updateComplete
  await el.updateComplete
  return el
}

function root(el: IconHost): SVGElement {
  return el.querySelector('[data-xh-part="root"]') as unknown as SVGElement
}

function glyph(el: IconHost): SVGElement {
  return el.querySelector('[data-xh-part="glyph"]') as unknown as SVGElement
}

/** 子树里出现过的全部属性名（不含传入节点自身）。 */
function descendantAttrs(el: Element): string[] {
  const out: string[] = []
  for (const child of Array.from(el.children)) {
    for (const attr of Array.from(child.attributes)) out.push(attr.name)
    out.push(...descendantAttrs(child))
  }
  return out
}

function warns(): DiagnosticRecord[] {
  return seen.filter(r => r.code === DIAGNOSTIC_CODES.warn && r.scope === 'icon')
}

describe('xh-icon 首帧铺设', () => {
  it('把记录的图元建进 glyph，命名空间与属性逐条落位', async () => {
    const el = await mount(create(SHELL, { icon: CHECK }))
    const g = glyph(el)

    expect(g.childElementCount).toBe(1)
    const path = g.firstElementChild!
    expect(path.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(path.tagName).toBe('path')
    expect(path.getAttribute('d')).toBe('M20 6 9 17l-5-5')
  })

  it('root 拿到 viewBox、data-icon 与记录的呈现属性', async () => {
    const el = await mount(create(SHELL, { icon: CHECK }))
    const svg = root(el)

    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('data-icon')).toBe('check')
    expect(svg.getAttribute('stroke-width')).toBe('2')
    expect(svg.getAttribute('stroke-linecap')).toBe('round')
    expect(svg.getAttribute('data-scope')).toBe('icon')
    expect(svg.getAttribute('data-part')).toBe('root')
  })

  it('嵌套记录逐层建出来，属性名大小写原样保留', async () => {
    const el = await mount(create(SHELL, { icon: CLIPPED }))
    const g = glyph(el)

    expect(g.childElementCount).toBe(2)
    const clip = g.querySelector('clipPath')!
    expect(clip.getAttribute('clipPathUnits')).toBe('userSpaceOnUse')
    expect(clip.firstElementChild!.tagName).toBe('rect')
    expect(g.querySelector('g')!.getAttribute('clip-path')).toBe('url(#xh-clipped-1)')
    expect(g.querySelector('circle')!.getAttribute('r')).toBe('9')
  })

  it('铺进去的节点不带 data-*、role、aria-*、class', async () => {
    const el = await mount(create(SHELL, { icon: CLIPPED }))
    const names = descendantAttrs(glyph(el))

    expect(names.filter(n => n.startsWith('data-'))).toEqual([])
    expect(names.filter(n => n === 'role' || n.startsWith('aria-') || n === 'class')).toEqual([])
  })

  it('没传 icon 时不铺任何东西，root 也没有 data-icon', async () => {
    const el = await mount(create(SHELL))

    expect(glyph(el).childElementCount).toBe(0)
    expect(root(el).hasAttribute('data-icon')).toBe(false)
    expect(warns()).toEqual([])
  })
})

describe('xh-icon 重铺判据', () => {
  it('同一记录再接线不重铺，节点身份不变', async () => {
    const el = await mount(create(SHELL, { icon: CHECK }))
    const g = glyph(el)
    const first = g.firstElementChild

    const records: MutationRecord[] = []
    const observer = new MutationObserver(list => void records.push(...list))
    observer.observe(g, { childList: true })

    el.setAttribute('size', 'lg')
    await el.updateComplete
    el.icon = CHECK
    await el.updateComplete

    observer.disconnect()
    expect(records).toEqual([])
    expect(g.firstElementChild).toBe(first)
    expect(root(el).getAttribute('data-size')).toBe('lg')
  })

  it('换一条记录会重铺', async () => {
    const el = await mount(create(SHELL, { icon: CHECK }))
    const g = glyph(el)

    el.icon = CLOSE
    await el.updateComplete

    expect(g.childElementCount).toBe(2)
    expect(Array.from(g.children).map(c => c.tagName)).toEqual(['line', 'line'])
    expect(root(el).getAttribute('data-icon')).toBe('close')
  })

  it('外部清空 glyph 后能自愈', async () => {
    const el = await mount(create(SHELL, { icon: CHECK }))
    const g = glyph(el)

    g.replaceChildren()
    el.requestUpdate()
    await el.updateComplete

    expect(g.childElementCount).toBe(1)
    expect(g.firstElementChild!.tagName).toBe('path')
  })

  it('作者换掉 glyph 节点后往新节点上铺', async () => {
    const el = await mount(create(SHELL, { icon: CHECK }))
    const svg = root(el)
    const old = glyph(el)

    const next = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    next.setAttribute('data-xh-part', 'glyph')
    old.remove()
    svg.appendChild(next)
    el.requestUpdate()
    await el.updateComplete

    expect(glyph(el)).toBe(next)
    expect(next.childElementCount).toBe(1)
  })
})

describe('xh-icon glyph 缺席', () => {
  it('一个节点都不动，命名与档位照打', async () => {
    const el = create(
      '<svg data-xh-part="root"><path d="M0 0h24v24H0z"></path></svg>',
      { icon: CHECK, label: '已通过' },
    )
    const before = root(el).innerHTML
    await mount(el)
    const svg = root(el)

    expect(svg.innerHTML).toBe(before)
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('已通过')
    expect(svg.getAttribute('data-icon')).toBe('check')
  })

  it('传了 icon 却没写 glyph 报一条 warn', async () => {
    const el = await mount(create('<svg data-xh-part="root"></svg>', { icon: CHECK }))
    const hits = warns()

    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'icon', part: 'glyph' })
    expect(hits[0]!.node).toBe(el)
  })

  it('没传 icon 时不报', async () => {
    await mount(create('<svg data-xh-part="root"></svg>'))
    expect(warns()).toEqual([])
  })
})

describe('xh-icon 所有权', () => {
  it('作者已在 glyph 里写了内容时不覆盖，并报 warn', async () => {
    const el = await mount(create(
      '<svg data-xh-part="root"><g data-xh-part="glyph"><rect x="2" y="2" width="20" height="20"></rect></g></svg>',
      { icon: CHECK },
    ))
    const g = glyph(el)

    expect(g.childElementCount).toBe(1)
    expect(g.firstElementChild!.tagName).toBe('rect')

    const hits = warns()
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'icon', part: 'glyph' })
    expect(hits[0]!.node).toBe(g)
  })

  it('归作者的 glyph 之后换记录也不动', async () => {
    const el = await mount(create(
      '<svg data-xh-part="root"><g data-xh-part="glyph"><rect x="2" y="2" width="20" height="20"></rect></g></svg>',
      { icon: CHECK },
    ))
    const g = glyph(el)
    const authored = g.firstElementChild

    el.icon = CLOSE
    await el.updateComplete

    expect(g.firstElementChild).toBe(authored)
    expect(g.childElementCount).toBe(1)
  })

  it('root 上已有 data-icon 的非空 glyph 归元素，接管后重新铺', async () => {
    const el = await mount(create(
      '<svg data-xh-part="root" data-icon="check"><g data-xh-part="glyph"><path d="M20 6 9 17l-5-5"></path></g></svg>',
      { icon: CLOSE },
    ))
    const g = glyph(el)

    expect(Array.from(g.children).map(c => c.tagName)).toEqual(['line', 'line'])
    expect(warns()).toEqual([])
  })
})

describe('xh-icon 命名两态', () => {
  it('给了名字写 role=img + aria-label，不写 aria-hidden', async () => {
    const svg = root(await mount(create(SHELL, { icon: CHECK, label: '已通过' })))

    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('已通过')
    expect(svg.hasAttribute('aria-hidden')).toBe(false)
  })

  it('没给名字写 aria-hidden=true，不写 role 与 aria-label', async () => {
    const svg = root(await mount(create(SHELL, { icon: CHECK })))

    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.hasAttribute('role')).toBe(false)
    expect(svg.hasAttribute('aria-label')).toBe(false)
  })

  it('label 属性写成空白等同装饰态', async () => {
    const el = create(SHELL, { icon: CHECK })
    el.setAttribute('label', '   ')
    const svg = root(await mount(el))

    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.hasAttribute('role')).toBe(false)
  })

  it('落在自带名字的控件里又给图标命名时报 warn', async () => {
    const button = document.createElement('button')
    const el = create(SHELL, { icon: CHECK, label: '保存' })
    button.appendChild(el)
    document.body.appendChild(button)
    await el.updateComplete
    await el.updateComplete

    const hits = warns()
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'icon', part: 'root' })
  })

  it('控件里的装饰态图标不报', async () => {
    const button = document.createElement('button')
    const el = create(SHELL, { icon: CHECK })
    button.appendChild(el)
    document.body.appendChild(button)
    await el.updateComplete
    await el.updateComplete

    expect(warns()).toEqual([])
  })
})

describe('xh-icon 部件标签契约', () => {
  it('root 不是 svg 时报 wcWrongPartTag', async () => {
    await mount(create('<div data-xh-part="root"></div>'))
    const hits = seen.filter(r => r.code === DIAGNOSTIC_CODES.wcWrongPartTag)

    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'icon', part: 'root' })
  })

  it('glyph 不是 g 时报 wcWrongPartTag', async () => {
    await mount(create('<svg data-xh-part="root"><rect data-xh-part="glyph"></rect></svg>'))
    const hits = seen.filter(r => r.code === DIAGNOSTIC_CODES.wcWrongPartTag)

    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'icon', part: 'glyph' })
  })

  it('root 与 glyph 标签合规时不报', async () => {
    await mount(create(SHELL, { icon: CHECK }))
    expect(seen.filter(r => r.code === DIAGNOSTIC_CODES.wcWrongPartTag)).toEqual([])
  })

  it('缺 root 时报 wcMissingPart，glyph 可省不报', async () => {
    await mount(create('<svg></svg>'))

    expect(seen.filter(r => r.code === DIAGNOSTIC_CODES.wcMissingPart)).toHaveLength(1)
    expect(seen.filter(r => r.part === 'glyph')).toEqual([])
  })
})
