// @vitest-environment jsdom
// tags-input 的标签：XhTagsInputItemPreview 渲的是库里 tag 的 root（data-scope="tag"），
// XhTagsInputItemText 是 tag 的 label，XhTagsInputItemDeleteTrigger 是所在标签那份 tag 的 close-trigger。
// 语气、尺寸、禁用与只读从 tags-input 传下去，形态按控件的面派；状态标记（高亮、编辑、值）留在本组件的 item 上。
// 就地编辑时预览走 tag 的 open=false 收起，删除钮点按摘掉这一枚并把焦点交回输入框。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputRoot,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

/** 每枚标签带预览（文字 + 删除钮）与常挂的编辑框。 */
function mountTags(props: Record<string, unknown> = {}): { change: ReturnType<typeof vi.fn>, host: HTMLElement } {
  const change = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhTagsInputRoot, { 'defaultValue': ['vue', 'react'], 'onValue-change': change, ...props }, {
        default: (bag: { value: string[] }) => h(XhTagsInputControl, null, () => [
          ...bag.value.map(v => h(XhTagsInputItem, { key: v, value: v }, () => [
            h(XhTagsInputItemPreview, null, () => [
              h(XhTagsInputItemText, () => v),
              h(XhTagsInputItemDeleteTrigger),
            ]),
            h(XhTagsInputItemInput),
          ])),
          h(XhTagsInputInput),
        ]),
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { change, host }
}

const ITEM = '[data-scope="tags-input"][data-part="item"]'
const TAG_ROOT = '[data-scope="tag"][data-part="root"]'
const CLOSE_TRIGGER = '[data-scope="tag"][data-part="close-trigger"]'

function itemEl(host: HTMLElement, v: string): HTMLElement {
  const hit = host.querySelector<HTMLElement>(`${ITEM}[data-value="${v}"]`)
  if (!hit)
    throw new Error(`找不到标签 ${v}`)
  return hit
}

/** 这一枚的预览：item 直属的那份 tag 的 root。 */
function tagEl(host: HTMLElement, v: string): HTMLElement {
  return itemEl(host, v).querySelector<HTMLElement>(`:scope > ${TAG_ROOT}`)!
}

function deleteTriggerEl(host: HTMLElement, v: string): HTMLButtonElement {
  return tagEl(host, v).querySelector<HTMLButtonElement>(CLOSE_TRIGGER)!
}

function inputEl(host: HTMLElement): HTMLInputElement {
  return host.querySelector<HTMLInputElement>('[data-scope="tags-input"][data-part="input"]')!
}

describe('tags-input 的标签套 tag', () => {
  it('预览是 tag 的 root、文字是 tag 的 label、删除钮是 tag 的 close-trigger；本组件不再有自己的那三个部件', async () => {
    const m = mountTags()
    await tick()
    for (const v of ['vue', 'react']) {
      const tag = tagEl(m.host, v)
      expect(tag.tagName).toBe('SPAN')
      expect(tag.getAttribute('data-state')).toBe('open')
      expect(tag.hidden).toBe(false)
      expect(tag.querySelector('[data-scope="tag"][data-part="label"]')?.textContent).toBe(v)
      const close = deleteTriggerEl(m.host, v)
      expect(close.tagName).toBe('BUTTON')
      expect(close.getAttribute('type')).toBe('button')
      expect(close.getAttribute('tabindex')).toBe('-1')
      expect(close.getAttribute('aria-label')).toBe(`Delete ${v}`)
      expect(close.disabled).toBe(false)
      expect(close.hidden).toBe(false)
    }
    expect(m.host.querySelector('[data-scope="tags-input"][data-part="item-preview"], [data-scope="tags-input"][data-part="item-text"], [data-scope="tags-input"][data-part="item-delete-trigger"]')).toBeNull()
  })

  it('tone / size 传到每枚标签上；形态按控件的面派：缺省是淡底，subtle 控件里是描边', async () => {
    const plain = mountTags()
    await tick()
    expect(tagEl(plain.host, 'vue').getAttribute('data-variant')).toBe('subtle')
    expect(tagEl(plain.host, 'vue').hasAttribute('data-tone')).toBe(false)
    expect(tagEl(plain.host, 'vue').hasAttribute('data-size')).toBe(false)

    const styled = mountTags({ variant: 'subtle', tone: 'success', size: 'lg' })
    await tick()
    for (const v of ['vue', 'react']) {
      const tag = tagEl(styled.host, v)
      expect(tag.getAttribute('data-variant')).toBe('outline')
      expect(tag.getAttribute('data-tone')).toBe('success')
      expect(tag.getAttribute('data-size')).toBe('lg')
    }
  })

  it('translations.deleteItem 落到 close-trigger 的可及名上', async () => {
    const m = mountTags({ translations: { deleteItem: (v: string) => `移除${v}` } })
    await tick()
    expect(deleteTriggerEl(m.host, 'vue').getAttribute('aria-label')).toBe('移除vue')
  })

  it('点删除钮摘掉这一枚并发 value-change；焦点当下在这一枚里时交回输入框', async () => {
    const m = mountTags()
    await tick()
    const close = deleteTriggerEl(m.host, 'react')
    close.focus()
    close.click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: ['vue'] })
    expect(m.host.querySelectorAll(ITEM).length).toBe(1)
    expect(document.activeElement).toBe(inputEl(m.host))
  })

  it('删除钮的 pointerdown 被拦下：焦点不会从输入框跳到钮上', async () => {
    const m = mountTags()
    await tick()
    const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    deleteTriggerEl(m.host, 'vue').dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('禁用：整枚标签标 data-disabled，删除钮留位、原生 disabled；直接派 click 不动值', async () => {
    const m = mountTags({ disabled: true })
    await tick()
    const tag = tagEl(m.host, 'vue')
    const close = deleteTriggerEl(m.host, 'vue')
    expect(tag.hasAttribute('data-disabled')).toBe(true)
    expect(close.disabled).toBe(true)
    expect(close.hasAttribute('data-disabled')).toBe(true)
    expect(close.hidden).toBe(false)
    close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })

  it('只读：标签不标 data-disabled，删除钮留位、原生 disabled；直接派 click 不动值', async () => {
    const m = mountTags({ readOnly: true })
    await tick()
    const tag = tagEl(m.host, 'vue')
    const close = deleteTriggerEl(m.host, 'vue')
    expect(tag.hasAttribute('data-disabled')).toBe(false)
    expect(close.disabled).toBe(true)
    expect(close.hidden).toBe(false)
    close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })

  it('光标走到标签上：data-highlighted 只落在本组件的 item 上，tag 的 root 不带', async () => {
    const m = mountTags()
    await tick()
    const input = inputEl(m.host)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    await tick()
    expect(itemEl(m.host, 'react').hasAttribute('data-highlighted')).toBe(true)
    expect(itemEl(m.host, 'vue').hasAttribute('data-highlighted')).toBe(false)
    expect(tagEl(m.host, 'react').hasAttribute('data-highlighted')).toBe(false)
  })

  it('就地编辑：双击 tag 的 root 进编辑态，预览按 open=false 收起、编辑框露出；Escape 后预览回来', async () => {
    const m = mountTags({ editable: true })
    await tick()
    const tag = tagEl(m.host, 'vue')
    tag.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    await tick()
    const edit = itemEl(m.host, 'vue').querySelector<HTMLInputElement>('[data-scope="tags-input"][data-part="item-input"]')!
    expect(itemEl(m.host, 'vue').hasAttribute('data-editing')).toBe(true)
    expect(tag.hidden).toBe(true)
    expect(tag.getAttribute('data-state')).toBe('closed')
    expect(edit.hidden).toBe(false)
    expect(document.activeElement).toBe(edit)

    edit.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await tick()
    expect(tag.hidden).toBe(false)
    expect(tag.getAttribute('data-state')).toBe('open')
    expect(edit.hidden).toBe(true)
    expect(document.activeElement).toBe(inputEl(m.host))
    expect(m.change).not.toHaveBeenCalled()
  })

  it('未开 editable 时双击 tag 的 root 不进编辑态', async () => {
    const m = mountTags()
    await tick()
    const tag = tagEl(m.host, 'vue')
    tag.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    await tick()
    expect(itemEl(m.host, 'vue').hasAttribute('data-editing')).toBe(false)
    expect(tag.hidden).toBe(false)
  })
})
