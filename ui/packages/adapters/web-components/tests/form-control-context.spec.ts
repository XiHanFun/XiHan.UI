// @vitest-environment jsdom
import type { XhFormElement } from '../src/elements/form'
import { formPathKey } from '@xihan-ui/headless'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

function textField(markup = ''): string {
  return `
    <xh-text-field ${markup}>
      <div data-xh-part="root">
        <label data-xh-part="label">邮箱</label>
        <div data-xh-part="control"><input data-xh-part="input"></div>
      </div>
    </xh-text-field>`
}

type AtomicControl = 'checkbox' | 'switch' | 'radio-group' | 'number-field' | 'password-input' | 'pin-input' | 'date-field' | 'time-field' | 'editable' | 'tags-input' | 'checkbox-group' | 'slider' | 'select' | 'cascader' | 'combobox' | 'tree-select' | 'date-picker' | 'time-picker' | 'color-picker' | 'mention' | 'rating' | 'segmented' | 'toggle-group' | 'transfer' | 'field-array' | 'file-upload' | 'image-cropper' | 'signature-pad'

const ATOMIC_CONTROLS: AtomicControl[] = ['checkbox', 'switch', 'radio-group', 'number-field', 'password-input', 'pin-input', 'date-field', 'time-field', 'editable', 'tags-input', 'checkbox-group', 'slider', 'select', 'cascader', 'combobox', 'tree-select', 'date-picker', 'time-picker', 'color-picker', 'mention', 'rating', 'segmented', 'toggle-group', 'transfer', 'field-array', 'file-upload', 'image-cropper', 'signature-pad']

