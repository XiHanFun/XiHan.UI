import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { barCodeAnatomy, barCodeKeyboard } from '@xihan-ui/headless'

// 条形码是一张图，APG 里对应的是"命名与描述"那一节；判据锁六件：
// 命名两态互斥、码制与模块数如实落到根上、没有可编码的内容与不合规则的内容都一根条不铺、
// 全部条恒合成一条 path、人读文字每段一个 <text> 且能整体关掉、换码制与换内容后几何跟着换。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

const SVG_NS = 'http://www.w3.org/2000/svg'

// 6 个字符走 B 子集：起始 + 6 + 校验 + 终止 = 8 × 11 + 13 = 101 个模块
const SKU = 'XH-001'
// 维基百科上的示例商品码，12 位不带校验位
const EAN12 = '400638133393'

function rootEl(doc: Document): Element {
  const el = doc.querySelector('[data-scope="bar-code"][data-part="root"]')
  if (!el)
    throw new Error('找不到 bar-code 的 root 部件')
  return el
}

/** root 直属的生成几何，按标记取。 */
function geoms(doc: Document, name: string): Element[] {
  return Array.from(rootEl(doc).children).filter(el => el.getAttribute('data-xh-geom') === name)
}

/** root 是 SVG 命名空间的 `<svg>`，且 viewBox 逐字相同。 */
function expectViewBox(viewBox: string) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const root = rootEl(doc)
    if (root.namespaceURI !== SVG_NS || root.localName !== 'svg')
      throw new Error(`${adapterName}: root 是 ${root.namespaceURI} 的 <${root.localName}>；不是 SVG 命名空间的 <svg> 时 viewBox 会被小写成 viewbox 而静默失效`)
    if (root.getAttribute('viewBox') !== viewBox)
      throw new Error(`${adapterName}: root 的 viewBox 期望 ${viewBox}，实际 ${root.getAttribute('viewBox')}`)
  }
}

/** 恰一条 bars path，且 d 是一串矩形子路径；文字节点数按 textCount。 */
function expectPainted(textCount: number) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const bars = geoms(doc, 'bars')
    if (bars.length !== 1)
      throw new Error(`${adapterName}: root 下有 ${bars.length} 条 bars path，全部条应当合成一条`)
    const path = bars[0]!
    if (path.namespaceURI !== SVG_NS || path.localName !== 'path')
      throw new Error(`${adapterName}: bars 那块是 ${path.namespaceURI} 的 <${path.localName}>；SVG 图元挂在非 SVG 命名空间里什么都不显示`)
    const d = path.getAttribute('d') ?? ''
    if (!/^(?:M\d+ \d+h\d+v\d+h-\d+z)+$/.test(d))
      throw new Error(`${adapterName}: bars 那条 <path> 的 d 是「${d.slice(0, 60)}」，不是一串矩形子路径`)
    const texts = geoms(doc, 'text')
    if (texts.length !== textCount)
      throw new Error(`${adapterName}: root 下有 ${texts.length} 个人读文字节点，期望 ${textCount}`)
    for (const text of texts) {
      if (text.namespaceURI !== SVG_NS || text.localName !== 'text')
        throw new Error(`${adapterName}: 人读文字是 ${text.namespaceURI} 的 <${text.localName}>，不是 SVG 的 <text>`)
      if (!text.getAttribute('x') || !text.getAttribute('y') || !text.getAttribute('text-anchor') || !text.getAttribute('font-size'))
        throw new Error(`${adapterName}: 人读文字缺 x / y / text-anchor / font-size 之一`)
    }
    if (rootEl(doc).childElementCount !== 1 + textCount)
      throw new Error(`${adapterName}: root 下共 ${rootEl(doc).childElementCount} 个元素，除 bars 与 ${textCount} 段文字外不该有别的`)
  }
}

