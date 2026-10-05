import { afterEach, describe, expect, it } from 'vitest'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 星接 Action Control icon 档，连接层投影的家族属性在静态夹具里照抄 */
const STAR = 'data-xh-action-control data-xh-action-profile="icon" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="xs"'

function mount(dir: 'ltr' | 'rtl' = 'ltr') {
  host = document.createElement('div')
  host.dir = dir
  host.innerHTML = `
    <div data-scope="rating" class="xh-scope-rating" data-part="root">
      <div data-scope="rating" class="xh-scope-rating" data-part="control">
        <span data-scope="rating" class="xh-scope-rating" data-part="item" ${STAR} data-highlighted></span>
        <span data-scope="rating" class="xh-scope-rating" data-part="item" ${STAR} data-highlighted data-half></span>
        <span data-scope="rating" class="xh-scope-rating" data-part="item" ${STAR}></span>
        <span data-scope="rating" class="xh-scope-rating" data-part="item" ${STAR}><svg viewBox="0 0 24 24"></svg></span>
      </div>
    </div>`
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>('[data-part="item"]')]
}

/** 点亮那层星形的裁切：换边的两侧由算式给出，计算值里的 0 写作 0%，与 0px 同义，统一成 0px 再比 */
function clipOf(element: HTMLElement): string {
  return getComputedStyle(element, '::after').clipPath.replace(/(?<![\d.])0%/g, '0px')
}

function maskOf(element: HTMLElement, pseudo: '::after' | '::before'): string {
  const style = getComputedStyle(element, pseudo)
  return style.maskImage || style.webkitMaskImage || ''
}

describe('rating 默认星形视觉', () => {
  it('空条目由两层首方星形绘制完整、半档和未选状态', () => {
    const [full, half, empty] = mount()

    for (const item of [full!, half!, empty!]) {
      expect(item.textContent).toBe('')
      expect(maskOf(item, '::before')).toContain('data:image/svg')
      expect(maskOf(item, '::after')).toContain('data:image/svg')
      expect(item.offsetWidth).toBeGreaterThan(0)
      expect(item.offsetWidth).toBe(item.offsetHeight)
    }

    expect(clipOf(full!)).toBe('inset(0px)')
    expect(clipOf(half!)).toBe('inset(0px 50% 0px 0px)')
    expect(clipOf(empty!)).toBe('inset(0px 100% 0px 0px)')
  })

  it('rTL 半档从右侧点亮', () => {
    const [, half] = mount('rtl')
    expect(clipOf(half!)).toBe('inset(0px 0px 0px 50%)')
  })

  it('rTL 未点亮的星从行首（右侧）擦出：裁掉的是左侧整幅', () => {
    const [full, , empty] = mount('rtl')
    expect(clipOf(empty!)).toBe('inset(0px 0px 0px 100%)')
    expect(clipOf(full!)).toBe('inset(0px)')
  })

  it('rtl 里局部写回 ltr 的星带按 ltr 裁', () => {
    mount('rtl')
    host!.querySelector<HTMLElement>('[data-part="root"]')!.dir = 'ltr'
    const [, half, empty] = [...host!.querySelectorAll<HTMLElement>('[data-part="item"]')]
    expect(clipOf(half!)).toBe('inset(0px 50% 0px 0px)')
    expect(clipOf(empty!)).toBe('inset(0px 100% 0px 0px)')
  })

  it.each(['ltr', 'rtl'] as const)('%s：两层星形都落在格子正中', (dir) => {
    const items = mount(dir).slice(0, 3)
    for (const item of items) {
      const box = item.getBoundingClientRect()
      for (const pseudo of ['::before', '::after'] as const) {
        const star = pseudoBox(item, pseudo)
        expect(Math.abs(star.centerX - (box.left + box.width / 2)), `${dir} ${pseudo}`).toBeLessThanOrEqual(0.5)
        expect(Math.abs(star.centerY - (box.top + box.height / 2)), `${dir} ${pseudo}`).toBeLessThanOrEqual(0.5)
      }
    }
  })

  it('作者传入图标后皮肤字形让位', () => {
    const custom = mount()[3]!
    expect(getComputedStyle(custom, '::before').content).toBe('none')
    expect(getComputedStyle(custom, '::after').content).toBe('none')
  })
})
