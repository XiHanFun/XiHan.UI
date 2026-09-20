来源：https://ui.docs.xihanfun.com/components/button

# Button 按钮

用于触发即时操作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/vue/src/components/button.ts" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/react/src/components/button.tsx" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

触发一次操作

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton>按钮</XhButton>
</template>
```

```html
<xh-button>
  <button data-xh-part="root">按钮</button>
</xh-button>
```

## 组件结构

加粗的是必需部件。

`data-scope="button"`：**`root`** · `label` · `indicator` · `prefix` · `suffix`

## 示例

### 变体

设置按钮外观

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton variant="solid">主要</XhButton>
  <XhButton variant="subtle">次要</XhButton>
  <XhButton variant="outline">线框</XhButton>
  <XhButton variant="ghost">幽灵</XhButton>
</template>
```

```html
<xh-button variant="solid">
  <button data-xh-part="root">主要</button>
</xh-button>
<xh-button variant="subtle">
  <button data-xh-part="root">次要</button>
</xh-button>
<xh-button variant="outline">
  <button data-xh-part="root">线框</button>
</xh-button>
<xh-button variant="ghost">
  <button data-xh-part="root">幽灵</button>
</xh-button>
```

### 尺寸

小、中、大三档

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton size="sm">小尺寸</XhButton>
  <XhButton>中尺寸</XhButton>
  <XhButton size="lg">大尺寸</XhButton>
</template>
```

```html
<xh-button size="sm">
  <button data-xh-part="root">小尺寸</button>
</xh-button>
<xh-button>
  <button data-xh-part="root">中尺寸</button>
</xh-button>
<xh-button size="lg">
  <button data-xh-part="root">大尺寸</button>