function atomicControl(kind: AtomicControl, markup = ''): string {
  if (kind === 'checkbox') {
    return `<xh-checkbox ${markup}><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>`
  }
  if (kind === 'switch') {
    return `<xh-switch ${markup}><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>`
  }
  if (kind === 'radio-group') {
    return `<xh-radio-group ${markup}><div data-xh-part="root">
      <div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="indicator"></span><span data-xh-part="item-text">甲</span></div>
    </div></xh-radio-group>`
  }
  if (kind === 'number-field')
    return `<xh-number-field ${markup}><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-number-field>`
  if (kind === 'password-input')
    return `<xh-password-input ${markup}><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-password-input>`
  if (kind === 'pin-input')
    return `<xh-pin-input ${markup} length="1"><div data-xh-part="root"><input data-xh-part="input" index="0"></div></xh-pin-input>`
  if (kind === 'date-field')
    return `<xh-date-field ${markup} segments="year"><div data-xh-part="root"><div data-xh-part="segment" segment="year"></div></div></xh-date-field>`
  if (kind === 'time-field')
    return `<xh-time-field ${markup} granularity="hour"><div data-xh-part="root"><span data-xh-part="segment" segment="hour"></span></div></xh-time-field>`
  if (kind === 'select') {
    return `<xh-select ${markup}><div data-xh-part="root"><button data-xh-part="trigger">选择</button><select data-xh-part="hidden-select"></select></div></xh-select>`
  }
  const nonRequiredMarkup = markup.replace(/\brequired(?:="false")?/g, '')
  if (kind === 'cascader')
    return `<xh-cascader ${nonRequiredMarkup}><div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger">选择</button></div></div></xh-cascader>`
  if (kind === 'combobox')
    return `<xh-combobox ${nonRequiredMarkup}><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-combobox>`
  if (kind === 'tree-select')
    return `<xh-tree-select ${nonRequiredMarkup}><div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger">选择</button></div></div></xh-tree-select>`
  if (kind === 'date-picker')
    return `<xh-date-picker ${markup} segments="year"><div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="segment-group"><span data-xh-part="segment" segment="year"></span></div><button data-xh-part="trigger">选择</button></div><input data-xh-part="hidden-input"><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="calendar"></div></div></div></div></xh-date-picker>`
  if (kind === 'time-picker')
    return `<xh-time-picker ${markup} granularity="hour"><div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="segment-group"><span data-xh-part="segment" segment="hour"></span></div><button data-xh-part="trigger">选择</button></div><input data-xh-part="hidden-input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-time-picker>`
  if (kind === 'color-picker')
    return `<xh-color-picker ${nonRequiredMarkup}><div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger">选择</button></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-color-picker>`
  if (kind === 'mention')
    return `<xh-mention ${nonRequiredMarkup}><div data-xh-part="root"><input data-xh-part="input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-mention>`
  if (kind === 'rating') {
    const ratingMarkup = markup.replace(/\binvalid(?:="false")?/g, '')
    return `<xh-rating ${ratingMarkup} count="1"><div data-xh-part="root"><div data-xh-part="control"><span data-xh-part="item" value="1"></span></div></div></xh-rating>`
  }
  if (kind === 'segmented') {
    return `<xh-segmented ${markup}><div data-xh-part="root"><button data-xh-part="item" value="a"><span data-xh-part="item-text">甲</span></button></div></xh-segmented>`
  }
  if (kind === 'toggle-group') {
    const disabledMarkup = markup.replace(/\b(?:read-only|required|invalid)(?:="false")?/g, '')
    return `<xh-toggle-group ${disabledMarkup}><div data-xh-part="root"><button data-xh-part="item" value="a">甲</button></div></xh-toggle-group>`
  }
  if (kind === 'transfer') {
    return `<xh-transfer ${nonRequiredMarkup}><div data-xh-part="root"><div data-xh-part="source-panel"><div data-xh-part="list"></div></div></div></xh-transfer>`
  }
  if (kind === 'field-array')
    return `<xh-field-array ${nonRequiredMarkup}><div data-xh-part="root"></div></xh-field-array>`
  if (kind === 'file-upload') {
    const fileUploadMarkup = markup.replace(/\b(?:read-only|required)(?:="false")?/g, '')
    return `<xh-file-upload ${fileUploadMarkup}><div data-xh-part="root"></div></xh-file-upload>`
  }
  if (kind === 'image-cropper') {
    const imageCropperMarkup = markup.replace(/\b(?:required|invalid)(?:="false")?/g, '')
    return `<xh-image-cropper ${imageCropperMarkup}><div data-xh-part="root"></div></xh-image-cropper>`
  }
  if (kind === 'signature-pad')
    return `<xh-signature-pad ${markup}><div data-xh-part="root"><input data-xh-part="hidden-input"></div></xh-signature-pad>`
  if (kind === 'editable')
    return `<xh-editable ${nonRequiredMarkup}><div data-xh-part="root"><div data-xh-part="control"><span data-xh-part="preview"></span><input data-xh-part="input"></div></div></xh-editable>`
  if (kind === 'tags-input')
    return `<xh-tags-input ${markup}><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-tags-input>`
  if (kind === 'checkbox-group') {
    return `<xh-checkbox-group ${nonRequiredMarkup}><div data-xh-part="root">
      <div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="indicator"></span><span data-xh-part="item-text">甲</span></div>
    </div></xh-checkbox-group>`
  }
  return `<xh-slider ${nonRequiredMarkup} default-value="50"><div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="track"></div><div data-xh-part="thumb" index="0"></div></div></div></xh-slider>`
}

