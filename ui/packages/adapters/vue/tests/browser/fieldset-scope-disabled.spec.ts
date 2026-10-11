// 字段集整组禁用压进子树：组内组件库的控件各自拿到 disabled，行为与禁用面一起到位。
// 原生 fieldset[disabled] 只管得住原生表单控件：滑块的拇指是 div、方向键照样能改值；各家族的禁用面认的是 data-disabled，
// 此前组内的文本框、选择器、复选框、按钮行为上被禁了，外观却一点不变灰，像是还能用。
// legend 里的控件不受本组禁用（原生语义），常用来放「启用这一组」的开关。
// 焦点与键盘只有真实浏览器给得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhButton,
  XhCheckbox,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhSelectRoot,
  XhSliderControl,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
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

const locked = ref(true)
const volume = ref([40])

async function mount(): Promise<void> {
  locked.value = true
  volume.value = [40]
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldsetRoot, { disabled: locked.value }, () => [
      h(XhFieldsetLegend, null, () => h(XhCheckbox, { 'data-test': 'legend-toggle' }, () => '启用这一组')),
      h(XhTextFieldRoot, { 'aria-label': '公司名称' }, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput))),
      h(XhSelectRoot, { collection: [{ value: 'd', label: '每天' }], label: '频率', placeholder: '请选择' }),
      h(XhCheckbox, { 'data-test': 'inner-check' }, () => '自动续费'),
      h(XhSliderRoot, { 'value': volume.value, 'onUpdate:value': (v: number[]) => (volume.value = v), 'aria-label': '音量' }, () =>
        h(XhSliderControl, null, () => [h(XhSliderTrack), h(XhSliderThumb)])),
      h(XhButton, null, () => '保存'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function scoped(scope: string, part: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  if (!el)
    throw new Error(`找不到 ${scope}/${part}`)
  return el
}

const INNER: Array<[string, string]> = [
  ['text-field', 'control'],
  ['select', 'trigger'],
  ['slider', 'root'],
  ['button', 'root'],
]

describe('字段集整组禁用', () => {
  it('组内组件库的控件都投影禁用，禁用面随之到位', async () => {
    await mount()
    for (const [scope, part] of INNER)
      expect(scoped(scope, part).hasAttribute('data-disabled'), `${scope}/${part}`).toBe(true)
    const inner = host!.querySelector<HTMLElement>(`[data-test='inner-check']`)!
    expect(inner.hasAttribute('data-disabled')).toBe(true)
  })

  it('滑块拇指这类非原生节点同样禁用：抽掉 Tab 位，方向键改不了值', async () => {
    await mount()
    const thumb = scoped('slider', 'thumb')
    expect(thumb.getAttribute('aria-disabled')).toBe('true')
    expect(thumb.hasAttribute('tabindex')).toBe(false)
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    await nextTick()
    expect(volume.value).toEqual([40])
  })

  it('legend 里的开关不受本组禁用', async () => {
    await mount()
    const toggle = host!.querySelector<HTMLElement>(`[data-test='legend-toggle']`)!
    expect(toggle.hasAttribute('data-disabled')).toBe(false)
  })

  it('整组解禁后，组内控件一并恢复', async () => {
    await mount()
    locked.value = false
    await nextTick()
    await nextTick()
    for (const [scope, part] of INNER)
      expect(scoped(scope, part).hasAttribute('data-disabled'), `${scope}/${part}`).toBe(false)
    expect(scoped('slider', 'thumb').getAttribute('tabindex')).toBe('0')
  })
})
