import type { Service } from '@xihan-ui/core'
// @vitest-environment jsdom
import type { RatingSchema } from '../src/rating'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clampRating,
  connectRating,
  ratingIntentFromKey,
  ratingMachine,
  ratingMax,
  ratingStep,
  ratingValueAtPointer,
  stepRating,
} from '../src/rating'

type Props = RatingSchema['props']

interface Harness {
  service: Service<RatingSchema>
  setProps: (next: Props) => void
}

function makeService(initial: Props = {}): Harness {
  let props = initial
  const runtime = createVanillaRuntime()
  const service = createService(ratingMachine, { props: () => props, runtime })
  runtime.start()
  return {
    service,
    setProps: (next) => {
      props = { ...props, ...next }
      // 受控值是从外面写进来的，不经 set；推一下让订阅者按新 props 重算
      service.context.set('value', service.context.get('value'))
    },
  }
}

/** connect 每次都要重取：它在调用那一刻把 context 读成一份快照，send 之后旧的那份就过期了。 */
function api(service: Service<RatingSchema>) {
  return connectRating(service, normalizeProps)
}

function itemAttrs(service: Service<RatingSchema>, index: number): Record<string, unknown> {
  return api(service).getItemProps({ value: index }) as Record<string, unknown>
}

function controlAttrs(service: Service<RatingSchema>): Record<string, unknown> {
  return api(service).getControlProps() as Record<string, unknown>
}

/** 每颗星的点亮情况，'●' 全亮、'◐' 半亮、'○' 不亮。一行字比五组断言好读。 */
function litPattern(service: Service<RatingSchema>): string {
  const a = api(service)
  return a.items
    .map((i) => {
      const s = a.getItemState({ value: i })
      return s.half ? '◐' : s.highlighted ? '●' : '○'
    })
    .join('')
}

// —— 纯函数 ——

describe('评分的值算术', () => {
  it('档位由 allowHalf 决定，count 默认 5 且挡得住脏输入', () => {
    expect(ratingStep(false)).toBe(1)
    expect(ratingStep(true)).toBe(0.5)
    expect(ratingMax()).toBe(5)
    expect(ratingMax(10)).toBe(10)
    // 负数与非数不该变成一条"负长度"的星带
    expect(ratingMax(-3)).toBe(0)
    expect(ratingMax(Number.NaN)).toBe(0)
    // 半颗星是档位不是颗数：4.5 颗星没有意义，向下取整
    expect(ratingMax(4.5)).toBe(4)
  })

  it('clampRating 把宿主写进来的任何数钉回合法档位', () => {
    expect(clampRating(3, 5)).toBe(3)
    // 越界值必须夹回来：不夹的话每颗星都会点亮，aria-checked 还会落在不存在的条目上
    expect(clampRating(99, 5)).toBe(5)
    expect(clampRating(-2, 5)).toBe(0)
    expect(clampRating(Number.NaN, 5)).toBe(0)
    // allowHalf 关着时半档要归整，否则会渲染出一颗不该出现的半星
    expect(clampRating(2.5, 5, false)).toBe(3)
    expect(clampRating(2.4, 5, false)).toBe(2)
    // allowHalf 开着时半档原样保留，其它小数就近归到半档
    expect(clampRating(2.5, 5, true)).toBe(2.5)
    expect(clampRating(2.3, 5, true)).toBe(2.5)
    expect(clampRating(2.2, 5, true)).toBe(2)
  })

  it('stepRating 走一档，两端都停住', () => {
    expect(stepRating(3, 1, 5)).toBe(4)
    expect(stepRating(3, -1, 5)).toBe(2)
    expect(stepRating(0.5, 1, 5, true)).toBe(1)
    expect(stepRating(1, -1, 5, true)).toBe(0.5)
    // 到顶了再按不该越过去，也不该回绕到最小
    expect(stepRating(5, 1, 5)).toBe(5)
    // 下界是一档不是 0：0 表示"还没评"，没有星承载得了它
    expect(stepRating(1, -1, 5)).toBe(1)
    expect(stepRating(0.5, -1, 5, true)).toBe(0.5)
    // 从"还没评"出发，任一方向都是踏上这条标尺
    expect(stepRating(0, 1, 5)).toBe(1)
    expect(stepRating(0, -1, 5)).toBe(1)
    // 一颗星都没有时无处可去
    expect(stepRating(0, 1, 0)).toBe(0)
  })
})

