import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { imageAnatomy, imageKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

const IMAGE_SELECTOR = '[data-scope="image"][data-part="image"]'
const SRC = 'https://example.test/photo.png'
const NEXT_SRC = 'https://example.test/other.png'

function requireImage(doc: Document): HTMLElement {
  const image = doc.querySelector<HTMLElement>(IMAGE_SELECTOR)
  if (!image)
    throw new Error('fixture 里没有 image')
  return image
}

/** jsdom 不会真去取图，load / error 只能直接在 image 节点上派发。 */
function dispatchOnImage(type: string): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    requireImage(doc).dispatchEvent(new Event(type))
  }
}

/** src / alt 不进归一化快照（只采 aria- / data- 与结构属性），只能直接读 DOM。 */
function assertImageSource(src: string | null, alt: string | null): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const image = requireImage(doc)
    const gotSrc = image.getAttribute('src')
    const gotAlt = image.getAttribute('alt')
    if (gotSrc !== src)
      throw new Error(`image 的 src 期望 ${src}，实际 ${gotSrc}`)
    if (gotAlt !== alt)
      throw new Error(`image 的 alt 期望 ${alt}，实际 ${gotAlt}`)
  }
}

// image 与 fallback 都常挂：image 只在 loaded 时显出，fallback 的显隐另有一套判据
// （失败恒显、加载途中要等 fallbackDelay），延迟窗口里两个都是收着的。
export const imageSuite: ConformanceSuite = {
  component: 'image',
  anatomy: imageAnatomy,
  keyboard: imageKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'image', tag: 'img' },
      { part: 'fallback', children: [{ text: '加载中' }] },
    ],
  },
  cases: [
    {
      name: '无 src：直接落回退态，image 带 hidden、fallback 可见',
      spec: { apg: APG, zag: 'image.machine#resolveSrc' },
      initial: {
        order: ['root', 'image', 'fallback'],
        counts: { root: 1, image: 1, fallback: 1 },
        parts: {
          root: { 'data-status': 'error' },
          image: {
            'role': null,
            'data-status': 'error',
            'hidden': '',
          },
          fallback: {
            'data-status': 'error',
            'hidden': null,
          },
        },
      },
    },
    {
      name: '有 src 且无延迟：停在 loading，fallback 立刻顶上',
      spec: { apg: APG, zag: 'image.machine#resolveSrc' },
      props: { src: SRC, alt: '一张示例图' },
      initial: {
        parts: {
          root: { 'data-status': 'loading' },
          image: { 'data-status': 'loading', 'hidden': '' },
          fallback: { 'data-status': 'loading', 'hidden': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'src / alt 不进归一化快照，只有直接读 DOM 才验得到它们真落在了 image 上',
          run: assertImageSource(SRC, '一张示例图'),
        },
      ],
    },
    {
      name: '图片就绪：image 显出、fallback 收起',
      spec: { apg: APG, zag: 'image.machine#loading' },
      // 图显出来了就得有替代文本，alt 由作者给
      props: { src: SRC, alt: '一张示例图' },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不真加载图片，load 只能在 image 节点上直接派发',
          run: dispatchOnImage('load'),
          expect: {
            parts: {
              root: { 'data-status': 'loaded' },
              image: { 'data-status': 'loaded', 'hidden': null },
              fallback: { 'data-status': 'loaded', 'hidden': '' },
            },
          },
        },
      ],
    },
    {
      name: '图片取不到：落回退态，image 收起、fallback 显出',
      spec: { apg: APG, zag: 'image.machine#loading' },
      props: { src: SRC },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不真加载图片，error 只能在 image 节点上直接派发',
          run: dispatchOnImage('error'),
          expect: {
            parts: {
              root: { 'data-status': 'error' },
              image: { 'data-status': 'error', 'hidden': '' },
              fallback: { 'data-status': 'error', 'hidden': null },
            },
          },
        },
      ],
    },
    {
      name: 'status-change：来源决议后先通知 loading，图片就绪再通知 loaded',
      spec: { zag: 'image.machine#invokeLoading' },
      props: { src: SRC, alt: '一张示例图' },
      initial: {
        events: [{ type: 'status-change', detail: { status: 'loading' } }],
      },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不真加载图片，load 只能在 image 节点上直接派发',
          run: dispatchOnImage('load'),
          expect: {
            parts: { root: { 'data-status': 'loaded' } },
            events: [{ type: 'status-change', detail: { status: 'loaded' } }],
          },
        },
      ],
    },
    {
      name: 'src 换人：从 loaded 重回 loading，fallback 重新顶上',
      spec: { zag: 'image.machine#syncSrc' },
      props: { src: SRC },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不真加载图片，load 只能在 image 节点上直接派发',
          run: dispatchOnImage('load'),
          expect: {
            parts: { root: { 'data-status': 'loaded' }, image: { hidden: null } },
          },
        },
        { kind: 'setProps', props: { src: NEXT_SRC } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-status', value: 'loading' } },
          expect: {
            parts: {
              root: { 'data-status': 'loading' },
              image: { 'data-status': 'loading', 'hidden': '' },
              fallback: { 'data-status': 'loading', 'hidden': null },
            },
          },
        },
        {
          kind: 'raw',
          why: 'src 不进归一化快照，换图有没有真落到 image 上只能直接读 DOM',
          run: assertImageSource(NEXT_SRC, null),
        },
      ],
    },
    {
      name: 'fallbackDelay：门槛内两个节点都收着，到点才让 fallback 顶上',
      spec: { zag: 'image.machine#trackFallbackDelay' },
      props: { src: SRC, fallbackDelay: 60 },
      initial: {
        parts: {
          root: { 'data-status': 'loading' },
          // 走缓存的快图在这一段里就到了，回退内容一次都不会闪
          image: { hidden: '' },
          fallback: { hidden: '' },
        },
      },
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'fallback', name: 'hidden', value: null } },
          expect: {
            parts: {
              root: { 'data-status': 'loading' },
              image: { hidden: '' },
              fallback: { 'data-status': 'loading', 'hidden': null },
            },
          },
        },
      ],
    },
    {
      name: 'fallbackDelay 不约束失败态：取不到图就立刻让 fallback 顶上',
      spec: { zag: 'image.machine#error' },
      // 门槛给得远大于用例时长：只要还在等门槛，这一条就会红
      props: { src: SRC, fallbackDelay: 60_000 },
      initial: {
        parts: { fallback: { hidden: '' } },
      },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不真加载图片，error 只能在 image 节点上直接派发',
          run: dispatchOnImage('error'),
          expect: {
            parts: {
              root: { 'data-status': 'error' },
              image: { hidden: '' },
              fallback: { 'data-status': 'error', 'hidden': null },
            },
          },
        },
      ],
    },
  ],
}
