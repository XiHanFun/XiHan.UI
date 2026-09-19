---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**NavigationMenu 入口与面板链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
按压面。** 机器 context 新增 `pressedPart`（`trigger` / `link`）与 `pressedValue`，根级事件
`PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }` 三个状态都认；守卫 `canPress` 在整套导航禁用时
不进，入口自身禁用时不进；`endPress` 只松开 part + value 对应的那一个；按住 Enter 激活链接后面板收起（或换到另一
张），链接藏进 inert 的面板里不会再来 keyup，机器随 `value` 变化撤下链接的按压；按住途中导航转入禁用时由机器自行
松开。入口的 Enter / Space 开合现在拦下自动重复（按住不放不再来回翻转）。键盘表新增 `navigation-menu.kbd.press`。

**破坏性（headless）：`NavigationMenuLinkProps` 新增必填 `value`。** 面板里可以有多条链接，按压通道按它记按住的
那一条。三端适配器按实例生成（Vue / React `useId`，Web Components 升级时按节点分配一次），作者不必提供；直接消费
`connectNavigationMenu` 的调用方需给每条链接一个稳定且不重复的串。三端公开 props、attribute 与事件不变。
