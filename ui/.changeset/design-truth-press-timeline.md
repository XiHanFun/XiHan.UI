---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

**统一点击触感：按下 120ms 进入 active 面并缩到 0.97，释放 200ms 回到 hover / rest；禁用同时降级前景与表面，不再只降低 opacity。**

令牌新增 `--xh-motion-duration-press`（120ms）、`--xh-motion-duration-release`（200ms）、`--xh-motion-ease-press`（standard）与 `--xh-motion-ease-release`（out-strong），减弱动效档两段时长归 1ms。

Action Control 家族配方的 rest 规则改为 `scale` 走 release 段，`:active` 规则追加 press 段的时长与曲线；Collection Item 家族配方的换面同节奏，`:active` 只改时长与曲线，不缩放整条。所有手写按压反馈的皮肤（83 处 rest 过渡、91 处 `:active` 规则）统一接入同一时间线；`segmented` 删除私有的 `--xh-segmented-item-press-scale` 槽，按压缩放一律走 `--xh-motion-scale-press`。

Action Control 家族的 disabled 状态改为 `--xh-bg-subtle` + `--xh-fg-disabled` 且 opacity 为 1；Button 不再为 solid / 默认变体保留品牌底的禁用面，outline / ghost 变体禁用时保持透明底；Toggle 新增 `--xh-toggle-bg-disabled` / `--xh-toggle-fg-disabled` / `--xh-toggle-border-disabled` / `--xh-toggle-bg-on-disabled` / `--xh-toggle-fg-on-disabled` 槽，选中且禁用时底色掺一半中性面；Accordion 与 Collapsible 的禁用触发器改为 `--xh-accordion-trigger-fg-disabled` / `--xh-collapsible-trigger-fg-disabled`。

破坏性：`--xh-segmented-item-press-scale` 被删除；按钮与切换按钮的禁用外观由淡化品牌面改为中性面。
