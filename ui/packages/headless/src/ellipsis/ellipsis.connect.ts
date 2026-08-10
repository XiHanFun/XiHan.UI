import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { EllipsisApi, EllipsisSchema } from './ellipsis.types'
import { dataAttr } from '@xihan-ui/core'
import { ellipsisAnatomy } from './ellipsis.anatomy'
import { resolveEllipsisLines } from './ellipsis.machine'

const parts = ellipsisAnatomy.build()

/**
 * 溢出与否是量出来的，这里只读结果并落成 data-overflowing——浮层不在这层做，
 * 要不要套一层提示由作者按这个属性（或 api.overflowing）决定。
 * tooltip 开着时另给一条不用浮层的路：真被裁了才把整段文字交给平台的原生提示。
 */
export function connectEllipsis<T extends PropTypes>(
  service: Service<EllipsisSchema>,
  normalize: NormalizeProps<T>,
): EllipsisApi<T> {
  const { state, prop, context, send } = service

  const expanded = state.matches('expanded')
  const overflowing = context.get('overflowing')
  const expandable = !!prop('expandable')
  const lines = resolveEllipsisLines(prop('lines'))
  const multiline = lines > 1
  // 铺开着就没什么被裁掉了，提示一并撤走
  const title = prop('tooltip') && overflowing && !expanded ? context.get('text') : undefined

  const setExpanded = (next: boolean): void => {
    if (next !== expanded)
      send({ type: 'TOGGLE' })
  }

  return {
    expanded,
    overflowing,
    setExpanded,
    measure: () => send({ type: 'MEASURE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 行数两处都写：data-lines 是读得懂的那一份，内联自定义属性是皮肤拿去裁行的那一份
      'data-lines': String(lines),
      'style': `--xh-_ellipsis-lines: ${lines}`,
      'data-multiline': dataAttr(multiline),
      'data-expandable': dataAttr(expandable),
      'data-expanded': dataAttr(expanded),
      'data-overflowing': dataAttr(overflowing),
      // 可展开时整块文字就是那颗按钮：读屏念得出角色、Tab 停得住、Enter / Space 按得动。
      // 不可展开时这几件一个都不写，它就还是一段普通的文字
      ...(expandable
        ? {
            'role': 'button',
            'tabindex': 0,
            'aria-expanded': expanded ? 'true' : 'false',
            'onClick': () => send({ type: 'TOGGLE' }),
            'onKeydown': (event: KeyboardEvent) => {
              if (event.key !== 'Enter' && event.key !== ' ')
                return
              // Space 的默认动作是翻页
              event.preventDefault()
              send({ type: 'TOGGLE' })
            },
          }
        : {}),
      ...(title === undefined ? {} : { title }),
    }),
  }
}
