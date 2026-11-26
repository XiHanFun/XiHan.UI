// @vitest-environment jsdom
// 不写默认插槽时照 stepsStructure 铺：铺出的 DOM 与手写全套部件逐节点相同，换步后序号圆点跟着换字。
import { describe, expect, it } from 'vitest'
import { h, ref } from 'vue'
import { XhStepsDescription, XhStepsIndicator, XhStepsItem, XhStepsList, XhStepsRoot, XhStepsSeparator, XhStepsTitle, XhStepsTrigger } from '../src'
import { flush, mountRender, structureSnapshot } from './structure-snapshot'

const STEPS = [
  { title: '填写地址', description: '收货人与联系方式' },
  { title: '选择支付' },
  { title: '确认订单', description: '核对金额' },
]

/** 手写全套部件：走过的步圆点留空，点状形态一律留空，没有说明的步不写说明。 */
function manual(props: Record<string, unknown>, current: number) {
  return () => h(XhStepsRoot, props, () => [
    h(XhStepsList, () => STEPS.map((step, i) => h(XhStepsItem, { key: i, value: i }, () => [
      h(XhStepsTrigger, () => [
        h(XhStepsIndicator, () => (props.variant === 'dot' || i < current ? '' : String(i + 1))),
        h(XhStepsTitle, () => step.title),
        step.description ? h(XhStepsDescription, () => step.description) : null,
      ]),
      h(XhStepsSeparator),
    ]))),
  ])
}

describe('steps 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：tablist / tab、aria-current 与 posinset 都在', () => {
    const props = { collection: STEPS, defaultValue: 1 }
    const auto = mountRender(() => h(XhStepsRoot, props))
    expect(structureSnapshot(auto)).toEqual(structureSnapshot(mountRender(manual(props, 1))))
    expect(auto.querySelector('[data-part="list"]')?.getAttribute('role')).toBe('tablist')
    expect(auto.querySelector('[data-part="trigger"][aria-current="step"]')?.textContent).toBe('2选择支付')
  })

  it('只读展示与点状形态同样逐节点相同：只读下触发器是 div、列表是有序列表语义', () => {
    for (const [props, current] of [[{ collection: STEPS, value: 2, readOnly: true }, 2], [{ collection: STEPS, defaultValue: 1, variant: 'dot' }, 1]] as const) {
      const auto = mountRender(() => h(XhStepsRoot, props))
      expect(structureSnapshot(auto)).toEqual(structureSnapshot(mountRender(manual(props, current))))
    }
    const readOnly = mountRender(() => h(XhStepsRoot, { collection: STEPS, value: 2, readOnly: true }))
    expect(readOnly.querySelector('[data-part="trigger"]')?.localName).toBe('div')
    expect(readOnly.querySelector('[data-part="list"]')?.getAttribute('role')).toBe('list')
  })

  it('换步后走过的圆点留空、交给皮肤画对号；退回去序号又写回来', async () => {
    const step = ref(0)
    const host = mountRender(() => h(XhStepsRoot, { collection: STEPS, value: step.value }))
    const indicators = (): string[] => Array.from(host.querySelectorAll('[data-part="indicator"]'), el => el.textContent ?? '')
    expect(indicators()).toEqual(['1', '2', '3'])
    step.value = 2
    await flush()
    expect(indicators()).toEqual(['', '', '3'])
    step.value = 1
    await flush()
    expect(indicators()).toEqual(['', '2', '3'])
  })
})
