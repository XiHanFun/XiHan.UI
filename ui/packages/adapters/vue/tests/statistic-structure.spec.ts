// @vitest-environment jsdom
// 不写默认插槽时照 statisticStructure 铺；value 按语言格式化，value 部件里写了内容就照写的显示。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { provideXhConfig, XhStatisticLabel, XhStatisticRoot, XhStatisticSuffix, XhStatisticTrend, XhStatisticValue } from '../src'

let unmounts: Array<() => void> = []

afterEach(() => {
  for (const un of unmounts) un()
  unmounts = []
  document.body.innerHTML = ''
})

function mount(setup: () => () => unknown): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({ setup }))
  app.mount(host)
  unmounts.push(() => {
    app.unmount()
    host.remove()
  })
  return host
}

/** 部件的标签、名字与文字，按文档序。 */
function skeleton(host: Element): string[] {
  return Array.from(host.querySelectorAll('[data-scope="statistic"][data-part]'), el => `${el.localName}|${el.getAttribute('data-part')}|${el.textContent}`)
}

function value(host: Element): string | null | undefined {
  return host.querySelector('[data-scope="statistic"][data-part="value"]')?.textContent
}

describe('statistic 的标准结构', () => {
  it('label、value、suffix 插槽与涨跌铺出的树与手写全套部件一致；数值按 locale 分组', () => {
    const auto = skeleton(mount(() => () => h(XhStatisticRoot, { label: '本月新增用户', value: 12480, locale: 'en-US', trend: 'up', trendText: '同比 12%' }, {
      suffix: () => '人',
    })))
    const manual = skeleton(mount(() => () => h(XhStatisticRoot, { trend: 'up' }, () => [
      h(XhStatisticLabel, () => '本月新增用户'),
      h(XhStatisticValue, () => '12,480'),
      h(XhStatisticSuffix, () => '人'),
      h(XhStatisticTrend, () => '同比 12%'),
    ])))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[1])).toEqual(['root', 'label', 'value', 'suffix', 'trend'])
  })

  it('formatOptions 原样交给 Intl.NumberFormat：货币写法跟着语言走', () => {
    const host = mount(() => () => h(XhStatisticRoot, { value: 1280.5, locale: 'zh-CN', formatOptions: { style: 'currency', currency: 'CNY' } }))
    expect(value(host)).toBe('¥1,280.50')
  })

  it('不写 locale 时取全局配置的语言', () => {
    const host = mount(() => {
      provideXhConfig({ locale: 'de-DE' })
      return () => h(XhStatisticRoot, { value: 1234.5 })
    })
    expect(value(host)).toBe('1.234,5')
  })

  it('value 改了文字当场跟着换；label 插槽压过 label 文字', async () => {
    const n = ref(1000)
    const host = mount(() => () => h(XhStatisticRoot, { label: '不用这段', value: n.value, locale: 'en-US' }, { label: () => '订单数' }))
    expect(skeleton(host).slice(1)).toEqual(['span|label|订单数', 'span|value|1,000'])
    n.value = 2500
    await nextTick()
    expect(value(host)).toBe('2,500')
  })

  it('手写结构：value 部件空着时铺格式化好的数值，写了内容就照写的显示', () => {
    const empty = mount(() => () => h(XhStatisticRoot, { value: 0.256, locale: 'en-US', formatOptions: { style: 'percent' } }, () => [
      h(XhStatisticValue),
    ]))
    expect(value(empty)).toBe('26%')
    const authored = mount(() => () => h(XhStatisticRoot, { value: 0.256, locale: 'en-US' }, () => [
      h(XhStatisticValue, () => '约四分之一'),
    ]))
    expect(value(authored)).toBe('约四分之一')
  })
})
