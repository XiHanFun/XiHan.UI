---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

ColorPicker 新增常驻形态 `inline` 与最近使用色。

- `inline`（Web Components 属性 `inline`）：取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 `control` / `trigger` / `positioner`。恒为展开态，`open` / `defaultOpen` / `onOpenChange` 不起作用；不入层栈、不抢焦点，点外与 Escape 都不收起。content 换成由标题命名的 `role="group"`（不带 `aria-modal` 与 `tabindex`），root 与 content 投影 `data-inline`；皮肤把取色面画成静态内容面：surface 圆角、`--xh-border-default` 描边、实体底、不落影、不播进退场，根不再取字段缺省宽。运行期关掉 `inline` 时收起回到浮层形态（`open` 受控为真则留着）。
- 最近使用色：一轮取色结束且颜色变了就记一笔，最新的在最前、同色（写法不同也算）只留一份。浮层形态以收起为一轮，常驻形态以焦点离开取色面为一轮；只经 `setValue` 改的不记。`recentColors`（属性 `recent-colors`，逗号分隔）可受控，`defaultRecentColors`（`default-recent-colors`）为非受控初值，`maxRecentColors`（`max-recent-colors`，缺省 8，写 0 即不记）限定个数；变化经 `onRecentColorsChange` / `recent-colors-change` 发出 `{ recentColors }`。
- 新部件 `recent-swatch-picker`：最近使用色的挂载点，与 `swatch-picker` 同一台色块选择器（`role="radiogroup"`，名字取新文案 `translations.recentSwatchGroup`，缺省 `Recent colors`），挑一格即改值；还没有最近使用色时收起。Vue / React 新增 `XhColorPickerRecentSwatchPicker`，不写子节点时按列表自动铺格；Web Components 由作者按 `recent-colors-change` 铺格。
- `colorPickerMeta.requiredParts` 去掉 `trigger`：它只在浮层形态才写，常驻形态不写。
- 插槽作用域 / 函数式 children 新增 `recentColors` 与 `clearRecentColors`；元素新增只读属性 `currentRecentColors` 与方法 `clearRecentColors()`。
- headless（破坏性）：`ColorPickerServices` 新增必填的 `recentSwatchPicker`，自行组装服务表接 `connectColorPicker` 的调用方要用 `colorPickerRecentSwatchPickerProps` 再建一台色块选择器补上；导出 `colorPickerRecentSwatchPickerProps`、`colorPickerPushRecent`、`colorPickerMaxRecent`、`COLOR_PICKER_MAX_RECENT_COLORS` 与类型 `ColorPickerRecentColorsChangeDetails`；机器 context 新增 `recentColors` / `sessionValue`，事件新增 `SESSION.END` / `RECENT.CLEAR` / `INLINE.SYNC` / `INLINE.CLOSE`。
