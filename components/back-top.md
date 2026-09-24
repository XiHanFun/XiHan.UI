来源：https://ui.docs.xihanfun.com/components/back-top

# BackTop 回到顶部

滚动超过指定距离后显示返回入口。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/back-top" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/back-top.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/back-top" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/back-top" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/back-top.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚动后显示回到顶部按钮

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = ["概览", "安装", "主题", "发布"];
const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="position: relative; inline-size: min(560px, 100%)">
    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 240px;
        overflow: auto;
        padding-inline: 16px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <section v-for="section in sections" :key="section" style="min-block-size: 104px; padding-block: 16px">
        <strong>{{ section }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ section }}相关内容</p>
      </section>
    </div>

    <XhBackTopRoot
      :target="scrollEl"
      :visibility-height="120"
      style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
    >
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
```

```html
<div style="position: relative; inline-size: min(560px, 100%)">
  <div
    id="back-top-basic-scroll"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      padding-inline: 16px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <section style="min-block-size: 104px; padding-block: 16px"><strong>概览</strong><p style="color: var(--xh-fg-muted)">概览相关内容</p></section>
    <section style="min-block-size: 104px; padding-block: 16px"><strong>安装</strong><p style="color: var(--xh-fg-muted)">安装相关内容</p></section>
    <section style="min-block-size: 104px; padding-block: 16px"><strong>主题</strong><p style="color: var(--xh-fg-muted)">主题相关内容</p></section>
    <section style="min-block-size: 104px; padding-block: 16px"><strong>发布</strong><p style="color: var(--xh-fg-muted)">发布相关内容</p></section>
  </div>

  <template id="back-top-basic-template">
    <xh-back-top visibility-height="120">
      <div
        data-xh-part="root"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <button data-xh-part="trigger"></button>
      </div>
    </xh-back-top>
  </template>
</div>

<script type="module">
  const template = document.getElementById("back-top-basic-template");
  const backTop = template.content.firstElementChild;
  backTop.target = document.getElementById("back-top-basic-scroll");
  template.replaceWith(backTop);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="back-top"`：**`root`** · **`trigger`**

## 示例

### 显示阈值

提前显示回到顶部按钮

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = ["快速开始", "基础配置", "主题定制", "部署"];
const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="position: relative; inline-size: min(560px, 100%)">
    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 220px;
        overflow: auto;
        padding-inline: 16px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <section v-for="section in sections" :key="section" style="min-block-size: 88px; padding-block: 14px">
        <strong>{{ section }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ section }}相关内容</p>
      </section>
    </div>

    <XhBackTopRoot
      :target="scrollEl"
      :visibility-height="48"
      style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
    >
      <XhBackTopTrigger />
    </XhBackTopRoot>
  </div>
</template>
```

```html
<div style="position: relative; inline-size: min(560px, 100%)">
  <div
    id="back-top-threshold-scroll"
    data-xh-scroll
    style="
      block-size: 220px;
      overflow: auto;
      padding-inline: 16px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <section style="min-block-size: 88px; padding-block: 14px"><strong>快速开始</strong><p style="color: var(--xh-fg-muted)">快速开始相关内容</p></section>
    <section style="min-block-size: 88px; padding-block: 14px"><strong>基础配置</strong><p style="color: var(--xh-fg-muted)">基础配置相关内容</p></section>
    <section style="min-block-size: 88px; padding-block: 14px"><strong>主题定制</strong><p style="color: var(--xh-fg-muted)">主题定制相关内容</p></section>
    <section style="min-block-size: 88px; padding-block: 14px"><strong>部署</strong><p style="color: var(--xh-fg-muted)">部署相关内容</p></section>
  </div>

  <template id="back-top-threshold-template">
    <xh-back-top visibility-height="48">
      <div
        data-xh-part="root"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <button data-xh-part="trigger"></button>
      </div>
    </xh-back-top>
  </template>
</div>

<script type="module">
  const template = document.getElementById("back-top-threshold-template");
  const backTop = template.content.firstElementChild;
  backTop.target = document.getElementById("back-top-threshold-scroll");
  template.replaceWith(backTop);
</script>
```

### 滚动方式

