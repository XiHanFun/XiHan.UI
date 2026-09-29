来源：https://ui.docs.xihanfun.com/components/watermark

# Watermark 水印

在内容区域上重复显示文字或图片水印。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/watermark" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/watermark.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/watermark" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/watermark" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/watermark.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

为内容添加文字水印

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhWatermarkRoot text="XiHan · 内部资料">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>季度报告</strong>
        <p style="margin-block-end: 0">本季度活跃用户增长 18.6%，核心功能使用率持续提升。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
```

```html
<xh-watermark text="XiHan · 内部资料" style="display: block">
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>季度报告</strong>
        <p style="margin-block-end: 0">本季度活跃用户增长 18.6%，核心功能使用率持续提升。</p>
      </div>
    </div>
  </div>
</xh-watermark>
```

## 组件结构

加粗的是必需部件。

`data-scope="watermark"`：**`root`** · `content`

## 示例

### 多行水印

显示归属和时间信息

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const lines = ["曦寒前端组件库", "zhaifanhua@gmail.com", "2026-08-11"];
</script>

<template>
  <XhWatermarkRoot :text="lines" :font-size="13">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 32px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">该内容仅供项目成员评审。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
```

```html
<xh-watermark
  text="曦寒前端组件库
zhaifanhua@gmail.com
2026-08-11"
  font-size="13"
  style="display: block"
>
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div style="inline-size: 320px; padding: 32px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">该内容仅供项目成员评审。</p>
      </div>
    </div>
  </div>
</xh-watermark>
```

### 外观