</xh-button>
```

### 图标

在文字前后放置图标

```vue
<script setup lang="ts">
import { ArrowRightIcon, PlusIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonLabel, XhButtonPrefix, XhButtonSuffix, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhButton>
    <XhButtonPrefix><XhIcon :icon="PlusIcon" /></XhButtonPrefix>
    <XhButtonLabel>新建项目</XhButtonLabel>
  </XhButton>
  <XhButton variant="subtle">
    <XhButtonLabel>下一步</XhButtonLabel>
    <XhButtonSuffix><XhIcon :icon="ArrowRightIcon" /></XhButtonSuffix>
  </XhButton>
</template>
```

```html
<xh-button>
  <button data-xh-part="root">
    <span data-xh-part="prefix">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 5V19"></path><path d="M5 12H19"></path>
      </svg>
    </span>
    <span data-xh-part="label">新建项目</span>
  </button>
</xh-button>
<xh-button variant="subtle">
  <button data-xh-part="root">
    <span data-xh-part="label">下一步</span>
    <span data-xh-part="suffix">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M4 12H20"></path><path d="M14 6L20 12L14 18"></path>
      </svg>
    </span>
  </button>
</xh-button>
```

### 仅图标

紧凑的图标操作

```vue
<script setup lang="ts">
import { HeartIcon, SearchIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhButton icon-only aria-label="搜索"><XhIcon :icon="SearchIcon" /></XhButton>
  <XhButton icon-only variant="subtle" aria-label="收藏"><XhIcon :icon="HeartIcon" /></XhButton>
  <XhButton icon-only variant="outline" aria-label="搜索"><XhIcon :icon="SearchIcon" /></XhButton>
  <XhButton icon-only variant="ghost" aria-label="收藏"><XhIcon :icon="HeartIcon" /></XhButton>
</template>
```

```html
<xh-button icon-only>
  <button data-xh-part="root" aria-label="搜索">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5L20.5 20.5"></path>
    </svg>
  </button>
</xh-button>
<xh-button icon-only variant="subtle">
  <button data-xh-part="root" aria-label="收藏">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"></path>
    </svg>
  </button>
</xh-button>
<xh-button icon-only variant="outline">
  <button data-xh-part="root" aria-label="搜索">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5L20.5 20.5"></path>
    </svg>
  </button>
</xh-button>
<xh-button icon-only variant="ghost">
  <button data-xh-part="root" aria-label="收藏">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"></path>
    </svg>
  </button>
</xh-button>
```

### 加载

保留按钮标签并阻止重复操作

```vue
<script setup lang="ts">
import { LoaderIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonIndicator, XhButtonLabel, XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhButton loading>
    <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
    <XhButtonLabel>提交</XhButtonLabel>
  </XhButton>
  <XhButton loading variant="subtle">
    <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
    <XhButtonLabel>处理中</XhButtonLabel>
  </XhButton>
</template>
```

```html
<xh-button loading>
  <button data-xh-part="root">
    <span data-xh-part="indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    </span>
    <span data-xh-part="label">提交</span>
  </button>
</xh-button>
<xh-button loading variant="subtle">
  <button data-xh-part="root">
    <span data-xh-part="indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    </span>
    <span data-xh-part="label">处理中</span>
  </button>
</xh-button>
```

### 异步操作

点击后显示加载状态

```vue
<script setup lang="ts">
import { LoaderIcon } from "@xihan-ui/icons";
import { XhButton, XhButtonIndicator, XhButtonLabel, XhIcon } from "@xihan-ui/vue";
import { ref } from "vue";

const loading = ref(false);

async function save() {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  loading.value = false;
}
</script>

<template>
  <XhButton :loading="loading" @click="save">
    <XhButtonIndicator><XhIcon :icon="LoaderIcon" /></XhButtonIndicator>
    <XhButtonLabel>保存</XhButtonLabel>
  </XhButton>
</template>
```

```html
<xh-button id="button-loading-trigger">
  <button data-xh-part="root">
    <span data-xh-part="indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    </span>
    <span data-xh-part="label">保存</span>
  </button>
</xh-button>

<script type="module">
  const button = document.getElementById("button-loading-trigger");
  button.addEventListener("click", async () => {
    button.loading = true;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    button.loading = false;
  });
</script>
```

### 全宽

占满容器宽度

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton full-width>继续</XhButton>
</template>
```

```html
<xh-button full-width>
  <button data-xh-part="root">继续</button>
</xh-button>
```

### 禁用

暂时不可执行的操作

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton disabled>主要操作</XhButton>
  <XhButton disabled variant="subtle">次要操作</XhButton>
  <XhButton disabled variant="outline">线框按钮</XhButton>
  <XhButton disabled variant="ghost">幽灵按钮</XhButton>
</template>
```

```html
<xh-button disabled><button data-xh-part="root">主要操作</button></xh-button>
<xh-button disabled variant="subtle"><button data-xh-part="root">次要操作</button></xh-button>
<xh-button disabled variant="outline"><button data-xh-part="root">线框按钮</button></xh-button>
<xh-button disabled variant="ghost"><button data-xh-part="root">幽灵按钮</button></xh-button>
```

### 链接

保留原生导航能力

```vue
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhButton as="a" href="/introduction">了解更多</XhButton>
</template>
```

```html
<xh-button as="a">
  <a data-xh-part="root" href="/introduction">了解更多</a>
</xh-button>
```

## 设计指引

### 何时使用

- 提交表单或执行命令。
- 打开菜单、对话框等浮层。
- 需要明确主次关系的一组操作。

### 何时不用

- 导航到其他地址时，将按钮渲染为链接。
- 表达持续的开关状态时，使用[切换按钮](./toggle)。
- 在多个选项中选择时，使用[切换按钮组](./toggle-group)或[单选组](./radio-group)。

### 特性

- 支持四种变体、六种颜色和三种尺寸。
- 缺省变体是品牌实心 `solid`，这是按钮独有的缺省；其余触发器缺省中性。
- 支持文字、图标、图标加文字与全宽按钮。
- `loading` 保留焦点并阻止重复操作。
- `as="a"` 保留原生链接能力。

### 组合

- 使用 `prefix` 与 `suffix` 放置图标。
- 使用 `indicator` 提供加载图形。
- 使用[按钮组](./button-group)组合相关操作。

### 最佳实践

- 每个视图只保留一个主要操作。
- 图标按钮必须提供 `aria-label`。
- 加载时保留原有标签，避免按钮宽度变化。

### 反模式

- 不要使用按钮模拟普通链接。
- 不要在按钮中嵌套可聚焦元素。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| 状态机 | `buttonMachine` |
| 皮肤 | `@xihan-ui/styles/button.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `'button' \| 'submit' \| 'reset'` |  |  |
| `disabled` | `boolean` |  |  |
| `loading` | `boolean` |  | 加载态：用 aria-disabled + 拦截事件表达，保留焦点。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，默认 solid——只有 Button 缺省品牌实心，其余触发器缺省中性。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `size` | `Size` |  |  |
| `iconOnly` | `boolean` |  | 仅图标：左右内边距清零、宽高相等。宽度跟随当前尺寸档的高度， 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行提供可及名。 |
| `ariaLabel` | `string` |  | 作者写在根节点上的可及名（aria-label / aria-labelledby）。 宿主只把它们转告连接层，用于判断图标按钮是否有名字；属性本身仍由宿主写入根节点。 |
| `ariaLabelledby` | `string` |  |  |
| `fullWidth` | `boolean` |  | 撑满行宽：表单末尾的提交按钮与移动端常用。 |
| `as` | `ButtonElement` |  | 渲染的标签，默认 button。 写为 a 时不再产出 type 与原生 disabled（两者在链接上无效），禁用改由 aria-disabled 表达， 点击仍被拦截。href 由作者自行提供。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `getRootProps` | `() => T['button']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, interactive | 激活按钮（原生行为） |
| `Enter` / `Space` | held in root, interactive | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `root` | `aria-disabled` | 'true' \| undefined |
| `indicator` | `aria-hidden` | 'true' |
| `prefix` | `aria-hidden` | 'true' |
| `suffix` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/button.css` 使用 `[data-scope="button"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-icon-only` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' \| 'text' |
| `root` | `data-xh-action-size` | props.size |
| `root` | `data-xh-action-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-button-bg` | `root` | `background-color` | `default`<br>`focus-visible`<br>`loading` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` | button 的 root 部件 background-color 覆盖槽。 |
| `--xh-button-bg-active` | `root` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | button 的 root 部件 background-color 覆盖槽。 |
| `--xh-button-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | button 的 root 部件 background-color 覆盖槽。 |
| `--xh-button-fg` | `root` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | button 的 root 部件 color 覆盖槽。 |
| `--xh-button-font-size` | `root` | `font-size` | `default` | `--xh-_button-group-font-size` | button 的 root 部件 font-size 覆盖槽。 |
| `--xh-button-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` | button 的 root 部件 font-weight 覆盖槽。 |
| `--xh-button-gap` | `root` | `gap` | `default` | `--xh-_button-group-gap` | button 的 root 部件 gap 覆盖槽。 |
| `--xh-button-h` | `root` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_button-group-h` | button 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-button-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | button 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-button-px` | `root` | `padding-inline` | `default` | `--xh-_button-group-px` | button 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-button-radius` | `root` | `border-radius` | `default` | `--xh-_button-radius` | button 的 root 部件 border-radius 覆盖槽。 |
| `--xh-button-shadow` | `root` | `box-shadow` | `default` | `none` | button 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-button-shadow-hover` | `root` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | button 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-button-spin-duration` | `indicator`<br>`root` | `animation` | `loading` | `--xh-spin-duration` | button 的 indicator、root 部件 animation 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-spin` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
