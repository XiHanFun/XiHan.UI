import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
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
  const stateAttr = collapsed ? 'collapsed' : 'expanded'

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

    // 侧栏位置、折叠态与分隔线开关都落在根上，各段从这里取自己的排布与描边
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-sider-placement': placement,
      'data-sider-collapsed': dataAttr(collapsed),
      'data-bordered': dataAttr(prop('bordered')),
    }),

    getHeaderProps: () => normalize.element({ ...parts.header.attrs }),

    getSiderProps: () => normalize.element({
      ...parts.sider.attrs,
      'id': ids.sider,
      'data-state': stateAttr,
      'data-placement': placement,
      'style': { inlineSize: siderWidth },
    }),

    getContentProps: () => normalize.element({ ...parts.content.attrs }),

    getFooterProps: () => normalize.element({ ...parts.footer.attrs }),

    // 把手指名它开合的是哪一段：aria-controls 指向侧栏，aria-expanded 说的是侧栏展开与否
    getSiderTriggerProps: () => normalize.button({
      ...parts['sider-trigger'].attrs,
      'type': 'button',
      'aria-controls': ids.sider,
      'aria-expanded': collapsed ? 'false' : 'true',
      'data-state': stateAttr,
      'onClick': () => send({ type: 'SIDER.TOGGLE' }),
    }),
  }
}
