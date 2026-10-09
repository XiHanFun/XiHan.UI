---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

ColorPicker 面板改宽、取色区贴顶通栏：

- 面板宽 12rem → `--xh-overlay-max-w-sm`（16rem），限高 `--xh-viewport-h-md` → `--xh-viewport-h-lg`
- 取色区高改读新增语义令牌 `--xh-overlay-color-area-h`（11rem，原 9rem）；排在面板最前时贴着顶边通栏、不取圆角
- 取色区拇指 14px → `--xh-control-indicator-md`（16px）；面板里两条滑块的拇指 18px → 16px，改为白盘 + 1px 描边 + 正中 8px 当前色点（只在取色器里，不动普通滑杆与 ColorSlider 独立件的拇指）
- 色板区上方一条通栏分隔（`--xh-material-solid-border`）；预设色块 28px → 16px、间距 4px → 8px（16px 的格子要 24px 间距才过目标尺寸的间隔例外），粗指针下格子回到 `--xh-control-h-sm`
- 通道输入照字段外壳：`--xh-bg-field` 底、高 `--xh-control-action-size`、12px 字；悬停描边升 `--xh-border-strong`；聚焦换承载面底与聚焦描边、不画环（强制色补 Highlight 环）
- 「添加」钮高改取 `--xh-control-action-size`
- ColorSlider 色条描边 `--xh-border-subtle` → `--xh-border-default`；透明度棋盘格与 Swatch 家族配方的棋盘格由 `neutral-300` 原语改为 `--xh-bg-subtle`
