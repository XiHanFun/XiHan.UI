// 接线后取消部件身上已经起播的过渡：一批部件只做一次同步样式计算。先把这些部件所在根上的动画取齐，
// 再一起取消；逐个部件取、取到就取消，每取消一次下一个部件就得重算一遍样式。
// 只取消这批部件自己身上的 CSS 过渡：伪元素上的、别的节点上的、关键帧动画都不碰；ShadowRoot 与 iframe 里的部件照样处理。
// 判据是 CDP 的样式计算次数（确定，不随机器快慢变）；耗时只打出来作参考。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { settleTransitionsAfterWiring } from '../../src/dom/settle-transitions'

const GROUPS = 50
const CHILDREN = 3
const BUSY = 300

const CSS = `
.settle-part, .settle-busy { background-color: rgb(0 0 0); transition: background-color 10s linear }
.settle-part.wired { background-color: rgb(255 0 0) }
.settle-part::before { content: ''; display: block; inline-size: 1px; block-size: 1px; background-color: rgb(0 0 0); transition: background-color 10s linear }
.settle-part.wired::before { background-color: rgb(255 0 0) }
.settle-busy.on { background-color: rgb(0 0 255) }
@keyframes settle-spin { to { opacity: 0.5 } }
.settle-part.spin { animation: settle-spin 10s linear infinite }
`

beforeAll(async () => {
  await cdp().send('Performance.enable')
})

afterEach(() => {
  document.head.querySelectorAll('style[data-settle]').forEach(style => style.remove())
  document.body.style.removeProperty('--settle-round')
  document.body.replaceChildren()
})

async function metrics(): Promise<Record<string, number>> {
  const { metrics } = await cdp().send('Performance.getMetrics') as { metrics: { name: string, value: number }[] }
  return Object.fromEntries(metrics.map(item => [item.name, item.value]))
}

/** 登记后要等两层微任务才处理，再多等一层确保处理完。 */
async function settled(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await Promise.resolve()
}

function addStyle(root: Document | ShadowRoot): void {
  // iframe 的 Document 与这边不是同一个构造器，按节点类型认
  const isDocument = root.nodeType === Node.DOCUMENT_NODE
  const style = (isDocument ? root as Document : (root as ShadowRoot).ownerDocument).createElement('style')
  style.dataset.settle = ''
  style.textContent = CSS
  if (isDocument)
    (root as Document).head.append(style)
  else
    root.append(style)
}

/** 自己身上（不含伪元素）正在跑的 CSS 过渡数。 */
function ownTransitions(el: Element): number {
  return el.getAnimations().filter(animation => 'transitionProperty' in animation).length
}

function pseudoTransitions(el: Element): number {
  return (el.getRootNode() as Document | ShadowRoot).getAnimations().filter((animation) => {
    const effect = animation.effect as KeyframeEffect
    return 'transitionProperty' in animation && effect.target === el && effect.pseudoElement === '::before'
  }).length
}

/** 一大片节点，其中一些带着正在跑的过渡：它们不在这批部件里，取消时不能碰。 */
function backdrop(): HTMLElement[] {
  const grid = document.createElement('div')
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(20, 1fr); gap: 2px'
  const busy: HTMLElement[] = []
  for (let i = 0; i < 3000; i++) {
    const cell = document.createElement('div')
    cell.textContent = `节点 ${i}`
    if (i < BUSY) {
      cell.className = 'settle-busy'
      busy.push(cell)
    }
    grid.append(cell)
  }
  document.body.append(grid)
  return busy
}

/** 嵌套的部件：父部件里套子部件。插进去先算一遍样式，再换成接线后的样式，过渡就此起播。 */
function nestedParts(parent: ParentNode, groups: number): HTMLElement[] {
  const parts: HTMLElement[] = []
  for (let g = 0; g < groups; g++) {
    const group = document.createElement('div')
    group.className = 'settle-part'
    parts.push(group)
    for (let c = 0; c < CHILDREN; c++) {
      const child = document.createElement('div')
      child.className = 'settle-part'
      group.append(child)
      parts.push(child)
    }
    parent.append(group)
  }
  return parts
}

