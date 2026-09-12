// 窄处的无条件兜底：pin-input / question-flow / radio-group / alert / slider / image-cropper / dialog。
//
// 这几条判据都不接断点：换行、可收缩、封顶、归零外边距在窄视口与窄容器两种情形下同时成立，
// 一份规则管两轴。所以下面每一条都在 375 / 768 / 1280 三档一起量，窄档不许溢出、宽档不许变样。
//
// 测试宿主的视口固定在一个宽度上，改不动。这里改用内嵌 iframe：布局按 iframe 自己的视口算，
// 宽度由这边的 width 说了算。皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 在给定宽度的视口里挂一段标记，返回那个文档。 */
function mount(width: number, html: string): Document {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 700px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = html
  return doc
}

afterEach(() => {
  frame?.remove()
  frame = null
})

/** 整页横向溢出多少像素：0 即没有横向滚动条。 */
function pageOverflow(doc: Document): number {
  return doc.documentElement.scrollWidth - doc.documentElement.clientWidth
}

/** 一组元素占了几行：按盒顶的不同取值算。 */
function rows(nodes: Iterable<Element>): number {
  return new Set([...nodes].map(node => Math.round(node.getBoundingClientRect().top))).size
}

function widths(nodes: Iterable<Element>): number[] {
  return [...nodes].map(node => Math.round(node.getBoundingClientRect().width))
}

const TIERS = [375, 768, 1280]

describe('pin-input：一行格子放不下时逐格收窄', () => {
  const markup = `<div data-scope="pin-input" data-part="root" data-size="lg">
    <label data-scope="pin-input" data-part="label">验证码</label>
    <div style="display:flex">${'<input data-scope="pin-input" data-part="input">'.repeat(8)}</div>
  </div>`

  it.each(TIERS)('%ipx 下不顶出页面', (width) => {
    expect(pageOverflow(mount(width, markup))).toBe(0)
  })

  it('375 下格子收窄而不是溢出，高度不跟着收', () => {
    const doc = mount(375, markup)
    const box = doc.querySelector('[data-part="input"]')!.getBoundingClientRect()
    // 八格定宽 48 加七道 12 的间距合计 468，比视口宽 93
    expect(box.width).toBeLessThan(48)
    expect(Math.round(box.height)).toBe(48)
  })

  it('放得下就一格不收：1280 下仍是尺寸档给的边长', () => {
    const doc = mount(1280, markup)
    const box = doc.querySelector('[data-part="input"]')!.getBoundingClientRect()
    expect(Math.round(box.width)).toBe(48)
    expect(Math.round(box.height)).toBe(48)
  })
})

describe('question-flow：页脚摆不下就换行', () => {
  const markup = `<div data-scope="question-flow" data-part="root" data-size="lg">
    <div data-scope="question-flow" data-part="footer">
      <div style="display:flex;align-items:center;gap:4px">
        <button data-scope="question-flow" data-part="prev-trigger"></button>
        <span data-scope="question-flow" data-part="counter">第 3 题 / 共 12 题</span>
        <button data-scope="question-flow" data-part="next-trigger"></button>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button data-scope="question-flow" data-part="skip-trigger">先跳过这一题</button>
        <button data-scope="question-flow" data-part="submit-trigger">保存答案并继续下一题</button>
      </div>
    </div>
  </div>`

  it.each(TIERS)('%ipx 下页脚自身不溢出', (width) => {
    const doc = mount(width, markup)
    const footer = doc.querySelector('[data-part="footer"]')!
    expect(footer.scrollWidth).toBe(footer.clientWidth)
  })

  /** 页脚里两组的盒。两组高度不同，行不行只能按上下/左右的位置关系判。 */
  function groups(width: number): [DOMRect, DOMRect] {
    const kids = [...mount(width, markup).querySelector('[data-part="footer"]')!.children]
    return [kids[0]!.getBoundingClientRect(), kids[1]!.getBoundingClientRect()]
  }

  it('375 下动作那组落到下一行', () => {
    const [steps, actions] = groups(375)
    expect(actions.top).toBeGreaterThanOrEqual(steps.bottom)
  })

  it('1280 下两组仍并排', () => {
    const [steps, actions] = groups(1280)
    expect(actions.left).toBeGreaterThanOrEqual(steps.right)
  })
})

