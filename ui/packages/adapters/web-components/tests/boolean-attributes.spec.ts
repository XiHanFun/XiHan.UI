// @vitest-environment jsdom
// 布尔 attribute 一律三态：不写交给缺省、显式 "false" 为假、其余为真，全部元素共用 dom/converters 那一个转换器。
import { describe, expect, it } from 'vitest'
import { XhBackgroundElement } from '../src/backgrounds'
import * as defined from '../src/define'
import { BOOLEAN_CONVERTER } from '../src/dom/converters'
import { XhReactiveElement } from '../src/reactive/element'

defined.defineXhElements()

type ElementClass = typeof XhReactiveElement & { elementProperties: Map<string, { type?: unknown, converter?: unknown }> }

const exported: unknown[] = [...Object.values(defined), XhBackgroundElement]
const classes = exported.filter((value): value is ElementClass => typeof value === 'function' && value.prototype instanceof XhReactiveElement)

/** 读法与三态布尔一模一样的转换器：缺席、空串、"false"、"true"、数字与别的值逐一比（autoplay 认毫秒数、checked 认 indeterminate）。 */
function readsLikeTriState(converter: unknown): boolean {
  const from = typeof converter === 'function' ? converter : (converter as { fromAttribute?: unknown } | undefined)?.fromAttribute
  if (typeof from !== 'function')
    return false
  return ([null, '', 'false', 'true', '3000', 'indeterminate', 'x'] as const).every(value => Object.is(from(value), BOOLEAN_CONVERTER.fromAttribute(value)))
}

describe('布尔 attribute 三态', () => {
  it('没有元素再用原生布尔的 type: Boolean', () => {
    // 先读 observedAttributes 让各元素的属性声明定稿
    for (const ctor of classes)
      void (ctor as unknown as { observedAttributes: string[] }).observedAttributes
    const native = classes.flatMap(ctor => [...ctor.elementProperties].filter(([, options]) => options.type === Boolean).map(([name]) => `${ctor.name}.${name}`))
    expect(native).toEqual([])
  })

  it('三态布尔只有 dom/converters 这一份，元素里不再各写一份', () => {
    const copies = classes.flatMap(ctor => [...ctor.elementProperties]
      .filter(([, options]) => options.converter !== BOOLEAN_CONVERTER && readsLikeTriState(options.converter))
      .map(([name]) => `${ctor.name}.${name}`))
    expect(copies).toEqual([])
  })

  it.each([
    ['xh-button', 'disabled', 'disabled'],
    ['xh-tabs', 'lazy-mount', 'lazyMount'],
    ['xh-citation', 'loop', 'loop'],
  ])('%s 的 %s：="false" 为假、空串为真、移除回到缺省', async (tag, attribute, property) => {
    const el = document.createElement(tag) as HTMLElement & Record<string, unknown> & { updateComplete: Promise<unknown> }
    document.body.append(el)
    el.setAttribute(attribute, 'false')
    expect(el[property]).toBe(false)
    el.setAttribute(attribute, '')
    expect(el[property]).toBe(true)
    el.removeAttribute(attribute)
    expect(el[property]).toBeUndefined()
    el.remove()
  })
})