describe('ratingIntentFromKey', () => {
  it('上/右加一档，下/左减一档', () => {
    expect(ratingIntentFromKey({ key: 'ArrowUp' })).toEqual({ kind: 'step', direction: 1 })
    expect(ratingIntentFromKey({ key: 'ArrowRight' })).toEqual({ kind: 'step', direction: 1 })
    expect(ratingIntentFromKey({ key: 'ArrowDown' })).toEqual({ kind: 'step', direction: -1 })
    expect(ratingIntentFromKey({ key: 'ArrowLeft' })).toEqual({ kind: 'step', direction: -1 })
  })

  it('rtl 只对调左右，上下不受影响', () => {
    expect(ratingIntentFromKey({ key: 'ArrowRight' }, 'rtl')).toEqual({ kind: 'step', direction: -1 })
    expect(ratingIntentFromKey({ key: 'ArrowLeft' }, 'rtl')).toEqual({ kind: 'step', direction: 1 })
    expect(ratingIntentFromKey({ key: 'ArrowUp' }, 'rtl')).toEqual({ kind: 'step', direction: 1 })
    expect(ratingIntentFromKey({ key: 'ArrowDown' }, 'rtl')).toEqual({ kind: 'step', direction: -1 })
  })

  it('home/End 取两端，不认识的键与带修饰键的组合一律不接', () => {
    expect(ratingIntentFromKey({ key: 'Home' })).toEqual({ kind: 'min' })
    expect(ratingIntentFromKey({ key: 'End' })).toEqual({ kind: 'max' })
    expect(ratingIntentFromKey({ key: 'a' })).toBeNull()
    // Ctrl+Home 是"跳到文档顶部"，吞掉它等于抢了浏览器与读屏的快捷键
    expect(ratingIntentFromKey({ key: 'Home', ctrlKey: true })).toBeNull()
    expect(ratingIntentFromKey({ key: 'ArrowRight', metaKey: true })).toBeNull()
    expect(ratingIntentFromKey({ key: 'ArrowRight', altKey: true })).toBeNull()
    expect(ratingIntentFromKey({ key: 'ArrowRight', shiftKey: true })).toBeNull()
  })
})

describe('ratingValueAtPointer', () => {
  it('allowHalf 时左半边算半颗，右半边算整颗', () => {
    expect(ratingValueAtPointer(3, 4, 20, true)).toBe(2.5)
    expect(ratingValueAtPointer(3, 15, 20, true)).toBe(3)
    // 正中间归半颗：边界总得归一侧，归小的那侧才不会让"没走到"被算成"走到了"
    expect(ratingValueAtPointer(3, 10, 20, true)).toBe(2.5)
  })

  it('rtl 下左右对调', () => {
    expect(ratingValueAtPointer(3, 4, 20, true, 'rtl')).toBe(3)
    expect(ratingValueAtPointer(3, 15, 20, true, 'rtl')).toBe(2.5)
  })

  it('没开 allowHalf、或宽度量不到时一律整颗', () => {
    expect(ratingValueAtPointer(3, 4, 20, false)).toBe(3)
    // 宽度为 0 说明这一帧还没布局：此时的比例只是巧合，不拿它猜半颗
    expect(ratingValueAtPointer(3, 4, 0, true)).toBe(3)
    expect(ratingValueAtPointer(3, Number.NaN, 20, true)).toBe(3)
  })
})

// —— 机器 ——

