import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { LayoutApi, LayoutSchema } from './layout.types'
import { dataAttr } from '@xihan-ui/core'
import { layoutAnatomy } from './layout.anatomy'

const parts = layoutAnatomy.build()

// 根上不写 role：地标（banner / navigation / main / contentinfo）该不该标、标在哪一段，
// 取决于这套骨架在页面里的位置，由作者自己声明。
export function connectLayout<T extends PropTypes>(
  service: Service<LayoutSchema>,
  normalize: NormalizeProps<T>,
): LayoutApi<T> {
  const { state, prop, send, scope } = service
  const collapsed = state.get() === 'collapsed'
  const placement = prop('siderPlacement') ?? 'start'
  const ids = scope.ids('layout', 'sider')

  // 两个固定开关各走各的：头钉住不牵连侧栏，侧栏钉住也不牵连头。
  // 标记同时落在根与对应那一段上：段上的给自己的钉法用，根上的给需要看见两个开关的排布规则用
  // （头钉住时头这一行要改成定高；侧栏要不要让开头的高度，取决于头是不是也钉住了）。
  const headerFixed = prop('headerFixed')
  const siderFixed = prop('siderFixed')

  // 侧栏宽度取当前这一档；该档没给值就把内联宽度清空，宽度交回皮肤里的档位变量。
  // 只写标准长度属性、不写自定义属性：过渡由皮肤对 inline-size 声明。
  const siderWidth = (collapsed ? prop('siderCollapsedWidth') : prop('siderWidth')) ?? ''

  const setSiderCollapsed = (next: boolean): void => {
    if (next !== collapsed)
      send({ type: next ? 'SIDER.COLLAPSE' : 'SIDER.EXPAND' })
  }

  return {
    siderCollapsed: collapsed,
    setSiderCollapsed,

    // 侧栏位置、折叠态、两个固定开关与分隔线开关都落在根上，各段从这里取自己的排布与描边
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-sider-placement': placement,
      'data-collapsed': dataAttr(collapsed),
      'data-header-fixed': dataAttr(headerFixed),
      'data-sider-fixed': dataAttr(siderFixed),
      'data-bordered': dataAttr(prop('bordered')),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      'data-fixed': dataAttr(headerFixed),
    }),

    getSiderProps: () => normalize.element({
      ...parts.sider.attrs,
      'id': ids.sider,
      'data-collapsed': dataAttr(collapsed),
      'data-placement': placement,
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
