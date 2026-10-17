// 整条占位：一段都没填、焦点也不在段上时，输入行显示一句占位文字，段位与分隔符让位；焦点一进到段上就换回段位。
// 多选没有选中值时标签行显示这句文字。文字由皮肤以生成内容画出，段位只是淡出，仍可聚焦、仍在读屏树里。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimePickerControl,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTagList,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  host.style.width = '320px'
  document.body.append(host)
  app = createApp({ render: () => h(XhTimePickerRoot, { locale: 'zh-CN', ...props }, () => h(XhTimePickerControl, null, () => [
    h(XhTimePickerTagList),
    h(XhTimePickerSegmentGroup, null, () => [
      h(XhTimePickerSegment, { segment: 'hour' }),
      h('span', ':'),
      h(XhTimePickerSegment, { segment: 'minute' }),
    ]),
  ])) })
  app.mount(host)
  await settle()
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='time-picker'][data-part='${name}']`)!
}

function segments(): HTMLElement[] {
  return [...part('segment-group').querySelectorAll<HTMLElement>(`[data-part='segment']:not([hidden])`)]
}

/** 占位文字真画出来了，段位与分隔符都淡出。 */
function expectPlaceholder(text: string): void {
  const group = part('segment-group')
  expect(getComputedStyle(group, '::before').content).toBe(`"${text}"`)
  for (const child of group.children)
    expect(getComputedStyle(child).opacity).toBe('0')
}

function expectSegments(): void {
  const group = part('segment-group')
  expect(getComputedStyle(group, '::before').content).toBe('none')
  for (const segment of segments())
    expect(getComputedStyle(segment).opacity).toBe('1')
}

describe('时间选择器的整条占位', () => {
  it('全空时显示占位文字，焦点进到段上换回段位，离开又回到占位', async () => {
    await mount({ placeholder: '请选择开始时间' })
    expectPlaceholder('请选择开始时间')
    // 占位文字压在同一行上、不吃指针：点下去落到底下的段位
    expect(getComputedStyle(part('segment-group'), '::before').pointerEvents).toBe('none')

    segments()[0]!.focus()
    await settle()
    expectSegments()

    segments()[0]!.blur()
    await settle()
    expectPlaceholder('请选择开始时间')
  })

  it('有值时段位照常', async () => {
    await mount({ placeholder: '请选择开始时间', defaultValue: '09:30' })
    expectSegments()
  })

  it('多选没有选中时标签行显示整条占位，选上一个即撤下', async () => {
    await mount({ placeholder: '请选择时间', selectionMode: 'multiple' })
    expect(getComputedStyle(part('tag-list'), '::before').content).toBe('"请选择时间"')
    app!.unmount()
    host!.remove()
    await mount({ placeholder: '请选择时间', selectionMode: 'multiple', defaultValue: ['09:30'] })
    expect(getComputedStyle(part('tag-list'), '::before').content).toBe('none')
  })
})