function startTransitions(parts: readonly HTMLElement[]): void {
  const view = parts[0]!.ownerDocument.defaultView!
  for (const el of parts) {
    void view.getComputedStyle(el).backgroundColor
    void view.getComputedStyle(el, '::before').backgroundColor
  }
  for (const el of parts)
    el.classList.add('wired')
}

describe('settleTransitionsAfterWiring 的同步样式计算次数', () => {
  it(`${GROUPS * (CHILDREN + 1)} 个嵌套部件带着起播的过渡、页面另有 ${BUSY} 个过渡在跑：处理一次只算一遍样式`, async ({ annotate }) => {
    addStyle(document)
    const busy = backdrop()
    for (const cell of busy)
      void getComputedStyle(cell).backgroundColor
    for (const cell of busy)
      cell.classList.add('on')
    const parts = nestedParts(document.body, GROUPS)
    startTransitions(parts)
    // 过渡起播后把页面上的动画全停住：帧里没有要推进的动画，样式计算只数处理本身与取消后的那一遍
    for (const animation of document.getAnimations())
      animation.pause()
    void document.documentElement.getBoundingClientRect()
    // 接线写下的属性让样式作废：处理时得同步重算
    document.body.style.setProperty('--settle-round', '1')

    const before = await metrics()
    const start = performance.now()
    settleTransitionsAfterWiring(parts)
    await settled()
    const elapsed = performance.now() - start
    const after = await metrics()
    const recalcs = after.RecalcStyleCount! - before.RecalcStyleCount!
    await annotate(`BENCH settle parts=${parts.length} busy=${BUSY} recalcs=${recalcs} layouts=${after.LayoutCount! - before.LayoutCount!} ms=${elapsed.toFixed(1)} styleMs=${((after.RecalcStyleDuration! - before.RecalcStyleDuration!) * 1000).toFixed(1)}`)

    expect(parts.map(ownTransitions).every(count => count === 0)).toBe(true)
    expect(parts.map(pseudoTransitions).every(count => count === 1)).toBe(true)
    expect(busy.map(ownTransitions).every(count => count === 1)).toBe(true)
    // 作废的样式算一遍（处理时同步算，或此前赶上的一帧里算过），取消后的样式在帧里再算一遍；改前每个部件一遍
    expect(recalcs).toBeLessThanOrEqual(2)
  })
})

describe('settleTransitionsAfterWiring 取消的范围不变', () => {
  it('关键帧动画不碰，没登记的部件不碰', async () => {
    addStyle(document)
    const [spinning, unregistered] = nestedParts(document.body, 1).slice(1)
    spinning!.classList.add('spin')
    startTransitions([spinning!, unregistered!])
    void getComputedStyle(spinning!).opacity
    settleTransitionsAfterWiring([spinning!])
    await settled()
    expect(ownTransitions(spinning!)).toBe(0)
    expect(spinning!.getAnimations().filter(animation => 'animationName' in animation)).toHaveLength(1)
    expect(ownTransitions(unregistered!)).toBe(1)
  })

  it('影子根（ShadowRoot）里的部件照样取消', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    addStyle(shadow)
    const parts = nestedParts(shadow, 2)
    startTransitions(parts)
    settleTransitionsAfterWiring(parts)
    await settled()
    expect(parts.map(ownTransitions)).toEqual(parts.map(() => 0))
  })

  it('iframe 里的部件照样取消', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const doc = frame.contentDocument!
    addStyle(doc)
    const parts = nestedParts(doc.body, 2)
    startTransitions(parts)
    settleTransitionsAfterWiring(parts)
    await settled()
    expect(parts.map(ownTransitions)).toEqual(parts.map(() => 0))
  })
})
