import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { qrCodeAnatomy, qrCodeKeyboard } from '@xihan-ui/headless'

// 二维码是一张图，APG 里对应的是"命名与描述"那一节；判据锁六件：
// 命名两态互斥、版本与静区如实落到根上、没有可编码的内容时一个模块都不铺、
// 缺省形状的几何逐字不变、换形状后每个深色模块的格心仍被墨盖住、放 logo 那块被挖空。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

const SVG_NS = 'http://www.w3.org/2000/svg'

// 23 字节，M 级下装不进 1 版（14 字节），落在 2 版（25 模块）
const URL_23 = 'https://ui.xihanfun.com'
// 超出 40 版 H 级的 1273 字节上限
const TOO_LONG = 'x'.repeat(1300)

/** 不写形状时那条 d；"显式写缺省形状"那条用例先记后比，同一次录制里用完即弃。 */
let defaultModulesD = ''

function rootEl(doc: Document): Element {
  const el = doc.querySelector('[data-scope="qr-code"][data-part="root"]')
  if (!el)
    throw new Error('找不到 qr-code 的 root 部件')
  return el
}

/** 取 root 直属的某一块生成几何；没有就是 null。 */
function geomEl(doc: Document, name: string): Element | null {
  return Array.from(rootEl(doc).children).find(el => el.getAttribute('data-xh-geom') === name) ?? null
}

function geomD(doc: Document, name: string, adapterName: string): string {
  const el = geomEl(doc, name)
  if (!el)
    throw new Error(`${adapterName}: root 里没有 data-xh-geom="${name}" 这块几何`)
  return el.getAttribute('d') ?? ''
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

/** 深色模块合成 root 下唯一一条 `<path>`。 */
function expectModulesPainted({ doc, adapterName }: RawStepContext): void {
  const root = rootEl(doc)
  if (root.childElementCount !== 1)
    throw new Error(`${adapterName}: root 下有 ${root.childElementCount} 个元素，深色模块应当合成一条 <path>`)
  const path = root.children[0]!
  if (path.namespaceURI !== SVG_NS || path.localName !== 'path')
    throw new Error(`${adapterName}: root 下那个元素是 ${path.namespaceURI} 的 <${path.localName}>；SVG 图元挂在非 SVG 命名空间里什么都不显示`)
  const d = path.getAttribute('d') ?? ''
  // 每个深色游程一段 `M…h…v1h-…z`，至少得有一段
  if (!/^(?:M-?\d+ -?\d+h\d+v1h-\d+z)+$/.test(d))
    throw new Error(`${adapterName}: <path> 的 d 是「${d.slice(0, 60)}」，不是一串矩形子路径`)
}

/** root 下一个元素都没生成。 */
function expectNothingPainted({ doc, adapterName }: RawStepContext): void {
  const root = rootEl(doc)
  if (root.childElementCount !== 0)
    throw new Error(`${adapterName}: root 下生成了 ${root.childElementCount} 个元素；没有可编码的内容时不该画出任何模块`)
}

// 一格的内切圆：起点在格子左边中点，半径 0.5 —— 墨盖住格心还余半格
const DOT_SEGMENT = /^M\d+ \d+\.5a0\.5 0\.5 0 1 0 1 0a0\.5 0\.5 0 1 0 -1 0z$/
// 圆角 0.25 的圆角方块：切掉的四个角都在离格心 0.25 以外
const ROUNDED_SEGMENT = /^M\d+\.25 \d+h0\.5a0\.25 0\.25 0 0 1 0\.25 0\.25v0\.5a0\.25 0\.25 0 0 1 -0\.25 0\.25h-0\.5a0\.25 0\.25 0 0 1 -0\.25 -0\.25v-0\.5a0\.25 0\.25 0 0 1 0\.25 -0\.25z$/
// 保持方块的时序与校正图形，写法与合并路径相同
const RUN_SEGMENT = /^M-?\d+ -?\d+h\d+v1h-\d+z$/

/** 把一条 d 拆成子路径（每段以 M 开头、以 z 结尾）。 */
function segmentsOf(d: string): string[] {
  return d.split('z').filter(s => s !== '').map(s => `${s}z`)
}

/**
 * 换了码点形状后，每一段要么是那个形状本身、要么是保持方块的时序与校正图形。
 * 两种形状的墨都盖得住格心，这里锁的就是"没混进第三种写法"。
 */
function expectModuleSegments(shape: RegExp) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const segments = segmentsOf(geomD(doc, 'modules', adapterName))
    if (segments.length === 0)
      throw new Error(`${adapterName}: 数据模块那条 path 是空的`)
    const bad = segments.find(s => !shape.test(s) && !RUN_SEGMENT.test(s))
    if (bad !== undefined)
      throw new Error(`${adapterName}: 数据模块里混进了一段「${bad}」，既不是指定形状也不是保持方块的时序 / 校正图形`)
  }
}

