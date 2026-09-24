来源：https://ui.docs.xihanfun.com/components/float-button

# FloatButton 浮动按钮

用于在视口边缘提供持续可见的操作入口。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/float-button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/float-button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/float-button" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/float-button" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/float-button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

展开一组悬浮操作

```vue
<script setup lang="ts">
import { MessageCircleIcon, SettingsIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhFloatButtonRoot style="position: static" default-open>
    <XhFloatButtonTrigger />
    <XhFloatButtonList>
      <button type="button" aria-label="消息"><XhIcon :icon="MessageCircleIcon" /></button>
      <button type="button" aria-label="分享"><XhIcon :icon="ShareIcon" /></button>
      <button type="button" aria-label="设置"><XhIcon :icon="SettingsIcon" /></button>
    </XhFloatButtonList>
  </XhFloatButtonRoot>
</template>
```

```html
<xh-float-button default-open>
  <div data-xh-part="root" style="position: static">
    <button data-xh-part="trigger"></button>
    <div data-xh-part="list">
      <button type="button" aria-label="消息"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg></button>
      <button type="button" aria-label="分享"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49"/></svg></button>
      <button type="button" aria-label="设置"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.09v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg></button>
    </div>
  </div>
</xh-float-button>
```

## 组件结构

加粗的是必需部件。

`data-scope="float-button"`：**`root`** · **`trigger`** · **`list`**

## 示例

### 悬停展开

指针进入时展开，键盘与触控仍可点击

```vue
<script setup lang="ts">
import { MessageCircleIcon, ShareIcon } from "@xihan-ui/icons";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhFloatButtonRoot style="position: static" expand-trigger="hover">
    <XhFloatButtonTrigger />
    <XhFloatButtonList>
      <button type="button" aria-label="消息"><XhIcon :icon="MessageCircleIcon" /></button>
      <button type="button" aria-label="分享"><XhIcon :icon="ShareIcon" /></button>
    </XhFloatButtonList>
  </XhFloatButtonRoot>
</template>
```

```html
<xh-float-button expand-trigger="hover">
  <div data-xh-part="root" style="position: static">
    <button data-xh-part="trigger"></button>
    <div data-xh-part="list">
      <button type="button" aria-label="消息"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.91 19.2A8.5 8.5 0 1 0 4.51 14.41L3 20.5Z"/></svg></button>
      <button type="button" aria-label="分享"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17.5" cy="5.5" r="2.75"/><circle cx="6.5" cy="12" r="2.75"/><circle cx="17.5" cy="18.5" r="2.75"/><line x1="8.87" y1="10.6" x2="15.13" y2="6.9"/><line x1="8.87" y1="13.4" x2="15.13" y2="17.1"/></svg></button>
    </div>
  </div>
</xh-float-button>
```

### 变体

设置浮动按钮的表面

```vue
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const variants = ["outline", "solid", "subtle", "ghost"] as const;
</script>

<template>
  <XhFloatButtonRoot v-for="variant in variants" :key="variant" style="position: static" :variant="variant">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
</template>
```

```html
<xh-float-button variant="solid"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
<xh-float-button variant="subtle"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
<xh-float-button variant="outline"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
<xh-float-button variant="ghost"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
```

### 尺寸

使用小、中、大三档尺寸

```vue
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <XhFloatButtonRoot v-for="size in sizes" :key="size" style="position: static" :size="size">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
</template>
```

```html
<xh-float-button size="sm"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
<xh-float-button size="md"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
<xh-float-button size="lg"><div data-xh-part="root" style="position: static"><button data-xh-part="trigger"></button><div data-xh-part="list"></div></div></xh-float-button>
```

## 设计指引

### 何时使用

- 长页面中的常用主操作。
- 移动端或窄屏中的紧凑操作组。

### 何时不用

- 返回页面顶部时，使用[回到顶部](./back-top)。
- 页面已有固定[工具栏](./toolbar)时。
- 操作数量较多时，使用[菜单](./menu)或抽屉。

### 特性

- 支持四个视口角与安全区偏移。
- 支持点击或悬停展开；键盘与触控始终使用点击。
- Escape、层外点击和再次触发均可收起。
- 收起后动作项退出 Tab 序列。
- 触发器走 Action Control floating 档：默认 48px 圆形、图标 24px，按下缩放并换底；默认（outline）使用磨砂浮动表面，solid / subtle / ghost 使用对应语义表面。
- 原生按钮动作项自动继承触发器的尺寸与外观。

### 组合

- 动作项可使用原生按钮或[按钮](./button)。
- 纯图标动作可配合[文字提示](./tooltip)。

### 最佳实践

