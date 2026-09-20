---
---

**七条家族门禁与逐家族豁免表进 `pnpm gate`。** 真源 §4 / §6.3 / §6.4 / §6.5 / §7.2 / §7.3 / §8.3 / §9 的家族规则此前只有文字，没有判据：新增 `check-surface-edge`（根面边界三选一）、`check-selection-marker`（选中与当前态按语义分类）、`check-state-ladder`（交互态按承载面阶梯，焦点边一律 `--xh-border-control-focus`）、`check-text-role`（标签 / 说明 / 标题 / 图标按角色取令牌）；扩展 `check-elevation-role`（raised 逐部件登记且必带 `--xh-border-default` 描边）、`check-shape-scale`（IDENTITY 形状身份表，正方盒不得用 pill，悬浮圆钮须接 floating profile）、`check-press-feedback`（铺满一行的部件不缩放、缩放必换底、集合行不许零反馈、data-pressed 第二判据）、`check-family-parity`（内容面 / 列表容器 / 反馈面 / 字段 / 值选择 / 导航 / 开关 / 按钮形触发器八个家族）。

存量登在 `tooling/scripts/family-backlog.json`，按门禁分段、一条一句理由，每条必须真被放行过一次（登记了却没命中判过期）。新增 runner `family-backlog.spec.mjs` 把每段条目数钉在快照与 CEILING 上、键集合只许是快照的子集——表只减不增；`family-gates.spec.mjs` 用临时夹具证每条门禁会红、当前仓库放行、过期豁免会红。`check-scrollbar-hosts` 与 `check-motion-role` 的内联待办一并迁进同一份表的 `scroll` / `motion` 段。
