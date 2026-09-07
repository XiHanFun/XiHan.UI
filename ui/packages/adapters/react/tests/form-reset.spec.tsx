// @vitest-environment jsdom
//
// 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhCheckbox,
  XhCheckboxGroupItem,
  XhCheckboxGroupRoot,
  XhComboboxClearTrigger,
  XhComboboxControl,
  XhComboboxHiddenInput,
  XhComboboxInput,
  XhComboboxRoot,
  XhDateFieldClearTrigger,
  XhDateFieldControl,
  XhDateFieldHiddenInput,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
  XhDatePickerClearTrigger,
  XhDatePickerControl,
  XhDatePickerHiddenInput,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayRoot,
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperHiddenInput,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPinInputHiddenInput,
  XhPinInputInput,
  XhPinInputRoot,
  XhRadioGroupItem,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingHiddenInput,
  XhRatingItem,
  XhRatingRoot,
  XhSegmentedItem,
  XhSegmentedRoot,
  XhSignaturePadControl,
  XhSignaturePadHiddenInput,
  XhSignaturePadPath,
  XhSignaturePadRoot,
  XhSwitch,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputRoot,
  XhTextFieldInput,
  XhTextFieldRoot,
  XhTimeFieldClearTrigger,
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
  XhTimePickerClearTrigger,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
  XhToggleGroupItem,
  XhToggleGroupRoot,
  XhTreeSelectClearTrigger,
  XhTreeSelectControl,
  XhTreeSelectHiddenInput,
  XhTreeSelectRoot,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: React.ReactNode): HTMLFormElement {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(<form>{node}</form>))
  return host.querySelector('form')!
}

const track = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="switch"][data-part="root"]')!