设置角度、间距、字号和透明度

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const looks = [
  { label: "默认", rotate: undefined, gap: undefined, fontSize: undefined, opacity: undefined },
  { label: "紧凑", rotate: 0, gap: 8, fontSize: 12, opacity: 0.18 },
  { label: "宽松", rotate: -45, gap: 56, fontSize: 18, opacity: 0.12 },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhWatermarkRoot
      v-for="l in looks"
      :key="l.label"
      text="曦寒"
      :rotate="l.rotate"
      :gap="l.gap"
      :font-size="l.fontSize"
      :opacity="l.opacity"
      style="inline-size: 220px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhWatermarkContent>
        <div style="padding: 16px; block-size: 160px; font-size: 13px">{{ l.label }}</div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-watermark
    text="曦寒"
    style="
      display: block;
      inline-size: 220px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">默认</div>
      </div>
    </div>
  </xh-watermark>

  <xh-watermark
    text="曦寒"
    rotate="0"
    gap="8"
    font-size="12"
    opacity="0.18"
    style="
      display: block;
      inline-size: 220px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">
          紧凑
        </div>
      </div>
    </div>
  </xh-watermark>

  <xh-watermark
    text="曦寒"
    rotate="-45"
    gap="56"
    font-size="18"
    opacity="0.12"
    style="
      display: block;
      inline-size: 220px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">
          宽松
        </div>
      </div>
    </div>
  </xh-watermark>
</div>
```

### 自定义颜色

设置水印前景色

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhWatermarkRoot text="机密" style="--xh-watermark-fg: var(--xh-fg-danger)">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 32px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>财务摘要</strong>
        <p style="margin-block-end: 0">仅限授权成员查看。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
```

```html
<xh-watermark text="机密" style="display: block; --xh-watermark-fg: var(--xh-fg-danger)">
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div style="inline-size: 320px; padding: 32px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>财务摘要</strong>
        <p style="margin-block-end: 0">仅限授权成员查看。</p>
      </div>
    </div>
  </div>
</xh-watermark>
```

### 图片地址

同源或放行了跨域的地址先取回再印出剪影

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhWatermarkRoot text="XiHan" image="/images/demo-avatar.svg" :image-size="{ width: 40, height: 40 }">
    <XhWatermarkContent>
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">预览版本仅供内部评审，请勿外传。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
```

```html
<xh-watermark id="watermark-image-url" text="XiHan" image="/images/demo-avatar.svg" style="display: block">
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div style="inline-size: 320px; padding: 24px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计稿预览</strong>
        <p style="margin-block-end: 0">预览版本仅供内部评审，请勿外传。</p>
      </div>
    </div>
  </div>
</xh-watermark>

<script type="module">
  // 图片尺寸是对象，只走 property
  document.getElementById("watermark-image-url").imageSize = { width: 40, height: 40 };
</script>
```

### 全屏水印

固定铺满整个视口，压在页面一切内容之上

```vue
<script setup lang="ts">
import { XhButton, XhWatermarkRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const on = ref(false);
</script>

<template>
  <XhButton variant="outline" @click="on = !on">{{ on ? "撤下全屏水印" : "铺上全屏水印" }}</XhButton>
  <XhWatermarkRoot v-if="on" fullscreen text="XiHan · 内部资料" />
</template>
```

```html
<xh-button id="watermark-fullscreen-toggle" variant="outline">
  <button data-xh-part="root">铺上全屏水印</button>
</xh-button>
<xh-watermark id="watermark-fullscreen" fullscreen text="XiHan · 内部资料" hidden>
  <div data-xh-part="root"></div>
</xh-watermark>

<script type="module">
  const toggle = document.getElementById("watermark-fullscreen-toggle");
  const watermark = document.getElementById("watermark-fullscreen");
  toggle.addEventListener("click", () => {
    watermark.hidden = !watermark.hidden;
    toggle.querySelector("button").textContent = watermark.hidden ? "铺上全屏水印" : "撤下全屏水印";
  });
</script>
```

## 设计指引

### 何时使用

- 标记内部数据、预览稿或样例内容。
- 在导出或截图内容中保留归属信息。

### 何时不用

- 水印不能替代访问控制或数据脱敏。
- 装饰纹理应使用背景样式。

### 特性

- 支持单行、多行文字和图片水印。图片可以是 `data:image/` 内联图片，也可以是 http(s)、`blob:` 或相对路径的地址：地址形式的图片按匿名跨域取回、画进 canvas 转成内联图片再印，取回之前只印文字；跨域地址须带 `Access-Control-Allow-Origin` 放行，否则浏览器拒载或 canvas 被污染，这张图不印并报一条诊断，文字照印。`javascript:` 等其余协议一律不收。
- 支持角度、间距、字号、透明度和字体配置。
- 水印不拦截指针事件，也不影响文本选择。
- 深浅主题下自动使用对应的前景色。
- 防篡改：删掉水印的根节点会被原位放回，改写它的 `data-scope` / `data-part` / `data-state` / `data-fullscreen` 或内联的图样变量会被改回当下 props 算出的值；组件卸载时先撤掉观察，正常卸载不受影响。它防的是直接动 DOM 的抹除，覆盖样式表、截图后处理之类防不住。
- `fullscreen` 全屏档：印子固定铺满整个视口，压在页面一切内容之上（含对话框与轻提示），页面滚动时原地不动；此时 root 不再建层叠上下文，放在页面任何位置都一样。祖先带 transform / filter 时 fixed 会被困在那个祖先里，全屏水印要放在没有这类祖先的地方。

### 组合

- 可包裹[表格](./table)、[卡片](./card)或页面内容区。

### 最佳实践

- 保持水印可见，但不要干扰正文阅读。
- 需要追溯时包含用户、时间或文档编号。
- 图片水印优先使用轮廓清晰的单色图形。

### 反模式

- 不要把水印当作安全边界。
- 不要使用过高的不透明度。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-watermark>` |
| Vue 组件 | `XhWatermarkContent` `XhWatermarkRoot` |
| 状态机 | `watermarkMachine` |
| 皮肤 | `@xihan-ui/styles/watermark.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fontFamily` | `string` |  | 印文字使用的字体，默认 `sans-serif`。 图样是一张用作遮罩的 SVG，无法获取页面中的字体，因此需要在这里把字体名写全 （例如 `'PingFang SC, sans-serif'`）；书写的字体在运行环境中不存在时由平台自行回退。 |
| `fontSize` | `number` |  | 字号，单位像素，默认 14。 |
| `fullscreen` | `boolean` |  | 全屏档：印子固定铺满整个视口，压在页面一切内容之上（含对话框与轻提示），不随 root 的盒子走， 页面滚动时原地不动；root 本身不再建层叠上下文。默认 false。 |
| `gap` | `number` |  | 两块图样之间的空白，单位像素，默认 24。 |
| `image` | `string` |  | 印在文字上方的图片：`data:image/` 开头的内联图片，或 http(s)、相对路径与 `blob:` 地址。 图样用作遮罩，遮罩只取图样的透明度：印出的是该图的剪影，颜色仍由 `--xh-watermark-fg` 提供。 地址形式的图片先按匿名跨域取回、画进 canvas 转成内联图片再印：SVG 当图片用时自己取不到外部资源。 跨域的地址须带 `Access-Control-Allow-Origin` 放行，否则取不回或 canvas 被污染，这张图不印并报一条诊断， 文字照印；取回之前只印文字。其余协议（如 `javascript:`）一律不收。 |
| `imageSize` | `WatermarkImageSize` |  | 图片的像素尺寸，默认 64 × 64。 |
| `opacity` | `number` |  | 印记的深浅，0 到 1，默认 0.15。 |
| `rotate` | `number` |  | 倾斜角度，单位度，默认 -22。 |
| `text` | `string \| string[]` |  | 水印文字。提供数组即多行，单个字符串中的换行同样断行； 空白行会被去除：它只使图样增高，不印出任何内容。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`IMAGE.LOADED` · `IMAGE.CLEAR`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lines` | `readonly string[]` | 归一化后的文字行；没有可印的文字时为空数组。 |
| `tile` | `WatermarkTile` | 图样尺寸，即平铺步距；没有图样时宽高都是 0。 |
| `image` | `string` | 图样的 data URI；没有图样时为空串。 |
| `state` | `WatermarkState` |  |
| `fullscreen` | `boolean` | 全屏档：印子固定铺满视口。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/watermark.css` 使用 `[data-scope="watermark"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-watermark-fg` | `root` | `background-color` | `state=ready` | `--xh-fg-muted` | watermark 的 root 部件 background-color 覆盖槽。 |
| `--xh-watermark-image` | `root` | `-webkit-mask-image`<br>`mask-image` | `state=ready` | `none` | watermark 的 root 部件 -webkit-mask-image、mask-image 覆盖槽。 |
| `--xh-watermark-layer` | `root` | `z-index` | `fullscreen`<br>`state=ready` | `--xh-layer-tooltip` | watermark 的 root 部件 z-index 覆盖槽。 |
| `--xh-watermark-tile` | `root` | `-webkit-mask-size`<br>`mask-size` | `state=ready` | `auto` | watermark 的 root 部件 -webkit-mask-size、mask-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
