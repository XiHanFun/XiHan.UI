// <xh-config> 的作用域跟着浮层走：对话框打开后 backdrop / positioner 搬进 body 下的 Portal 外壳，
// 里面的库内元素照它们在原来 DOM 里的位置取配置，读到这一层的语言、尺寸与文案；
// 打开期间改这一层的配置，搬走的元素跟着变；关上归位后照旧。
// 语言看量程刻度值的千分位（de-DE 写点、en-US 写逗号），尺寸看开关根上的 data-size，文案看密码框切换钮的名字。
import { afterEach, describe, expect, it } from 'vitest'
import { resolveXhConfig } from '../../src/config'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface ConfigScope extends HTMLElement {
  locale?: string
  size?: 'sm' | 'md' | 'lg'
  translations?: Record<string, Record<string, unknown>>
}

interface DialogHost extends HTMLElement {
  open?: boolean
}

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

interface Fixture {
  readonly scope: ConfigScope
  readonly inner: ConfigScope
  readonly dialog: DialogHost
  readonly positioner: HTMLElement
  readonly progress: HTMLElement
  readonly switchRoot: () => HTMLElement
  readonly visibilityTrigger: () => HTMLElement
  readonly maxLabel: () => string | null
}

function mount(): Fixture {
  document.body.innerHTML = `
    <xh-config id="scope" locale="de-DE" size="sm" mode="dark">
      <xh-dialog>
        <div data-xh-part="backdrop"></div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <h2 data-xh-part="title">设置</h2>
            <xh-config id="inner" density="compact">
              <xh-switch aria-label="启用"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
              <xh-password-input label="密码"></xh-password-input>
              <xh-progress semantics="meter" value="5000" max="10000" scale style="display: block">
                <div data-xh-part="root" aria-label="额度">
                  <div data-xh-part="track"><div data-xh-part="range"></div></div>
                </div>
              </xh-progress>
            </xh-config>
          </div>
        </div>
      </xh-dialog>
    </xh-config>
  `
  const scope = document.querySelector<ConfigScope>('#scope')!
  scope.translations = { 'password-input': { visibilityTriggerShow: '显示密码' } }
  const progress = scope.querySelector<HTMLElement>('xh-progress')!
  return {
    scope,
    inner: scope.querySelector<ConfigScope>('#inner')!,
    dialog: scope.querySelector<DialogHost>('xh-dialog')!,
    positioner: scope.querySelector<HTMLElement>('[data-xh-part="positioner"]')!,
    progress,
    switchRoot: () => scope.ownerDocument.querySelector<HTMLElement>('[data-scope="switch"][data-part="root"]')!,
    visibilityTrigger: () => scope.ownerDocument.querySelector<HTMLElement>('[data-scope="password-input"][data-part="visibility-trigger"]')!,
    maxLabel: () => [...progress.querySelectorAll('[data-part="scale-label"]')].at(-1)?.textContent ?? null,
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wc <xh-config> 作用域跨 Portal', () => {
  it('对话框打开后搬进 Portal 的元素读到这一层的语言、尺寸与文案', async () => {
    const f = mount()
    f.dialog.open = true
    await settle()

    expect(f.scope.contains(f.positioner)).toBe(false)
    expect(f.positioner.closest('[data-xh-portal-shell]')).not.toBeNull()
    expect(resolveXhConfig(f.progress)).toMatchObject({ locale: 'de-DE', size: 'sm' })
    expect(f.maxLabel()).toBe('10.000')
    expect(f.switchRoot().getAttribute('data-size')).toBe('sm')
    expect(f.visibilityTrigger().getAttribute('aria-label')).toBe('显示密码')
  })

  it('打开期间改这一层的配置，搬走的元素跟着变；关上归位后照旧', async () => {
    const f = mount()
    f.dialog.open = true
    await settle()

    f.scope.locale = 'en-US'
    f.scope.size = 'lg'
    f.scope.translations = { 'password-input': { visibilityTriggerShow: '查看密码' } }
    await settle()
    expect(f.scope.contains(f.positioner)).toBe(false)
    expect(f.maxLabel()).toBe('10,000')
    expect(f.switchRoot().getAttribute('data-size')).toBe('lg')
    expect(f.visibilityTrigger().getAttribute('aria-label')).toBe('查看密码')

    f.dialog.open = false
    await settle()
    await new Promise(resolve => setTimeout(resolve, 400))
    await settle()
    expect(f.scope.contains(f.positioner)).toBe(true)
    f.scope.size = 'md'
    await settle()
    expect(f.switchRoot().getAttribute('data-size')).toBe('md')
    expect(f.maxLabel()).toBe('10,000')
  })

  it('浮层里的 <xh-config> 承接外层的视觉环境，只改自己声明的轴', async () => {
    const f = mount()
    f.dialog.open = true
    await settle()

    expect(f.inner.closest('[data-xh-portal-shell]')).not.toBeNull()
    expect(f.inner.getAttribute('data-density')).toBe('compact')
    expect(f.inner.getAttribute('data-theme')).toBe('dark')
  })

  it('禁用的字段集：组里开的浮层内容跟着禁用，legend 里开的不吃本组禁用', async () => {
    const popover = (id: string): string => `
      <xh-popover id="${id}" open modal="false">
        <button data-xh-part="trigger">${id}</button>
        <div data-xh-part="positioner"><div data-xh-part="content">
          <xh-switch aria-label="${id}"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        </div></div>
      </xh-popover>`
    document.body.innerHTML = `
      <xh-fieldset disabled>
        <fieldset data-xh-part="root">
          <legend data-xh-part="legend">${popover('in-legend')}</legend>
          ${popover('in-group')}
        </fieldset>
      </xh-fieldset>`
    await settle()

    const switchRoot = (id: string): HTMLElement => {
      const content = document.querySelector<HTMLElement>(`[aria-label="${id}"][data-scope="switch"][data-part="root"]`)
      if (!content)
        throw new Error(`找不到 ${id} 的开关`)
      return content
    }
    expect(switchRoot('in-group').closest('[data-xh-portal-shell]')).not.toBeNull()
    expect(switchRoot('in-legend').closest('[data-xh-portal-shell]')).not.toBeNull()
    expect(switchRoot('in-group').hasAttribute('data-disabled')).toBe(true)
    expect(switchRoot('in-legend').hasAttribute('data-disabled')).toBe(false)
  })
})