- 为每个图标按钮提供可访问名称。
- 将操作数量控制在 2 至 5 个。
- 使用 `offset` 避开系统手势区。

### 反模式

- 不要承载高风险的破坏性操作。
- 不要遮挡主要内容或固定导航。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-float-button>` |
| Vue 组件 | `XhFloatButtonList` `XhFloatButtonRoot` `XhFloatButtonTrigger` |
| 组合式函数 | `useFloatButton` |
| 状态机 | `floatButtonMachine` |
| 皮肤 | `@xihan-ui/styles/float-button.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` |  |  |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者未提供时不写入。 |
| `disabled` | `boolean` |  |  |
| `expandTrigger` | `FloatButtonExpandTrigger` |  | 展开方式，默认 click。 |
| `offset` | `number` |  | 距两条边的距离（px），默认 24。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `FloatButtonPlacement` |  | 固定在哪一角，默认 bottom-end。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，默认与 lg 同档：悬浮按钮需要易于触达，起始即比行内按钮大一档。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `translations` | `Partial<FloatButtonTranslations>` |  |  |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，默认 outline（缺省中性，描边 + 磨砂面；solid 才品牌实心）。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatButtonRoot` | `default` | `FloatButtonRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFloatButtonRoot` | `children` | `SlotChildren<FloatButtonRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `DISABLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isDisabled` · `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 展开的动作组当前是否显示。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getListProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, not disabled | 展开 / 收起 list；悬停展开时这条路照样在，触摸与键盘都靠它 |
| `Enter` / `Space` | held in trigger, not disabled | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |
| `Escape` | open，无论焦点是否仍在整组内 | 只收起当前 LayerRegistry 的栈顶层；更晚打开的 Drawer / Popover 先处理自己的 Escape |
| `Tab` / `Shift+Tab` | open | 走进展开的那一组；收起时 list 带 hidden，里面的按钮一并退出 Tab 序列 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `list` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.translations?.trigger |
| `list` | `aria-labelledby` | `trigger` 部件的 id |
| `list` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/float-button.css` 使用 `[data-scope="float-button"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-placement` | props.placement |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'floating' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | props.variant |
| `list` | `data-placement` | props.placement |
| `list` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-float-button-bg` | `list`<br>`root`<br>`trigger` | `background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`not([data-scope])`<br>`variant=outline` | `--xh-_action-variant-bg-disabled`<br>`--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest`<br>`--xh-_float-button-bg`<br>`--xh-material-frosted-focus-surface` | float-button 的 list、root、trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-bg-active` | `list`<br>`trigger` | `background-color` | `active`<br>`disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed` | `--xh-_action-variant-bg-pressed`<br>`--xh-_float-button-bg-active` | float-button 的 list、trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-bg-hover` | `list`<br>`trigger` | `background-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`loading`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])` | `--xh-_action-variant-bg-hover`<br>`--xh-_float-button-bg-hover` | float-button 的 list、trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-border` | `list`<br>`root`<br>`trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`not([data-scope])`<br>`variant=outline` | `--xh-_action-variant-border-disabled`<br>`--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest`<br>`--xh-_float-button-border` | float-button 的 list、root、trigger 部件 border、border-color 覆盖槽。 |
| `--xh-float-button-border-hover` | `list`<br>`root`<br>`trigger` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_float-button-border-hover` | float-button 的 list、root、trigger 部件 border-color 覆盖槽。 |
| `--xh-float-button-fg` | `list`<br>`root`<br>`trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest`<br>`--xh-_float-button-fg` | float-button 的 list、root、trigger 部件 color 覆盖槽。 |
| `--xh-float-button-gap` | `list`<br>`root` | `gap` | `default` | `--xh-space-2` | float-button 的 list、root 部件 gap 覆盖槽。 |
| `--xh-float-button-icon-size` | `root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-_float-button-glyph-size` | float-button 的 root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-float-button-layer` | `root` | `z-index` | `default` | `--xh-_layer` | float-button 的 root 部件 z-index 覆盖槽。 |
| `--xh-float-button-radius` | `list`<br>`trigger` | `border-radius` | `default` | `--xh-_action-profile-radius`<br>`--xh-shape-circle` | float-button 的 list、trigger 部件 border-radius 覆盖槽。 |
| `--xh-float-button-shadow` | `list`<br>`root`<br>`trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-scope])`<br>`pressed`<br>`variant=outline` | `--xh-_float-button-shadow`<br>`none` | float-button 的 list、root、trigger 部件 box-shadow 覆盖槽。 |
| `--xh-float-button-size` | `list`<br>`trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size`<br>`--xh-_float-button-size` | float-button 的 list、trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-pop-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
