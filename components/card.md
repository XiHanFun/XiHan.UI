来源：https://ui.docs.xihanfun.com/components/card

# Card 卡片

用于组织相关内容与操作的中性表面。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/card" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/card.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/card" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/card" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/card.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

Header 放标题与说明，Content 放主体

```vue
<script setup lang="ts">
import { XhCardContent, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot style="inline-size: 360px; max-inline-size: 100%">
    <XhCardHeader>
      <XhCardTitle>本月账单</XhCardTitle>
      <XhCardDescription>账期 7 月 1 日至 7 月 31 日</XhCardDescription>
    </XhCardHeader>
    <XhCardContent>共 128 笔支出，合计 3,240.00 元。</XhCardContent>
  </XhCardRoot>
</template>
```

```html
<xh-card>
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="header">
      <div data-xh-part="title">本月账单</div>
      <div data-xh-part="description">账期 7 月 1 日至 7 月 31 日</div>
    </div>
    <div data-xh-part="content">共 128 笔支出，合计 3,240.00 元。</div>
  </div>
</xh-card>
```

## 组件结构

加粗的是必需部件。

`data-scope="card"`：**`root`** · `header` · `title` · `trigger` · `description` · `content` · `footer`

## 示例

### 变体

outline 为默认卡面，subtle 淡底嵌入，ghost 用于嵌套

```vue
<script setup lang="ts">
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCardRoot v-for="v in variants" :key="v" :variant="v" style="inline-size: 200px">
      <XhCardHeader>
        <XhCardTitle>{{ v }}</XhCardTitle>
      </XhCardHeader>
      <XhCardContent>一段用来看表面层级的正文。</XhCardContent>
    </XhCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-card variant="outline">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">outline</div>
      </div>
      <div data-xh-part="content">一段用来看表面层级的正文。</div>
    </div>
  </xh-card>

  <xh-card variant="subtle">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">subtle</div>
      </div>
      <div data-xh-part="content">一段用来看表面层级的正文。</div>
    </div>
  </xh-card>

  <xh-card variant="ghost">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">ghost</div>
      </div>
      <div data-xh-part="content">一段用来看表面层级的正文。</div>
    </div>
  </xh-card>
</div>
```

### 横向布局

Card 只提供内容面，方向和媒体尺寸由使用场景决定

```vue
<script setup lang="ts">
import {
  XhCardContent,
  XhCardDescription,
  XhCardFooter,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot style="inline-size: 100%; max-inline-size: 520px; flex-direction: row; align-items: center">
    <div
      aria-hidden="true"
      style="flex: none; inline-size: 120px; aspect-ratio: 1; border-radius: var(--xh-shape-surface); background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle))"
    />
    <XhCardContent>
      <XhCardHeader>
        <XhCardTitle>七月总结</XhCardTitle>
        <XhCardDescription>收入与支出趋势已生成</XhCardDescription>
      </XhCardHeader>
      <XhCardFooter>更新于今天 09:30</XhCardFooter>
    </XhCardContent>
  </XhCardRoot>
</template>
```

```html
<xh-card>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 520px; flex-direction: row; align-items: center">
    <div
      aria-hidden="true"
      style="flex: none; inline-size: 120px; aspect-ratio: 1; border-radius: var(--xh-shape-surface); background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-subtle))"
    ></div>
    <div data-xh-part="content">
      <div data-xh-part="header">
        <div data-xh-part="title">七月总结</div>
        <div data-xh-part="description">收入与支出趋势已生成</div>
      </div>
      <div data-xh-part="footer">更新于今天 09:30</div>
    </div>
  </div>
</xh-card>
```

### 带媒体

图片或自绘媒体作为普通子节点放入，由内容自己决定比例与圆角

```vue
<script setup lang="ts">
import { XhCardContent, XhCardDescription, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot variant="subtle" style="max-inline-size: 300px">
    <div
      aria-hidden="true"
      style="block-size: 120px; border-radius: var(--xh-shape-surface); background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-surface))"
    />
    <XhCardHeader>
      <XhCardTitle>七月总结</XhCardTitle>
      <XhCardDescription>媒体与文字共享卡片的统一节奏</XhCardDescription>
    </XhCardHeader>
    <XhCardContent>本月共完成 18 个里程碑。</XhCardContent>
  </XhCardRoot>
</template>
```

```html
<xh-card variant="subtle">
  <div data-xh-part="root" style="max-inline-size: 300px">
    <div
      aria-hidden="true"
      style="block-size: 120px; border-radius: var(--xh-shape-surface); background: linear-gradient(135deg, var(--xh-bg-brand), var(--xh-bg-surface))"
    ></div>
    <div data-xh-part="header">
      <div data-xh-part="title">七月总结</div>
      <div data-xh-part="description">媒体与文字共享卡片的统一节奏</div>
    </div>
    <div data-xh-part="content">本月共完成 18 个里程碑。</div>
  </div>
</xh-card>
```