describe('ratingMachine', () => {
  it('默认没评分，defaultValue 决定初值并夹回合法档位', () => {
    expect(makeService().service.context.get('value')).toBe(0)
    expect(makeService({ defaultValue: 3 }).service.context.get('value')).toBe(3)
  })

  it('步进、取端点都落在合法档位上', () => {
    const { service } = makeService({ defaultValue: 2, count: 5 })
    service.send({ type: 'VALUE.STEP', direction: 1 })
    expect(service.context.get('value')).toBe(3)
    service.send({ type: 'VALUE.TO_MAX' })
    expect(service.context.get('value')).toBe(5)
    service.send({ type: 'VALUE.TO_MIN' })
    expect(service.context.get('value')).toBe(1)
  })

  it('allowHalf 时一档是半颗，Home 取到的最小档也是半颗', () => {
    const { service } = makeService({ defaultValue: 2, allowHalf: true })
    service.send({ type: 'VALUE.STEP', direction: 1 })
    expect(service.context.get('value')).toBe(2.5)
    service.send({ type: 'VALUE.TO_MIN' })
    expect(service.context.get('value')).toBe(0.5)
  })

  it('disabled / readOnly 下用户那几条路都推不动值，程序化 setValue 照走', () => {
    for (const props of [{ disabled: true }, { readOnly: true }]) {
      const { service } = makeService({ defaultValue: 2, ...props })
      service.send({ type: 'VALUE.STEP', direction: 1 })
      service.send({ type: 'VALUE.TO_MAX' })
      service.send({ type: 'ITEM.SELECT', value: 5 })
      expect(service.context.get('value')).toBe(2)
      // 宿主自己写值与"用户能不能改"是两回事
      service.send({ type: 'VALUE.SET', value: 4 })
      expect(service.context.get('value')).toBe(4)
    }
  })

  it('选中半档时焦点锚点落在承载它的那颗星上', () => {
    const { service } = makeService({ allowHalf: true })
    service.send({ type: 'ITEM.SELECT', value: 2.5 })
    expect(service.context.get('value')).toBe(2.5)
    // 值是 2.5，但能被聚焦的是第 3 颗星
    expect(service.context.get('focusedValue')).toBe(3)
  })

  it('悬停只改预览值，不碰评分；离开即复位', () => {
    const onHoverChange = vi.fn()
    const { service } = makeService({ defaultValue: 1, onHoverChange })
    service.send({ type: 'ITEM.HOVER', value: 4 })
    expect(service.context.get('hoveredValue')).toBe(4)
    expect(service.context.get('value')).toBe(1)
    expect(onHoverChange).toHaveBeenLastCalledWith({ value: 4 })

    service.send({ type: 'HOVER.CLEAR' })
    expect(service.context.get('hoveredValue')).toBeNull()
    expect(onHoverChange).toHaveBeenLastCalledWith({ value: null })
  })

  it('没悬停过就收预览不发空通知', () => {
    const onHoverChange = vi.fn()
    const { service } = makeService({ onHoverChange })
    service.send({ type: 'HOVER.CLEAR' })
    expect(onHoverChange).not.toHaveBeenCalled()
  })

  it('受控 value：内部不落值，只发 onValueChange', () => {
    const onValueChange = vi.fn()
    const { service, setProps } = makeService({ value: 2, onValueChange })
    service.send({ type: 'VALUE.STEP', direction: 1 })
    // 宿主没写回，界面就不该自作主张
    expect(service.context.get('value')).toBe(2)
    expect(onValueChange).toHaveBeenCalledWith({ value: 3 })

    setProps({ value: 4 })
    expect(service.context.get('value')).toBe(4)
  })
})

// —— connect ——

