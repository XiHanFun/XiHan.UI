// actionOnClick：点行是行主操作（看详情），只有行首方框与空格键改选中；真实指针点在行的空白处与方框上各量一次。
import type { GridListNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const projects: GridListNode[] = [
  { value: 'docs', label: '文档站' },
  { value: 'console', label: '管理后台' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(actionOnClick: boolean): Promise<{ actions: string[], values: string[][] }> {
  const actions: string[] = []
  const values: string[][] = []
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhGridListRoot, {
      'collection': projects,
      'selectionMode': 'multiple',
      actionOnClick,
      'aria-label': '项目',
      'onAction': (details: { value: string }) => actions.push(details.value),
      'onUpdate:value': (value: string[]) => values.push(value),
    }, () => projects.map(project => h(XhGridListRow, { key: project.value, value: project.value }, () => [
      h(XhGridListRowSelectionIndicator),
      h(XhGridListRowContent, null, () => [h(XhGridListRowText, null, () => project.label)]),
    ]))),
  })
  app.mount(host)
  await nextTick()
  return { actions, values }
}

function row(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='grid-list'][data-part='row'][data-value='${value}']`)!
}

describe('gridList actionOnClick', () => {
  it('点行空白处只触发行主操作，不改选中；点行首方框只改选中，不触发行主操作', async () => {
    const log = await mount(true)
    const docs = row('docs')
    const box = docs.getBoundingClientRect()
    await userEvent.click(docs, { position: { x: box.width - 4, y: box.height / 2 } })
    await nextTick()
    expect(log.actions).toEqual(['docs'])
    expect(log.values).toEqual([])
    expect(docs.getAttribute('aria-selected')).toBe('false')

    await userEvent.click(docs.querySelector<HTMLElement>(`[data-part='row-selection-indicator']`)!)
    await nextTick()
    expect(log.values.at(-1)).toEqual(['docs'])
    expect(log.actions).toEqual(['docs'])
    // 方框不可聚焦，焦点落在所在的行上
    expect(document.activeElement).toBe(docs)

    await userEvent.keyboard(' ')
    expect(log.values.at(-1)).toEqual([])
  })

  it('不开时点行即切换选中，行主操作只在 Enter 上', async () => {
    const log = await mount(false)
    await userEvent.click(row('console'))
    await nextTick()
    expect(log.values.at(-1)).toEqual(['console'])
  })
})
