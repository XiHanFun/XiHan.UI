import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { LayoutApi, LayoutSchema } from './layout.types'
import { dataAttr } from '@xihan-ui/core'
import { layoutAnatomy } from './layout.anatomy'
import { resolveSiderPresentation } from './layout.machine'

const parts = layoutAnatomy.build()

// 根上不写 role：地标（banner / navigation / main / contentinfo）该不该标、标在哪一段，
// 取决于这套骨架在页面里的位置，由作者自己声明。
export function connectLayout<T extends PropTypes>(
  service: Service<LayoutSchema>,
  normalize: NormalizeProps<T>,
): LayoutApi<T> {
  const { state, prop, send, scope, context } = service
  const collapsed = state.get() === 'collapsed'
  const placement = prop('siderPlacement') ?? 'start'
  const ids = scope.ids('layout', 'sider')

  // 覆盖档的成立条件在这里收口：写了断点就只在未达档时成立，宽屏退回占位档
  const presentation = resolveSiderPresentation(
    prop('siderPresentation'),
    prop('siderBreakpoint'),
    context.get('siderNarrow'),
  )
  const sheet = presentation === 'sheet'

  // 两个固定开关各走各的：头钉住不牵连侧栏，侧栏钉住也不牵连头。
  // 标记同时落在根与对应那一段上：段上的给自己的钉法用，根上的给需要看见两个开关的排布规则用
  // （头钉住时头这一行要改成定高；侧栏要不要让开头的高度，取决于头是不是也钉住了）。
  const headerFixed = prop('headerFixed')
  const siderFixed = prop('siderFixed')

  // 侧栏宽度取当前这一档；该档没给值就把内联宽度清空，宽度交回皮肤里的档位变量。
  // 只写标准长度属性、不写自定义属性：过渡由皮肤对 inline-size 声明。
  // 覆盖档恒取展开那一档：收起只是把面板推出画外，宽度不参与
  const siderWidth = (collapsed && !sheet ? prop('siderCollapsedWidth') : prop('siderWidth')) ?? ''

  const setSiderCollapsed = (next: boolean): void => {
    if (next !== collapsed)
      send({ type: next ? 'SIDER.COLLAPSE' : 'SIDER.EXPAND' })
  }

  return {
    siderCollapsed: collapsed,
    siderPresentation: presentation,
    setSiderCollapsed,

    // 侧栏位置、折叠态、两个固定开关与分隔线开关都落在根上，各段从这里取自己的排布与描边
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-sider-placement': placement,
      // 断点档位落在根上：宽度未达档时由皮肤把侧栏换成折叠宽
      'data-sider-breakpoint': prop('siderBreakpoint'),
      // 已解析的呈现形态：宽屏落回 inline，皮肤据此决定侧栏占一列还是盖上去
      'data-sider-presentation': presentation,
      'data-collapsed': dataAttr(collapsed),
      'data-header-fixed': dataAttr(headerFixed),
      'data-sider-fixed': dataAttr(siderFixed),
      'data-bordered': dataAttr(prop('bordered')),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'data-fixed': dataAttr(headerFixed),
    }),

    // 遮罩只在覆盖档在场：占位档下带 hidden，既不占位也不吃指针。
    // 收起态不打 hidden——它得留在文档里把那一路淡出播完，让开指针归皮肤
    getSiderBackdropProps: () => normalize.element({
      ...parts['sider-backdrop'].attrs,
      'aria-hidden': true,
      'data-collapsed': dataAttr(collapsed),
      'hidden': !sheet || undefined,
      'onClick': () => setSiderCollapsed(true),
    }),

    getSiderProps: () => normalize.element({
      ...parts.sider.attrs,
      'id': ids.sider,
      'data-collapsed': dataAttr(collapsed),
      'data-placement': placement,
      'data-presentation': presentation,
      'data-fixed': dataAttr(siderFixed),
      'style': { inlineSize: siderWidth },
    }),

    getContentProps: () => normalize.element({ ...parts.content.attrs }),

    getFooterProps: () => normalize.element({ ...parts.footer.attrs }),

    // 把手指名它开合的是哪一段：aria-controls 指向侧栏，aria-expanded 与 data-collapsed 说的都是侧栏的折叠态
    getSiderTriggerProps: () => normalize.button({
      ...parts['sider-trigger'].attrs,
      'type': 'button',
      'aria-controls': ids.sider,
      'aria-expanded': collapsed ? 'false' : 'true',
      'data-collapsed': dataAttr(collapsed),
      'onClick': () => send({ type: 'SIDER.TOGGLE' }),
    }),
  }
}
