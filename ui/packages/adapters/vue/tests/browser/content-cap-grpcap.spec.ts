// 内容不断加进来时，控件自己的盒子不许没有上限地长，超出的那一截还要够得到。
//
// 三件都是「一个表单字段」：标签输入的框、自增高的多行输入框、文件列表。
// 条目数与文本长度都由使用者给，没有上限时它们会一路长下去，把同一张表单里后面的字段全推走。
// 判据分两半，缺一不可：到了上限就不再长（盒的高度不随内容再涨），
// 且多出来的那一截推得回来看（面内纵向滚得到底）。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

/** 在一条定宽的栏里挂一段标记。宽度固定是为了让换行的行数只由条目数决定。 */
function mount(html: string, width = 320): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}px`
  host.innerHTML = html
  document.body.append(host)
  return host
}

function pick(selector: string): HTMLElement {
  const el = host?.querySelector(selector)
  if (!el)
    throw new Error(`没有挂上 ${selector}`)
  return el as HTMLElement
}

/** 盒子的外高。 */
function height(el: HTMLElement): number {
  return Math.round(el.getBoundingClientRect().height)
}

/** 往块轴推到底，返回推得动的距离：0 即这块内容取不回来。 */
function reachDown(el: HTMLElement): number {
  el.scrollTop = 99999
  return el.scrollTop
}

/** 令牌当下解析成多少像素。密度换档时这个数跟着变，用例不写死。 */
function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;block-size:var(${name})`
  document.body.append(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return Math.round(px)
}

function rep(n: number, f: (i: number) => string): string {
  return Array.from({ length: n }, (_, i) => f(i + 1)).join('')
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('标签输入：标签越加越多，框不会一直长高', () => {
  function mountTags(n: number): HTMLElement {
    mount(`
      <div data-scope="tags-input" data-part="root">
        <div data-scope="tags-input" data-part="control" id="control">
          ${rep(n, i => `<span data-scope="tags-input" data-part="item"><span data-scope="tags-input" data-part="item-preview"><span data-scope="tags-input" data-part="item-text">标签${i}</span><button data-scope="tags-input" data-part="item-delete-trigger"></button></span></span>`)}
          <input data-scope="tags-input" data-part="input" />
          <button data-scope="tags-input" data-part="clear-trigger"></button>
        </div>
      </div>`)
    return pick('#control')
  }

  it('装得下的时候按内容收：空框是一行控件高，加到 5 个只多一行', () => {
    const cap = tokenPx('--xh-viewport-h-sm')
    const empty = height(mountTags(0))
    const five = height(mountTags(5))

    expect(empty).toBe(tokenPx('--xh-control-h-md'))
    expect(five).toBeGreaterThan(empty)
    expect(five).toBeLessThan(cap)
  })

  it('加到 30 个、100 个都停在同一个上限上，不再跟着涨', () => {
    const cap = tokenPx('--xh-viewport-h-sm')

    expect(height(mountTags(30))).toBe(cap)
    expect(height(mountTags(100))).toBe(cap)
  })

  it('上限之后的标签是滚出来的，不是被裁掉取不回', () => {
    const control = mountTags(100)

    expect(control.scrollHeight).toBeGreaterThan(control.clientHeight)
    expect(reachDown(control)).toBe(control.scrollHeight - control.clientHeight)
  })

  it('上限走令牌，不是皮肤里写死的一个数', () => {
    const control = mountTags(30)

    expect(getComputedStyle(control).maxBlockSize).toBe(`${tokenPx('--xh-viewport-h-sm')}px`)
  })

  it('作者能把上限调到别的高度', () => {
    const control = mountTags(100)
    control.style.setProperty('--xh-tags-input-control-max-h', '80px')

    expect(height(control)).toBe(80)
    expect(reachDown(control)).toBe(control.scrollHeight - control.clientHeight)
  })
})

describe('多行输入：自增高的框不会一直长高', () => {
  // autoSize 量完内容把高度写进内联 style，同时把输入框自己那条纵滚关掉；
  // 没给 maxRows 时这个数没有上限，这里照它写下的形状复现。
  function mountArea(px: number, autoResize = true): HTMLElement {
    mount(`
      <div data-scope="text-field" data-part="root">
        <div data-scope="text-field" data-part="control" id="control">
          <textarea
            data-scope="text-field" data-part="input" data-multiline
            ${autoResize ? 'data-auto-resize' : ''}
            style="block-size: ${px}px; overflow-y: hidden"></textarea>
        </div>
      </div>`)
    return pick('#control')
  }

  it('行数少时按内容收，行数多时停在上限上', () => {
    const cap = tokenPx('--xh-viewport-h-sm')
    const short = height(mountArea(100))

    expect(short).toBeGreaterThan(0)
    expect(short).toBeLessThan(cap)
    expect(height(mountArea(900))).toBe(cap)
    expect(height(mountArea(3000))).toBe(cap)
  })

  it('上限之后的行是滚出来的，不是被裁掉取不回', () => {
    const control = mountArea(900)

    expect(control.scrollHeight).toBeGreaterThan(control.clientHeight)
    expect(reachDown(control)).toBe(control.scrollHeight - control.clientHeight)
  })

  it('没开自增高的多行框不受这条上限管：高度由使用者拖出来', () => {
    const control = mountArea(900, false)

    expect(getComputedStyle(control).maxBlockSize).toBe('none')
    expect(height(control)).toBeGreaterThan(tokenPx('--xh-viewport-h-sm'))
  })
})

describe('文件上传：文件列表不会一直长高', () => {
  function mountList(n: number): HTMLElement {
    mount(`
      <div data-scope="file-upload" data-part="root">
        <div data-scope="file-upload" data-part="dropzone">拖到这里</div>
        <ul data-scope="file-upload" data-part="list" id="list">
          ${rep(n, i => `<li data-scope="file-upload" data-part="item"><span data-scope="file-upload" data-part="item-name">文件${i}.png</span><span data-scope="file-upload" data-part="item-size-text">12 KB</span><button data-scope="file-upload" data-part="item-delete-trigger"></button></li>`)}
        </ul>`)
    return pick('#list')
  }

  it('一两个文件时按内容收，几十个时停在上限上', () => {
    const cap = tokenPx('--xh-viewport-h-md')
    const one = height(mountList(1))

    expect(one).toBeGreaterThan(0)
    expect(one).toBeLessThan(cap)
    expect(height(mountList(30))).toBe(cap)
    expect(height(mountList(200))).toBe(cap)
  })

  it('上限之后的文件行是滚出来的，不是被裁掉取不回', () => {
    const list = mountList(30)

    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight)
    expect(reachDown(list)).toBe(list.scrollHeight - list.clientHeight)
  })
})
