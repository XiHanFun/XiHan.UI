---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

DOM 状态属性收成一套词汇（`tooling/scripts/state-vocabulary.json` 是真源，`check-state-vocabulary` 七条判据守住）。皮肤靠这些 `data-*` 选中状态，使用者的全局规则同样靠它们，所以同一含义只留一个名字：

- **当前项**：`aria-current` 在 data 侧一律配 `data-current`。anchor 的 `data-active`、carousel 指示点 / pagination 页码 / side-nav 链接的 `data-selected` 都改过来；steps 保持 `data-state=current`（步骤族）。
- **`data-active` 一名三义退役**：展开 / 选中路径上的祖先改 `data-in-path`（cascader 列项、side-nav 分支），滑杆刻度已被越过改 `data-passed`（slider mark / mark-label）。
- **混合态一个词**：checkbox-group / table 表头 / transfer 列头的组级汇总 `data-state` 从 `all | some | none` 改为 `checked | unchecked | indeterminate`，与 checkbox 同词（`CheckboxGroupCheckedState` / `TableSelectionState` / `TransferCheckState` 的取值随之改）。
- **显隐**：有开合交互的 tag，`data-state` 从 `visible | hidden` 改 `open | closed`（机器状态名同改，`onOpenChange` 不变）；派生显隐的 back-top 从布尔 `data-visible` 改 `data-state: visible | hidden`。
- **折叠**：layout 侧栏从 `data-state=collapsed|expanded` 改布尔 `data-collapsed`，与 side-nav / splitter 同写法。
- **死属性删除**：button 与 infinite-scroll 根上皮肤零引用的 `data-state`；scroll-area / scrollbar 的 `data-hover`（悬停走 `:hover`）。calendar 格子的 `data-focused` 改 `data-focus`。

退役的四个属性名（`data-active` / `data-focused` / `data-hover` / `data-visible`）与四个 `data-state` 取值（`all` / `some` / `none` / `collapsed`）是公开面删减，基线已推。