describe('radio-group：横排摆不下就换行，不压条目', () => {
  const options = ['灰度发布', '全量发布', '只推预发环境', '回滚上一版', '暂不发布']
  const markup = `<div data-scope="radio-group" data-part="root" data-orientation="horizontal">
    <span data-scope="radio-group" data-part="label">部署方式</span>
    ${options.map(text => `<div data-scope="radio-group" data-part="item">
      <span data-scope="radio-group" data-part="indicator"></span>
      <span data-scope="radio-group" data-part="item-text">${text}</span>
    </div>`).join('')}
  </div>`

  it('375 下条目宽度与 1280 下一模一样', () => {
    const narrow = widths(mount(375, markup).querySelectorAll('[data-part="item"]'))
    const wide = widths(mount(1280, markup).querySelectorAll('[data-part="item"]'))
    expect(narrow).toEqual(wide)
  })

  it('375 下条目文字不折行：高度与 1280 下一致', () => {
    const heightAt = (width: number): number =>
      Math.round(mount(width, markup).querySelector('[data-part="item"]')!.getBoundingClientRect().height)
    expect(heightAt(375)).toBe(heightAt(1280))
  })

  it('375 下换行、1280 下并排', () => {
    expect(rows(mount(375, markup).querySelectorAll('[data-part="item"]'))).toBeGreaterThan(1)
    expect(rows(mount(1280, markup).querySelectorAll('[data-part="item"]'))).toBe(1)
  })
})

describe('alert：图标、文本列、叉恒在同一行', () => {
  const markup = `<div data-scope="alert" data-part="root" data-tone="info">
    <span data-scope="alert" data-part="indicator"></span>
    <div data-scope="alert" data-part="content">
      <div data-scope="alert" data-part="title">磁盘快满了</div>
      <div data-scope="alert" data-part="description">这台机器的系统盘只剩下不到一成的空间，构建产物再堆几次就会写不进去，建议先清一遍缓存目录。</div>
    </div>
    <button data-scope="alert" data-part="close-trigger"></button>
  </div>`

  // 说明越长，content 那条伸缩基准取 auto 时撑得越宽；三档窄视口都要压得住
  it.each([375, 414, 480])('%ipx 下三件都在首行', (width) => {
    const doc = mount(width, markup)
    const top = (part: string): number => Math.round(doc.querySelector(`[data-part="${part}"]`)!.getBoundingClientRect().top)
    expect(top('content')).toBe(top('indicator'))
    expect(top('close-trigger')).toBe(top('indicator'))
  })

  it('叉恒在行尾而不是掉到内容下方', () => {
    const doc = mount(375, markup)
    const close = doc.querySelector('[data-part="close-trigger"]')!.getBoundingClientRect()
    const content = doc.querySelector('[data-part="content"]')!.getBoundingClientRect()
    expect(close.left).toBeGreaterThanOrEqual(content.right)
  })
})

