import type { App } from 'vue'
import type { CascaderRootSlotProps } from '../../src/components/cascader/cascader'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderItem,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | undefined
let host: HTMLElement | undefined

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = undefined
  host = undefined
})

describe('级联真实浏览器表单', () => {
  it('原生 fieldset 禁用排除字段，JSON 保留路径边界与同名实例顺序', async () => {
    const disabled = ref(false)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h('form', [
      h('fieldset', { disabled: disabled.value }, [h(XhCascaderRoot, { name: 'paths', defaultValue: ['a,b', 'c'] })]),
      h(XhCascaderRoot, { name: 'paths', defaultValue: ['a', 'b,c'] }),
    ]) })
    app.mount(host)
    const form = host.querySelector('form')!
    expect(new FormData(form).getAll('paths')).toEqual(['["a,b","c"]', '["a","b,c"]'])
    disabled.value = true
    await nextTick()
    expect(new FormData(form).getAll('paths')).toEqual(['["a","b,c"]'])
  })

  it('展开面板重置后保留真实焦点并可继续键盘选择，未加载默认路径仍可提交', async () => {
    let api: CascaderRootSlotProps
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h('form', [h(XhCascaderRoot, {
      name: 'paths',
      defaultOpen: true,
      defaultValue: ['未加载', 'a,b'],
      collection: [{ value: '华东', children: [{ value: '已加载甲' }, { value: '已加载乙' }] }],
    }, {
      default: (current: CascaderRootSlotProps) => {
        api = current
        return [
          h(XhCascaderControl, null, () => h(XhCascaderTrigger, null, () => '选择路径')),
          h(XhCascaderPositioner, null, () => h(XhCascaderContent, null, () => current.columns.map(column =>
            h(XhCascaderColumn, { level: column.level }, () => column.items.map(item =>
              h(XhCascaderItem, { value: item.value }, () => item.label),
            )),
          ))),
        ]
      },
    })]) })
    app.mount(host)
    await nextTick()
    api!.setValue([['华东', '已加载甲']])
    api!.setActivePath(['华东'])
    await nextTick()
    const first = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='item'][data-value='已加载甲']`)!
    await expect.poll(() => first.getBoundingClientRect().width).toBeGreaterThan(0)
    first.focus()
    await nextTick()
    const form = host.querySelector('form')!
    form.reset()
    await nextTick()
    expect(new FormData(form).getAll('paths')).toEqual(['["未加载","a,b"]'])
    expect(document.activeElement === first).toBe(true)
    expect(api!.open).toBe(true)
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await nextTick()
    expect(new FormData(form).getAll('paths')).toEqual(['["华东","已加载乙"]'])
  })
})
