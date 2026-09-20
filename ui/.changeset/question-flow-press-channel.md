---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**QuestionFlow 的选项与四颗按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
question-flow 机器 context 新增 `pressed`（按 `QuestionFlowPressedKey` 记：`'prev'` / `'next'` / `'skip'` / `'submit'` / `` `item:${value}` ``，
类型进公开面），事件 `PRESS.START { key, disabled }`（只在答题态接，部件自身的禁用随事件带入守卫 `canPress`）/ `PRESS.END { key }`；
换题、题目改写、交卷与关掉跳过时由机器松开。选项是 `role=radio` / `checkbox`，只有 Space 是激活键，Enter 归选项组的前进、不进按压面。
键盘表新增 `question-flow.kbd.item-press` 与 `question-flow.kbd.press`。三端公开 props 与事件不变。