describe('connectRating', () => {
  it('control 是 radiogroup，三个 aria 布尔显式给出', () => {
    const { service } = makeService({ required: true })
    const control = controlAttrs(service)
    expect(control.role).toBe('radiogroup')
    expect(control['data-scope']).toBe('rating')
    expect(control['data-part']).toBe('control')
    expect(control['aria-orientation']).toBe('horizontal')
    // 省略是"没说"，显式 false 是"明确说了不是"
    expect(control['aria-disabled']).toBe('false')
    expect(control['aria-readonly']).toBe('false')
    expect(control['aria-required']).toBe('true')
    expect(control['aria-labelledby']).toBe((api(service).getLabelProps() as Record<string, unknown>).id)
  })

  it('条目报得出自己是第几颗、一共几颗', () => {
    const { service } = makeService({ count: 4 })
    const third = itemAttrs(service, 3)
    expect(third.role).toBe('radio')
    expect(third['aria-posinset']).toBe(3)
    expect(third['aria-setsize']).toBe(4)
    expect(third['data-value']).toBe('3')
    expect(api(service).items).toEqual([1, 2, 3, 4])
  })

  it('评 3 分：前三颗点亮，aria-checked 只落在第 3 颗上', () => {
    const { service } = makeService({ defaultValue: 3 })
    expect(litPattern(service)).toBe('●●●○○')
    expect(itemAttrs(service, 3)['aria-checked']).toBe('true')
    expect(itemAttrs(service, 3)['data-state']).toBe('checked')
    expect(itemAttrs(service, 2)['aria-checked']).toBe('false')
    expect(itemAttrs(service, 4)['data-highlighted']).toBeUndefined()
  })

  it('半档：承载它的那颗星既点亮又带 data-half', () => {
    const { service } = makeService({ defaultValue: 2.5, allowHalf: true })
    expect(litPattern(service)).toBe('●●◐○○')
    const third = itemAttrs(service, 3)
    expect(third['data-half']).toBe('')
    expect(third['data-highlighted']).toBe('')
    // 半档没有独立的 radio 可承载，读屏念的是承载它的那一颗
    expect(third['aria-checked']).toBe('true')
    expect(itemAttrs(service, 2)['data-half']).toBeUndefined()
  })

  it('allowHalf 关着时，宿主硬塞进来的半档被归整', () => {
    const { service } = makeService({ value: 2.5 })
    expect(api(service).value).toBe(3)
    expect(litPattern(service)).toBe('●●●○○')
    expect(itemAttrs(service, 3)['data-half']).toBeUndefined()
  })

  it('宿主写进来的越界值在 connect 这一层就被夹回去', () => {
    const { service } = makeService({ value: 99, count: 5 })
    const a = api(service)
    expect(a.value).toBe(5)
    expect(a.highlightedValue).toBe(5)
    // 夹不住的话 aria-checked 会落在第 99 颗星上，也就是谁都没有
    expect(itemAttrs(service, 5)['aria-checked']).toBe('true')
  })

  it('悬停预览只改点亮范围，aria-checked 与真实值纹丝不动', () => {
    const { service } = makeService({ defaultValue: 1 })
    service.send({ type: 'ITEM.HOVER', value: 4 })
    expect(litPattern(service)).toBe('●●●●○')
    const a = api(service)
    expect(a.value).toBe(1)
    expect(a.hoveredValue).toBe(4)
    expect(a.highlightedValue).toBe(4)
    // 预览期间读屏念的仍是用户真正选过的那一颗
    expect(itemAttrs(service, 1)['aria-checked']).toBe('true')
    expect(itemAttrs(service, 4)['aria-checked']).toBe('false')

    service.send({ type: 'HOVER.CLEAR' })
    expect(litPattern(service)).toBe('●○○○○')
  })

  it('只读：留在 Tab 序列里、条目仍可聚焦，但不给悬停预览', () => {
    const { service } = makeService({ defaultValue: 2, readOnly: true })
    const control = controlAttrs(service)
    expect(control.tabindex).toBe(0)
    expect(control['aria-readonly']).toBe('true')
    expect(control['data-readonly']).toBe('')
    // 锚点那颗星照样占着 Tab 位
    expect(itemAttrs(service, 2).tabindex).toBe(0)
    expect(itemAttrs(service, 1).tabindex).toBe(-1)
    // 悬停守卫会挡住 ITEM.HOVER；就算机器里留着上一次的预览值，connect 也不认
    service.send({ type: 'ITEM.HOVER', value: 5 })
    expect(api(service).hoveredValue).toBeNull()
    expect(litPattern(service)).toBe('●●○○○')
  })

  it('禁用：整条带子退出 Tab 序列，这正是它与只读的分界', () => {
    const { service } = makeService({ defaultValue: 2, disabled: true })
    const control = controlAttrs(service)
    expect(control.tabindex).toBeUndefined()
    expect(control['aria-disabled']).toBe('true')
    const second = itemAttrs(service, 2)
    expect(second.tabindex).toBeUndefined()
    expect(second['aria-disabled']).toBe('true')
    // 集合条目绝不输出原生 disabled：那样连聚焦与派事件都做不到，样式也得另写一套
    expect(second.disabled).toBeUndefined()
  })

  it('一颗星都没评时无人认领 Tab 位，由 control 兜底', () => {
    const { service } = makeService()
    expect(controlAttrs(service).tabindex).toBe(0)
    expect(itemAttrs(service, 1).tabindex).toBe(-1)

    // 焦点进带内后 control 让位，Tab 才能正常离开这一组
    service.send({ type: 'ITEM.FOCUS', index: 1 })
    expect(controlAttrs(service).tabindex).toBe(-1)
    expect(itemAttrs(service, 1).tabindex).toBe(0)
  })

  it('锚点跟焦点走：受控且宿主没写回时，Tab 位停在被点过的那颗星上', () => {
    const { service } = makeService({ value: 1 })
    service.send({ type: 'ITEM.FOCUS', index: 4 })
    expect(itemAttrs(service, 4).tabindex).toBe(0)
    // 选中值仍由宿主持有
    expect(itemAttrs(service, 1)['aria-checked']).toBe('true')
    expect(itemAttrs(service, 4)['aria-checked']).toBe('false')

    service.send({ type: 'CONTROL.BLUR' })
    expect(itemAttrs(service, 1).tabindex).toBe(0)
    expect(itemAttrs(service, 4).tabindex).toBe(-1)
  })

  it('表单影子：name 给了才提交，没评分时提交空串', () => {
    const { service } = makeService({ name: 'score', required: true })
    const input = api(service).getHiddenInputProps() as Record<string, unknown>
    expect(input.name).toBe('score')
    expect(input.type).toBe('text')
    expect(input.tabindex).toBe(-1)
    expect(input['aria-hidden']).toBe(true)
    expect(input.required).toBe(true)
    // readonly 会让原生校验整个跳过这个字段，required 就永远不生效
    expect(input.readonly).toBeUndefined()
    // "0" 在原生校验眼里是有值的，required 便拦不住"一颗都没点"
    expect(input.value).toBe('')

    service.send({ type: 'VALUE.SET', value: 3 })
    expect((api(service).getHiddenInputProps() as Record<string, unknown>).value).toBe('3')
  })

  it('没给 name 就不产出该属性，这份输入不参与提交', () => {
    const { service } = makeService()
    expect((api(service).getHiddenInputProps() as Record<string, unknown>).name).toBeUndefined()
  })
})

