// @vitest-environment jsdom
// 不给 children 时照 stepsStructure 铺：铺出的 DOM 与手写全套部件逐节点相同，换步后序号圆点跟着换字。
import type { XhStepsRootProps } from '../src'
import { describe, expect, it } from 'vitest'
import { XhStepsDescription, XhStepsIndicator, XhStepsItem, XhStepsList, XhStepsRoot, XhStepsSeparator, XhStepsTitle, XhStepsTrigger } from '../src'
import { renderInto, structureSnapshot } from './structure-snapshot'

const STEPS = [
  { title: '填写地址', description: '收货人与联系方式' },
  { title: '选择支付' },
  { title: '确认订单', description: '核对金额' },
]

/** 手写全套部件：走过的步圆点留空，点状形态一律留空，没有说明的步不写说明。 */
function Manual({ current, ...props }: XhStepsRootProps & { current: number }) {
  return (
    <XhStepsRoot {...props}>
      <XhStepsList>
        {STEPS.map((step, i) => (
          <XhStepsItem key={step.title} value={i}>
            <XhStepsTrigger>
              <XhStepsIndicator>{props.variant === 'dot' || i < current ? '' : String(i + 1)}</XhStepsIndicator>
              <XhStepsTitle>{step.title}</XhStepsTitle>
              {step.description ? <XhStepsDescription>{step.description}</XhStepsDescription> : null}
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        ))}
      </XhStepsList>
    </XhStepsRoot>
  )
}

describe('steps 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：tablist / tab、aria-current 与 posinset 都在', async () => {
    const auto = await renderInto(<XhStepsRoot collection={STEPS} defaultValue={1} />)
    const hand = await renderInto(<Manual collection={STEPS} defaultValue={1} current={1} />)
    expect(structureSnapshot(auto.host)).toEqual(structureSnapshot(hand.host))
    expect(auto.host.querySelector('[data-part="list"]')?.getAttribute('role')).toBe('tablist')
    expect(auto.host.querySelector('[data-part="trigger"][aria-current="step"]')?.textContent).toBe('2选择支付')
  })

  it('只读展示与点状形态同样逐节点相同：只读下触发器是 div、列表是有序列表语义', async () => {
    const readOnly = await renderInto(<XhStepsRoot collection={STEPS} value={2} readOnly />)
    expect(structureSnapshot(readOnly.host)).toEqual(structureSnapshot((await renderInto(<Manual collection={STEPS} value={2} readOnly current={2} />)).host))
    expect(readOnly.host.querySelector('[data-part="trigger"]')?.localName).toBe('div')
    expect(readOnly.host.querySelector('[data-part="list"]')?.getAttribute('role')).toBe('list')
    const dot = await renderInto(<XhStepsRoot collection={STEPS} defaultValue={1} variant="dot" />)
    expect(structureSnapshot(dot.host)).toEqual(structureSnapshot((await renderInto(<Manual collection={STEPS} defaultValue={1} variant="dot" current={1} />)).host))
  })

  it('换步后走过的圆点留空、交给皮肤画对号；退回去序号又写回来', async () => {
    const view = await renderInto(<XhStepsRoot collection={STEPS} value={0} />)
    const indicators = (): string[] => Array.from(view.host.querySelectorAll('[data-part="indicator"]'), el => el.textContent ?? '')
    expect(indicators()).toEqual(['1', '2', '3'])
    await view.rerender(<XhStepsRoot collection={STEPS} value={2} />)
    expect(indicators()).toEqual(['', '', '3'])
    await view.rerender(<XhStepsRoot collection={STEPS} value={1} />)
    expect(indicators()).toEqual(['', '2', '3'])
  })
})