平滑返回或立即返回

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const sections = ["概览", "配置", "接口", "发布"];
const smoothEl = ref<HTMLElement | null>(null);
const autoEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; inline-size: min(640px, 100%)">
    <div style="position: relative">
      <div
        ref="smoothEl"
        data-xh-scroll
        style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
      >
        <p v-for="section in sections" :key="section" style="min-block-size: 64px">平滑 · {{ section }}</p>
      </div>
      <XhBackTopRoot
        :target="smoothEl"
        behavior="smooth"
        :visibility-height="40"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative">
      <div
        ref="autoEl"
        data-xh-scroll
        style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
      >
        <p v-for="section in sections" :key="section" style="min-block-size: 64px">立即 · {{ section }}</p>
      </div>
      <XhBackTopRoot
        :target="autoEl"
        behavior="auto"
        :visibility-height="40"
        size="sm"
        style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; inline-size: min(640px, 100%)">
  <div style="position: relative">
    <div id="back-top-smooth-scroll" data-xh-scroll style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <p style="min-block-size: 64px">平滑 · 概览</p><p style="min-block-size: 64px">平滑 · 配置</p><p style="min-block-size: 64px">平滑 · 接口</p><p style="min-block-size: 64px">平滑 · 发布</p>
    </div>
    <template id="back-top-smooth-template">
      <xh-back-top behavior="smooth" visibility-height="40" size="sm"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"><button data-xh-part="trigger"></button></div></xh-back-top>
    </template>
  </div>

  <div style="position: relative">
    <div id="back-top-auto-scroll" data-xh-scroll style="block-size: 200px; overflow: auto; padding-inline: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <p style="min-block-size: 64px">立即 · 概览</p><p style="min-block-size: 64px">立即 · 配置</p><p style="min-block-size: 64px">立即 · 接口</p><p style="min-block-size: 64px">立即 · 发布</p>
    </div>
    <template id="back-top-auto-template">
      <xh-back-top behavior="auto" visibility-height="40" size="sm"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 10px; --xh-back-top-inset-inline: 10px"><button data-xh-part="trigger"></button></div></xh-back-top>
    </template>
  </div>
</div>

<script type="module">
  for (const mode of ["smooth", "auto"]) {
    const template = document.getElementById(`back-top-${mode}-template`);
    const backTop = template.content.firstElementChild;
    backTop.target = document.getElementById(`back-top-${mode}-scroll`);
    template.replaceWith(backTop);
  }
</script>
```

### 变体

选择与所在表面匹配的样式

```vue
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";

const variants = [
  { label: "线框（默认）", value: "outline" },
  { label: "实心", value: "solid" },
  { label: "幽灵", value: "ghost" },
] as const;
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 12px; inline-size: min(640px, 100%)">
    <div
      v-for="item in variants"
      :key="item.label"
      style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <span style="color: var(--xh-fg-muted)">{{ item.label }}</span>
      <XhBackTopRoot
        :variant="item.value"
        :visibility-height="0"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 12px; inline-size: min(640px, 100%)">
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">线框（默认）</span>
    <xh-back-top variant="outline" visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">实心</span>
    <xh-back-top variant="solid" visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
  <div style="position: relative; block-size: 120px; padding: 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <span style="color: var(--xh-fg-muted)">幽灵</span>
    <xh-back-top variant="ghost" visibility-height="0"><div data-xh-part="root" style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"><button data-xh-part="trigger"></button></div></xh-back-top>
  </div>
