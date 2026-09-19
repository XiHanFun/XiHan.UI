/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 form 相关实现。

import type { KeyboardTable } from '../spec/types'

const SPEC = 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission'

// Form 只接按压通道，激活本身一个按键都不接管：
// · 回车提交走 `<form>` 的隐式提交，浏览器派出 submit 事件后组件在那里收口；
// · 提交/重置两颗键是原生 type=submit / type=reset 的 button，空格与回车归浏览器；
// · 错误摘要的每一条是原生 `<a href>`，回车激活归浏览器，组件只在 click 上接管焦点。
export const formKeyboard: KeyboardTable = {
  component: 'form',
  source: SPEC,
  rows: [
    {
      id: 'form.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held on submit-trigger / reset-trigger / error-summary-item, not disabled, no async validation in flight',
      does: '按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，异步校验开跑（提交在途）或条目所指字段改好时一并撤下',
    },
  ],
}