describe('原生表单重置', () => {
  it('非受控：重置回到 defaultChecked', () => {
    const form = mount(<XhSwitch name="notify" defaultChecked={false} />)
    act(() => track().click())
    expect(track().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(track().getAttribute('aria-checked')).toBe('false')
  })

  it('宿主没写 defaultChecked 时不把它抹成兜底空值以外的东西', () => {
    const form = mount(<XhSwitch name="notify" defaultChecked />)
    act(() => track().click())
    expect(track().getAttribute('aria-checked')).toBe('false')
    act(() => form.reset())
    expect(track().getAttribute('aria-checked')).toBe('true')
  })

  it('复选框：重置回到 defaultChecked，锚点在带文字时的 <label> 上也接得住', () => {
    const box = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="checkbox"][data-part="root"]')!
    const form = mount(<XhCheckbox name="agree" defaultChecked={false}>同意条款</XhCheckbox>)
    act(() => box().click())
    expect(box().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(box().getAttribute('aria-checked')).toBe('false')
  })

  it('复选框：半选也由重置还原', () => {
    const box = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="checkbox"][data-part="root"]')!
    const form = mount(<XhCheckbox name="agree" defaultChecked="indeterminate" />)
    act(() => box().click())
    expect(box().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(box().getAttribute('aria-checked')).toBe('mixed')
  })
})

/** 组与容器的锚点不在单件那种壳上，而是根部件自己渲的那个节点，单独核一遍它接住了没有。 */
describe('组与容器的原生表单重置', () => {
  const items = (scope: string): HTMLElement[] =>
    [...host!.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="item"]`)]

  it('复选框组：重置回到 defaultValue', () => {
    const form = mount(
      <XhCheckboxGroupRoot name="topping" defaultValue={['a']}>
        <XhCheckboxGroupItem value="a" />
        <XhCheckboxGroupItem value="b" />
      </XhCheckboxGroupRoot>,
    )
    act(() => items('checkbox-group')[1]!.click())
    expect(items('checkbox-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'true'])
    act(() => form.reset())
    expect(items('checkbox-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('单选组：重置回到 defaultValue', () => {
    const form = mount(
      <XhRadioGroupRoot name="size" defaultValue="a">
        <XhRadioGroupItem value="a" />
        <XhRadioGroupItem value="b" />
      </XhRadioGroupRoot>,
    )
    act(() => items('radio-group')[1]!.click())
    expect(items('radio-group').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    act(() => form.reset())
    expect(items('radio-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('开关组：重置回到 defaultValue', () => {
    const form = mount(
      <XhToggleGroupRoot name="align" defaultValue="a">
        <XhToggleGroupItem value="a">左</XhToggleGroupItem>
        <XhToggleGroupItem value="b">右</XhToggleGroupItem>
      </XhToggleGroupRoot>,
    )
    act(() => items('toggle-group')[1]!.click())
    expect(items('toggle-group').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    act(() => form.reset())
    expect(items('toggle-group').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('分段控件：重置回到 defaultValue', () => {
    const form = mount(
      <XhSegmentedRoot name="range" defaultValue="day">
        <XhSegmentedItem value="day">日</XhSegmentedItem>
        <XhSegmentedItem value="month">月</XhSegmentedItem>
      </XhSegmentedRoot>,
    )
    act(() => items('segmented')[1]!.click())
    expect(items('segmented').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    act(() => form.reset())
    expect(items('segmented').map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('动态录入：重置回到 defaultValue 的行数', () => {
    const rows = (): number => items('field-array').length
    const form = mount(
      <XhFieldArrayRoot name="tags" defaultValue={['甲']}>
        {({ items: rowList }) => (
          <>
            {rowList.map(row => <XhFieldArrayItem key={row.key} index={row.index} />)}
            <XhFieldArrayAddTrigger>加一行</XhFieldArrayAddTrigger>
          </>
        )}
      </XhFieldArrayRoot>,
    )
    act(() => host!.querySelector<HTMLButtonElement>('[data-scope="field-array"][data-part="add-trigger"]')!.click())
    expect(rows()).toBe(2)
    act(() => form.reset())
    expect(rows()).toBe(1)
  })

  it('评分：重置回到 defaultValue，表单影子随之还原', () => {
    const shadow = (): HTMLInputElement =>
      host!.querySelector<HTMLInputElement>('[data-scope="rating"][data-part="hidden-input"]')!
    const form = mount(
      <XhRatingRoot name="score" defaultValue={2}>
        <XhRatingControl>
          <XhRatingItem value={1} />
          <XhRatingItem value={2} />
          <XhRatingItem value={3} />
        </XhRatingControl>
        <XhRatingHiddenInput />
      </XhRatingRoot>,
    )
    act(() => items('rating')[2]!.click())
    expect(items('rating').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true'])
    expect(shadow().value).toBe('3')
    act(() => form.reset())
    expect(items('rating').map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(shadow().value).toBe('2')
  })
})

/**
 * 文本输入族：值全攥在机器里，原生 reset 只还原原生控件。
 * 锚点是根部件自己渲的那个 div，单独核它接住了没有——门禁对 React 只做静态串匹配，
 * 核不到 ref 究竟落在哪个节点上。
 */
describe('文本输入族的原生表单重置', () => {
  const part = (scope: string, name: string): HTMLInputElement =>
    host!.querySelector<HTMLInputElement>(`[data-scope="${scope}"][data-part="${name}"]`)!

  /** 真实输入：写进框里再派 input，与用户敲字走同一条路。 */
  const typeInto = (el: HTMLInputElement, text: string): void => {
    act(() => {
      el.value = text
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  const press = (el: HTMLElement, key: string): void => {
    act(() => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    })
  }

  it('文本框：重置回到 defaultValue', () => {
    const form = mount(
      <XhTextFieldRoot name="nickname" defaultValue="阿旺">
        <XhTextFieldInput />
      </XhTextFieldRoot>,
    )
    typeInto(part('text-field', 'input'), '小黑')
    expect(part('text-field', 'input').value).toBe('小黑')
    act(() => form.reset())
    expect(part('text-field', 'input').value).toBe('阿旺')
  })

  it('数字框：重置回到 defaultValue', () => {
    const form = mount(
      <XhNumberFieldRoot name="count" defaultValue="3">
        <XhNumberFieldInput />
      </XhNumberFieldRoot>,
    )
    typeInto(part('number-field', 'input'), '9')
    expect(part('number-field', 'input').value).toBe('9')
    act(() => form.reset())
    expect(part('number-field', 'input').value).toBe('3')
  })

  it('密码框：重置回到 defaultValue', () => {
    const form = mount(
      <XhPasswordInputRoot name="password" defaultValue="a1">
        <XhPasswordInputInput />
      </XhPasswordInputRoot>,
    )
    typeInto(part('password-input', 'input'), 'b2c3')
    expect(part('password-input', 'input').value).toBe('b2c3')
    act(() => form.reset())
    expect(part('password-input', 'input').value).toBe('a1')
  })

  it('分格验证码：重置回到 defaultValue，隐藏输入随之还原', () => {
    const form = mount(
      <XhPinInputRoot name="code" length={3} defaultValue={['1']}>
        <XhPinInputInput index={0} />
        <XhPinInputInput index={1} />
        <XhPinInputInput index={2} />
        <XhPinInputHiddenInput />
      </XhPinInputRoot>,
    )
    typeInto(part('pin-input', 'input'), '9')
    expect(part('pin-input', 'hidden-input').value).toBe('9')
    act(() => form.reset())
    expect(part('pin-input', 'hidden-input').value).toBe('1')
  })

  it('就地编辑：重置回到 defaultValue，预览区跟着还原', () => {
    const preview = (): HTMLElement => host!.querySelector<HTMLElement>('[data-scope="editable"][data-part="preview"]')!
    const form = mount(
      <XhEditableRoot name="nickname" defaultValue="阿旺">
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      </XhEditableRoot>,
    )
    act(() => host!.querySelector<HTMLButtonElement>('[data-scope="editable"][data-part="edit-trigger"]')!.click())
    typeInto(part('editable', 'input'), '小黑')
    act(() => host!.querySelector<HTMLButtonElement>('[data-scope="editable"][data-part="submit-trigger"]')!.click())
    expect(preview().textContent).toBe('小黑')
    act(() => form.reset())
    expect(preview().textContent).toBe('阿旺')
  })

  it('标签输入：重置回到 defaultValue，隐藏输入随之还原', () => {
    const form = mount(
      <XhTagsInputRoot name="stack" defaultValue={['vue']}>
        <XhTagsInputInput />
        <XhTagsInputHiddenInput />
      </XhTagsInputRoot>,
    )
    typeInto(part('tags-input', 'input'), 'react')
    press(part('tags-input', 'input'), 'Enter')
    expect(part('tags-input', 'hidden-input').value).toBe('vue,react')
    act(() => form.reset())
    expect(part('tags-input', 'hidden-input').value).toBe('vue')
  })
})

/**
 * 日期时间族：值同样攥在机器里。
 * 锚点是根部件自己渲的那个 div，逐个核它接住了没有——门禁对 React 只做静态串匹配，
 * 核不到那只 ref 有没有真落到根节点上。
 * 两个选择器还各自内嵌着自己的分段输入机器，那几台也得一并收到重置。
 */
describe('日期时间族的原生表单重置', () => {
  const part = (scope: string, name: string): HTMLInputElement =>
    host!.querySelector<HTMLInputElement>(`[data-scope="${scope}"][data-part="${name}"]`)!

  const clear = (scope: string): void => {
    act(() => host!.querySelector<HTMLButtonElement>(`[data-scope="${scope}"][data-part="clear-trigger"]`)!.click())
  }

  it('分段日期：清空后重置回到 defaultValue', () => {
    const form = mount(
      <XhDateFieldRoot name="due" defaultValue="2024-02-15" locale="zh-CN" timeZone="UTC">
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment index={0} />
            <XhDateFieldSegment index={1} />
            <XhDateFieldSegment index={2} />
          </XhDateFieldSegmentGroup>
          <XhDateFieldClearTrigger>清空</XhDateFieldClearTrigger>
        </XhDateFieldControl>
        <XhDateFieldHiddenInput />
      </XhDateFieldRoot>,
    )
    expect(part('date-field', 'hidden-input').value).toBe('2024-02-15')
    clear('date-field')
    expect(part('date-field', 'hidden-input').value).toBe('')
    act(() => form.reset())
    expect(part('date-field', 'hidden-input').value).toBe('2024-02-15')
  })

  it('分段时间：清空后重置回到 defaultValue', () => {
    const form = mount(
      <XhTimeFieldRoot name="start" defaultValue="09:30">
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
          <XhTimeFieldClearTrigger>清空</XhTimeFieldClearTrigger>
        </XhTimeFieldControl>
        <XhTimeFieldHiddenInput />
      </XhTimeFieldRoot>,
    )
    expect(part('time-field', 'hidden-input').value).toBe('09:30')
    clear('time-field')
    expect(part('time-field', 'hidden-input').value).toBe('')
    act(() => form.reset())
    expect(part('time-field', 'hidden-input').value).toBe('09:30')
  })

  it('时间选择器：清空后重置回到 defaultValue', () => {
    const form = mount(
      <XhTimePickerRoot name="start" defaultValue="09:30" min="08:00" max="11:00" step={30}>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerTrigger>选择</XhTimePickerTrigger>
          <XhTimePickerClearTrigger>清空</XhTimePickerClearTrigger>
        </XhTimePickerControl>
        <XhTimePickerHiddenInput />
      </XhTimePickerRoot>,
    )
    expect(part('time-picker', 'hidden-input').value).toBe('09:30')
    clear('time-picker')
    expect(part('time-picker', 'hidden-input').value).toBe('')
    act(() => form.reset())
    expect(part('time-picker', 'hidden-input').value).toBe('09:30')
  })

  it('日期选择器：清空后重置回到 defaultValue，内嵌那组段位跟着还原', () => {
    const segments = (): string[] =>
      [...host!.querySelectorAll<HTMLElement>('[data-scope="date-field"][data-part="segment"]')]
        .map(el => el.textContent ?? '')
    const form = mount(
      <XhDatePickerRoot name="due" defaultValue="2024-02-15" locale="zh-CN" timeZone="UTC">
        <XhDatePickerControl>
          <XhDatePickerSegmentGroup>
            <XhDatePickerSegment index={0} />
            <XhDatePickerSegment index={1} />
            <XhDatePickerSegment index={2} />
          </XhDatePickerSegmentGroup>
          <XhDatePickerClearTrigger>清空</XhDatePickerClearTrigger>
          <XhDatePickerTrigger>选择</XhDatePickerTrigger>
        </XhDatePickerControl>
        <XhDatePickerHiddenInput />
      </XhDatePickerRoot>,
    )
    expect(part('date-field', 'hidden-input').value).toBe('2024-02-15')
    expect(segments()).toEqual(['2024', '02', '15'])
    clear('date-picker')
    expect(part('date-field', 'hidden-input').value).toBe('')
    act(() => form.reset())
    expect(part('date-field', 'hidden-input').value).toBe('2024-02-15')
    expect(segments()).toEqual(['2024', '02', '15'])
  })
})

/**
 * 集合浮层族：选中值攥在机器里，浮层里那份表单出口只是影子。
 * 锚点是根部件自己渲的那个 div，逐个核它接住了没有——门禁对 React 只做静态串匹配，
 * 核不到那只 ref 有没有真落到根节点上。
 */
describe('集合浮层族的原生表单重置', () => {
  const part = (scope: string, name: string): HTMLInputElement =>
    host!.querySelector<HTMLInputElement>(`[data-scope="${scope}"][data-part="${name}"]`)!

  const clear = (scope: string): void => {
    act(() => host!.querySelector<HTMLButtonElement>(`[data-scope="${scope}"][data-part="clear-trigger"]`)!.click())
  }

  it('组合框：清空后重置回到 defaultValue', () => {
    const form = mount(
      <XhComboboxRoot
        name="fruit"
        defaultValue="apple"
        collection={[{ value: 'apple', label: 'Apple' }, { value: 'pear', label: 'Pear' }]}
      >
        <XhComboboxControl>
          <XhComboboxInput />
          <XhComboboxClearTrigger>清空</XhComboboxClearTrigger>
        </XhComboboxControl>
        <XhComboboxHiddenInput />
      </XhComboboxRoot>,
    )
    expect(part('combobox', 'hidden-input').value).toBe('apple')
    clear('combobox')
    expect(part('combobox', 'hidden-input').value).toBe('')
    act(() => form.reset())
    expect(part('combobox', 'hidden-input').value).toBe('apple')
  })

  it('树形选择：清空后重置回到 defaultValue', () => {
    const form = mount(
      <XhTreeSelectRoot
        name="dir"
        defaultValue="src"
        collection={[{ value: 'src', label: 'Source' }, { value: 'docs', label: 'Docs' }]}
      >
        <XhTreeSelectControl>
          <XhTreeSelectTrigger><XhTreeSelectValueText /></XhTreeSelectTrigger>
          <XhTreeSelectClearTrigger>清空</XhTreeSelectClearTrigger>
        </XhTreeSelectControl>
        <XhTreeSelectHiddenInput />
      </XhTreeSelectRoot>,
    )
    expect(part('tree-select', 'hidden-input').value).toBe('src')
    clear('tree-select')
    expect(part('tree-select', 'hidden-input').value).toBe('')
    act(() => form.reset())
    expect(part('tree-select', 'hidden-input').value).toBe('src')
  })
})

/**
 * 指针拖拽族：裁切矩形与笔迹都攥在机器里，DOM 上只有一份影子输入。
 * 锚点是根部件自己渲的那个 div，逐个核它接住了没有——门禁对 React 只做静态串匹配，
 * 核不到那只 ref 有没有真落到根节点上。
 */
describe('指针拖拽族的原生表单重置', () => {
  const part = (scope: string, name: string): HTMLElement =>
    host!.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!

  const value = (scope: string): string =>
    (part(scope, 'hidden-input') as HTMLInputElement).value

  it('图片裁切：方向键挪过之后，重置回到 defaultValue', () => {
    const form = mount(
      <XhImageCropperRoot name="avatar" defaultValue={{ x: 100, y: 50, width: 100, height: 50 }}>
        <XhImageCropperViewport>
          <XhImageCropperImage />
          <XhImageCropperCropArea>
            <XhImageCropperCropHandle position="nw" />
          </XhImageCropperCropArea>
        </XhImageCropperViewport>
        <XhImageCropperHiddenInput />
      </XhImageCropperRoot>,
    )
    // 图片自然尺寸只能由 load 事件报进来，jsdom 不会真去取图
    const img = part('image-cropper', 'image')
    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true })
    act(() => {
      img.dispatchEvent(new Event('load'))
    })

    expect(value('image-cropper')).toBe('100,50,100,50')
    act(() => {
      part('image-cropper', 'crop-area').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
      )
    })
    expect(value('image-cropper')).toBe('101,50,100,50')
    act(() => form.reset())
    expect(value('image-cropper')).toBe('100,50,100,50')
  })

  it('手写签名：画过一笔之后，重置把画布清空', () => {
    const form = mount(
      <XhSignaturePadRoot name="sign">
        <XhSignaturePadControl>
          <XhSignaturePadPath />
        </XhSignaturePadControl>
        <XhSignaturePadHiddenInput />
      </XhSignaturePadRoot>,
    )
    // jsdom 不做布局，画布矩形恒是全 0，落笔坐标换算不出来
    const control = part('signature-pad', 'control')
    control.getBoundingClientRect = (): DOMRect => ({
      x: 0,
      y: 0,
      width: 300,
      height: 120,
      top: 0,
      left: 0,
      right: 300,
      bottom: 120,
      toJSON: () => ({}),
    }) as DOMRect

    const ink = (): string => part('signature-pad', 'path').getAttribute('d') ?? ''
    act(() => {
      control.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 1, clientX: 10, clientY: 10, bubbles: true, cancelable: true }))
    })
    act(() => {
      document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 40, clientY: 30, bubbles: true }))
    })
    act(() => {
      document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
    })
    expect(ink()).not.toBe('')
    expect(value('signature-pad')).toContain('<path')

    act(() => form.reset())
    expect(ink()).toBe('')
    expect(value('signature-pad')).toBe('')
  })
})