// —— connect 的事件处理器（要活 DOM）——

interface Mounted {
  control: HTMLElement
  items: HTMLElement[]
}

const mounted: HTMLElement[] = []

afterEach(() => {
  for (const el of mounted.splice(0)) el.remove()
})

/** 铺一条最小的星带：只写导航要用到的身份属性，其余由被测处理器自己去读。 */
function mountControl(count = 5): Mounted {
  const control = document.createElement('div')
  control.setAttribute('data-scope', 'rating')
  control.setAttribute('data-part', 'control')
  const items: HTMLElement[] = []
  for (let i = 1; i <= count; i++) {
    const item = document.createElement('span')
    item.setAttribute('data-scope', 'rating')
    item.setAttribute('data-part', 'item')
    item.setAttribute('data-value', String(i))
    item.setAttribute('tabindex', '-1')
    control.append(item)
    items.push(item)
  }
  document.body.append(control)
  mounted.push(control)
  return { control, items }
}

function pressKey(service: Service<RatingSchema>, control: HTMLElement, key: string): { prevented: boolean } {
  const handler = controlAttrs(service).onKeyDown as (e: unknown) => void
  let prevented = false
  handler({ key, currentTarget: control, preventDefault: () => void (prevented = true) })
  return { prevented }
}

describe('connectRating 的键盘处理器', () => {
  it('方向键走一档，焦点跟着落到承载新值的那颗星上', () => {
    const { service } = makeService({ defaultValue: 2 })
    const { control, items } = mountControl()

    expect(pressKey(service, control, 'ArrowRight').prevented).toBe(true)
    expect(service.context.get('value')).toBe(3)
    expect(document.activeElement).toBe(items[2])

    pressKey(service, control, 'ArrowDown')
    expect(service.context.get('value')).toBe(2)
    expect(document.activeElement).toBe(items[1])
  })

  it('allowHalf 时半档也有落脚的星', () => {
    const { service } = makeService({ defaultValue: 2, allowHalf: true })
    const { control, items } = mountControl()
    pressKey(service, control, 'ArrowUp')
    expect(service.context.get('value')).toBe(2.5)
    // 2.5 挂在第 3 颗上
    expect(document.activeElement).toBe(items[2])
  })

  it('home/End 取两端', () => {
    const { service } = makeService({ defaultValue: 2 })
    const { control, items } = mountControl()
    pressKey(service, control, 'End')
    expect(service.context.get('value')).toBe(5)
    expect(document.activeElement).toBe(items[4])
    pressKey(service, control, 'Home')
    expect(service.context.get('value')).toBe(1)
    expect(document.activeElement).toBe(items[0])
  })

  it('不归评分管的键不吞：值不动，也不 preventDefault', () => {
    const { service } = makeService({ defaultValue: 2 })
    const { control } = mountControl()
    // 吞掉它就等于把页面滚动、读屏快捷键一并吞了
    expect(pressKey(service, control, 'PageUp').prevented).toBe(false)
    expect(service.context.get('value')).toBe(2)
  })

  it('disabled / readOnly 下键盘既不改值也不吞键', () => {
    for (const props of [{ disabled: true }, { readOnly: true }]) {
      const { service } = makeService({ defaultValue: 2, ...props })
      const { control } = mountControl()
      const { prevented } = pressKey(service, control, 'ArrowRight')
      expect(service.context.get('value')).toBe(2)
      expect(prevented).toBe(false)
    }
  })

  it('受控且宿主没写回：值不动，焦点也不动', () => {
    const { service } = makeService({ value: 2 })
    const { control, items } = mountControl()
    items[0]!.focus()
    pressKey(service, control, 'ArrowRight')
    // 值没变，承载它的仍是第 2 颗，焦点便落在那里而不是第 3 颗
    expect(service.context.get('value')).toBe(2)
    expect(document.activeElement).toBe(items[1])
  })
})

