// @vitest-environment jsdom
import type { BreadcrumbApi, BreadcrumbProps } from '../src/breadcrumb'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { breadcrumbAnatomy, breadcrumbMachine, breadcrumbMeta, connectBreadcrumb } from '../src/breadcrumb'

type Props = Record<string, unknown>

/** 起一台机器：面包屑的机器只承载按压通道，属性仍由 props 决定。 */
function makeService(props: BreadcrumbProps = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(breadcrumbMachine, { props: () => ({ ...props }), runtime })
  runtime.start()
  return { api: (): BreadcrumbApi => connectBreadcrumb(service, normalizeProps) }
}

function api(props: BreadcrumbProps = {}): BreadcrumbApi {
  return makeService(props).api()
}

/** 按压事件桩：只有 key 与 repeat / isComposing 参与判定。 */
function key(name: string): KeyboardEvent {
  return { key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent
}

function fire(props: Props, name: string, event: unknown): void {
  (props[name] as (e: unknown) => void)(event)
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
    const link = api().getLinkProps({ value: 'docs', current: true }) as Props
    expect(link['aria-current']).toBe('page')
    expect(link['aria-disabled']).toBe('true')
    expect(link.tabindex).toBe(-1)
    expect(link['data-current']).toBe('')
  })

  it('非当前页那条：不写 aria-current、不写 tabindex，aria-disabled 显式 false', () => {
    const link = api().getLinkProps({ value: 'home', current: false }) as Props
    // aria-current 的默认值就是 "false"，省略即"不是当前项"；写一遍 false 只是噪音
    expect(link['aria-current']).toBeUndefined()
    // aria-disabled 是布尔 aria：省略是"没说"，显式 false 是"明确说了不是"
    expect(link['aria-disabled']).toBe('false')
    // <a href> 本来就在 Tab 序列里，补 tabindex 只会无谓地多一层
    expect(link.tabindex).toBeUndefined()
    expect(link['data-current']).toBeUndefined()
  })

  it('链接投影 Collection Item 的 nav 语境与尺寸档，当前页显式投影 terminal', () => {
    const link = api({ size: 'sm' }).getLinkProps({ value: 'home', current: false }) as Props
    expect(link['data-xh-collection-item']).toBe('')
    expect(link['data-xh-collection-size']).toBe('sm')
    expect(link['data-xh-collection-context']).toBe('nav')
    expect(link['data-xh-collection-terminal']).toBeUndefined()
    // 当前页同时带 aria-disabled='true'，terminal 要显式标出来，家族才不会按禁用面画它
    const current = api().getLinkProps({ value: 'docs', current: true }) as Props
    expect(current['data-xh-collection-terminal']).toBe('')
    // size 不写时家族尺寸档落 md
    expect(current['data-xh-collection-size']).toBe('md')
  })

  it('current 缺省等同于 false', () => {
    const link = api().getLinkProps({ value: 'home' }) as Props
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
    expect(fire(api().getLinkProps({ value: 'docs', current: true }) as Props)).toBe(true)
    expect(fire(api().getLinkProps({ value: 'home', current: false }) as Props)).toBe(false)
  })

  it('分隔符对读屏隐藏；省略位是列表项、不再隐藏，里面的触发器是带名字的按钮', () => {
    expect((api().getSeparatorProps() as Props)['aria-hidden']).toBe(true)
    const ellipsis = api().getEllipsisProps() as Props
    expect(ellipsis['aria-hidden']).toBeUndefined()
    expect(ellipsis.hidden).toBeUndefined()
    const trigger = api().getEllipsisTriggerProps() as Props
    expect(trigger.type).toBe('button')
    expect(trigger['aria-label']).toBe('Show full path')
    expect(trigger['data-xh-collection-context']).toBe('nav')
    expect((api({ translations: { ellipsis: '展开完整路径' } }).getEllipsisTriggerProps() as Props)['aria-label']).toBe('展开完整路径')
  })

  it('按压通道：keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路', () => {
    const h = makeService()
    const link = (value = 'home'): Props => h.api().getLinkProps({ value }) as Props
    expect(link()['data-pressed']).toBeUndefined()
    fire(link(), 'onKeyDown', key(' '))
    expect(link()['data-pressed']).toBe('')
    fire(link(), 'onKeyUp', key(' '))
    expect(link()['data-pressed']).toBeUndefined()
    fire(link(), 'onKeyDown', key('Enter'))
    expect(link()['data-pressed']).toBe('')
    fire(link(), 'onBlur', {})
    expect(link()['data-pressed']).toBeUndefined()
    fire(link(), 'onPointerDown', { pointerType: 'touch' })
    expect(link()['data-pressed']).toBe('')
    fire(link(), 'onPointerCancel', {})
    expect(link()['data-pressed']).toBeUndefined()
    fire(link(), 'onPointerDown', { pointerType: 'touch' })
    expect(link()['data-pressed']).toBe('')
    fire(link(), 'onPointerUp', {})
    expect(link()['data-pressed']).toBeUndefined()
    fire(link(), 'onPointerDown', { pointerType: 'mouse' })
    expect(link()['data-pressed']).toBeUndefined()
  })

  it('按压通道：按 value 记住按住的那一条，另一条的 keyup 不把它松开；当前页那条不进', () => {
    const h = makeService()
    const link = (value: string, current = false): Props => h.api().getLinkProps({ value, current }) as Props
    fire(link('home'), 'onKeyDown', key('Enter'))
    expect(link('home')['data-pressed']).toBe('')
    expect(link('docs')['data-pressed']).toBeUndefined()
    fire(link('docs'), 'onKeyUp', key('Enter'))
    expect(link('home')['data-pressed']).toBe('')
    fire(link('home'), 'onKeyUp', key('Enter'))
    expect(link('home')['data-pressed']).toBeUndefined()
    // 当前页带 aria-current 与 aria-disabled，是不可点的终点
    fire(link('docs', true), 'onKeyDown', key('Enter'))
    expect(link('docs', true)['data-pressed']).toBeUndefined()
    fire(link('docs', true), 'onPointerDown', { pointerType: 'touch' })
    expect(link('docs', true)['data-pressed']).toBeUndefined()
  })

  it('折叠：首层与末几层恒在，中间一段换成省略位；按下触发器展开完整路径，省略位收起', () => {
    const collection = ['home', 'docs', 'guides', 'components', 'breadcrumb'].map(value => ({ value }))
    const h = makeService({ collection, maxItems: 3 })
    expect(h.api().items.map(item => item.type === 'node' ? item.node.value : `…${item.nodes.map(n => n.value).join(',')}`))
      .toEqual(['home', '…docs,guides', 'components', 'breadcrumb'])
    expect(h.api().collapsedRange(5)).toEqual({ start: 1, end: 3 })
    expect(h.api().expanded).toBe(false)

    const list = document.createElement('ol')
    list.setAttribute('data-scope', 'breadcrumb')
    list.setAttribute('data-part', 'list')
    const trigger = document.createElement('button')
    const home = document.createElement('a')
    home.setAttribute('data-scope', 'breadcrumb')
    home.setAttribute('data-part', 'link')
    list.append(home, trigger)
    document.body.append(list)
    const onClick = (h.api().getEllipsisTriggerProps() as Props).onClick as (e: unknown) => void
    onClick({ currentTarget: trigger })

    expect(h.api().expanded).toBe(true)
    expect(h.api().items.every(item => item.type === 'node')).toBe(true)
    expect(h.api().collapsedRange(5)).toBeNull()
    expect((h.api().getEllipsisProps() as Props).hidden).toBe(true)
    list.remove()
  })

  it('展开后焦点落到第一条展开出来的链接：触发器之前有几条链接，就落第几条', async () => {
    const h = makeService({ collection: ['a', 'b', 'c', 'd'].map(value => ({ value })), maxItems: 2 })
    const list = document.createElement('ol')
    list.setAttribute('data-scope', 'breadcrumb')
    list.setAttribute('data-part', 'list')
    const link = (): HTMLAnchorElement => {
      const el = document.createElement('a')
      el.href = '#'
      el.setAttribute('data-scope', 'breadcrumb')
      el.setAttribute('data-part', 'link')
      return el
    }
    const first = link()
    const trigger = document.createElement('button')
    const last = link()
    list.append(first, trigger, last)
    document.body.append(list)
    ;((h.api().getEllipsisTriggerProps() as Props).onClick as (e: unknown) => void)({ currentTarget: trigger })
    // 宿主把展开后的路径渲出来：被折叠的 b、c 插回首层之后，触发器随省略位消失
    const revealed = link()
    trigger.replaceWith(revealed, link())
    // 落焦推迟到宿主渲完这一轮
    await Promise.resolve()
    expect(document.activeElement).toBe(revealed)
    list.remove()
  })

  it('collapsedRange：不给 maxItems、非正数或层数不超过上限都不折；上限为 1 时只留末层', () => {
    expect(api().collapsedRange(5)).toBeNull()
    expect(api({ maxItems: 0 }).collapsedRange(5)).toBeNull()
    expect(api({ maxItems: 5 }).collapsedRange(5)).toBeNull()
    expect(api({ maxItems: 1 }).collapsedRange(5)).toEqual({ start: 0, end: 4 })
    expect(api({ maxItems: 4 }).collapsedRange(6)).toEqual({ start: 1, end: 3 })
  })

  it('程序化展开只改状态，焦点不动', () => {
    const h = makeService({ collection: ['a', 'b', 'c'].map(value => ({ value })), maxItems: 2 })
    h.api().expand()
    expect(h.api().expanded).toBe(true)
    expect(h.api().items).toHaveLength(3)
  })

  it('meta 的必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(breadcrumbAnatomy.parts)
    expect(breadcrumbMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
