/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { TruncateApi, TruncateSchema, TruncateTranslations } from './truncate.types'
import { dataAttr } from '@xihan-ui/core'
import { truncateAnatomy } from './truncate.anatomy'
import { resolveTruncateLines } from './truncate.machine'

const parts = truncateAnatomy.build()

/** 作者与语言包都没给文案时按钮上的字。 */
const DEFAULT_TRANSLATIONS: TruncateTranslations = {
  expand: 'Show more',
  collapse: 'Show less',
}

/**
 * 溢出与否是量出来的，这里只读结果并落成 data-overflowing——浮层不在这层做，
 * 要不要套一层提示由作者按这个属性（或 api.overflowing）决定。
 * tooltip 开着时另给一条不用浮层的路：真被裁了才把整段文字交给平台的原生提示。
 */
export function connectTruncate<T extends PropTypes>(
  service: Service<TruncateSchema>,
  normalize: NormalizeProps<T>,
): TruncateApi<T> {
  const { state, prop, context, send, scope } = service
  const ids = scope.ids('truncate', 'root')

  const open = state.matches('open')
  const overflowing = context.get('overflowing')
  const expandable = !!prop('expandable')
  const lines = resolveTruncateLines(prop('lines'))
  const multiline = lines > 1
  /**
   * 展开按钮此刻有没有事可做。
   *
   * 没被裁掉的短文本按下去什么都不变：按钮留着，读屏会念出一颗按不动的按钮，
   * 键盘用户 Tab 进来也无事可做，所以这时收起不占位。
   * 铺开态无条件算数：量测在铺开态是跳过的（裁剪已撤，两个尺寸恒相等），
   * 此刻的 overflowing 未必反映夹住的那一版；靠它判就可能把收回去的入口一并撤掉。
   */
  const actionable = expandable && (overflowing || open)
  // 铺开着就没什么被裁掉了，提示一并撤走
  const title = prop('tooltip') && overflowing && !open ? context.get('text') : undefined
  // 中间省略只在单行成立；真被裁了、又收着时才把整段文字交给皮肤去拼首尾两段
  const middle = prop('position') === 'middle' && !multiline
  const middleText = middle && overflowing && !open ? context.get('text') : undefined
  const translations = prop('translations')
  const triggerLabel = open
    ? translations?.collapse ?? DEFAULT_TRANSLATIONS.collapse
    : translations?.expand ?? DEFAULT_TRANSLATIONS.expand

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: 'TOGGLE' })
  }

  return {
    open,
    overflowing,
    setOpen,
    measure: () => send({ type: 'MEASURE' }),
    triggerLabel,

    // 文字盒子只是一段字：展开交互全在旁边那颗按钮上，这里不写角色、不占 Tab 位
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'id': ids.root,
      // 行数两处都写：data-lines 是读得懂的那一份，内联自定义属性是皮肤拿去裁行的那一份
      'data-lines': String(lines),
      'style': `--xh-_truncate-lines: ${lines}`,
      'data-multiline': dataAttr(multiline),
      'data-expandable': dataAttr(expandable),
      'data-overflowing': dataAttr(overflowing),
      // 缺省的末尾省略不写；中间省略落档位，被裁时再把整段文字交给皮肤拼首尾两段
      'data-position': middle ? 'middle' : undefined,
      'data-middle-text': middleText,
      // 开合编码只在真能展开时写：给一个恒 closed 会让皮肤按一个永远打不开的状态排版
      'data-state': actionable ? (open ? 'open' : 'closed') : undefined,
      ...(title === undefined ? {} : { title }),
    }),

    // 展开按钮是 Action Control 的文字档：ghost 形态、sm 档，与正文并排不抢眼；
    // 原生 button 自带 Enter / Space 激活，不另接按键
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'type': 'button',
      'aria-controls': ids.root,
      'aria-expanded': open ? 'true' : 'false',
      'data-state': open ? 'open' : 'closed',
      'hidden': !actionable || undefined,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时收起态也点得到，守卫得自己带
        if (actionable)
          send({ type: 'TOGGLE' })
      },
    }),
  }
}
