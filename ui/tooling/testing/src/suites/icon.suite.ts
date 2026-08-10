import type { IconNode, IconRecord } from '@xihan-ui/kernel'
import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { iconAnatomy, iconKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

const SVG_NS = 'http://www.w3.org/2000/svg'

// 一条带嵌套的记录：顶层一个 path，另一个 g 里再套 circle，用来验证铺设逐层递归。
const CHECK: IconRecord = {
  name: 'check',
  viewBox: '0 0 24 24',
  attrs: {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
  },
  nodes: [
    { tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } },
    {
      tag: 'g',
      attrs: { 'fill-rule': 'evenodd' },
      children: [{ tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } }],
    },
  ],
}

// 作者手写内联几何时用的路径数据，用来核对元素没碰它。
const AUTHORED_D = 'M3 3h18v18H3z'

// 换记录用的第二条，节点数与标签都与上面那条不同。
const CLOSE: IconRecord = {
  name: 'close',
  viewBox: '0 0 24 24',
  attrs: { stroke: 'currentColor' },
  nodes: [{ tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } }],
}

function partEl(doc: Document, part: string): Element {
  const el = doc.querySelector(`[data-scope="icon"][data-part="${part}"]`)
  if (!el)
    throw new Error(`找不到 icon 的 ${part} 部件`)
  return el
}

/** 记录的 viewBox 与呈现属性逐字落在 root 上。 */
function expectRootCarries(record: IconRecord) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const root = partEl(doc, 'root')
    if (root.namespaceURI !== SVG_NS || root.localName !== 'svg')
      throw new Error(`${adapterName}: root 是 ${root.namespaceURI} 的 <${root.localName}>；不是 SVG 命名空间的 <svg> 时 viewBox 会被小写成 viewbox 而静默失效`)
    const names = root.getAttributeNames()
    const expected: Record<string, string> = { viewBox: record.viewBox, ...record.attrs }
    for (const [name, value] of Object.entries(expected)) {
      if (!names.includes(name))
        throw new Error(`${adapterName}: root 上没有逐字的 ${name}（实际属性名：${names.join(' ')}）`)
      if (root.getAttribute(name) !== value)
        throw new Error(`${adapterName}: root.${name} 期望 ${value}，实际 ${root.getAttribute(name)}`)
    }
  }
}

/** 一个铺进去的节点：标签、属性集与记录逐字相同，且不多带任何属性。 */
function assertNode(el: Element, node: IconNode, path: string, adapterName: string): void {
  if (el.namespaceURI !== SVG_NS)
    throw new Error(`${adapterName}: ${path} 建在 ${el.namespaceURI} 下，SVG 图元挂在非 SVG 命名空间里什么都不显示`)
  if (el.localName !== node.tag)
    throw new Error(`${adapterName}: ${path} 期望 <${node.tag}>，实际 <${el.localName}>`)
  const want = Object.keys(node.attrs ?? {}).sort()
  const got = el.getAttributeNames().sort()
  // 逐字相等同时锁住两件事：属性名的连字符原样保留，且铺进去的节点零 data-* / role / aria-* / class
  if (want.join(' ') !== got.join(' '))
    throw new Error(`${adapterName}: ${path} 属性名期望 [${want.join(' ')}]，实际 [${got.join(' ')}]`)
  for (const [name, value] of Object.entries(node.attrs ?? {})) {
    if (el.getAttribute(name) !== value)
      throw new Error(`${adapterName}: ${path}.${name} 期望 ${value}，实际 ${el.getAttribute(name)}`)
  }
  const kids = node.children ?? []
  if (el.childElementCount !== kids.length)
    throw new Error(`${adapterName}: ${path} 期望 ${kids.length} 个子元素，实际 ${el.childElementCount}`)
  kids.forEach((child, i) => assertNode(el.children[i]!, child, `${path}>${child.tag}[${i}]`, adapterName))
}

/** glyph 里铺的正是这条记录的图元树。 */
function expectGlyphPainted(record: IconRecord) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const glyph = partEl(doc, 'glyph')
    if (glyph.localName !== 'g')
      throw new Error(`${adapterName}: glyph 是 <${glyph.localName}>，图元只能铺进 <g>`)
    if (glyph.childElementCount !== record.nodes.length)
      throw new Error(`${adapterName}: glyph 期望 ${record.nodes.length} 个图元，实际 ${glyph.childElementCount}`)
    record.nodes.forEach((node, i) => assertNode(glyph.children[i]!, node, `glyph>${node.tag}[${i}]`, adapterName))
  }
}

/** 某个部件下一个元素都没生成。 */
function expectNoChildElements(part: string) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const el = partEl(doc, part)
    if (el.childElementCount !== 0)
      throw new Error(`${adapterName}: ${part} 下生成了 ${el.childElementCount} 个元素，期望一个都不生成`)
  }
}

/** root 下只有作者手写的那一个节点，元素既没添也没改。 */
function expectOnlyAuthorNode({ doc, adapterName }: RawStepContext): void {
  const root = partEl(doc, 'root')
  if (root.childElementCount !== 1)
    throw new Error(`${adapterName}: root 下有 ${root.childElementCount} 个元素，期望只剩作者手写的那一个`)
  const only = root.children[0]!
  if (only.localName !== 'path')
    throw new Error(`${adapterName}: root 下那个元素是 <${only.localName}>，作者写的是 <path>`)
  const names = only.getAttributeNames().sort()
  if (names.join(' ') !== 'd')
    throw new Error(`${adapterName}: 作者写的 <path> 属性名期望 [d]，实际 [${names.join(' ')}]`)
  if (only.getAttribute('d') !== AUTHORED_D)
    throw new Error(`${adapterName}: 作者写的 <path> 的 d 被改成了 ${only.getAttribute('d')}`)
}