/** root 下一个元素都没生成。 */
function expectNothingPainted({ doc, adapterName }: RawStepContext): void {
  const root = rootEl(doc)
  if (root.childElementCount !== 0)
    throw new Error(`${adapterName}: root 下生成了 ${root.childElementCount} 个元素；没画出码时不该铺任何条或文字`)
}

/** 人读文字连起来读出来是这一串。 */
function expectText(expected: string) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const joined = geoms(doc, 'text').map(el => el.textContent ?? '').join('')
    if (joined !== expected)
      throw new Error(`${adapterName}: 人读文字读出来是「${joined}」，期望「${expected}」`)
  }
}

/** 记下 bars 的 d，供换内容后比对。 */
let paintedD = ''

export const barCodeSuite: ConformanceSuite = {
  component: 'bar-code',
  anatomy: barCodeAnatomy,
  keyboard: barCodeKeyboard,
  // 只有 root 一个角色节点；条与文字是算出来的几何，由适配器铺在 root 内部
  fixture: {
    part: 'root',
    tag: 'svg',
  },
  cases: [
    {
      name: '给了内容：root 是有名字的图像，码制与模块数如实落在根上',
      spec: { apg: APG },
      props: { value: SKU },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': SKU,
            'aria-hidden': null,
            'data-format': 'code128',
            'data-modules': '101',
            'data-state': 'ready',
          },
        },
        activeElement: null,
        events: [],
      },
      steps: [
        {
          kind: 'raw',
          why: '条与文字是子元素不是属性，只能数节点',
          run: expectPainted(1),
        },
        {
          kind: 'raw',
          why: '缺省 barWidth 2、静区 10、条高 64、文字区 10X：(101 + 20) × 2 宽，64 + 20 高',
          run: expectViewBox('0 0 242 84'),
        },
        {
          kind: 'raw',
          why: '人读文字就是内容本身',
          run: expectText(SKU),
        },
        {
          kind: 'raw',
          why: '换内容后几何要跟着换：先记下这一版的 d',
          run: ({ doc, adapterName }) => {
            paintedD = geoms(doc, 'bars')[0]!.getAttribute('d') ?? ''
            if (paintedD === '')
              throw new Error(`${adapterName}: bars 的 d 是空的`)
          },
        },
        {
          kind: 'setProps',
          props: { value: 'XH-002' },
          expect: { parts: { root: { 'aria-label': 'XH-002', 'data-modules': '101', 'data-state': 'ready' } } },
        },
        {
          kind: 'raw',
          why: '同样长度的内容模块数不变，但条的排布必须变',
          run: ({ doc, adapterName }) => {
            const d = geoms(doc, 'bars')[0]!.getAttribute('d') ?? ''
            if (d === paintedD)
              throw new Error(`${adapterName}: 内容从 ${SKU} 换成 XH-002 后 bars 的 d 一字未变，几何没跟着重算`)
          },
        },
      ],
    },
    {
      name: '换码制：EAN-13 补上校验位，十三位人读数字逐位各一个节点，静区按规范的 11 格',
      spec: { apg: APG },
      props: { format: 'ean13', value: EAN12 },
      initial: {
        counts: { root: 1 },
        parts: {
          root: {
            'data-format': 'ean13',
            'data-modules': '95',
            'data-state': 'ready',
            'aria-label': EAN12,
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '每位数字各自一个 <text> 才能落在自己那格下面',
          run: expectPainted(13),
        },
        {
          kind: 'raw',
          why: '人读文字含补上的校验位',
          run: expectText('4006381333931'),
        },
        {
          kind: 'raw',
          why: '(95 + 22) × 2 宽',
          run: expectViewBox('0 0 234 84'),
        },
        {
          kind: 'setProps',
          props: { label: '商品条码' },
          expect: { parts: { root: { 'aria-label': '商品条码', 'role': 'img' } } },
        },
      ],
    },
    {
      name: '关掉人读文字：一个 <text> 都不铺，守卫条的延长段仍留着',
      spec: { apg: APG },
      props: { format: 'ean8', value: '96385074', text: false },
      initial: {
        counts: { root: 1 },
        parts: { root: { 'data-format': 'ean8', 'data-modules': '67', 'data-state': 'ready' } },
      },
      steps: [
        {
          kind: 'raw',
          why: '"没铺文字"是子元素个数',
          run: expectPainted(0),
        },
        {
          kind: 'raw',
          why: '(67 + 14) × 2 宽；高只有条高 64 加守卫延长的 5X',
          run: expectViewBox('0 0 162 74'),
        },
        {
          kind: 'setProps',
          props: { text: true },
          expect: { parts: { root: { 'data-state': 'ready' } } },
        },
        {
          kind: 'raw',
          why: '打开后八位数字各一个节点',
          run: expectPainted(8),
        },
      ],
    },
    {
      name: '没有内容：root 退出无障碍树，一根条都不铺，viewBox 只剩静区与条高',
      spec: { apg: APG },
      props: { value: '' },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'aria-hidden': 'true',
            'role': null,
            'aria-label': null,
            'data-format': 'code128',
            'data-modules': null,
            'data-state': 'empty',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '"一根条都没铺"是子元素个数，不是属性',
          run: expectNothingPainted,
        },
        {
          kind: 'raw',
          why: '没画码时 viewBox 只剩两侧静区与条高',
          run: expectViewBox('0 0 40 64'),
        },
      ],
    },
    {
      name: '内容不合码制规则：落 error 态且一根条都不铺，不画一张扫出错内容的码',
      spec: { apg: APG },
      props: { format: 'ean13', value: '4006381333930' },
      initial: {
        counts: { root: 1 },
        parts: {
          root: {
            'data-format': 'ean13',
            'data-state': 'error',
            'data-modules': null,
            // 内容还在，名字照给
            'role': 'img',
            'aria-label': '4006381333930',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '校验位错一位的码照样扫得开、扫出的是另一个商品；钉住的是"什么都不画"',
          run: expectNothingPainted,
        },
        {
          kind: 'setProps',
          props: { value: '4006381333931' },
          expect: { parts: { root: { 'data-state': 'ready', 'data-modules': '95' } } },
        },
      ],
    },
    {
      name: '不认识的码制：落 error 态、一根条都不铺，data-format 原样写上给作者看',
      spec: { apg: APG },
      props: { format: 'code93', value: SKU },
      initial: {
        counts: { root: 1 },
        parts: {
          root: {
            'data-format': 'code93',
            'data-state': 'error',
            'data-modules': null,
            'role': 'img',
            'aria-label': SKU,
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '静默退回 code128 会画出一张按错码制扫出来的码；钉住的是"什么都不画"',
          run: expectNothingPainted,
        },
        {
          kind: 'setProps',
          props: { format: 'code39' },
          expect: { parts: { root: { 'data-format': 'code39', 'data-state': 'ready', 'data-modules': '127' } } },
        },
      ],
    },
    {
      name: 'itf14 缺省带承载条，关掉后 viewBox 少掉上下各 2X',
      spec: { apg: APG },
      props: { format: 'itf14', value: '15400141288763', barWidth: 1 },
      initial: {
        counts: { root: 1 },
        parts: { root: { 'data-format': 'itf14', 'data-modules': '135', 'data-state': 'ready' } },
      },
      steps: [
        {
          kind: 'raw',
          why: '(135 + 20) × 1 宽；上下承载条各 2、条高 64、文字区 10',
          run: expectViewBox('0 0 155 78'),
        },
        {
          kind: 'setProps',
          props: { bearerBars: false },
          expect: { parts: { root: { 'data-state': 'ready' } } },
        },
        {
          kind: 'raw',
          why: '承载条撤掉后高度只剩条高与文字区',
          run: expectViewBox('0 0 155 74'),
        },
      ],
    },
  ],
}