async function expectAtomicState(form: XhFormElement, kind: AtomicControl, enabled: boolean): Promise<void> {
  if (kind === 'field-array') {
    let root: HTMLElement | null = null
    await vi.waitFor(() => {
      root = form.querySelector<HTMLElement>('xh-field-array [data-scope="field-array"][data-part="root"]')
      expect(root?.hasAttribute('data-disabled')).toBe(enabled)
    })
    expect(root!.hasAttribute('data-readonly')).toBe(enabled)
    expect(root!.hasAttribute('data-invalid')).toBe(enabled)
    return
  }
  if (kind === 'file-upload') {
    let root: HTMLElement | null = null
    await vi.waitFor(() => {
      root = form.querySelector<HTMLElement>('xh-file-upload [data-scope="file-upload"][data-part="root"]')
      expect(root?.hasAttribute('data-disabled')).toBe(enabled)
    })
    expect(root!.hasAttribute('data-invalid')).toBe(enabled)
    return
  }
  if (kind === 'image-cropper') {
    let root: HTMLElement | null = null
    await vi.waitFor(() => {
      root = form.querySelector<HTMLElement>('xh-image-cropper [data-scope="image-cropper"][data-part="root"]')
      expect(root?.hasAttribute('data-disabled')).toBe(enabled)
    })
    expect(root!.hasAttribute('data-readonly')).toBe(enabled)
    return
  }
  if (kind === 'signature-pad') {
    let root: HTMLElement | null = null
    await vi.waitFor(() => {
      root = form.querySelector<HTMLElement>('xh-signature-pad [data-scope="signature-pad"][data-part="root"]')
      expect(root?.hasAttribute('data-disabled')).toBe(enabled)
    })
    const input = form.querySelector<HTMLInputElement>('xh-signature-pad input')!
    expect(root!.hasAttribute('data-readonly')).toBe(enabled)
    expect(root!.hasAttribute('data-invalid')).toBe(enabled)
    expect(input.required).toBe(enabled)
    return
  }
  if (kind === 'rating') {
    let control: HTMLElement | null = null
    await vi.waitFor(() => {
      control = form.querySelector<HTMLElement>('xh-rating [data-scope="rating"][data-part="control"]')
      expect(control?.getAttribute('aria-disabled')).toBe(String(enabled))
    })
    expect(control!.getAttribute('aria-readonly')).toBe(String(enabled))
    expect(control!.getAttribute('aria-required')).toBe(String(enabled))
    return
  }
  if (kind === 'segmented') {
    let root: HTMLElement | null = null
    await vi.waitFor(() => {
      root = form.querySelector<HTMLElement>('xh-segmented [data-scope="segmented"][data-part="root"]')
      expect(root?.getAttribute('aria-readonly')).toBe(String(enabled))
    })
    const item = form.querySelector<HTMLElement>('xh-segmented [data-scope="segmented"][data-part="item"]')!
    expect(item.getAttribute('aria-disabled')).toBe(String(enabled))
    expect(root!.getAttribute('aria-invalid')).toBe(String(enabled))
    expect(root!.getAttribute('aria-required')).toBe(String(enabled))
    return
  }
  if (kind === 'toggle-group') {
    await vi.waitFor(() => {
      const item = form.querySelector<HTMLElement>('xh-toggle-group [data-scope="toggle-group"][data-part="item"]')
      expect(item?.getAttribute('aria-disabled')).toBe(String(enabled))
    })
    return
  }
  if (kind === 'transfer') {
    let root: HTMLElement | null = null
    let list: HTMLElement | null = null
    await vi.waitFor(() => {
      root = form.querySelector<HTMLElement>('xh-transfer [data-scope="transfer"][data-part="root"]')
      list = form.querySelector<HTMLElement>('xh-transfer [data-scope="transfer"][data-part="list"]')
      expect(root?.hasAttribute('data-disabled')).toBe(enabled)
      expect(list?.getAttribute('aria-readonly')).toBe(String(enabled))
    })
    expect(list!.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  if (kind === 'combobox' || kind === 'mention') {
    const input = form.querySelector(`xh-${kind} input`) as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(enabled))
    expect(input.readOnly).toBe(enabled)
    expect(input.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  if (kind === 'date-picker' || kind === 'time-picker' || kind === 'color-picker') {
    const trigger = form.querySelector(`xh-${kind} button[data-xh-part="trigger"]`) as HTMLButtonElement
    await vi.waitFor(() => expect(trigger.disabled).toBe(enabled))
    if (kind === 'color-picker') {
      expect(form.querySelector<HTMLElement>('xh-color-picker [data-scope="color-picker"][data-part="root"]')!.hasAttribute('data-readonly')).toBe(enabled)
    }
    else {
      const segment = form.querySelector<HTMLElement>(`xh-${kind} [role="spinbutton"]`)!
      expect(segment.getAttribute('aria-readonly')).toBe(String(enabled))
      expect(segment.getAttribute('aria-invalid')).toBe(String(enabled))
      expect(segment.getAttribute('aria-required')).toBe(String(enabled))
    }
    return
  }
  if (kind === 'select' || kind === 'cascader' || kind === 'tree-select') {
    const trigger = form.querySelector(`xh-${kind} button[data-xh-part="trigger"]`) as HTMLButtonElement
    await vi.waitFor(() => expect(trigger.disabled).toBe(enabled))
    expect(trigger.getAttribute('aria-readonly')).toBe(String(enabled))
    expect(trigger.getAttribute('aria-invalid')).toBe(String(enabled))
    if (kind === 'select')
      expect((form.querySelector('xh-select select') as HTMLSelectElement).required).toBe(enabled)
    return
  }
  if (kind === 'number-field' || kind === 'password-input' || kind === 'pin-input' || kind === 'editable' || kind === 'tags-input') {
    const input = form.querySelector(`xh-${kind} input`) as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(enabled))
    expect(input.readOnly).toBe(enabled)
    if (kind === 'tags-input')
      expect(input.getAttribute('aria-required')).toBe(String(enabled))
    else if (kind !== 'editable')
      expect(input.required).toBe(enabled)
    expect(input.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  if (kind === 'checkbox-group') {
    let item: HTMLElement | null = null
    await vi.waitFor(() => {
      item = form.querySelector<HTMLElement>('xh-checkbox-group [role="checkbox"]')
      expect(item?.getAttribute('aria-disabled')).toBe(String(enabled))
    })
    expect(item!.getAttribute('aria-readonly')).toBe(String(enabled))
    expect(item!.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  if (kind === 'slider') {
    let thumb: HTMLElement | null = null
    await vi.waitFor(() => {
      thumb = form.querySelector<HTMLElement>('xh-slider [role="slider"]')
      expect(thumb?.getAttribute('aria-disabled')).toBe(String(enabled))
    })
    const root = form.querySelector<HTMLElement>('xh-slider [data-scope="slider"][data-part="root"]')!
    expect(root.hasAttribute('data-readonly')).toBe(enabled)
    expect(root.hasAttribute('data-invalid')).toBe(enabled)
    return
  }
  if (kind === 'date-field' || kind === 'time-field') {
    let segment: HTMLElement | null = null
    await vi.waitFor(() => {
      segment = form.querySelector<HTMLElement>(`xh-${kind} [role="spinbutton"]`)
      expect(segment?.getAttribute('aria-disabled')).toBe(String(enabled))
    })
    expect(segment!.getAttribute('aria-readonly')).toBe(String(enabled))
    expect(segment!.getAttribute('aria-required')).toBe(String(enabled))
    expect(segment!.getAttribute('aria-invalid')).toBe(String(enabled))
    return
  }
  let root: HTMLElement | null = null
  await vi.waitFor(() => {
    root = form.querySelector<HTMLElement>(kind === 'radio-group' ? '[role="radiogroup"]' : `button[role="${kind}"]`)
    expect(root?.getAttribute('aria-readonly')).toBe(String(enabled))
  })
  const disabled = kind === 'radio-group'
    ? form.querySelector('[role="radio"]')?.getAttribute('aria-disabled') === 'true'
    : (root! as HTMLButtonElement).disabled
  expect(disabled).toBe(enabled)
  expect(root!.getAttribute('aria-invalid')).toBe(String(enabled))
  expect(root!.getAttribute('aria-required')).toBe(String(enabled))
}

function formMarkup(content: string): string {
  return `<form data-xh-part="root"><div data-xh-part="field-group" name="email">${content}</div></form>`
}

function makeForm(content: string): XhFormElement {
  const form = document.createElement('xh-form') as XhFormElement
  form.innerHTML = formMarkup(content)
  form.disabled = true
  form.readOnly = true
  form.rules = { email: { required: true } }
  form.errors = { email: '格式不对' }
  document.body.append(form)
  return form
}

describe('form control context 接线', () => {
  it('数组路径严格取 data-path，运行期改写后由观察器重新接线', async () => {
    const form = document.createElement('xh-form') as XhFormElement
    const first = ['users', 0, 'email']
    form.innerHTML = `<form data-xh-part="root"><div data-xh-part="field-group" data-path='${JSON.stringify(first)}'></div></form>`
    document.body.append(form)
    await vi.waitFor(() => expect(form.querySelector('[data-part="field-group"]')?.getAttribute('data-form-path')).toBe(formPathKey(first)))

    const second = ['users', 1, 'email']
    form.querySelector('[data-part="field-group"]')!.setAttribute('data-path', JSON.stringify(second))
    await vi.waitFor(() => expect(form.querySelector('[data-part="field-group"]')?.getAttribute('data-form-path')).toBe(formPathKey(second)))
  })

  it('直接 xh-text-field 继承 Form 的禁用、只读、必填与无效态', async () => {
    const form = makeForm(textField())
    const input = form.querySelector('xh-text-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(true))
    expect(input.readOnly).toBe(true)
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-readonly')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
  })

  it('field 包装的 xh-text-field 把最近状态交给内层控件机器', async () => {
    const field = `
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          ${textField('data-xh-part="control"')}
          <p data-xh-part="description">工作邮箱</p>
          <p data-xh-part="error-text">格式不对</p>
        </div>
      </xh-field>`
    const form = makeForm(field)
    const input = form.querySelector('xh-field xh-text-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.disabled).toBe(true))
    expect(input.readOnly).toBe(true)
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('text field 实例显式 false 顶掉最近 Field 的四条继承状态', async () => {
    const field = `
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">邮箱</label>
          ${textField('data-xh-part="control" disabled="false" read-only="false" required="false" invalid="false"')}
          <p data-xh-part="description">工作邮箱</p>
          <p data-xh-part="error-text">格式不对</p>
        </div>
      </xh-field>`
    const form = makeForm(field)
    const input = form.querySelector('xh-field xh-text-field input') as HTMLInputElement
    await vi.waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('false'))
    expect(input.disabled).toBe(false)
    expect(input.readOnly).toBe(false)
    expect(input.required).toBe(false)
    expect(input.getAttribute('aria-readonly')).toBe('false')
    expect(input.getAttribute('aria-required')).toBe('false')
  })

  it.each(ATOMIC_CONTROLS)('%s 直接继承 Form 的四条状态轴', async (kind) => {
    await expectAtomicState(makeForm(atomicControl(kind)), kind, true)
  })

  it.each(ATOMIC_CONTROLS)('%s 以最近 Field 的显式 false 顶掉 Form', async (kind) => {
    const field = `<xh-field disabled="false" read-only="false" required="false" invalid="false">
      <div data-xh-part="root"><div data-xh-part="control">${atomicControl(kind)}</div></div>
    </xh-field>`
    await expectAtomicState(makeForm(field), kind, false)
  })

  it.each(ATOMIC_CONTROLS)('%s 以实例显式 false 顶掉 Field 与 Form', async (kind) => {
    const field = `<xh-field disabled read-only required invalid>
      <div data-xh-part="root"><div data-xh-part="control">${atomicControl(kind, 'disabled="false" read-only="false" required="false" invalid="false"')}</div></div>
    </xh-field>`
    await expectAtomicState(makeForm(field), kind, false)
  })
})