/**
 * Icon 的一致性套件。
 *
 * root 必须是 `<svg>`、glyph 必须是 `<g>`：前者关系到 viewBox 的大小写，后者关系到图元挂在哪个命名空间下。
 * 图元本身不进属性快照（快照只采 role / aria-* / data-*），故用 raw 步骤直接读 DOM 核对。
 *
 * 默认 fixture 只写 root：glyph 在 Vue 版由组件内部渲染，在 WC 版由作者手写，
 * 后者在 WC 的套件清单里把 glyph 补进 fixture。两侧铺设后的 DOM 形状相同，
 * 故 glyph 的断言写在共享用例里，两端各跑一遍。
 */
export const iconSuite: ConformanceSuite = {
  component: 'icon',
  anatomy: iconAnatomy,
  keyboard: iconKeyboard,
  fixture: {
    part: 'root',
    tag: 'svg',
  },
  cases: [
    {
      name: '装饰态：退出无障碍树，不写 role 与 aria-label，缺省档不上 data-size / data-weight',
      spec: { apg: APG },
      props: { icon: CHECK },
      initial: {
        order: ['root', 'glyph'],
        counts: { root: 1, glyph: 1 },
        parts: {
          root: {
            'aria-hidden': 'true',
            'role': null,
            'aria-label': null,
            'data-icon': 'check',
            'data-size': null,
            'data-weight': null,
          },
          // 空壳只是容器，命名归 root
          glyph: { 'role': null, 'aria-hidden': null, 'aria-label': null, 'data-icon': null },
        },
        activeElement: null,
        events: [],
      },
      steps: [
        {
          kind: 'raw',
          why: '归一化快照只采 role / aria-* / data-*，viewBox 与呈现属性只能直接读 DOM',
          run: expectRootCarries(CHECK),
        },
        {
          kind: 'raw',
          why: '图元不进属性快照，逐层核对标签与属性只能直接读 DOM',
          run: expectGlyphPainted(CHECK),
        },
      ],
    },
    {
      name: '命名态：role="img" + aria-label，且不写 aria-hidden',
      spec: { apg: APG },
      props: { icon: CHECK, label: '已通过' },
      initial: {
        parts: {
          root: {
            'role': 'img',
            'aria-label': '已通过',
            'aria-hidden': null,
            'data-icon': 'check',
          },
        },
      },
    },
    {
      name: '纯空白的名字不算给过：归装饰态',
      spec: { apg: APG },
      props: { icon: CHECK, label: '   ' },
      initial: {
        parts: {
          root: { 'aria-hidden': 'true', 'role': null, 'aria-label': null },
        },
      },
    },
    {
      name: '档位：size 与 weight 接线到 data-size / data-weight',
      spec: { apg: APG },
      props: { icon: CHECK, size: 'lg', weight: 'bold' },
      initial: {
        parts: {
          root: { 'data-size': 'lg', 'data-weight': 'bold' },
        },
      },
    },
    {
      name: '换记录：data-icon 跟着换，glyph 重铺成新记录的图元',
      spec: { apg: APG },
      props: { icon: CHECK },
      steps: [
        {
          kind: 'setProps',
          props: { icon: CLOSE },
          expect: {
            counts: { root: 1, glyph: 1 },
            parts: { root: { 'data-icon': 'close' } },
          },
        },
        {
          kind: 'raw',
          why: '图元不进属性快照，重铺后的树只能直接读 DOM',
          run: expectGlyphPainted(CLOSE),
        },
        {
          kind: 'raw',
          why: '呈现属性不进属性快照',
          run: expectRootCarries(CLOSE),
        },
      ],
    },
    {
      name: '没传 icon：root 上不写 data-icon，glyph 里一个元素都不生成',
      spec: { apg: APG },
      props: {},
      initial: {
        counts: { root: 1, glyph: 1 },
        parts: {
          root: { 'data-icon': null, 'aria-hidden': 'true' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '"没铺任何东西"是子元素个数，不是属性',
          run: expectNoChildElements('glyph'),
        },
      ],
    },
    {
      name: 'glyph 缺席：作者手写的几何原样留着，命名与档位照样落在 root 上',
      spec: { apg: APG },
      // 作者没留空壳、直接把几何写进 root = 没授权在这里铺内容
      fixture: () => ({
        part: 'root',
        tag: 'svg',
        children: [{ tag: 'path', attrs: { d: AUTHORED_D } }],
      }),
      props: { icon: CHECK, label: '已通过', size: 'sm' },
      initial: {
        order: ['root'],
        counts: { root: 1, glyph: 0 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': '已通过',
            'aria-hidden': null,
            'data-icon': 'check',
            'data-size': 'sm',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '没有空壳时不许凭空造节点、也不许改作者的节点，这一条只能直接读 root 的子树',
          run: expectOnlyAuthorNode,
        },
      ],
    },
  ],
}