### 整卡可点

interactive 加标题里的 trigger：整张卡片都是点击区，读屏只读到一个链接

```vue
<script setup lang="ts">
import {
  XhButton,
  XhCardContent,
  XhCardDescription,
  XhCardFooter,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
  XhCardTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 链接只包标题文字：可及名就是「季度报告」，卡片里的其余内容不进链接名 -->
  <XhCardRoot interactive style="inline-size: 360px; max-inline-size: 100%">
    <XhCardHeader>
      <XhCardTitle>
        <XhCardTrigger href="#/reports/2026-q3">季度报告</XhCardTrigger>
      </XhCardTitle>
      <XhCardDescription>2026 年第三季度 · 财务部</XhCardDescription>
    </XhCardHeader>
    <XhCardContent>营收同比增长 12%，毛利率持平。</XhCardContent>
    <!-- 脚部叠在点击区之上：里面的按钮照常可点，不触发整卡 -->
    <XhCardFooter>
      <XhButton size="sm" variant="ghost">收藏</XhButton>
    </XhCardFooter>
  </XhCardRoot>
</template>
```

```html
<!-- 链接只包标题文字：可及名就是「季度报告」，卡片里的其余内容不进链接名 -->
<xh-card interactive>
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="header">
      <div data-xh-part="title">
        <a data-xh-part="trigger" href="#/reports/2026-q3">季度报告</a>
      </div>
      <div data-xh-part="description">2026 年第三季度 · 财务部</div>
    </div>
    <div data-xh-part="content">营收同比增长 12%，毛利率持平。</div>
    <!-- 脚部叠在点击区之上：里面的按钮照常可点，不触发整卡 -->
    <div data-xh-part="footer">
      <xh-button size="sm" variant="ghost">
        <button data-xh-part="root" type="button">收藏</button>
      </xh-button>
    </div>
  </div>
</xh-card>
```

## 设计指引

### 何时使用

- 把一组相关信息收成一个可以整体感知的单元。
- 内容块之间需要视觉边界。

### 何时不用

- 页面上每一块都使用卡片会使边界失效。
- 只需要一条分隔时，使用[分隔线](./separator)。

### 特性

- root 必需；header、title、description、content、footer 按内容组合。
- `outline` 是默认卡面，`subtle` 用淡底嵌在别的面里，`ghost` 用于嵌套内容不再画面。
- 根统一提供 16px 内边距、12px 段间距和 surface 圆角；横向布局与媒体比例由使用场景决定。
- 整卡可点用 `interactive` 加标题里的 `trigger`：trigger 是原生链接（给了 `href`）或 `<button type="button">`，路由链接等作者自己的节点用 `asChild`。它的点击区由伪元素铺满整张卡片，卡片里任一处点下去都是在点它；可及名只取 trigger 自己的文字，Tab 位也只有它这一个。不把整张卡片包进 `<a>`：那样读屏会把标题、说明、正文连成一整串链接名逐字念完，卡片里也不能再放按钮（交互元素不能嵌套）。
- 可交互卡片的反馈按根面分：`outline` 是抬起面，悬停抬高一档海拔（raised → lifted），按下落回 raised 并换到白底阶梯第一档；`subtle` 悬停淡底 200、按下 300；`ghost` 悬停 100、按下 200。抬起只走影、不走位移，减弱动效下仍是淡变。按下只认 trigger 自己的按下，脚部按钮按下时整卡不跟着换面。
- 键盘聚焦 trigger 时焦点环画在整张卡片外沿，与点击区是同一块轮廓；trigger 自己不再画环。
- 脚部叠在点击区之上：里面另放的按钮照常可点、不触发整卡，脚部的空白处也不触发。其余部件都在点击区之下。
- `data-material="liquid"` 下，可交互卡片在细指针悬停时描边扫过一道交互光，只播一遍，与 Button 实心钮同一配方；standard 档、粗指针与强制色下不画。时长槽 `--xh-card-glint-duration`。

### 组合

- 图片等媒体直接作为普通子节点放入；内容区可放[描述列表](./descriptions)、[表格](./table)或[统计数值](./statistic)。

### 最佳实践

- 整卡可点时用 `interactive` 加 trigger，不要自己给根加 `tabindex` 与点击处理：那样根没有可及名，读屏只报一个“组”。
- trigger 与根之间的祖先不要再建定位上下文（`position: relative` 等），否则点击区只铺到那一层。
- 同组卡片保持相同宽度和内容节奏。

### 反模式

