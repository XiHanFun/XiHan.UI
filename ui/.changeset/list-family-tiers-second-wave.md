---
"@xihan-ui/styles": major
---

列表族条目度量与高亮档位统一第二批（context-menu / menubar / mention / time-picker / transfer / table），与 select 族同一套两档词汇。

破坏性：9 个覆盖槽改名或移除（不留旧名）：

- `--xh-context-menu-item-bg-highlight` → `--xh-context-menu-item-bg-hover`、`--xh-menubar-item-bg-highlight` → `--xh-menubar-item-bg-hover`、`--xh-transfer-item-bg-highlight` → `--xh-transfer-item-bg-hover`、`--xh-table-row-bg-highlight` → `--xh-table-row-bg-hover`、`--xh-time-picker-item-bg-highlight` → `--xh-time-picker-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
- `--xh-time-picker-item-bg-checked-highlight` → `--xh-time-picker-item-bg-checked-hover`：同一档位词汇；选中格保持品牌实底不变。
- `--xh-mention-item-bg-highlight` → `--xh-mention-item-bg-hover`，`--xh-mention-item-fg-highlight` 与 `--xh-mention-item-font-weight-highlight` 移除：候选锚点回归纯轻档底色，不再借选中的文字色与字重。

新增：

- context-menu 打开子菜单的触发条目升强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-context-menu-item-bg-active` 与 `--xh-context-menu-item-active-font-weight`。
- menubar 展开着的菜单 trigger 升强档：`--xh-menubar-trigger-bg-active` 槽名不变、缺省从中性灰改为品牌淡底；不加字重（横排加粗会推挤相邻触发器）。悬停新增轻档槽 `--xh-menubar-trigger-bg-hover`。
- 条目行高从 none 抬到 normal，新增 `--xh-context-menu-item-leading` 与 `--xh-menubar-item-leading`。

度量：

- context-menu / menubar / mention / transfer 条目与 time-picker 格 padding 统一 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色文字色补 micro 过渡；context-menu / menubar 尺寸阶梯重排（sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`）。
- time-picker 格保持紧排行高：居中的单个数字格没有截断层，列内多露几格。
- transfer 面板头与搜索框行内内缩跟随条目改 `--xh-control-px-md`，勾选列与全选框保持同一条竖线。
- table 只统一行高亮档位词汇；行选中保持底色表达（宽行扫读依赖底色通道），单元格度量不动。
- tags-input 不入组：其 data-highlighted 是退格/方向键的操作光标（整颗反白表示即将删除或编辑），语义与列表导航高亮不同，胶囊度量亦非列表行。