</div>
```

## 设计指引

### 何时使用

- 长页面或独立滚动区域。

### 何时不用

- 短页面不需要返回入口。
- 多个悬浮操作使用[浮动按钮](./float-button)。

### 特性

- `visibilityHeight` 设置显示阈值。
- `behavior` 支持平滑或立即返回。
- 触发器走 Action Control floating 档：默认 48px 圆形、图标 24px，按下缩放并换底；默认（outline）使用磨砂浮动表面，也可通过 `variant` 切换为 solid / subtle / ghost。
- 减少动效、减少透明度与强制色模式会自动降级。

### 组合

- 指定 `target` 后监听并滚动该容器；未指定时作用于页面。

### 最佳实践

- 避开固定工具条和移动端手势区。
- 保持默认的按需显示，不在页面顶部常驻。

### 反模式

- 在短页面或已有返回入口的位置重复使用。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-back-top>` |
| Vue 组件 | `XhBackTopRoot` `XhBackTopTrigger` |
| 组合式函数 | `useBackTop` |
| 状态机 | `backTopMachine` |
| 皮肤 | `@xihan-ui/styles/back-top.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `visibilityHeight` | `number` |  | 滚动超过该像素数后按钮才显示，默认 200。 |
| `behavior` | `BackTopBehavior` |  | 滚回顶部的方式，默认 smooth。 |
| `translations` | `Partial<BackTopTranslations>` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，默认 outline（缺省中性，描边 + 磨砂面；solid 才品牌实心）。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定按钮使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，默认 md；触发器走 Action Control floating 档（40 / 48 / 56px）。 |
| `onVisibilityChange` | `(details: BackTopVisibilityChangeDetails) => void` |  | 显隐变化时回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `visibility-change` | `BackTopVisibilityChangeDetails` | 显隐变化；detail 为 `{ visible: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhBackTopRoot` | `default` | `BackTopRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhBackTopRoot` | `target` | `() => HTMLElement \| null` |  | 滚动容器取值器，默认即整页滚动；挂载效应执行时求值。 |
| `XhBackTopRoot` | `children` | `SlotChildren<BackTopRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `trigger` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`hidden` · `visible`

**事件**：`SCROLL.RESOLVE` · `TRIGGER.CLICK` · `PRESS.START` · `PRESS.END`

**判据**：`shouldShow` · `shouldHide`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visible` | `boolean` | 按钮当前是否显示。 |
| `scrollToTop` | `() => void` | 程序化滚回顶部，与点击按钮走同一路径。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 滚回顶部；按 behavior 决定是一步到位还是平滑滚过去 |
| `Enter` / `Space` | held in trigger | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |
| `Tab` / `Shift+Tab` | trigger 露面时 | 走到按钮上；收起时整个 root 带 hidden，按钮不在 Tab 序列里 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-label` | props.translations.trigger |

## 样式参考

### 皮肤

`@xihan-ui/styles/back-top.css` 使用 `[data-scope="back-top"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'visible' \| 'hidden' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'floating' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-back-top-bg` | `root`<br>`trigger` | `background-color` | `default`<br>`disabled`<br>`focus-visible`<br>`variant=outline` | `--xh-_action-variant-bg-disabled`<br>`--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest`<br>`--xh-_back-top-bg`<br>`--xh-material-frosted-focus-surface` | back-top 的 root、trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-bg-active` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | back-top 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-back-top-border` | `root`<br>`trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`focus-visible`<br>`variant=outline` | `--xh-_action-variant-border-disabled`<br>`--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest`<br>`--xh-_back-top-border` | back-top 的 root、trigger 部件 border、border-color 覆盖槽。 |
| `--xh-back-top-border-hover` | `root`<br>`trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_back-top-border` | back-top 的 root、trigger 部件 border-color 覆盖槽。 |
| `--xh-back-top-fg` | `root`<br>`trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest`<br>`--xh-_back-top-fg` | back-top 的 root、trigger 部件 color 覆盖槽。 |
| `--xh-back-top-icon-size` | `trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | back-top 的 trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-back-top-inset-block` | `root` | `inset-block-end` | `default` | `--xh-space-8` | back-top 的 root 部件 inset-block-end 覆盖槽。 |
| `--xh-back-top-inset-inline` | `root` | `inset-inline-end` | `default` | `--xh-space-8` | back-top 的 root 部件 inset-inline-end 覆盖槽。 |
| `--xh-back-top-layer` | `root` | `z-index` | `default` | `--xh-layer-sticky` | back-top 的 root 部件 z-index 覆盖槽。 |
| `--xh-back-top-radius` | `trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | back-top 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-back-top-shadow` | `root`<br>`trigger` | `box-shadow` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`variant=outline` | `--xh-_back-top-shadow`<br>`none` | back-top 的 root、trigger 部件 box-shadow 覆盖槽。 |
| `--xh-back-top-size` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=floating` | `--xh-_action-profile-visual-size` | back-top 的 trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
