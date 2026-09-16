---
"@xihan-ui/styles": major
---

**共享关键帧集中到 `family/motion.css`，四组 disclosure 关键帧并成一对。** 此前 8 个跨皮肤共用的关键帧（`xh-overlay-slide-in / out`、`xh-overlay-pop-in`、`xh-pop-in`、`xh-pop-out`、`xh-fade-in / out`、`xh-rise-in`）被 31 份皮肤逐份复制，共 67 处帧体逐字相同的定义（另有 context-menu 与 select 里 4 处无人引用的死定义一并删除）；现在只定义一次，皮肤改为 `@import '../family/motion.css'`，单独引入任一皮肤时关键帧仍随之到场。新增子入口 `@xihan-ui/styles/motion.css`。本次只搬定义、不改任何组件的时长与曲线，零视觉变化。

破坏性变更：Accordion、Collapsible、Reasoning、ToolCall 各自一对 `xh-<组件>-expand / collapse` 关键帧退役（`xh-accordion-expand`、`xh-accordion-collapse`、`xh-collapsible-expand`、`xh-collapsible-collapse`、`xh-reasoning-expand`、`xh-reasoning-collapse`、`xh-tool-call-expand`、`xh-tool-call-collapse`），统一由 `xh-disclosure-expand` / `xh-disclosure-collapse` 承担；两端内缩由各皮肤在 `content` 部件上写进 `--xh-_disclosure-pt` / `--xh-_disclosure-pb`，没写的那一端按 0 动，与原先逐组件关键帧的效果一致。在 `xihan.overrides` 层重定义旧名字的覆盖会失效，改为重定义 `xh-disclosure-expand` / `xh-disclosure-collapse`。

门禁同步收紧：`check-keyframe-refs` 允许引用本皮肤 `@import` 的家族文件里的名字，并新增两条判据——皮肤内重定义 `family/motion.css` 已有的名字判红、`@import` 了 motion.css 却不引用任何共享名字（或反之）判红；`check-keyframe-registry` 给共享关键帧登记锚定关系 `relation`（`anchored-list` / `anchored-panel` / `detached` / `fade` / `disclosure`），带 `relation` 的名字只能定义在 `family/motion.css`；`check-motion-role` 按规范 §9.5 的三行登记浮层的锚定关系，`animation` 引用的共享进出场关键帧必须与关系相符，并把 `drawer:translate` 登进大尺度位移名单（入场改走 `--xh-motion-ease-slide` 留待 drawer 提交，现以待办放行、只减不增）。

35 份皮肤去注释压空白后合计缩小 14784 字节（family/motion.css 自身 1993 字节），`.size-limit.css.json` 只重落这 35 条；其中 `select.css` 与 `time-range-picker.css` 的登记值反而上调（21065 → 21369、27901 → 27993），是此前基线已在 10% 松量内过期，本次实测各减 1098 与 601 字节。
