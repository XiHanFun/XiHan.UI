import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { aspectRatioAnatomy, aspectRatioKeyboard } from '@xihan-ui/headless'

// 出处：比例交给 CSS 的 aspect-ratio 属性，盒宽随容器、块向尺寸由它算出。
const CSS = 'https://www.w3.org/TR/css-sizing-4/#aspect-ratio'

const ROOT = '[data-scope="aspect-ratio"][data-part="root"]'
const SLOT = '--xh-_aspect-ratio'

// 归一化快照只收属性，不收 style；比例只落在 root 的内联私有槽上，只能直接读节点。
const WHY = '归一化快照不收 style，比例只落在 root 的内联私有槽上，只能直接读节点'

function rootOf(doc: Document): HTMLElement {
  const root = doc.querySelector<HTMLElement>(ROOT)
  if (!root)
    throw new Error('fixture 里没有 root 部件')
  return root
}

/** 核对 root 上私有槽的取值：连接层把归一后的比例按 String() 写进去。 */
function expectRatio(expected: number) {
  return ({ doc }: RawStepContext): void => {
    const got = rootOf(doc).style.getPropertyValue(SLOT).trim()
    if (got !== String(expected))
      throw new Error(`${SLOT} 是 ${JSON.stringify(got)}，期望 ${JSON.stringify(String(expected))}`)
  }
}

/** 核对作者的内容原样落在 root 里、是它的直接子元素：皮肤按直接子元素铺满盒子。 */
function expectContent(text: string) {
  return ({ doc }: RawStepContext): void => {
    const children = [...rootOf(doc).children]
    if (children.length !== 1 || children[0]!.textContent !== text)
      throw new Error(`root 的直接子元素是 ${JSON.stringify(children.map(el => el.textContent))}，期望只有一个「${text}」`)
  }
}

const CONTENT = '画面'

/** aspect-ratio 的一致性套件：锁「比例落成什么、非法值回落到哪、内容放在哪」。 */
export const aspectRatioSuite: ConformanceSuite = {
  component: 'aspect-ratio',
  anatomy: aspectRatioAnatomy,
  keyboard: aspectRatioKeyboard,
  fixture: { part: 'root', tag: 'div', children: [{ tag: 'div', text: CONTENT }] },
  cases: [
    {
      name: '缺省比例为 1：私有槽落成 1，根上不写 role、不可聚焦',
      spec: { apg: CSS },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: { root: { role: null, tabindex: null } },
        activeElement: null,
        events: [],
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectRatio(1) },
        { kind: 'raw', why: '内容是作者的节点、不是部件，快照只收部件', run: expectContent(CONTENT) },
      ],
    },
    {
      name: '给 16 / 9：私有槽写成这个数，不取整也不约分',
      spec: { apg: CSS },
      props: { ratio: 16 / 9 },
      steps: [{ kind: 'raw', why: WHY, run: expectRatio(16 / 9) }],
    },
    {
      name: '改 ratio：私有槽跟着换',
      spec: { apg: CSS },
      props: { ratio: 4 / 3 },
      steps: [
        { kind: 'raw', why: WHY, run: expectRatio(4 / 3) },
        { kind: 'setProps', props: { ratio: 2 } },
        { kind: 'raw', why: WHY, run: expectRatio(2) },
        { kind: 'setProps', props: { ratio: 0.5 } },
        { kind: 'raw', why: WHY, run: expectRatio(0.5) },
      ],
    },
    {
      name: '0 与负数回落到 1：零高或倒置的盒子画不出来',
      spec: { apg: CSS },
      props: { ratio: 0 },
      steps: [
        { kind: 'raw', why: WHY, run: expectRatio(1) },
        { kind: 'setProps', props: { ratio: 2 } },
        { kind: 'raw', why: WHY, run: expectRatio(2) },
        { kind: 'setProps', props: { ratio: -16 / 9 } },
        { kind: 'raw', why: WHY, run: expectRatio(1) },
      ],
    },
    {
      name: 'NaN 与无穷回落到 1：不把读不出的数写进样式',
      spec: { apg: CSS },
      props: { ratio: Number.NaN },
      steps: [
        { kind: 'raw', why: WHY, run: expectRatio(1) },
        { kind: 'setProps', props: { ratio: 3 } },
        { kind: 'raw', why: WHY, run: expectRatio(3) },
        { kind: 'setProps', props: { ratio: Number.POSITIVE_INFINITY } },
        { kind: 'raw', why: WHY, run: expectRatio(1) },
      ],
    },
  ],
}
