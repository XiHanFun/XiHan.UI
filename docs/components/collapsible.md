# Collapsible 折叠区域

一块可以展开收起的内容，只有一块。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/collapsible" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/collapsible.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/collapsible" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/collapsible" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/collapsible.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控，defaultOpen 只给初始值，之后由组件自己维护开合

<XhDemo src="collapsible/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="collapsible"`：`root` · `header` · `trigger` · **`content`** · `indicator`

## 示例

### 受控

传了 open 就由宿主说了算，组件自己不再改状态，只发 open-change 报告意图

<XhDemo src="collapsible/02-controlled" />

### 禁用

disabled 把触发器整个关停，点击与键盘都不再改开合，已展开的内容维持原样

<XhDemo src="collapsible/03-disabled" />

### 尺寸

size 换的是触发按钮的高度、内边距与字号，三档并排对照

<XhDemo src="collapsible/04-size" />

### 自定义展开标记

往指示符部件里塞自己的图形，转向仍由皮肤按 open 接管

<XhDemo src="collapsible/05-marker" />

### 展开动画

收起时节点不卸载，作者接管内容区的 display，用一条行高过渡就能平滑展开

<XhDemo src="collapsible/06-transition" />

### 语气

tone 落在触发按钮的展开态上，六种语气各展开一份做对照

<XhDemo src="collapsible/07-tone" />

## 设计指引

### 何时使用

- 高级选项、补充说明这类默认不需要看见的单块内容。

### 何时不用

- 有好几块并列的可折叠内容：用[手风琴](./accordion)，它管互斥与整组语义。
- 内容需要浮在页面之上：用[气泡卡片](./popover)。

### 特性

- 触发器与内容通过 `aria-controls` 与 `aria-expanded` 关联。
- 展开动画由皮肤给，内容高度由组件量出来。
- 指示符部件空着由皮肤画一枚箭头，塞进图形即以作者的为准，转向两种情形都由皮肤打。

### 组合

- 放进[卡片](./card)、[表单](./form)的高级选项区。

### 最佳实践

- 触发器文字说明里面是什么，别只写"展开"。
- 收起时内容退出 Tab 序列，别让焦点落到看不见的地方。

### 反模式

- 把必填字段藏进折叠区：用户提交失败也不知道错在哪。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-collapsible>` |
| Vue 组件 | `XhCollapsibleContent` `XhCollapsibleHeader` `XhCollapsibleIndicator` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| 组合式函数 | `useCollapsible` |
| 状态机 | `collapsibleMachine` |
| 皮肤 | `@xihan-ui/styles/collapsible.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起 content |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/collapsible.css` 使用 `[data-scope="collapsible"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `header` | `data-disabled` | ''（条件成立时才出现） |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-collapsible-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | collapsible 的 content 部件 color 覆盖槽。 |
| `--xh-collapsible-content-py` | `*`<br>`content` | `padding-block` | `@keyframes xh-collapsible-collapse`<br>`@keyframes xh-collapsible-expand`<br>`default` | `--xh-stack-gap-md` | collapsible 的 *、content 部件 padding-block 覆盖槽。 |
| `--xh-collapsible-header-gap` | `header` | `gap` | `default` | `--xh-_collapsible-trigger-gap` | collapsible 的 header 部件 gap 覆盖槽。 |
| `--xh-collapsible-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | collapsible 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-collapsible-trigger-bg` | `trigger` | `background` | `default` | `transparent` | collapsible 的 trigger 部件 background 覆盖槽。 |
| `--xh-collapsible-trigger-bg-hover` | `trigger` | `background` | `hover` | `--xh-bg-subtle` | collapsible 的 trigger 部件 background 覆盖槽。 |
| `--xh-collapsible-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-fg-open` | `trigger` | `color` | `state=open` | `--xh-_collapsible-open-fg` | collapsible 的 trigger 部件 color 覆盖槽。 |
| `--xh-collapsible-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_collapsible-trigger-font-size` | collapsible 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-collapsible-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | collapsible 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-collapsible-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_collapsible-trigger-gap` | collapsible 的 trigger 部件 gap 覆盖槽。 |
| `--xh-collapsible-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_collapsible-trigger-h` | collapsible 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-collapsible-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_collapsible-trigger-px` | collapsible 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-collapsible-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | collapsible 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-collapsible-collapse` · `xh-collapsible-expand` 随皮肤自带，不引用别处文件里的名字；`rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