describe('slider：刻度文案不顶出页面', () => {
  const markup = `<div data-scope="slider" data-part="root">
    <label data-scope="slider" data-part="label">水温</label>
    <div data-scope="slider" data-part="control" data-orientation="horizontal">
      <div data-scope="slider" data-part="track" data-orientation="horizontal">
        <div data-scope="slider" data-part="range" data-orientation="horizontal" style="inset-inline-start:0%;inline-size:26%"></div>
      </div>
      <div data-scope="slider" data-part="tick-group">
        <span data-scope="slider" data-part="tick" style="inset-inline-start:0%"></span>
        <span data-scope="slider" data-part="tick-label" style="inset-inline-start:0%">0°C</span>
        <span data-scope="slider" data-part="tick" style="inset-inline-start:26%"></span>
        <span data-scope="slider" data-part="tick-label" style="inset-inline-start:26%">26°C</span>
        <span data-scope="slider" data-part="tick" style="inset-inline-start:100%"></span>
        <span data-scope="slider" data-part="tick-label" style="inset-inline-start:100%">沸腾了</span>
      </div>
      <div data-scope="slider" data-part="thumb" data-orientation="horizontal" style="inset-inline-start:26%"></div>
    </div>
  </div>`

  // 溢出量与视口宽无关（三档恒等于半个末档文案），所以三档一起量
  it.each(TIERS)('%ipx 下不顶出页面', (width) => {
    expect(pageOverflow(mount(width, markup))).toBe(0)
  })

  it.each(TIERS)('%ipx 下首末两档文案都落在视口之内', (width) => {
    const doc = mount(width, markup)
    const labels = [...doc.querySelectorAll('[data-part="tick-label"]')].map(node => node.getBoundingClientRect())
    expect(labels.at(0)!.left).toBeGreaterThanOrEqual(0)
    expect(labels.at(-1)!.right).toBeLessThanOrEqual(width)
  })

  it('没有刻度文案的滑块不让出这一段', () => {
    const bare = markup.replace(/<span data-scope="slider" data-part="tick-label"[\s\S]*?<\/span>/g, '')
    const doc = mount(375, bare)
    const control = doc.querySelector('[data-part="control"]')!.getBoundingClientRect()
    expect(Math.round(control.width)).toBe(375)
  })
})

describe('image-cropper：两条控制轴不顶出容器', () => {
  const markup = `<div data-scope="image-cropper" data-part="root">
    <div data-scope="image-cropper" data-part="viewport" style="height:120px"></div>
    <input type="range" data-scope="image-cropper" data-part="zoom-slider">
    <input type="range" data-scope="image-cropper" data-part="rotate-slider">
  </div>`

  it.each(TIERS)('%ipx 下 root 没有横向溢出', (width) => {
    const doc = mount(width, markup)
    const root = doc.querySelector('[data-part="root"]')!
    expect(root.scrollWidth).toBe(root.clientWidth)
    expect(pageOverflow(doc)).toBe(0)
  })

  it.each(['zoom-slider', 'rotate-slider'])('%s 的行内外边距归零', (part) => {
    const doc = mount(375, markup)
    const style = doc.defaultView!.getComputedStyle(doc.querySelector(`[data-part="${part}"]`)!)
    expect(style.marginInlineStart).toBe('0px')
    expect(style.marginInlineEnd).toBe('0px')
  })
})

describe('dialog：定位层的内衬与安全区取大的一头', () => {
  /** 从样式表里取 dialog 定位层那条规则的声明文本。 */
  function positionerRule(): string {
    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList
      try {
        rules = sheet.cssRules
      }
      catch {
        continue
      }
      for (const rule of collect(rules)) {
        if (!(rule instanceof CSSStyleRule))
          continue
        const selector = rule.selectorText
        if (/data-scope=['"]dialog['"]/.test(selector) && /data-part=['"]positioner['"]/.test(selector) && rule.cssText.includes('padding'))
          return rule.cssText
      }
    }
    throw new Error('样式表里找不到 dialog 定位层那条规则')
  }

  /** 逐层展开 @layer / @media 里的规则。 */
  function* collect(rules: CSSRuleList): Generator<CSSRule> {
    for (const rule of rules) {
      yield rule
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested)
        yield* collect(nested)
    }
  }

  it.each(['top', 'bottom', 'left', 'right'])('四条边都让开 safe-area-inset-%s', (side) => {
    expect(positionerRule()).toContain(`env(safe-area-inset-${side})`)
  })
})
