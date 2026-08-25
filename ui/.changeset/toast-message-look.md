---
"@xihan-ui/vue": minor
"@xihan-ui/styles": major
---

轻提示改成短消息的样子：顶部居中、宽度包着内容、一行图标加一句话。

上一版把 toast 从通知卡片收窄成操作反馈时只动了结构，皮肤还是照着卡片那份抄的——
定宽 320px、竖排、起始侧一条 4px 语气色条、行尾一颗叉。一句「已保存」于是撑成一个
方块，右边留着一大片空白，看着仍然像一则公告。

现在它是这样：

```
┌──────────────────┐
│  ✓  已保存        │   ← 贴着文字收缩，顶部居中
└──────────────────┘
```

- **收缩包裹**：`inline-size` 的默认值从 `--xh-overlay-max-w` 改成 `auto`，
  上限压在 `min(48rem, 100%)`，长文案在上限处换行、仍然居中。
- **单行横排**：`flex-direction` 去掉，`align-items: center`；标题吃掉剩余宽度，
  操作钮与叉自动落到行尾（两者不再 `align-self: flex-start`）。
- **矮一档**：纵内衬从面档（12px）换成控件档 `--xh-field-py`（8px），条子高 39px，
  与 Element Plus message 的 39px 齐平、比 Ant Design message 的 40px 矮 1px。
- **语气走淡底**：底与描边取语气层的 `--xh-_tone-subtle` / `--xh-_tone-border`
  （与 alert 同一套口径），正文留中性——正文也跟着兑成语气色的话，绿字压绿底是整条里
  对比度最差的一处。起始侧那条 4px 色条随之删除。
- **字号回到正文档**：13px → 14px；标题不再加粗、不再换行高，一句话的反馈没有主次之分。
- **状态字形不带圆底**：服务档的默认模板改用新的 `typeGlyph`（16px 裸字形，颜色取
  `--xh-_tone-fg`，与 alert 的状态图标同档），圆底徽记 `typeBadge` 留给对话框那种有余裕的版面（通知的类型字形由皮肤在 `item-indicator` 上画）。
- **到点自己走的不出关闭按钮**：`createToastService` 的默认模板据此分两档——
  会自己消失的不出叉（三家参考实现都是这样），`loading` 与 `duration <= 0` 这种走不掉的
  反过来默认出叉，否则界面上一个可点、可聚焦的节点都没有。两档都能用 `closable` 显式改口。

**破坏性**：删掉 `--xh-toast-accent` 与 `--xh-toast-accent-width` 两个覆盖槽（色条没了）。
另有四个槽的默认值变了：`--xh-toast-w`（20rem → auto）、`--xh-toast-bg`
（`--xh-bg-surface-raised` → 语气淡底）、`--xh-toast-border`（中性 → 语气描边）、
`--xh-toast-title-font-weight`（semibold → regular）；`--xh-toast-close-size` 的默认值
从 `--xh-control-h-sm`（28px）降到 `--xh-control-action-size`（24px）。
靠「轻提示是 320px 定宽」做过对齐、或依赖默认那颗叉关闭常驻提示的用法要跟着改。
