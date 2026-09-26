# Log 日志

等宽排版的滚动区域，一行一条，可以自动跟随到底部。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/log" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/log.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/log" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/log" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/log.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

root / viewport / content / line 四层；一行写什么由作者决定，组件只提供身份与等宽排版

<XhDemo src="log/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="log"`：**`root`** · **`viewport`** · **`content`** · `line` · `scroll-to-end-trigger` · `live-region`

## 示例

### 按行数定高

rows 决定可见几行，一行的高度归皮肤，修改 --xh-log-line-height 两者一起变化

<XhDemo src="log/02-rows" />

### 自动跟随到底部

新行进入时视口自动跟随；向上滚动一段即停止跟随，组件报告的 atBottom 与 scrollToBottom 足以自行绘制一条回到最新

<XhDemo src="log/03-follow" />

### 取行中

loading 使日志区报告 aria-busy 并把指针换为忙碌态；正在拉取那一行由作者自行渲染

<XhDemo src="log/04-loading" />

### 级别

行上写 level，四档 debug / info / warn / error 由皮肤染色；时间戳与行内标记仍归作者

<XhDemo src="log/05-levels" />

### 换为自绘滚动条

视口提供一个 id，用滚动条的 controls 挂载；滚动条浮在内容之上，不占宽度也不留空道

<XhDemo src="log/06-scrollbar" />

### 回到底部与播报

向上翻一段，右下角的按钮自动显示，按下后归位并重新粘附；输出结束后在播报区朗读一句结论

<XhDemo src="log/07-scroll-button" />

## 设计指引

### 何时使用

- 构建输出、运行日志、命令行回显。
- 任何从底部持续增长、需要始终跟随到底的内容：内容不需要区分条目身份，整段追加即可。

### 何时不用

- 内容是会话、条目有身份且需要逐条遍历时，使用[消息流](./message-feed)。
- 展示结构化记录、需要筛选排序时，使用[表格](./table)。
- 展示一段代码时，使用[代码视图](./code-view)。

### 特性

- 结构四层：`root` · `viewport` · `content` · `line`；每行内容由作者决定，组件只提供身份与等宽排版。另有两个可选部件：`scroll-to-end-trigger` 与 `live-region`。
- `rows` 按行数定高。
- 自动跟随到底部；用户向上翻时停止跟随，回到底部后恢复。
- 内置“回到底部”：离开底部时出现，按下后归位并重新粘附。留空时皮肤绘制向下的字形，放入节点即替换为自定义图形。
- 应用设为 `data-material="liquid"` 时，“回到底部”换成液态面：按下层换色调，按住时液面随手指形变。
- 视口自身可聚焦，整块日志占一个 Tab 停靠位，方向键与翻页键交给浏览器滚动。

### 组合

- 行内可以用[文本高亮](./highlight)标出关键词。
- 给视口一个 id，把[滚动条](./scrollbar)的 `controls` 指向它，滚动条与视口平级放在 `root` 内：它浮在内容之上，不占宽度。未挂自绘滚动条时视口自行预留一条通道，原生滚动条出现与消失不会推动文字。

### 最佳实践

- 用户向上翻时不强行拉回底部。
- 行数很大时截断或虚拟化，不把十万行全部挂载。

### 反模式

