---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**同一类角色在不同组件里取了对立的部件名，十处逐处定一个赢家。** 部件名是对外契约：它同时是 `data-part` 的取值、CSS 选择器的落点、Vue 部件组件的名字与自定义元素的 `csspart`。名字不统一，读者每换一个组件就得重学一遍，写共用样式时也没法一条选择器覆盖同一类角色。

七处按「多数家的名字」定案改名，三处判定为不同的东西、把区别写进解剖注释。

## 一、改名（破坏性）

| 组件 | 已删的部件名 | 换成 | 为什么是它赢 |
| --- | --- | --- | --- |
| `approval` / `question-flow` | `announcement` | `live-region` | 另外七家（log / markdown-stream / message-feed / sortable / table / tabs / tree）都叫 `live-region`；`announcement` 在这七家里指的是「念的那句文本」（`api.announcement`），一名两义 |
| `approval` | `actions` | `footer` | 六家（card / layout / page-header / question-flow / select / table）都叫 `footer`；approval 的这一位与 question-flow 的 `footer` 连注释都一样：「只排布按钮，不承载语义」 |
| `checkbox-group` | `trigger` | `select-all-trigger` | table 的同物就叫 `select-all-trigger`；库里另外 30 家的 `trigger` 一律指「开合这个组件的那一位」，全选不是开合 |
| `fieldset` | `helper-text` | `description` | 十三家都叫 `description`，兄弟件 `field` 也是；`helper-text` 全库仅此一处 |
| `sortable` | `item-handle` | `item-drag-trigger` | 另三处都叫「拖谁 + `-drag-trigger`」（tabs 的 `tab-drag-trigger`、table 的 `column-drag-trigger` 与 `row-drag-trigger`） |
| `table` | `loading-state` | `loading` | 与同一位置的占位部件 `empty` 成对；`empty` 有四家在用（cascader / combobox / diff-view / table），`loading-state` 全库仅此一处 |
| `tool-call` | `name` | `label` | 三十四家都叫 `label`，同一台折叠机器的兄弟件 `reasoning` 也是；`name` 全库仅此一处 |

跟着改名一起变的名字：

| 已删 | 换成 |
| --- | --- |
| Vue `XhApprovalActions` | `XhApprovalFooter` |
| Vue `XhApprovalAnnouncement` | `XhApprovalLiveRegion` |
| Vue `XhQuestionFlowAnnouncement` | `XhQuestionFlowLiveRegion` |
| Vue `XhCheckboxGroupTrigger` | `XhCheckboxGroupSelectAllTrigger` |
| Vue `XhFieldsetHelperText` | `XhFieldsetDescription` |
| Vue `XhSortableItemHandle` | `XhSortableItemDragTrigger` |
| Vue `XhTableLoadingState` | `XhTableLoading` |
| Vue `XhToolCallName` | `XhToolCallLabel` |
| `ApprovalApi.getActionsProps` | `getFooterProps` |
| `ApprovalApi` / `QuestionFlowApi` 的 `getAnnouncementProps` | `getLiveRegionProps` |
| `CheckboxGroupApi.getTriggerProps` | `getSelectAllTriggerProps` |
| `FieldsetApi.getHelperTextProps` | `getDescriptionProps` |
| `SortableApi.getItemHandleProps` | `getItemDragTriggerProps` |
| `TableApi.getLoadingStateProps` | `getLoadingProps` |
| `ToolCallApi.getNameProps` | `getLabelProps` |
| `SortableTranslations` 的 `itemHandle` | `itemDragTrigger` |
| 组件覆盖槽 `--xh-sortable-handle-bg-hover` | `--xh-sortable-drag-bg-hover`（这一段与 tabs、table 的 `--xh-<组件>-drag-*` 同名） |
| 组件覆盖槽 `--xh-sortable-handle-fg` | `--xh-sortable-drag-fg` |
| 组件覆盖槽 `--xh-sortable-handle-fg-disabled` | `--xh-sortable-drag-fg-disabled` |
| 组件覆盖槽 `--xh-sortable-handle-fg-hover` | `--xh-sortable-drag-fg-hover` |
| 组件覆盖槽 `--xh-sortable-handle-radius` | `--xh-sortable-drag-radius` |
| 组件覆盖槽 `--xh-sortable-handle-size` | `--xh-sortable-drag-size` |
| 组件覆盖槽 `--xh-sortable-handle-grip-w` | `--xh-sortable-drag-grip-w` |
| 组件覆盖槽 `--xh-sortable-handle-grip-h` | `--xh-sortable-drag-grip-h` |
| 组件覆盖槽 `--xh-tool-call-name-font` | `--xh-tool-call-label-font` |
| 组件覆盖槽 `--xh-checkbox-group-trigger-fg` | `--xh-checkbox-group-select-all-trigger-fg` |
| 组件覆盖槽 `--xh-checkbox-group-trigger-fg-disabled` | `--xh-checkbox-group-select-all-trigger-fg-disabled` |
| 组件覆盖槽 `--xh-checkbox-group-trigger-font-size` | `--xh-checkbox-group-select-all-trigger-font-size` |
| 组件覆盖槽 `--xh-checkbox-group-trigger-font-weight` | `--xh-checkbox-group-select-all-trigger-font-weight` |
| 组件覆盖槽 `--xh-checkbox-group-trigger-gap` | `--xh-checkbox-group-select-all-trigger-gap` |
| 组件覆盖槽 `--xh-checkbox-group-trigger-radius` | `--xh-checkbox-group-select-all-trigger-radius` |
| 组件覆盖槽 `--xh-approval-actions-gap` | `--xh-approval-footer-gap` |

`data-part`、`csspart` 与覆盖槽都没有 IDE 提示，改错了不会报错：请在自己的代码库里全文搜索上表左列的每一个名字。

`api.announcement`（那句播报文本）没有变，`popselect` / `select` 等的 `footer` 没有变，`field` 的 `description` 与 `error-text` 没有变。

## 二、判定为不同的东西（无改动，区别写进解剖注释）

- **`code-view` 的 `line` 与 `diff-view` 的 `row`。** 带 `role="row"` 与 `aria-rowindex`、住在 `role="table"` 里的那一类叫 `row`（diff-view / table / heatmap）；不带任何表格语义的纯文本行叫 `line`（code-view / log）。判据是 ARIA 结构，不是外观。
- **`select` 的 `tag` 与 `tag` 组件。** scope 名（`data-scope`）标识的是组件，部件名（`data-part`）标识的是组件里的位置，两把尺子不交叉；`select` 的 `tag` 是它自己画的已选值小片，不是 `tag` 组件的落点。
- **`approval` 的 `scope-group` / `scope-item` / `scope-indicator` / `scope-label`。** 这里的 scope 指授权范围，与标识组件身份的 `data-scope` 不是一回事；它取的是组件自己的领域词（props 就叫 `scopes` / `grantedScopes`），改名会把入参与部件的同名对应关系拆散。

## 默认渲染逐像素未变

改名逐处同改了皮肤选择器与生成的样式表，没有一条规则的命中面发生变化；三处「判定为不同」的地方一个字符都没动。
