// @vitest-environment jsdom
// 字段边界与浮层：子树里的控件不再被外层字段命名、描述，不再继承它的禁用，也不拿同一个控件 id。
//
// 组合控件（图标选择器）里内嵌的搜索框若照旧接上外层字段，会被读成字段的名字「图标」，
// 字段禁用时它也跟着禁用；放在浮层里的输入框同理，浮层经 Portal 搬到落点后不该再归外层字段管。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldBoundary,
  XhFieldDescription,
  XhFieldLabel,
  XhFieldRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../src'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function mountInField(inner: () => VNode[]): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhFieldRoot, { disabled: true }, () => [
      h(XhFieldLabel, null, () => '图标'),
      ...inner(),
      h(XhFieldDescription, null, () => '展示在菜单前'),
    ]),
  })
  app.mount(host)
  for (let i = 0; i < 3; i++)
    await nextTick()
}

function searchBox(): VNode {
  return h(XhTextFieldRoot, null, () => [h(XhTextFieldInput, { 'aria-label': '搜索图标', 'data-testid': 'search' })])
}

function input(): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>('[data-testid="search"]')
  if (!el)
    throw new Error('找不到搜索框')
  return el
}

function expectIsolated(): void {
  const labelId = document.querySelector('[data-scope="field"][data-part="label"]')!.id
  const descriptionId = document.querySelector('[data-scope="field"][data-part="description"]')!.id
  const el = input()
  expect((el.getAttribute('aria-labelledby') ?? '').split(/\s+/)).not.toContain(labelId)
  expect((el.getAttribute('aria-describedby') ?? '').split(/\s+/)).not.toContain(descriptionId)
  // 外层字段禁用，边界后面的搜索框照常可用
  expect(el.disabled).toBe(false)
  expect(el.getAttribute('aria-label')).toBe('搜索图标')
}

describe('字段边界', () => {
  it('不加边界时内嵌的搜索框被外层字段命名、描述并跟着禁用', async () => {
    await mountInField(() => [searchBox()])
    const labelId = document.querySelector('[data-scope="field"][data-part="label"]')!.id
    expect((input().getAttribute('aria-labelledby') ?? '').split(/\s+/)).toContain(labelId)
    expect(input().disabled).toBe(true)
  })

  it('xhFieldBoundary 后面的控件不再继承外层字段', async () => {
    await mountInField(() => [h(XhFieldBoundary, null, () => [searchBox()])])
    expectIsolated()
  })

  it('浮层内容搬到落点后自动断开：放在里面的输入框不归外层字段管', async () => {
    await mountInField(() => [
      h(XhPopoverRoot, { defaultOpen: true }, () => [
        h(XhPopoverTrigger, null, () => '选择图标'),
        h(XhPopoverPositioner, null, () => [h(XhPopoverContent, null, () => [searchBox()])]),
      ]),
    ])
    expectIsolated()
  })
})