/** 三个码眼各三段：外框、挖孔、内心；挖孔逆绕才能挖出中间那圈白。 */
function expectEyeSegments({ doc, adapterName }: RawStepContext): void {
  const segments = segmentsOf(geomD(doc, 'eyes', adapterName))
  if (segments.length !== 9)
    throw new Error(`${adapterName}: 码眼那条 path 有 ${segments.length} 段，三个码眼各应是外框 + 挖孔 + 内心三段`)
}

export const qrCodeSuite: ConformanceSuite = {
  component: 'qr-code',
  anatomy: qrCodeAnatomy,
  keyboard: qrCodeKeyboard,
  // 只有 root 一个角色节点；模块是算出来的几何，由适配器铺在 root 内部。
  // logo 是可选部件，只在放 logo 的用例里派生进来
  fixture: {
    part: 'root',
    tag: 'svg',
  },
  cases: [
    {
      name: '给了内容：root 是有名字的图像，版本与每边模块数如实落在根上',
      spec: { apg: APG },
      props: { value: URL_23, level: 'M' },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': URL_23,
            'aria-hidden': null,
            'data-level': 'M',
            'data-version': '2',
            'data-modules': '25',
            'data-state': 'ready',
            'data-logo': null,
          },
        },
        activeElement: null,
        events: [],
      },
      steps: [
        {
          kind: 'raw',
          why: '归一化快照只采 role / aria-* / data-*，viewBox 只能直接读 DOM',
          // 25 个模块 + 两侧各 4 个模块的静区
          run: expectViewBox('0 0 33 33'),
        },
        {
          kind: 'raw',
          why: '几何不进属性快照，只能直接读 root 的子树',
          run: expectModulesPainted,
        },
      ],
    },
    {
      name: '纠错级别与静区如实生效：静区含在 viewBox 里，不额外占尺寸',
      spec: { apg: APG },
      props: { value: 'xihan', level: 'H', margin: 0 },
      initial: {
        parts: {
          root: {
            'data-level': 'H',
            'data-version': '1',
            'data-modules': '21',
            'data-state': 'ready',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'viewBox 不进属性快照；静区归零时它必须恰好等于模块数',
          run: expectViewBox('0 0 21 21'),
        },
      ],
    },
    {
      name: 'label 盖过 value 当可及名字',
      spec: { apg: APG },
      props: { value: URL_23, label: '打开曦寒 UI 文档' },
      initial: {
        parts: {
          root: {
            'role': 'img',
            'aria-label': '打开曦寒 UI 文档',
            'aria-hidden': null,
          },
        },
      },
    },
    {
      name: '纯空白的名字不算给过：整张图退出无障碍树',
      spec: { apg: APG },
      props: { value: URL_23, label: '   ' },
      initial: {
        parts: {
          root: {
            'aria-hidden': 'true',
            'role': null,
            'aria-label': null,
            // 名字没了，码照画
            'data-state': 'ready',
            'data-version': '2',
          },
        },
      },
    },
    {
      name: '内容变长：版本与每边模块数跟着变，路径重画',
      spec: { apg: APG },
      props: { value: 'x'.repeat(10), level: 'L' },
      initial: {
        parts: {
          root: { 'data-version': '1', 'data-modules': '21' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { value: 'x'.repeat(40) },
          expect: {
            counts: { root: 1 },
            parts: {
              root: {
                'data-version': '3',
                'data-modules': '29',
                'data-state': 'ready',
                'aria-label': 'x'.repeat(40),
              },
            },
          },
        },
        {
          kind: 'raw',
          why: 'viewBox 不进属性快照，换版本后它必须跟着变',
          run: expectViewBox('0 0 37 37'),
        },
        {
          kind: 'raw',
          why: '重画后的几何只能直接读 root 的子树',
          run: expectModulesPainted,
        },
      ],
    },
    {
      name: '没给内容：退出无障碍树，不写版本，一个模块都不铺',
      spec: { apg: APG },
      props: {},
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'aria-hidden': 'true',
            'role': null,
            'aria-label': null,
            'data-level': 'M',
            'data-version': null,
            'data-modules': null,
            'data-state': 'empty',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '"一个模块都没铺"是子元素个数，不是属性',
          run: expectNothingPainted,
        },
        {
          kind: 'raw',
          why: '没画码时 viewBox 只剩两侧静区',
          run: expectViewBox('0 0 8 8'),
        },
      ],
    },
    {
      name: '内容装不下：落 error 态且一个模块都不铺，不画半截的码',
      spec: { apg: APG },
      props: { value: TOO_LONG, level: 'H' },
      initial: {
        counts: { root: 1 },
        parts: {
          root: {
            'data-state': 'error',
            'data-version': null,
            'data-modules': null,
            // 内容还在，名字照给
            'role': 'img',
            'aria-label': TOO_LONG,
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '截断出来的码扫得开、内容是半截的；这一条钉的是"什么都不画"，只能数子元素',
          run: expectNothingPainted,
        },
      ],
    },
    {
      name: '显式写缺省形状与不写等价：还是那一条合并路径，码眼不另起一条',
      spec: { apg: APG },
      props: { value: URL_23 },
      steps: [
        {
          kind: 'raw',
          why: '几何不进属性快照；先记下不写形状时的那条 d',
          run: ({ doc, adapterName }) => {
            defaultModulesD = geomD(doc, 'modules', adapterName)
          },
        },
        {
          kind: 'setProps',
          props: { moduleShape: 'square', eyeShape: 'square' },
        },
        {
          kind: 'raw',
          why: '缺省形状的几何是向后兼容的硬要求，只能逐字比对那条 d',
          run: (ctx) => {
            const now = geomD(ctx.doc, 'modules', ctx.adapterName)
            if (now !== defaultModulesD)
              throw new Error(`${ctx.adapterName}: 显式写 square/square 后 d 变了；缺省形状必须与不写形状逐字相同`)
            if (geomEl(ctx.doc, 'eyes'))
              throw new Error(`${ctx.adapterName}: 缺省形状下码眼不该另起一条 path，它们并在数据模块那条里`)
            expectModulesPainted(ctx)
          },
        },
      ],
    },
    {
      name: '圆点码点：每段是格内最大内切圆，码眼另起一条，时序与校正图形仍是方块',
      spec: { apg: APG },
      props: { value: URL_23, moduleShape: 'dot' },
      steps: [
        {
          kind: 'raw',
          why: '"墨盖住格心"落在 d 的半径上，只能直接读几何',
          run: expectModuleSegments(DOT_SEGMENT),
        },
        {
          kind: 'raw',
          why: '码眼与数据模块形状可能不同，几何必须分成两条',
          run: expectEyeSegments,
        },
      ],
    },
    {
      name: '圆角码点：每段是圆角 0.25 的圆角方块，切掉的角够不着格心',
      spec: { apg: APG },
      props: { value: URL_23, moduleShape: 'rounded' },
      steps: [
        {
          kind: 'raw',
          why: '圆角半径决定墨还盖不盖得住格心，只能直接读几何',
          run: expectModuleSegments(ROUNDED_SEGMENT),
        },
      ],
    },
    {
      name: '圆角码眼：码眼另起一条且保持外框 + 挖孔 + 内心的同心结构，数据模块仍是方块',
      spec: { apg: APG },
      props: { value: URL_23, eyeShape: 'rounded' },
      steps: [
        {
          kind: 'raw',
          why: '同心结构落在子路径段数上，只能直接读几何',
          run: expectEyeSegments,
        },
        {
          kind: 'raw',
          why: '码眼变形不该带着数据模块一起变形',
          run: expectModuleSegments(RUN_SEGMENT),
        },
      ],
    },
    {
      name: '放 logo：root 上落 data-logo，那块模块被挖空，logo 摆在正中且不超过整码 1/5',
      spec: { apg: APG },
      fixture: (base: FixtureNode) => ({
        ...base,
        children: [{
          part: 'logo',
          tag: 'svg',
          children: [{ tag: 'rect', attrs: { x: '0', y: '0', width: '100%', height: '100%' } }],
        }],
      }),
      props: { value: URL_23, level: 'Q' },
      initial: {
        order: ['root', 'logo'],
        counts: { root: 1, logo: 1 },
        parts: {
          root: { 'data-logo': '', 'data-state': 'ready' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '挖空矩形与 logo 的落位都不进属性快照，只能直接读 DOM',
          run: ({ doc, adapterName }) => {
            const root = rootEl(doc)
            const clear = geomEl(doc, 'logo-clear')
            if (!clear)
              throw new Error(`${adapterName}: 放了 logo 却没铺挖空矩形；模块从 logo 底下透出来会被当成模块边界`)
            const logo = doc.querySelector('[data-scope="qr-code"][data-part="logo"]')!
            const read = (el: Element, name: string): number => Number(el.getAttribute(name))
            for (const name of ['x', 'y', 'width', 'height']) {
              if (read(clear, name) !== read(logo, name))
                throw new Error(`${adapterName}: 挖空矩形的 ${name} 与 logo 的对不上，logo 边上会露出模块`)
            }
            const count = Number(root.getAttribute('data-modules'))
            const side = read(logo, 'width')
            if (!(side > 0) || side * 5 > count)
              throw new Error(`${adapterName}: logo 边长 ${side} 超出每边 ${count} 个模块的 1/5`)
            // 两侧余量相等即居中；余量是整数即压在模块边界上，不会切开半个模块
            const lead = read(logo, 'x') - Number(root.getAttribute('viewBox')!.split(' ')[0])
            const rest = Number(root.getAttribute('viewBox')!.split(' ')[2]) - lead - side
            if (lead !== rest || !Number.isInteger(lead))
              throw new Error(`${adapterName}: logo 没有整格居中（左侧余量 ${lead}、右侧 ${rest}）`)
          },
        },
        {
          kind: 'raw',
          why: '挖空必须压在模块之上、又在 logo 之下，靠的是文档序',
          run: ({ doc, adapterName }) => {
            const kids = Array.from(rootEl(doc).children)
            const clearAt = kids.findIndex(el => el.getAttribute('data-xh-geom') === 'logo-clear')
            const modulesAt = kids.findIndex(el => el.getAttribute('data-xh-geom') === 'modules')
            const logoAt = kids.findIndex(el => el.getAttribute('data-part') === 'logo')
            if (!(modulesAt < clearAt && clearAt < logoAt))
              throw new Error(`${adapterName}: 子节点次序是 模块 ${modulesAt} / 挖空 ${clearAt} / logo ${logoAt}，挖空必须夹在两者之间`)
          },
        },
        {
          kind: 'setProps',
          props: { value: '' },
          expect: {
            // 没画出码就没有可挖的位
            parts: { root: { 'data-state': 'empty', 'data-logo': null } },
          },
        },
        {
          kind: 'raw',
          why: 'logo 收没收起落在宽高上，宽高不进属性快照',
          run: ({ doc, adapterName }) => {
            if (geomEl(doc, 'logo-clear'))
              throw new Error(`${adapterName}: 没画出码却还挖了一块空`)
            const logo = doc.querySelector('[data-scope="qr-code"][data-part="logo"]')!
            if (logo.getAttribute('width') !== '0' || logo.getAttribute('height') !== '0')
              throw new Error(`${adapterName}: 没画出码时 logo 应当收成 0 宽 0 高，实际 ${logo.getAttribute('width')}×${logo.getAttribute('height')}`)
          },
        },
      ],
    },
    {
      name: '没写 logo 部件：root 上不落 data-logo，也不铺挖空矩形',
      spec: { apg: APG },
      props: { value: URL_23 },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: { 'data-logo': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '"没铺挖空"是子元素，不是属性',
          run: ({ doc, adapterName }) => {
            if (geomEl(doc, 'logo-clear'))
              throw new Error(`${adapterName}: 没放 logo 却挖了一块空，那片模块白丢了`)
          },
        },
      ],
    },
  ],
}