- 每到一行就整块重渲。
- 不提供复制或下载全部日志的入口。
- 把每一行都写进播报区，读屏会被逐行打断。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-log>` |
| Vue 组件 | `XhLogContent` `XhLogLine` `XhLogLiveRegion` `XhLogRoot` `XhLogScrollToEndTrigger` `XhLogViewport` |
| 组合式函数 | `useLog` |
| 状态机 | `logMachine` |
| 皮肤 | `@xihan-ui/styles/log.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `threshold` | `number` |  | 距底部多少 px 视为在底部，默认使用贴底原语的默认值。 |
| `onStickChange` | `(details: LogStickChangeDetails) => void` |  | 贴底状态变化时通知宿主。 |
| `loading` | `boolean` |  | 行仍在传输中：日志区报告 aria-busy，根写 data-loading。 |
| `rows` | `number` |  | 视口按多少行定高；未提供时高度由皮肤决定。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。影响行文字号与内衬，行高不随档位变化。 |
| `translations` | `Partial<LogTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `stick-change` | `LogStickChangeDetails` | 贴底状态变化；detail 为 `{ atBottom: boolean, sticking: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhLogRoot` | `default` | `LogRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhLogLine` | `level` | `LogLevel` |  | 该行的级别，写为行上的 data-level。 |
| `XhLogRoot` | `children` | `SlotChildren<LogRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `scroll-to-end-trigger` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM` · `PRESS.START` · `PRESS.END` · `TRIGGER.RENDERED`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `rows` | `number \| undefined` | 取整后的行数；rows 缺席或不是正数时为 undefined。 |
| `loading` | `boolean` |  |
| `atBottom` | `boolean` | 当前滚动位置是否落在底部阈值内。 |
| `sticking` | `boolean` | 新行到达时是否自动跟随到底部。 |
| `showScrollToEndTrigger` | `boolean` | 是否显示回到底部按钮，不在底部时为 true。 |
| `scrollToBottom` | `() => void` | 滚动到底部并恢复贴附。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getLineProps` | `(props?: LogLineProps) => T['element']` |  |
| `getScrollToEndTriggerProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入日志区 | 日志区自身可聚焦，方向键/PageUp/PageDown/Home/End 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |
| `Space` / `Enter` | 按住"回到底部"按钮且视口不在底部 | 按住期间 scroll-to-end-trigger 投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或回到底部（按钮收起）撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `viewport` | `aria-busy` | 'true' \| undefined |
| `viewport` | `aria-label` | label.log |
| `viewport` | `aria-live` | 'off' |
| `viewport` | `role` | 'log' |
| `scroll-to-end-trigger` | `aria-label` | label.scrollToBottom |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

- 视口是 `role=log`，但其隐含的 `aria-live` 被显式关闭：逐行读出连续输出会成为读屏噪声。
- 播报使用独立的 `live-region`：宿主决定读哪一句、何时读，例如一段输出结束后读出结论与错误条数。不要把每一行原样写入，否则等于重新打开逐行播报。
- 成批取行期间视口报告 `aria-busy`；播报区是视口的兄弟节点，不受其影响。

## 样式参考

### 皮肤

`@xihan-ui/styles/log.css` 使用 `[data-scope="log"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-at-bottom` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-sticking` | ''（条件成立时才出现） |
| `line` | `data-level` | line?.level |
| `scroll-to-end-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `scroll-to-end-trigger` | `data-state` | 'visible' \| 'hidden' |
| `scroll-to-end-trigger` | `data-xh-action-control` | '' |
| `scroll-to-end-trigger` | `data-xh-action-display` | 'always' |
| `scroll-to-end-trigger` | `data-xh-action-profile` | 'floating' |
| `scroll-to-end-trigger` | `data-xh-action-size` | 'xs' |
| `scroll-to-end-trigger` | `data-xh-action-variant` | 'ghost' |
| `scroll-to-end-trigger` | `data-xh-liquid` | '' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-log-bg` | `root` | `background` | `default` | `--xh-bg-surface` | log 的 root 部件 background 覆盖槽。 |
| `--xh-log-border` | `root` | `border` | `default` | `--xh-border-default` | log 的 root 部件 border 覆盖槽。 |
| `--xh-log-content-px` | `content` | `padding-inline` | `default` | `--xh-_log-content-px` | log 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-log-fg` | `root` | `color` | `default` | `--xh-fg-default` | log 的 root 部件 color 覆盖槽。 |
| `--xh-log-font` | `content` | `font-family` | `default` | `--xh-font-family-mono` | log 的 content 部件 font-family 覆盖槽。 |
| `--xh-log-font-size` | `content` | `font-size` | `default` | `--xh-_log-font-size` | log 的 content 部件 font-size 覆盖槽。 |
| `--xh-log-icon-size` | `scroll-to-end-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | log 的 scroll-to-end-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-log-level-debug-fg` | `line` | `color` | `level=debug` | `--xh-fg-subtle` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-error-fg` | `line` | `color` | `level=error` | `--xh-fg-danger` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-info-fg` | `line` | `color` | `level=info` | `--xh-fg-default` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-level-warn-fg` | `line` | `color` | `level=warn` | `--xh-fg-warning` | log 的 line 部件 color 覆盖槽。 |
| `--xh-log-line-height` | `line`<br>`root`<br>`viewport` | `block-size`<br>`line-height` | `default` | `1.25rem` | log 的 line、root、viewport 部件 block-size、line-height 覆盖槽。 |
| `--xh-log-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | log 的 root 部件 border-radius 覆盖槽。 |
| `--xh-log-rows` | `viewport` | `block-size` | `default` | `16` | log 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-bg` | `scroll-to-end-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`material=liquid`<br>`where([data-material='liquid'])`<br>`xh-ink-surface`<br>`xh-liquid` | `--xh-_liquid-bg`<br>`--xh-material-frosted-bg`<br>`--xh-material-liquid-focus-surface` | log 的 scroll-to-end-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-bg-hover` | `scroll-to-end-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_action-variant-bg-hover`<br>`--xh-_liquid-bg-hover` | log 的 scroll-to-end-trigger 部件 background-color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-border` | `scroll-to-end-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-material-frosted-border`<br>`--xh-material-liquid-border` | log 的 scroll-to-end-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-fg` | `scroll-to-end-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-material-frosted-fg`<br>`--xh-material-liquid-fg` | log 的 scroll-to-end-trigger 部件 color 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-inset` | `scroll-to-end-trigger` | `inset-block-end`<br>`inset-inline-end` | `default` | `--xh-space-3` | log 的 scroll-to-end-trigger 部件 inset-block-end、inset-inline-end 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-radius` | `scroll-to-end-trigger` | `border-radius` | `default` | `--xh-shape-circle` | log 的 scroll-to-end-trigger 部件 border-radius 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-shadow` | `scroll-to-end-trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`material=liquid`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`where([data-material='liquid'])`<br>`xh-liquid` | `--xh-_liquid-shadow`<br>`--xh-material-frosted-shadow` | log 的 scroll-to-end-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-log-scroll-to-end-trigger-size` | `scroll-to-end-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` | log 的 scroll-to-end-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-log-shadow` | `root` | `box-shadow` | `default` | `none` | log 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-log-tab-size` | `line` | `tab-size` | `default` | `4` | log 的 line 部件 tab-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（锚定面板） · 出现（无锚定弹出）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
