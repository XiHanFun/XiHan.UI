import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { TruncateApi, TruncateSchema } from './truncate.types'
import { dataAttr } from '@xihan-ui/core'
import { truncateAnatomy } from './truncate.anatomy'
import { resolveTruncateLines } from './truncate.machine'

const parts = truncateAnatomy.build()

/**
 * 溢出与否是量出来的，这里只读结果并落成 data-overflowing——浮层不在这层做，
 * 要不要套一层提示由作者按这个属性（或 api.overflowing）决定。
 * tooltip 开着时另给一条不用浮层的路：真被裁了才把整段文字交给平台的原生提示。
 */
export function connectTruncate<T extends PropTypes>(
  service: Service<TruncateSchema>,
  normalize: NormalizeProps<T>,
): TruncateApi<T> {
  const { state, prop, context, send } = service

  const open = state.matches('open')
  const overflowing = context.get('overflowing')
  const expandable = !!prop('expandable')
  const lines = resolveTruncateLines(prop('lines'))
  const multiline = lines > 1
  /**
   * 这块文字此刻是不是一颗按钮。
   *
   * 没被裁掉的短文本按下去什么都不变：给了角色与 tabindex，读屏会念出一颗按不动的按钮，
   * 键盘用户 Tab 进来也无事可做。
   * 铺开态无条件算数：量测在铺开态是跳过的（裁剪已撤，两个尺寸恒相等），
   * 此刻的 overflowing 未必反映夹住的那一版；靠它判就可能把收回去的入口一并撤掉。
   */
  const actionable = expandable && (overflowing || open)
  // 铺开着就没什么被裁掉了，提示一并撤走
  const title = prop('tooltip') && overflowing && !open ? context.get('text') : undefined

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: 'TOGGLE' })
  }

  return {
    open,
    overflowing,
    setOpen,
    measure: () => send({ type: 'MEASURE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 行数两处都写：data-lines 是读得懂的那一份，内联自定义属性是皮肤拿去裁行的那一份
      'data-lines': String(lines),
      'style': `--xh-_truncate-lines: ${lines}`,
      'data-multiline': dataAttr(multiline),
      'data-expandable': dataAttr(expandable),
      'data-overflowing': dataAttr(overflowing),
      // 真有东西可展开时整块文字就是那颗按钮：读屏念得出角色、Tab 停得住、Enter / Space 按得动。
      // 否则这几件一个都不写，它就还是一段普通的文字
      ...(actionable
        ? {
            'role': 'button',
            'tabindex': 0,
            'aria-expanded': open ? 'true' : 'false',
            // 与全库 29 处 aria-expanded 对齐的开合编码。按不动的那一支一个都不写：
            // 给一个恒 closed 会让皮肤画出一个永远转不动的箭头
            'data-state': open ? 'open' : 'closed',
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
