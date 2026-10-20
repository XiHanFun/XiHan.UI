---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

**新增** 菜单、右键菜单与菜单栏按数据铺时，子菜单那一层的勾选与单选状态有了写处：带 `children` 的条目写 `checkboxValue` / `radioValue`，交给按数据铺出的那一层，与子菜单自己的同名属性同义，写了即受控。此前子层只收到条目数据，里面的勾选与单选条目一直显示成没勾。按数据铺时子层的勾选改动不另外上报，勾选条目写 `closeOnSelect`，由根上的 `item-select` 得知。

- headless：`MenuNode`、`ContextMenuNode`、`MenubarNode` 新增 `checkboxValue`、`radioValue`，元信息同名两项（没写为 `null`）。
- Vue / React：`XhMenubarSub`、`XhContextMenuSub` 与 `XhMenuSub` 一样收 `checkboxValue`、`defaultCheckboxValue`、`radioValue`、`defaultRadioValue`，并派发 `checkbox-value-change`、`radio-value-change`（React 为 `onCheckboxValueChange`、`onRadioValueChange`）。
- **修复** Vue 的 `XhMenuSub`、`XhMenubarSub`、`XhContextMenuSub` 改了属性（如子层的 `collection`）后子层跟着变，此前子菜单只认挂载时那一份。
- **修复** Vue / React 的子菜单入口只挂父层那一个皮肤挂载类：此前同时挂着 `xh-scope-menu`，菜单条目的皮肤也落到菜单栏、右键菜单的这一条上。
- **修复** Vue / React 的子菜单入口合并两层产出时，父层没给的键不再盖掉子层给的：入口照旧带着子层的 `data-state`（展开 / 收起），与 Web Components 一致。
