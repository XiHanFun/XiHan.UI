import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { watermarkAnatomy, watermarkKeyboard } from '@xihan-ui/headless'

// 水印是一层印子，APG 没有对应模式；判据锁四件：没有可印的文字时整层不算、
// 图样是一张 SVG 而不是位图、作者写进文字里的标记字符出不了自己的那对标签、多行按行铺开。
// 印子铺在根的伪元素上，无障碍树里本就看不见它，故这里不验读屏——它压根不进树。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

const IMAGE_PREFIX = 'data:image/svg+xml,'

function rootEl(doc: Document): Element {
  const el = doc.querySelector('[data-scope="watermark"][data-part="root"]')
  if (!el)
    throw new Error('找不到 watermark 的 root 部件')
  return el
}

/** 取回图样那张 SVG 的原文；没写出图样时是 null。快照不采集 style，这几条只能这么验。 */
function readSvg(doc: Document): string | null {
  const match = /--xh-watermark-image:\s*url\("([^"]+)"\)/.exec(rootEl(doc).getAttribute('style') ?? '')
  if (!match)
    return null
  const uri = decodeURIComponent(match[1]!)
  if (!uri.startsWith(IMAGE_PREFIX))
    throw new Error(`图样不是 SVG 的 data URI，开头是「${uri.slice(0, 40)}」`)
  return uri.slice(IMAGE_PREFIX.length)
}

/** 平铺步距，形如 `120px 84px`；没写出时是 null。 */
function readTile(doc: Document): string | null {
  const match = /--xh-watermark-tile:\s*([^;]+)/.exec(rootEl(doc).getAttribute('style') ?? '')
  return match ? match[1]!.trim() : null
}

function svgOf({ doc, adapterName }: RawStepContext): string {
  const svg = readSvg(doc)
  if (svg === null)
    throw new Error(`${adapterName}: 根上没写出图样`)
  return svg
}

/** 一张图样里铺了几行字。 */
function lineCount(svg: string): number {
  return svg.split('<text').length - 1
}

/** 步距的高度那一维，单位像素。 */
function tileHeight(doc: Document, adapterName: string): number {
  const tile = readTile(doc)
  const match = tile === null ? null : /^(\d+)px (\d+)px$/.exec(tile)
  if (!match)
    throw new Error(`${adapterName}: 步距期望形如「120px 84px」，实际「${tile ?? '不写出'}」`)
  return Number(match[2])
}

/** 单行那一版的高度，供多行那一步比对；同一次录制里用完即弃。 */
let singleLineHeight = 0

