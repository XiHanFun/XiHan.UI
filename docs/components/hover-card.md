# HoverCard <Badge type="info" text="悬浮卡片" />

指针停留一会儿才出现的信息卡：预览一个对象，不打断当前动作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/hover-card" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/hover-card.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/hover-card" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/hover-card" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/hover-card.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

与 Tooltip 的分界在于卡片本体可交互：指针停在卡片上不收起，里面的链接与按钮都点得到

<XhDemo src="hover-card/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="hover-card"`：`root` · **`trigger`** · `positioner` · **`content`** · `title` · `description` · `arrow`

## 示例

### 延时

openDelay 默认 700ms，closeDelay 默认 300ms——那段收起等待正是留给指针从触发器走到卡片上的通行时间

<XhDemo src="hover-card/02-delay" />

### 受控

传了 open 就由宿主说了算；悬停与 Escape 都只发意图，最终写不写由外面这颗按钮同一份状态决定

<XhDemo src="hover-card/03-controlled" />

### 尺寸

三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别

<XhDemo src="hover-card/04-size" />

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是卡片与触发器的距离

<XhDemo src="hover-card/05-placement" />

### 禁用

disabled 只关掉卡片本身，触发器照样可点、可聚焦，也照样进不了展开等待

<XhDemo src="hover-card/06-disabled" />

## 设计指引

### 何时使用

- 链接或头像的预览：用户资料、文档摘要、商品简介。
- 信息属于"顺便看看"，不需要专门去点。

### 何时不用

- 内容需要交互（按钮、表单）：用[气泡卡片](./popover)。
- 只是一句文字：用[文字提示](./tooltip)。
- 触摸端是主要场景。

### 特性

- `openDelay` 与 `closeDelay` 一对：进入要停留、离开有宽限，指针斜穿去卡片上不会误收。
- 可受控。
- 内容与 Popover 共用 M2 磨砂：单层背景模糊、柔和顶光和浮层阴影，正文保持不透明。
  箭头只复用底色与边界，不叠加模糊；减少透明、高对比与强制颜色偏好由材质令牌统一响应。
  `--xh-hover-card-backdrop` 可覆盖模糊配方；打印时整块预览收起。

### 组合

- 触发器常是[头像](./avatar)或链接；卡片里放[卡片](./card)式的排版。

### 最佳实践

- 打开延时给到几百毫秒，否则鼠标扫过一段文字会弹出一串卡片。
- 卡片里的信息在别处也要有正式入口。

### 反模式

- 卡片里放操作按钮：指针过去的路上可能就关了。
- 延时为 0。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hover-card>` |
| Vue 组件 | `XhHoverCardArrow` `XhHoverCardContent` `XhHoverCardDescription` `XhHoverCardPositioner` `XhHoverCardRoot` `XhHoverCardTitle` `XhHoverCardTrigger` |
| 组合式函数 | `useHoverCard` |
| 状态机 | `hoverCardMachine` |
| 皮肤 | `@xihan-ui/styles/hover-card.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 |
| `offset` | `number` |  | 浮层与锚点的间距（px）。 |
| `openDelay` | `number` |  | 悬停进入到展开的等待毫秒，默认 700。 |
| `closeDelay` | `number` |  | 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。 |
| `dir` | `Direction` |  | 文字方向，仅在显式给出时写到根节点上。 |
| `disabled` | `boolean` |  | 只关掉卡片本身，不影响 trigger 元素自身的可用性。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定卡片的内边距档位。 |
| `onOpenChange` | `(details: HoverCardOpenChangeDetails) => void` |  | open 变化意图回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `HoverCardOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHoverCardRoot` | `default` | `HoverCardRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`POINTER.ENTER` · `POINTER.LEAVE` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isDisabled` · `isFocusHeld`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开卡片即收起，都不走延时 |
| `Escape` | 浮层可见（含收起等待期） | 立即收起，不等 closeDelay |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id \| `trigger` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/hover-card.css` 使用 `[data-scope="hover-card"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-hover-card-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | hover-card 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-hover-card-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | hover-card 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-hover-card-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | hover-card 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-hover-card-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | hover-card 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-hover-card-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | hover-card 的 description 部件 color 覆盖槽。 |
| `--xh-hover-card-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | hover-card 的 content 部件 color 覆盖槽。 |
| `--xh-hover-card-gap` | `content` | `gap` | `default` | `--xh-space-2` | hover-card 的 content 部件 gap 覆盖槽。 |
| `--xh-hover-card-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | hover-card 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-hover-card-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | hover-card 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-hover-card-max-w` | `content` | `max-inline-size` | `default` | `--xh-_hover-card-max-w` | hover-card 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-hover-card-px` | `content` | `padding-inline` | `default` | `--xh-_hover-card-pad` | hover-card 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-hover-card-py` | `content` | `padding-block` | `default` | `--xh-_hover-card-pad` | hover-card 的 content 部件 padding-block 覆盖槽。 |
| `--xh-hover-card-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | hover-card 的 content 部件 border-radius 覆盖槽。 |
| `--xh-hover-card-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | hover-card 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-hover-card-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | hover-card 的 title 部件 color 覆盖槽。 |
| `--xh-hover-card-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | hover-card 的 title 部件 font-size 覆盖槽。 |
| `--xh-hover-card-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | hover-card 的 title 部件 font-weight 覆盖槽。 |
| `--xh-hover-card-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` | hover-card 的 trigger 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