describe('connectRating 的指针处理器', () => {
  /** jsdom 没有布局，clientWidth 恒为 0，因此指针一路只会产出整颗。 */
  function pointerEvent(el: HTMLElement, offsetX = 0): unknown {
    return { currentTarget: el, offsetX }
  }

  it('点条目即选中，条目自报的序号就是新值', () => {
    const { service } = makeService()
    const { items } = mountControl()
    const onClick = itemAttrs(service, 3).onClick as (e: unknown) => void
    onClick(pointerEvent(items[2]!))
    expect(service.context.get('value')).toBe(3)
    expect(service.context.get('focusedValue')).toBe(3)
  })

  it('指针划过条目起预览，离开评分带即复位', () => {
    const { service } = makeService({ defaultValue: 1 })
    const { items } = mountControl()
    const onPointerMove = itemAttrs(service, 4).onPointerMove as (e: unknown) => void
    onPointerMove(pointerEvent(items[3]!))
    expect(service.context.get('hoveredValue')).toBe(4)
    expect(service.context.get('value')).toBe(1)

    ;(controlAttrs(service).onPointerLeave as () => void)()
    expect(service.context.get('hoveredValue')).toBeNull()
  })

  it('指针被系统抢走同样收起预览，不留一片亮着的星', () => {
    const { service } = makeService()
    const { items } = mountControl()
    ;(itemAttrs(service, 5).onPointerMove as (e: unknown) => void)(pointerEvent(items[4]!))
    expect(service.context.get('hoveredValue')).toBe(5)
    ;(controlAttrs(service).onPointerCancel as () => void)()
    expect(service.context.get('hoveredValue')).toBeNull()
  })

  it('disabled 时点击与划过都不认', () => {
    const { service } = makeService({ defaultValue: 1, disabled: true })
    const { items } = mountControl()
    const attrs = itemAttrs(service, 4)
    ;(attrs.onClick as (e: unknown) => void)(pointerEvent(items[3]!))
    ;(attrs.onPointerMove as (e: unknown) => void)(pointerEvent(items[3]!))
    expect(service.context.get('value')).toBe(1)
    expect(api(service).hoveredValue).toBeNull()
  })
})

describe('评分 · 每颗星的名字', () => {
  it('没给文案就不发名字，作者标在星星上的那句自己当名字', () => {
    const { service } = makeService({ defaultValue: 3, count: 5 })
    // 星里只有符号时名字会随高亮在两个符号间变，所以留了文案位；但写死一句会把作者
    // 标在星星上的那句盖掉，读屏念到的就不是屏幕上的东西——不给就不发。
    expect(itemAttrs(service, 2)['aria-label']).toBeUndefined()
    expect(itemAttrs(service, 4)['aria-label']).toBeUndefined()
  })

  it('文案拿得到档位与总数，作者给了就用作者那份', () => {
    const { service } = makeService({ count: 4, translations: { item: (value, count) => `${count} 分里的 ${value} 分` } })
    expect(itemAttrs(service, 3)['aria-label']).toBe('4 分里的 3 分')
  })
})