export const watermarkSuite: ConformanceSuite = {
  component: 'watermark',
  anatomy: watermarkAnatomy,
  keyboard: watermarkKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'content', text: '合同正文' },
    ],
  },
  cases: [
    {
      name: '没有可印的文字：state 落 empty，图样与步距都不写出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: { 'role': null, 'data-state': 'empty' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '皮肤按 data-state 决定画不画那一层；此时若还留着图样变量，铺出来的会是一整块实心色',
          run: ({ doc, adapterName }) => {
            if (readSvg(doc) !== null || readTile(doc) !== null)
              throw new Error(`${adapterName}: 没有可印的文字时不该写出图样或步距`)
          },
        },
      ],
    },
    {
      name: '给了文字：state 落 ready，图样是一张 SVG，步距是两个像素值',
      spec: { apg: APG },
      props: { text: '曦寒前端组件库' },
      initial: {
        parts: {
          root: { 'data-state': 'ready' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '图样必须是 SVG：位图要一个能绘图的运行时才产得出，服务端渲染与判据都拿不到',
          run: (ctx) => {
            const svg = svgOf(ctx)
            if (!svg.startsWith('<svg ') || !svg.includes('曦寒前端组件库'))
              throw new Error(`${ctx.adapterName}: 图样不是一张带上文字的 SVG，实际「${svg.slice(0, 60)}」`)
            // 步距必须写出来且形如「120px 84px」；写不出来，平铺就退回图样的固有尺寸
            tileHeight(ctx.doc, ctx.adapterName)
          },
        },
      ],
    },
    {
      name: '四个数值只走内联变量，不占 data-*、也不改语义',
      spec: { apg: APG },
      props: { text: '曦寒', rotate: -45, gap: 40, fontSize: 20, opacity: 0.3 },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-state': 'ready',
            'data-rotate': null,
            'data-gap': null,
            'data-font-size': null,
            'data-opacity': null,
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '角度与深浅要参与图样的几何计算，落成属性就参与不了',
          run: (ctx) => {
            const svg = svgOf(ctx)
            if (!svg.includes('rotate(-45 ') || !svg.includes('fill-opacity="0.3"') || !svg.includes('font-size="20"'))
              throw new Error(`${ctx.adapterName}: 四个数值没落进图样，实际「${svg.slice(0, 120)}」`)
          },
        },
      ],
    },
    {
      name: '文字里的标记字符被转义，出不了自己的那对标签',
      spec: { apg: APG },
      props: { text: '<script>alert("x")</script> & \'曦寒\'' },
      initial: {
        parts: {
          root: { 'data-state': 'ready' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '一个没转的 < 就足以把整张图样打断，后面的字全变成标记',
          run: (ctx) => {
            const svg = svgOf(ctx)
            if (svg.includes('<script') || svg.includes('</script'))
              throw new Error(`${ctx.adapterName}: 文字里的尖括号原样进了图样：${svg}`)
            if (!svg.includes('&lt;script&gt;') || !svg.includes('&amp;') || !svg.includes('&quot;'))
              throw new Error(`${ctx.adapterName}: 五个 XML 字符没有全部转义：${svg}`)
            // 编码后的 data URI 里不该剩下能提前收尾一条 CSS 声明的字符
            const uri = rootEl(ctx.doc).getAttribute('style') ?? ''
            const image = /url\("([^"]+)"\)/.exec(uri)?.[1] ?? ''
            if (/[;"#%<>]/.test(image.replace(/%[0-9A-F]{2}/gi, '')))
              throw new Error(`${ctx.adapterName}: 图样里剩下了未编码的字符：${image}`)
          },
        },
      ],
    },
    {
      name: '多行：数组按行铺开，空白行不占位，图样跟着长高',
      spec: { apg: APG },
      props: { text: '曦寒前端组件库' },
      steps: [
        {
          kind: 'raw',
          why: '先记下单行那一版的高度，供换成多行后比对',
          run: (ctx) => {
            singleLineHeight = tileHeight(ctx.doc, ctx.adapterName)
          },
        },
        {
          kind: 'setProps',
          props: { text: ['曦寒前端组件库', '仅供内部评审'] },
        },
        {
          kind: 'raw',
          why: '多行是两条 <text>，不是一条挤在一起的长字符串',
          run: (ctx) => {
            const svg = svgOf(ctx)
            if (lineCount(svg) !== 2)
              throw new Error(`${ctx.adapterName}: 图样里有 ${lineCount(svg)} 行，期望 2 行`)
            const height = tileHeight(ctx.doc, ctx.adapterName)
            if (height <= singleLineHeight)
              throw new Error(`${ctx.adapterName}: 两行的步距高 ${height}，没有超过单行的 ${singleLineHeight}`)
          },
        },
        {
          kind: 'setProps',
          props: { text: ['曦寒前端组件库', '   ', '仅供内部评审'] },
        },
        {
          kind: 'raw',
          why: '空白行只会让图样长高，印不出任何东西',
          run: (ctx) => {
            const svg = svgOf(ctx)
            if (lineCount(svg) !== 2)
              throw new Error(`${ctx.adapterName}: 夹了一行空白后有 ${lineCount(svg)} 行，期望仍是 2 行`)
          },
        },
      ],
    },
    {
      name: '两个部件各一份，按地 / 内容的文档序排列',
      spec: { apg: APG },
      props: { text: '曦寒' },
      initial: {
        order: ['root', 'content'],
        counts: { root: 1, content: 1 },
      },
    },
  ],
}
