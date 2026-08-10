// @vitest-environment jsdom
import type { BreadcrumbProps } from '../src/breadcrumb'
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
import { breadcrumbAnatomy, breadcrumbMeta, connectBreadcrumb } from '../src/breadcrumb'

type Props = Record<string, unknown>

function api(props: BreadcrumbProps = {}) {
  return connectBreadcrumb(props, normalizeProps)
}

describe('connectBreadcrumb', () => {
  it('root 是带名字的 nav 地标；dir 未给时不写，免得切断继承', () => {
    const root = api().getRootProps() as Props
    expect(root['data-scope']).toBe('breadcrumb')
    expect(root['data-part']).toBe('root')
    expect(root['aria-label']).toBe('Breadcrumb')
    expect(root.dir).toBeUndefined()

    expect((api({ dir: 'rtl' }).getRootProps() as Props).dir).toBe('rtl')
  })

  it('translations 覆盖地标名字', () => {
    expect((api({ translations: { root: '面包屑' } }).getRootProps() as Props)['aria-label']).toBe('面包屑')
  })

  it('list 与 item 只带身份标记：有序与层级由 ol/li 标签自己给，不再补 role', () => {
    const list = api().getListProps() as Props
    const item = api().getItemProps() as Props
    expect(list).toEqual({ 'data-scope': 'breadcrumb', 'data-part': 'list' })
    expect(item).toEqual({ 'data-scope': 'breadcrumb', 'data-part': 'item' })
  })

  it('当前页那条：aria-current=page + aria-disabled=true + 脱出 Tab 序列', () => {
    const link = api().getLinkProps({ current: true }) as Props
    expect(link['aria-current']).toBe('page')
    expect(link['aria-disabled']).toBe('true')
    expect(link.tabindex).toBe(-1)
    expect(link['data-current']).toBe('')
  })

  it('非当前页那条：不写 aria-current、不写 tabindex，aria-disabled 显式 false', () => {
    const link = api().getLinkProps({ current: false }) as Props
    // aria-current 的默认值就是 "false"，省略即"不是当前项"；写一遍 false 只是噪音
    expect(link['aria-current']).toBeUndefined()
    // aria-disabled 是布尔 aria：省略是"没说"，显式 false 是"明确说了不是"
    expect(link['aria-disabled']).toBe('false')
    // <a href> 本来就在 Tab 序列里，补 tabindex 只会无谓地多一层
    expect(link.tabindex).toBeUndefined()
    expect(link['data-current']).toBeUndefined()
  })

  it('current 缺省等同于 false', () => {
    const link = api().getLinkProps({}) as Props
    expect(link['aria-current']).toBeUndefined()
    expect(link['aria-disabled']).toBe('false')
  })

  it('当前页那条点不动：click 被 preventDefault，别的条放行', () => {
    // 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 恒 false，
    // 断言会永远为真——必须显式建可取消的事件才验得到这道守卫
    const fire = (props: Props): boolean => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      ;(props.onClick as (e: MouseEvent) => void)(event)
      return event.defaultPrevented
    }
    expect(fire(api().getLinkProps({ current: true }) as Props)).toBe(true)
    expect(fire(api().getLinkProps({ current: false }) as Props)).toBe(false)
  })

  it('分隔符与省略号对读屏隐藏', () => {
    expect((api().getSeparatorProps() as Props)['aria-hidden']).toBe('true')
    expect((api().getEllipsisProps() as Props)['aria-hidden']).toBe('true')
  })

  it('meta 的必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(breadcrumbAnatomy.parts)
    expect(breadcrumbMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
