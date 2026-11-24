---
'@xihan-ui/styles': major
---

**破坏性** 面板角上的关闭钮七处同一把尺：Popover、Tour、FloatingPanel、Alert 的叉从随档的 16px 收到 12px（`--xh-glyph-size-xs`），与 Dialog、Drawer、Notification 卡片一致，比钮的随档字形低一档。钮的视觉盒与命中区不变。

聚焦与按下的长相由悬停那一档推出来：聚焦是透明底加悬停字色，按下是换底加悬停字色，不再单开覆盖槽。删掉的七个槽：

| 删掉的槽 | 改写成 |
| --- | --- |
| `--xh-dialog-close-bg-focus`、`--xh-drawer-close-bg-focus`、`--xh-popover-close-bg-focus` | 不再提供：聚焦面恒为透明，焦点由库的聚焦环表出 |
| `--xh-dialog-close-fg-focus`、`--xh-drawer-close-fg-focus`、`--xh-popover-close-fg-focus` | 同名的 `-close-fg-hover`：聚焦与悬停同一个字色 |
| `--xh-floating-panel-action-fg-active` | `--xh-floating-panel-action-fg-hover`：按下与悬停同一个字色 |

要让叉回到 16px，在组件上写 `--xh-<组件>-icon-size`（如 `--xh-popover-icon-size: var(--xh-glyph-size-sm)`）。