- 卡片嵌套卡片，两层边界互相削弱。
- 整卡可点的同时在正文里再放按钮或链接：它们被点击区盖住，点下去触发的是整卡。另有操作时放进脚部。
- 静态卡片也挂悬停反馈：没有 trigger 的卡片悬停抬起，读者会以为能点。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardContent` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardRoot` `XhCardTitle` `XhCardTrigger` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `interactive` | `boolean` |  | 整卡可交互：标题里的 trigger（链接或按钮）把点击区铺满整张卡片，悬停抬起、按下换面， 焦点环画在卡片外沿。可及名只取 trigger 自己的文字，卡片里的其余内容不进链接名。 默认 false。 |
| `variant` | `ControlVariant` |  | 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影。默认 outline。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['element']` | 整卡的触发器：放在 title 里的链接或按钮，interactive 时它的点击区铺满整张卡片。 |
| `getDescriptionProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on trigger | 原生激活：链接只认 Enter 并跳转，按钮 Enter 与 Space 都认；整张卡片只有 trigger 这一个 Tab 位 |

- 可交互卡片的语义就是一个链接或按钮加一段普通内容：根不写 role、不拿焦点，读屏按文档序读到标题里的链接，再读说明与正文。
- trigger 必须有可见文字，它就是可及名；只放图标时补 `aria-label`。
- 点击区盖在内容之上，内容里的文字不能再拖选；需要复制的内容（编号、地址）不要放进可交互卡片，或放进脚部。

## 样式参考

### 皮肤

`@xihan-ui/styles/card.css` 使用 `[data-scope="card"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-card-bg` | `root` | `background` | `default`<br>`variant=subtle` | `--xh-bg-subtle`<br>`--xh-bg-surface` | card 的 root 部件 background 覆盖槽。 |
| `--xh-card-bg-hover` | `root` | `background` | `hover`<br>`interactive`<br>`variant=ghost`<br>`variant=subtle` | `--xh-_card-host-bg-hover`<br>`--xh-bg-subtle` | card 的 root 部件 background 覆盖槽。 |
| `--xh-card-bg-pressed` | `root` | `background` | `active`<br>`interactive`<br>`not(:has([data-scope='card'][data-part='footer']:active)`<br>`variant=ghost`<br>`variant=outline`<br>`variant=subtle` | `--xh-_card-host-bg-pressed`<br>`--xh-bg-subtle-hover`<br>`--xh-bg-subtle-hover-opaque` | card 的 root 部件 background 覆盖槽。 |
| `--xh-card-border` | `root` | `border` | `default` | `--xh-border-default` | card 的 root 部件 border 覆盖槽。 |
| `--xh-card-content-gap` | `content` | `gap` | `default` | `--xh-space-1` | card 的 content 部件 gap 覆盖槽。 |
| `--xh-card-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | card 的 description 部件 color 覆盖槽。 |
| `--xh-card-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | card 的 description 部件 font-size 覆盖槽。 |
| `--xh-card-description-leading` | `description` | `line-height` | `default` | `--xh-leading-normal` | card 的 description 部件 line-height 覆盖槽。 |
| `--xh-card-fg` | `root` | `color` | `default` | `--xh-fg-default` | card 的 root 部件 color 覆盖槽。 |
| `--xh-card-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` | card 的 root 部件 font-size 覆盖槽。 |
| `--xh-card-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | card 的 footer 部件 gap 覆盖槽。 |
| `--xh-card-gap` | `root` | `gap` | `default` | `--xh-space-3` | card 的 root 部件 gap 覆盖槽。 |
| `--xh-card-glint-duration` | `root` | `animation` | `@media (hover: hover) and (pointer: fine) and (forced-colors: none)`<br>`hover`<br>`interactive`<br>`material=liquid`<br>`where([data-material='liquid'])` | `--xh-motion-duration-glint` | card 的 root 部件 animation 覆盖槽。 |
| `--xh-card-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` | card 的 root 部件 line-height 覆盖槽。 |
| `--xh-card-p` | `root` | `padding` | `default` | `--xh-surface-pad-lg` | card 的 root 部件 padding 覆盖槽。 |
| `--xh-card-radius` | `root`<br>`trigger` | `border-radius` | `default`<br>`interactive` | `--xh-shape-surface` | card 的 root、trigger 部件 border-radius 覆盖槽。 |
| `--xh-card-shadow` | `root` | `box-shadow` | `default`<br>`variant=ghost`<br>`variant=subtle` | `--xh-elevation-raised`<br>`none` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-shadow-hover` | `root` | `box-shadow` | `hover`<br>`interactive`<br>`variant=outline` | `--xh-elevation-lifted` | card 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-card-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | card 的 title 部件 color 覆盖槽。 |
| `--xh-card-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | card 的 title 部件 font-size 覆盖槽。 |
| `--xh-card-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | card 的 title 部件 font-weight 覆盖槽。 |
| `--xh-card-title-leading` | `title` | `line-height` | `default` | `--xh-leading-tight` | card 的 title 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-card-glint-duration`。

`background-color` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走。
