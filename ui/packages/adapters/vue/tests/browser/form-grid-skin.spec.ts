// 表单的网格档：列数与跨列都只在 CSS 里兑现，jsdom 只看得见属性落没落。
// 这里查真浏览器算出来的轨道表与每一格的起止列线——没有它，皮肤规则写反了也没人知道。
import type { FormFieldSpan } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhFormFieldGroup, XhFormRoot } from '../../src'
// 皮肤要一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 挂一张固定宽度的表单，宽度写死才好数轨道 */
function mount(rootProps: Record<string, unknown>, spans: Array<FormFieldSpan | undefined>): void {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  host.style.inlineSize = '600px'
  document.body.append(host)
  app = createApp({
    setup: () => () => h(
      XhFormRoot,
      { ...rootProps, style: 'inline-size: 600px' },
      () => spans.map((span, i) => h(XhFormFieldGroup, { key: i, value: `f${i}`, span }, () => [])),
    ) as never,
  })
  app.mount(host)
}

function root(): HTMLElement {
  const el = document.querySelector<HTMLElement>('[data-scope="form"][data-part="root"]')
  if (!el)
    throw new Error('找不到表单根')
  return el
}

function groups(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="form"][data-part="field-group"]')]
}

/** 第 n 个字段容器；取不到就当场报错，省掉逐处的空值判断 */
function group(index: number): HTMLElement {
  const el = groups()[index]
  if (!el)
    throw new Error(`没有第 ${index} 个字段容器`)
  return el
}

describe('form 网格档的皮肤', () => {
  it('缺省竖排不是网格', () => {
    mount({}, [undefined])
    expect(getComputedStyle(root()).display).toBe('flex')
  })

  it('两列排成两条等宽轨道', () => {
    mount({ layout: 'grid', columns: 2 }, [undefined, undefined])
    const style = getComputedStyle(root())
    expect(style.display).toBe('grid')
    expect(style.gridTemplateColumns.split(' ')).toHaveLength(2)
  })

  it('不给列数就一列', () => {
    mount({ layout: 'grid' }, [undefined])
    expect(getComputedStyle(root()).gridTemplateColumns.split(' ')).toHaveLength(1)
  })

  it('span=full 的字段占满整行，同排的普通字段只占一列', () => {
    mount({ layout: 'grid', columns: 2 }, [undefined, 'full'])
    const normal = group(0)
    const full = group(1)
    expect(getComputedStyle(normal).gridColumnEnd).toBe('auto')
    expect(getComputedStyle(full).gridColumnStart).toBe('1')
    expect(getComputedStyle(full).gridColumnEnd).toBe('-1')
    expect(full.getBoundingClientRect().width).toBeGreaterThan(normal.getBoundingClientRect().width * 1.8)
  })

  it('数字跨列落成 span N，实测宽度就是两格', () => {
    mount({ layout: 'grid', columns: 3 }, [2, undefined])
    const wide = group(0)
    const one = group(1)
    expect(getComputedStyle(wide).gridColumnEnd).toBe('span 2')
    // 三列 600px 的表单：一格约 200px，跨两格连着中间那道 gap 明显更宽
    expect(wide.getBoundingClientRect().width).toBeGreaterThan(one.getBoundingClientRect().width * 1.8)
  })
})
