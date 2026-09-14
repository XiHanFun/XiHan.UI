// @vitest-environment jsdom
// table 的读屏文案能不能改：一条走实例 prop，一条走全局配置。
//
// 全局那条以前到不了——跑机器的组件只经 useMachine 并了 locale 与 size，
// 而 translations 按组件名分桶、只有 withXhConfig 认得出自己是谁。
import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { provideXhConfig, XhTableColumnHeader, XhTableColumnResizeTrigger, XhTableHeader, XhTableRoot, XhTableRow } from '../src'

const COLUMNS = [{ id: 'name', label: '名称', width: 120, resizable: true }]
const ROWS = [{ id: 'a' }]

function mount(render: () => unknown) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ render })
  app.mount(host)
  const handle = host.querySelector<HTMLElement>('[data-part="column-resize-trigger"]')
  if (!handle)
    throw new Error('没渲出改宽把手')
  const done = (): void => {
    app.unmount()
    host.remove()
  }
  return { handle, done }
}

/** 外面裹一层供了全局配置的宿主。 */
function mountWithConfig(config: Record<string, unknown>, render: () => unknown) {
  return mount(() => h({
    setup() {
      provideXhConfig(config as never)
      return () => render()
    },
  }))
}

/** 一张只有表头的表，把手在里面。 */
function table(props: Record<string, unknown> = {}): unknown {
  return h(XhTableRoot, { rows: ROWS, columns: COLUMNS, ...props }, () => [
    h(XhTableHeader, null, () => [
      h(XhTableRow, null, () => [
        h(XhTableColumnHeader, { value: 'name' }, () => [h(XhTableColumnResizeTrigger)]),
      ]),
    ]),
  ])
}

describe('table 的读屏文案', () => {
  it('缺省是英文', () => {
    const { handle, done } = mount(() => table())
    expect(handle.getAttribute('aria-label')).toBe('Resize column 名称')
    done()
  })

  it('实例上的 translations 改得动', () => {
    const { handle, done } = mount(() => table({
      translations: { columnResize: (label: string) => `调整${label}的宽度` },
    }))
    expect(handle.getAttribute('aria-label')).toBe('调整名称的宽度')
    done()
  })

  it('全局配置里按组件名分桶的那份也到得了', () => {
    const { handle, done } = mountWithConfig(
      { translations: { table: { columnResize: (label: string) => `全局：${label}` } } },
      () => table(),
    )
    expect(handle.getAttribute('aria-label')).toBe('全局：名称')
    done()
  })

  it('实例上的那份压得过全局', () => {
    const { handle, done } = mountWithConfig(
      { translations: { table: { columnResize: (label: string) => `全局：${label}` } } },
      () => table({ translations: { columnResize: (label: string) => `实例：${label}` } }),
    )
    expect(handle.getAttribute('aria-label')).toBe('实例：名称')
    done()
  })
})
