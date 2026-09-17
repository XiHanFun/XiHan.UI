---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**Tour 气泡改 M4 sheet 三件套，末行三颗按钮与关闭按钮接入 Action Control 与按压通道。** 连接层的
prev-trigger / next-trigger / skip-trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` /
`data-xh-action-display="always"` / `data-xh-action-size="sm"`，variant 分别为 `outline` / `solid` / `ghost`
（下一步是整条引导的主线动作，显式品牌实心）；close-trigger 新增 `data-xh-action-profile="icon"` /
`data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`；首步的 prev-trigger 在原生 `disabled` 之外同步投影
`data-disabled`。Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在机器 `context.pressed`，新增事件
`PRESS.START` / `PRESS.END`，导出类型 `TourPressedPart`，气泡收起时一并松开；首步禁用的上一步不进按压面），
键盘表新增 `tour.kbd.press`。

视觉默认变化：content 与 arrow 由 `--xh-border-default` 描边 + `--xh-bg-surface` 底 + `--xh-elevation-sheet` 影，改为
`--xh-material-elevated-border` / `-bg` / `-shadow` 三件套（`--xh-tour-border / -bg / -shadow / -fg` 缺省随之改为 elevated
令牌，与 Dialog 同源）。next-trigger 删除自写的品牌实心 + 顶光 + 只缩放的按压，改由配方 solid 列给出（悬停 `--xh-bg-brand-hover`
→ 按下 `--xh-bg-brand-active` 并 0.97 缩放），`--xh-tour-next-shadow` 缺省由顶光改为 `none`；prev-trigger 改由配方 outline
列给出（静息透明底 + `--xh-border-control` 描边，悬停 `--xh-bg-subtle` 100 → 按下 `--xh-bg-subtle-hover` 200，禁用
`--xh-border-subtle` + `--xh-fg-disabled`）；skip-trigger 改由配方 ghost 列给出（静息字色由 `--xh-fg-muted` 改为
`--xh-fg-default`，悬停 100 → 按下 200）；三颗的行内内衬缺省由 `--xh-control-px-md` 改为 sm 档 `--xh-control-px-sm`，字号改
`--xh-control-font-sm`。close-trigger 删除自写的悬停 200 / 按下 300 与粗指针 `::after`，改由配方 ghost 列给出（悬停 100 →
按下 200，命中区由家族外扩到 44px）。progress-dot 基础圆角由 `--xh-shape-pill` 改为 `--xh-shape-circle`，当前那颗单独取
`--xh-shape-pill`（观感不变）。description 字号由 `--xh-text-body-size` 14 改为 `--xh-text-secondary-size` 13、行高改
`--xh-leading-normal`，并新增 `overscroll-behavior: contain`。root / content 的 `--xh-icon-size` 缺省由 `--xh-glyph-size-text`
改为 `--xh-glyph-size-md`，四颗按钮内随档取 16px。

公开槽 `--xh-tour-next-bg / -bg-hover / -fg / -shadow`、`--xh-tour-action-radius`、`--xh-tour-skip-trigger-px`、
`--xh-tour-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active` 改为桥接到配方之前，使用者槽仍优先于形态矩阵。
