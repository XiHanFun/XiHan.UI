// @vitest-environment jsdom
// 不给 children 时照 statisticStructure 铺；value 按语言格式化，value 部件里写了内容就照写的显示。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhConfigProvider, XhStatisticLabel, XhStatisticRoot, XhStatisticSuffix, XhStatisticTrend, XhStatisticValue } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(node: React.ReactNode): Promise<HTMLElement> {
  act(() => root?.unmount())
  document.body.innerHTML = ''
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  return host
}

function skeleton(host: Element): string[] {
  return Array.from(host.querySelectorAll('[data-scope="statistic"][data-part]'), el => `${el.localName}|${el.getAttribute('data-part')}|${el.textContent}`)
}

function value(host: Element): string | null | undefined {
  return host.querySelector('[data-scope="statistic"][data-part="value"]')?.textContent
}

describe('statistic 的标准结构', () => {
  it('label、value、suffix 与涨跌铺出的树与手写全套部件一致；数值按 locale 分组', async () => {
    const auto = skeleton(await render(<XhStatisticRoot label="本月新增用户" value={12480} locale="en-US" suffix="人" trend="up" trendText="同比 12%" />))
    const manual = skeleton(await render(
      <XhStatisticRoot trend="up">
        <XhStatisticLabel>本月新增用户</XhStatisticLabel>
        <XhStatisticValue>12,480</XhStatisticValue>
        <XhStatisticSuffix>人</XhStatisticSuffix>
        <XhStatisticTrend>同比 12%</XhStatisticTrend>
      </XhStatisticRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[1])).toEqual(['root', 'label', 'value', 'suffix', 'trend'])
  })

  it('formatOptions 原样交给 Intl.NumberFormat：货币写法跟着语言走', async () => {
    const host = await render(<XhStatisticRoot value={1280.5} locale="zh-CN" formatOptions={{ style: 'currency', currency: 'CNY' }} />)
    expect(value(host)).toBe('¥1,280.50')
  })

  it('不写 locale 时取全局配置的语言', async () => {
    const host = await render(<XhConfigProvider config={{ locale: 'de-DE' }}><XhStatisticRoot value={1234.5} /></XhConfigProvider>)
    expect(value(host)).toBe('1.234,5')
  })

  it('label 是节点时由 label 部件装着', async () => {
    const host = await render(<XhStatisticRoot label={<strong>订单数</strong>} value={1000} locale="en-US" />)
    expect(skeleton(host).slice(1)).toEqual(['span|label|订单数', 'span|value|1,000'])
    expect(host.querySelector('[data-part="label"] > strong')).not.toBeNull()
  })

  it('手写结构：value 部件空着时铺格式化好的数值，写了内容就照写的显示', async () => {
    const empty = await render(<XhStatisticRoot value={0.256} locale="en-US" formatOptions={{ style: 'percent' }}><XhStatisticValue /></XhStatisticRoot>)
    expect(value(empty)).toBe('26%')
    const authored = await render(<XhStatisticRoot value={0.256} locale="en-US"><XhStatisticValue>约四分之一</XhStatisticValue></XhStatisticRoot>)
    expect(value(authored)).toBe('约四分之一')
  })
})
