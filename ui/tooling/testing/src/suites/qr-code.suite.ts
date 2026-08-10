import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { qrCodeAnatomy, qrCodeKeyboard } from '@xihan-ui/headless'

// 二维码是一张图，APG 里对应的是"命名与描述"那一节；判据锁三件：
// 命名两态互斥、版本与静区如实落到根上、没有可编码的内容时一个模块都不铺。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

const SVG_NS = 'http://www.w3.org/2000/svg'

// 23 字节，M 级下装不进 1 版（14 字节），落在 2 版（25 模块）
const URL_23 = 'https://ui.xihanfun.com'
// 超出 40 版 H 级的 1273 字节上限
const TOO_LONG = 'x'.repeat(1300)

function rootEl(doc: Document): Element {
  const el = doc.querySelector('[data-scope="qr-code"][data-part="root"]')
  if (!el)
    throw new Error('找不到 qr-code 的 root 部件')
  return el
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

export const qrCodeSuite: ConformanceSuite = {
  component: 'qr-code',
  anatomy: qrCodeAnatomy,
  keyboard: qrCodeKeyboard,
  // 只有 root 一个角色节点；模块是算出来的几何，由适配器铺在 root 内部
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
  ],
}
