import type { App } from 'vue'
import { afterEach, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhCommandContent, XhCommandEmpty, XhCommandGroup, XhCommandInput, XhCommandItem, XhCommandList, XhCommandRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | undefined
let host: HTMLElement | undefined

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='command'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少命令部件 ${name}`)
  return element
}

function item(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='command'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`缺少命令 ${value}`)
  return element
}

async function mount(render: () => ReturnType<typeof h>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = undefined
  host = undefined
})

it('隐藏组不成为活动命令，后续全部隐藏清理 ARIA，恢复后仍可键盘执行', async () => {
  const groupHidden = ref(true)
  const secondHidden = ref(false)
  const selected: string[] = []
  await mount(() => h(XhCommandRoot, {
    defaultOpen: true,
    modal: false,
    closeOnSelect: false,
    collection: [{ value: 'first', label: '首项', group: 'primary' }, { value: 'second', label: '次项' }],
    onSelect: (details: { value: string }) => selected.push(details.value),
  }, () => h(XhCommandContent, null, () => [
    h(XhCommandInput),
    h(XhCommandList, null, () => [
      h(XhCommandGroup, { value: 'primary', hidden: groupHidden.value }, () => h(XhCommandItem, { value: 'first' }, () => '首项')),
      h(XhCommandItem, { value: 'second', hidden: secondHidden.value }, () => '次项'),
    ]),
    h(XhCommandEmpty, null, () => '没有显示中的命令'),
  ])))
  const input = part('input') as HTMLInputElement
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('second').id)
  input.focus()
  await userEvent.keyboard('{Home}{Enter}')
  expect(selected).toEqual(['second'])
  secondHidden.value = true
  await nextTick()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBeNull()
  expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
  expect(part('empty').textContent).toBe('没有显示中的命令')
  await userEvent.keyboard('{Enter}')
  expect(selected).toEqual(['second'])
  groupHidden.value = false
  await nextTick()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  expect(part('empty').getBoundingClientRect().height).toBe(0)
  await userEvent.keyboard('{Home}{Enter}')
  expect(selected).toEqual(['second', 'first'])
})

it('搜索过滤自身写入的 hidden 不阻止查询清空后重新激活首项', async () => {
  await mount(() => h(XhCommandRoot, {
    defaultOpen: true,
    modal: false,
    collection: [{ value: 'first', label: 'Alpha' }, { value: 'second', label: 'Beta' }],
  }))
  const input = part('input') as HTMLInputElement
  await userEvent.fill(input, 'Beta')
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('second').id)
  expect(item('first').hidden).toBe(true)
  await userEvent.fill(input, '')
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  expect(item('first').hidden).toBe(false)
})

it('保持展开替换 List 后观察归属切到新节点，隐藏与恢复都更新 ARIA', async () => {
  const generation = ref(0)
  const firstHidden = ref(false)
  const secondHidden = ref(false)
  const collection = [{ value: 'first', label: '首项' }, { value: 'second', label: '次项' }]
  await mount(() => h(XhCommandRoot, { defaultOpen: true, modal: false, collection }, () =>
    h(XhCommandContent, null, () => [
      h(XhCommandInput),
      h(XhCommandList, { key: generation.value }, () => [
        h(XhCommandItem, { value: 'first', hidden: firstHidden.value }, () => '首项'),
        h(XhCommandItem, { value: 'second', hidden: secondHidden.value }, () => '次项'),
      ]),
    ])))
  const input = part('input')
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  const oldList = part('list')
  generation.value++
  await nextTick()
  expect(part('list')).not.toBe(oldList)
  firstHidden.value = true
  await nextTick()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('second').id)
  secondHidden.value = true
  await nextTick()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBeNull()
  firstHidden.value = false
  await nextTick()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  oldList.hidden = true
  await nextTick()
  expect(input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  expect(part('content').getAttribute('data-state')).toBe('open')
})
