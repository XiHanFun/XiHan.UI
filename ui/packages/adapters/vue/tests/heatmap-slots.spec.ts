import type { HeatmapCellSlotProps, HeatmapRootSlotProps } from '../src'
import { mount } from '@vue/test-utils'
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhHeatmapRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

const MATRIX = {
  variant: 'matrix' as const,
  rows: ['周一', '周二'],
  columns: ['上午', '下午'],
  value: [
    { row: '周一', column: '上午', value: 5 },
    { row: '周二', column: '下午', value: 2 },
  ],
}

/** 挂一棵默认树，返回 root 节点。 */
function render(props: Record<string, unknown>, slots: Record<string, unknown>): HTMLElement {
  const w = mount(
    defineComponent({ setup: () => () => h(XhHeatmapRoot, props, slots) }),
    { attachTo: document.body },
  )
  return w.element as HTMLElement
}

const cellQuery = '[data-scope="heatmap"][data-part="cell"]'

describe('热力图的 cell 插槽', () => {
  it('日期形态：每格都铺一次，载荷带日期', () => {
    const root = render(
      { startDate: '2024-01-01', endDate: '2024-01-03' },
      { cell: (cell: HeatmapCellSlotProps) => ('date' in cell ? cell.date.slice(-2) : '') },
    )
    const cells = [...root.querySelectorAll(cellQuery)]
    expect(cells.map(el => el.textContent)).toEqual(['01', '02', '03'])
  })

  it('矩阵形态：每格同样铺得到，载荷带行列与数值', () => {
    const root = render(
      MATRIX,
      { cell: (cell: HeatmapCellSlotProps) => ('date' in cell ? '' : `${cell.row}/${cell.column}=${cell.count}`) },
    )
    const cells = [...root.querySelectorAll(cellQuery)]
    expect(cells.map(el => el.textContent)).toEqual([
      '周一/上午=5',
      '周一/下午=0',
      '周二/上午=0',
      '周二/下午=2',
    ])
  })

  it('不写 cell 插槽时格子仍是空的', () => {
    const root = render(MATRIX, {})
    expect([...root.querySelectorAll(cellQuery)].every(el => el.textContent === '')).toBe(true)
  })
})

describe('热力图默认插槽的载荷', () => {
  it('三形态通用的那一组也在里面：矩阵形态下靠它读锚点、挪锚点', () => {
    let seen: HeatmapRootSlotProps | null = null
    render(MATRIX, {
      default: (props: HeatmapRootSlotProps) => {
        seen = props
        return []
      },
    })
    const props = seen as unknown as HeatmapRootSlotProps
    expect(props.variant).toBe('matrix')
    // 带 Date 的那一组在矩阵形态下恒为 null，只有 Cell 那一组读得出
    expect(props.anchorDate).toBeNull()
    expect(props.anchorCell).toEqual({ row: '周一', column: '上午' })
    expect(props.focusedCell).toBeNull()
    expect(props.detailOpen).toBe(false)
    expect(typeof props.setFocusedCell).toBe('function')
  })

  it('挪过锚点之后载荷里读得出新的锚点', async () => {
    const seen: HeatmapRootSlotProps[] = []
    const w = mount(
      defineComponent({
        setup: () => () => h(XhHeatmapRoot, MATRIX, {
          default: (props: HeatmapRootSlotProps) => {
            seen.push(props)
            return []
          },
        }),
      }),
      { attachTo: document.body },
    )
    seen.at(-1)!.setFocusedCell({ row: '周二', column: '下午' })
    await w.vm.$nextTick()
    expect(seen.at(-1)!.focusedCell).toEqual({ row: '周二', column: '下午' })
    expect(seen.at(-1)!.anchorCell).toEqual({ row: '周二', column: '下午' })
  })
})
