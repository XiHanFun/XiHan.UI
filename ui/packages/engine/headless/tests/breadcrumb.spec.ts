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

  it('分隔符与省略号对读屏隐藏', () => {
    expect((api().getSeparatorProps() as Props)['aria-hidden']).toBe(true)
    expect((api().getEllipsisProps() as Props)['aria-hidden']).toBe(true)
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

  it('meta 的必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(breadcrumbAnatomy.parts)
    expect(breadcrumbMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
