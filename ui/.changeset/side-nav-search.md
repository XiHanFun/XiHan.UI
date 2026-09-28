---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

SideNav 新增搜索过滤：放一个 `input` 部件（root 里、list 之前）即可输入即按 `filter`（缺省为标签大小写不敏感包含）过滤导航树，命中入口整枝留下、祖先保留并展开，没命中的列表项、分支整行整枝带 `hidden` 收起，分组的成员一个都没命中就整组收起；方向键只走剩下的行。搜索中的展开单独记，不改写 `expandedValue`、不发 `expanded-value-change`，清空检索词即回到原样。搜索框里下方向键或 Enter 进到剩下的第一行，Escape 先清空检索词；一条都没命中时新部件 `empty` 以 `role="status"` 露面，文案取新增的 `translations.noMatch`，搜索框可及名取 `translations.input`。折叠成图标栏时过滤暂停，搜索框留着高度、不可见也不可聚焦。搜索框走面板内嵌搜索的写法（投影 `data-xh-field-input`，只画一道取实体面分隔令牌的下划线），样式槽 `--xh-side-nav-input-*`、`--xh-side-nav-search-divider`、`--xh-side-nav-placeholder-fg` 与 `--xh-side-nav-empty-*`。新增 `api.inputValue` / `setInputValue` / `searching` / `empty` / `translations` 与 `getInputProps()` / `getEmptyProps()`；`getItemProps` 可带所包链接的 `value`、`getGroupProps` 可带成员 `members`，三端适配器自动收集。Vue / React 新增 `XhSideNavInput`、`XhSideNavEmpty` 与根上的 `filter`，插槽载荷多了 `inputValue` / `setInputValue` / `searching`；Web Components 新增 `input`、`empty` 角色、`filter` property、`inputValue` / `searching` 读口与 `setInputValue` 方法。TreeSelect 的树形检索裁剪改由与 SideNav 共用的一份实现承担，行为不变。side-nav.css 因搜索框、自动填充与空态的规则涨约 15%。
