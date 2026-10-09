---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

Rating 的星放大一档并加悬停强调：

- 星 sm / md / lg 由 16 / 20 / 24px 改为 20 / 24 / 32px（星是评分的主体），星盒比星大 4px（24 / 28 / 36px）
- 新增动效令牌 `--xh-motion-scale-emphasis`（1.2，减弱动效下为 1）：悬停与键盘聚焦把星放大强调，按下保持放大并换到 200 档面；只读时悬停不放大
- 未选中的星仍取 `--xh-fg-subtle`（过 3:1 的非文字对比）
