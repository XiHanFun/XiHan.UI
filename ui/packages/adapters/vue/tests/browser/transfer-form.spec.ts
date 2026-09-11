import type { App } from 'vue'
import type { TransferRootSlotProps } from '../../src/components/transfer/transfer'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTransferRoot } from '../../src'

let app: App | undefined
let host: HTMLElement | undefined

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = undefined
  host = undefined
})

describe('穿梭框真实浏览器表单', () => {
  it('原生禁用 fieldset 排除字段，恢复后保留逗号原值与相同 name 的实例顺序', async () => {
    const disabled = ref(false)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h('form', [
      h('fieldset', { disabled: disabled.value }, [
        h(XhTransferRoot, { name: 'members', defaultValue: ['a,b', 'a'] }),
      ]),
      h(XhTransferRoot, { name: 'members', defaultValue: ['b'] }),
    ]) })
    app.mount(host)
    const form = host.querySelector('form')!
    expect(new FormData(form).getAll('members')).toEqual(['a,b', 'a', 'b'])
    disabled.value = true
    await nextTick()
    expect(new FormData(form).getAll('members')).toEqual(['b'])
    disabled.value = false
    await nextTick()
    expect(new FormData(form).getAll('members')).toEqual(['a,b', 'a', 'b'])
  })

  it('外部原生表单在目标清空后仍恢复默认值，空字符串值与零值集合不同', async () => {
    let api: TransferRootSlotProps
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h('div', [
      h(XhTransferRoot, { name: 'members', form: 'external-form', defaultValue: ['a,b', ''] }, {
        default: (current: TransferRootSlotProps) => {
          api = current
          return []
        },
      }),
      h('form', { id: 'external-form' }),
    ]) })
    app.mount(host)
    await nextTick()
    const form = host.querySelector('form')!
    expect(new FormData(form).getAll('members')).toEqual(['a,b', ''])
    api!.setValue([])
    await nextTick()
    expect(new FormData(form).getAll('members')).toEqual([])
    form.reset()
    await nextTick()
    expect(new FormData(form).getAll('members')).toEqual(['a,b', ''])
  })
})
