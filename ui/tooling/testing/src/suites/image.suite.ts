import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { imageAnatomy, imageKeyboard } from '@xihan-ui/headless'
import { imageSource } from './shared/image-source'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

const IMAGE_SELECTOR = '[data-scope="image"][data-part="image"]'
const SRC = imageSource('photo.png')
const NEXT_SRC = imageSource('other.png')

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

/** loading 不进归一化快照，只能直接读 DOM。 */
function assertImageLoading(value: string | null): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const got = requireImage(doc).getAttribute('loading')
    if (got !== value)
      throw new Error(`image 的 loading 期望 ${value}，实际 ${got}`)
  }
}

const VIEWER_CONTENT = '[data-scope="image-viewer"][data-part="content"]'

/**
 * 预览层是另一台组件（图片预览），它的部件不进本套件的快照：直接在文档里等它的 content。
 * open 为真时等到一个对话框、大图换成这张图；为假时等到它收起或卸下。
 */
function untilPreview(open: boolean, src?: string): (ctx: RawStepContext) => Promise<void> {
  return async ({ doc, flush }) => {
    const opened = (): boolean => {
      const content = doc.querySelector<HTMLElement>(VIEWER_CONTENT)
      return content?.getAttribute('role') === 'dialog' && content.getAttribute('data-state') === 'open'
    }
    for (let i = 0; i < 50; i++) {
      await flush()
      if (opened() === open)
        break
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    if (opened() !== open)
      throw new Error(open ? '预览层没有打开' : '预览层没有收起')
    if (open && src !== undefined) {
      const got = doc.querySelector(`${VIEWER_CONTENT} [data-scope="image-viewer"][data-part="image"]`)?.getAttribute('src')
      if (got !== src)
        throw new Error(`预览层大图的 src 期望 ${src}，实际 ${got}`)
    }
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
      { part: 'placeholder' },
      { part: 'fallback', children: [{ text: '加载中' }] },
    ],
  },
  cases: [
    {
      name: '无 src：直接落回退态，image 带 hidden、fallback 可见',
      spec: { apg: APG, zag: 'image.machine#resolveSrc' },
      initial: {
        order: ['root', 'image', 'placeholder', 'fallback'],
        counts: { root: 1, image: 1, placeholder: 1, fallback: 1 },
        parts: {
          root: { 'data-state': 'error' },
          image: {
            'role': null,
            'data-state': 'error',
            'hidden': '',
          },
          placeholder: {
            'data-state': 'error',
            'hidden': '',
          },
          fallback: {
            'data-state': 'error',
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
          root: { 'data-state': 'loading' },
          image: { 'data-state': 'loading', 'hidden': '' },
          placeholder: { 'data-state': 'loading', 'hidden': null },
          fallback: { 'data-state': 'loading', 'hidden': null },
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
      name: '图片就绪：image 显出、placeholder 与 fallback 收起',
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
              root: { 'data-state': 'loaded' },
              image: { 'data-state': 'loaded', 'hidden': null },
              placeholder: { 'data-state': 'loaded', 'hidden': '' },
              fallback: { 'data-state': 'loaded', 'hidden': '' },
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
              root: { 'data-state': 'error' },
              image: { 'data-state': 'error', 'hidden': '' },
              fallback: { 'data-state': 'error', 'hidden': null },
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
            parts: { root: { 'data-state': 'loaded' } },
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
            parts: { root: { 'data-state': 'loaded' }, image: { hidden: null } },
          },
        },
        { kind: 'setProps', props: { src: NEXT_SRC } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'loading' } },
          expect: {
            parts: {
              root: { 'data-state': 'loading' },
              image: { 'data-state': 'loading', 'hidden': '' },
              fallback: { 'data-state': 'loading', 'hidden': null },
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
          root: { 'data-state': 'loading' },
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
              root: { 'data-state': 'loading' },
              image: { hidden: '' },
              fallback: { 'data-state': 'loading', 'hidden': null },
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
              root: { 'data-state': 'error' },
              image: { hidden: '' },
              fallback: { 'data-state': 'error', 'hidden': null },
            },
          },
        },
      ],
    },
    {
      name: 'fit：写了就落 data-fit，换值跟着换',
      spec: { zag: 'image.connect#getImageProps' },
      props: { src: SRC, fit: 'contain' },
      initial: {
        parts: { image: { 'data-fit': 'contain' } },
      },
      steps: [
        { kind: 'setProps', props: { fit: 'scale-down' } },
        {
          kind: 'settle',
          until: { attr: { part: 'image', name: 'data-fit', value: 'scale-down' } },
          expect: { parts: { image: { 'data-fit': 'scale-down' } } },
        },
      ],
    },
    {
      name: 'lazy：交给原生 loading="lazy"，等着取图时图片不收起（收起的图片浏览器永远不会去取）',
      spec: { zag: 'image.connect#getImageProps' },
      props: { src: SRC, lazy: true },
      initial: {
        parts: {
          root: { 'data-state': 'loading' },
          image: { 'data-state': 'loading', 'hidden': null },
          placeholder: { hidden: null },
          fallback: { hidden: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'loading 不进归一化快照，只有直接读 DOM 才验得到它真落在了 image 上',
          run: assertImageLoading('lazy'),
        },
        {
          kind: 'raw',
          why: 'jsdom 不真加载图片，error 只能在 image 节点上直接派发',
          run: dispatchOnImage('error'),
          expect: {
            parts: { image: { 'data-state': 'error', 'hidden': '' } },
          },
        },
      ],
    },
    {
      name: 'preview：root 是一颗打开对话框的按钮，占一个 Tab 位',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/', zag: 'image.connect#getRootProps' },
      props: { src: SRC, alt: '一张示例图', preview: true },
      initial: {
        parts: {
          root: {
            'role': 'button',
            'tabindex': '0',
            'aria-haspopup': 'dialog',
            'data-interactive': '',
          },
          image: { role: null },
        },
      },
      steps: [
        {
          kind: 'focus',
          part: 'root',
          via: 'keyboard',
          expect: { activeElement: { part: 'root', exact: true } },
        },
      ],
      covers: ['image.kbd.tab'],
    },
    {
      name: '缺省：root 不是按钮、不可聚焦；没写 fit 不落 data-fit（交给皮肤的变量），没开 lazy 不写 loading',
      spec: { zag: 'image.connect#getRootProps' },
      props: { src: SRC, alt: '一张示例图' },
      initial: {
        parts: {
          root: { 'role': null, 'tabindex': null, 'aria-haspopup': null, 'data-interactive': null },
          image: { 'data-fit': null, 'hidden': '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'loading 不进归一化快照，只有直接读 DOM 才验得到它没被写上',
          run: assertImageLoading(null),
        },
      ],
    },
    {
      name: 'Enter / Space 打开预览：预览层看同一张图，Escape 收起后焦点回到图片',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction', zag: 'image.machine#openPreview' },
      props: { src: SRC, alt: '一张示例图', preview: true },
      steps: [
        { kind: 'focus', part: 'root', via: 'keyboard' },
        { kind: 'key', key: 'Enter' },
        {
          kind: 'raw',
          why: '预览层是图片预览这台组件，它的部件不进本套件的快照，只能直接在文档里等',
          run: untilPreview(true, SRC),
        },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'raw',
          why: '预览层是图片预览这台组件，它的部件不进本套件的快照，只能直接在文档里等',
          run: untilPreview(false),
        },
        {
          kind: 'settle',
          until: { activeElement: 'root' },
          expect: { activeElement: { part: 'root', exact: true } },
        },
        { kind: 'key', key: 'Space' },
        {
          kind: 'raw',
          why: '预览层是图片预览这台组件，它的部件不进本套件的快照，只能直接在文档里等',
          run: untilPreview(true, SRC),
        },
      ],
      covers: ['image.kbd.open-preview'],
    },
  ],
}
