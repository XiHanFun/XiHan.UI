---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

**调整** 控件内图标小一档：`--xh-glyph-size-md` / `-lg` 由 20 / 24px 改为 18 / 20px（`-sm` 仍是 16px），14px 字的 md 控件配 18px 图标。Action Control、Field Chrome、Collection Item 三份配方按档下发的 `--xh-icon-size`、字段与菜单里作者放的图标、Spinner 的三档直径（16 / 18 / 20px）、ColorSwatch 的三档边长、Statistic 涨跌箭头、浮动钮 lg 档的字形一起变小。Rating 的星随档取 18 / 20 / 32px，盒不小于细指针最小目标 `--xh-control-target-min`（24 / 24 / 36px）。Notification 卡片左列的类型字形不再取 `--xh-glyph-size-lg`，改与标题一行的行框同高（仍是 24px）。要回到原来的尺寸，在主题里把两支令牌写回 20px / 24px。
