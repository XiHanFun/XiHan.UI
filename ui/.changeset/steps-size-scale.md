---
'@xihan-ui/styles': patch
---

Steps 的尺寸档与同类对象同一把尺：
- 序号圆点直径改取 `--xh-control-h-sm/md/lg`，与 Avatar、带框 Icon 相同并随密度换档。comfortable 下 sm 由 28px 变为 32px、md 由 32px 变为 36px，lg 仍是 40px；compact 下三档依旧是 28 / 32 / 36px。此前 sm / md 走 space 档不随密度，lg 却走 control-h 随密度，三档不在同一把尺上。
- 作者放进标题 / 说明里的图标是控件内图标，改为随尺寸档取 `--xh-glyph-size-sm/md/lg`（16 / 20 / 24px），此前三档都固定 16px。`--xh-steps-icon-size` 照旧可覆盖；圆点里的兜底对号与作者图标仍走指示符档，不受影响。
