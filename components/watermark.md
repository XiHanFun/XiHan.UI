来源：https://ui.docs.xihanfun.com/components/watermark

# 水印 `watermark`

在一块区域上铺一层重复的印记，底下的内容照常点、照常选。

## 何时使用

- 内部数据页面需要标出归属与责任人，降低截图外传的意愿。
- 预览稿、样例数据需要标明"非正式"。

## 何时不用

- 当作防泄密手段：它是网页上的一层元素，删得掉。它降低随手外传的意愿，不构成防护。
- 只是想加个装饰纹理：那是背景。

## 特性

- 印子是一张按文字算出来的 SVG，铺在根的伪元素上，不拦指针事件。
- `text` 写成多行就是多行水印，图样跟着长高；空行不占位。
- 文字与图片都空了才落 `data-state="empty"`，整层不画。
- 颜色走 `--xh-watermark-fg`，深浅主题各自跟着走。
- `fontFamily` 指定印文字的字体；图样是当图片用的 SVG，取不到页面字体，字体名要写全。
- `image` 在文字上方印一张图，`imageSize` 给它的像素尺寸（缺省 64 × 64）。

## 示例

### 基础用法

印子是一张按文字算出来的 SVG，铺在根的伪元素上；底下的内容照常点、照常选

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhWatermarkRoot text="曦寒 · 内部资料">
    <XhWatermarkContent>
      <div style="padding: 24px; line-height: 1.9">
        <p>本页列出的账期数据仅供内部核对。</p>
        <p>试着选中这段文字，或点下面的按钮——水印不吃点击，也选不中。</p>
        <p><button type="button">点我</button></p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
```

```html
<xh-watermark text="曦寒 · 内部资料" style="display: block">
  <div data-xh-part="root">
    <div data-xh-part="content">
      <div style="padding: 24px; line-height: 1.9">
        <p>本页列出的账期数据仅供内部核对。</p>
        <p>试着选中这段文字，或点下面的按钮——水印不吃点击，也选不中。</p>
        <p><button type="button">点我</button></p>
      </div>
    </div>
  </div>
</xh-watermark>
```

### 多行

text 写成多行就是多行水印，图样跟着长高；空白行不占位

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const lines = ["曦寒前端组件库", "zhaifanhua@gmail.com", "2026-08-11"];
</script>

<template>
  <XhWatermarkRoot :text="lines" :font-size="13">
    <XhWatermarkContent>
      <div style="padding: 32px; line-height: 1.9">
        <p>三行水印按行铺开，每行居中对齐，整块绕图样中心一起倾斜。</p>
        <p>行距按字号折算，换字号不必再调行距。</p>
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
      <div style="padding: 32px; line-height: 1.9">
        <p>三行水印按行铺开，每行居中对齐，整块绕图样中心一起倾斜。</p>
        <p>行距按字号折算，换字号不必再调行距。</p>
      </div>
    </div>
  </div>
</xh-watermark>
```

### 角度、疏密与深浅

rotate 转整块图样，gap 决定两块之间留多少空白，fontSize 与 opacity 决定字多大、印多深

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const looks = [
  { label: "缺省", rotate: undefined, gap: undefined, fontSize: undefined, opacity: undefined },
  { label: "平着排、印得密", rotate: 0, gap: 8, fontSize: 12, opacity: 0.18 },
  { label: "转 45 度、印得疏", rotate: -45, gap: 56, fontSize: 18, opacity: 0.12 },
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
      style="inline-size: 220px; border: 1px solid var(--xh-border-default); border-radius: 6px"
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
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">缺省</div>
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
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">
          平着排、印得密
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
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 16px; block-size: 160px; font-size: 13px">
          转 45 度、印得疏
        </div>
      </div>
    </div>
  </xh-watermark>
</div>
```

### 撤掉与换色

文字空了就落 data-state="empty"，整层不画；印子的颜色走 --xh-watermark-fg，深浅主题各自跟着走

```vue
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const on = ref(true);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px">
      <input v-model="on" type="checkbox">
      盖上水印
    </label>
    <!-- 图样当遮罩用，颜色由这一个变量决定；写成背景图就得把颜色焊死在图里 -->
    <XhWatermarkRoot
      :text="on ? '曦寒 · 机密' : ''"
      style="--xh-watermark-fg: var(--xh-fg-danger); border: 1px solid var(--xh-border-default); border-radius: 6px"
    >
      <XhWatermarkContent>
        <div style="padding: 24px; block-size: 180px; line-height: 1.9">
          <p>取消勾选后 root 落 data-state="empty"，印子那一层整层不画。</p>
        </div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <label style="display: flex; align-items: center; gap: 8px; font-size: 13px">
    <input id="watermark-toggle" type="checkbox" checked />
    盖上水印
  </label>

  <!-- 图样当遮罩用，颜色由这一个变量决定；写成背景图就得把颜色焊死在图里 -->
  <xh-watermark
    id="watermark-color"
    text="曦寒 · 机密"
    style="
      display: block;
      --xh-watermark-fg: var(--xh-fg-danger);
      border: 1px solid var(--xh-border-default);
      border-radius: 6px;
    "
  >
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div style="padding: 24px; block-size: 180px; line-height: 1.9">
          <p>取消勾选后 root 落 data-state="empty"，印子那一层整层不画。</p>
        </div>
      </div>
    </div>
  </xh-watermark>
</div>

<script type="module">
  // 勾选状态决定水印文字给不给
  const toggle = document.getElementById("watermark-toggle");
  const watermark = document.getElementById("watermark-color");
  toggle.addEventListener("change", () => {
    watermark.text = toggle.checked ? "曦寒 · 机密" : "";
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-watermark>` |
| Vue 组件 | `XhWatermarkContent` `XhWatermarkRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/watermark.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="watermark"`：**`root`** · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fontFamily` | `string` |  | 印文字用的字体，缺省 `sans-serif`。 图样是一张当遮罩用的 SVG，取不到页面里的字体，所以要在这里把字体名写全 （例如 `'PingFang SC, sans-serif'`）；写的字体在运行环境里不存在时由平台自己回退。 |
| `fontSize` | `number` |  | 字号，单位像素，缺省 14。 |
| `gap` | `number` |  | 两块图样之间留的空白，单位像素，缺省 24。 |
| `image` | `string` |  | 印在文字上方的图片，只收 `data:image/` 开头的内联图片。 图样是当遮罩用的，遮罩只取图样的透明度：印出来是这张图的剪影，颜色仍由 `--xh-watermark-fg` 给。外部地址一律不收——SVG 当图片用时取不到外部资源， 收了也印不出东西。 |
| `imageSize` | `WatermarkImageSize` |  | 图片的像素尺寸，缺省 64 × 64。 |
| `opacity` | `number` |  | 印子的深浅，0 到 1，缺省 0.15。 |
| `rotate` | `number` |  | 倾斜角度，单位度，缺省 -22。 |
| `text` | `string \| string[]` |  | 水印文字。给数组就是多行，单个字符串里的换行同样断行； 去掉空白行——它只让图样长高，印不出任何东西。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `lines` | `readonly string[]` | 归一化后的文字行；没有可印的文字时是空数组。 |
| `tile` | `WatermarkTile` | 图样尺寸，即平铺步距；没有图样时宽高都是 0。 |
| `image` | `string` | 图样的 data URI；没有图样时是空串。 |
| `state` | `WatermarkState` |  |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/watermark.css` 按部件选择：`[data-scope="watermark"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-watermark-fg` · `--xh-watermark-image` · `--xh-watermark-tile`

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 包住[表格](./table)、[卡片](./card)或整块内容区。

## 最佳实践

- 深浅要能看见又不碍阅读：默认 0.15 是个稳妥的起点，深色主题下往往还要再调。
- 内容里带上可追溯的标识（工号、时间），只写公司名起不到追溯作用。
- 印 logo 用单色图形：印子是遮罩，出来的是剪影，多色图会糊成一块。

## 反模式

- 把它当访问控制用：不该看见的数据就不该发到前端。
- 印得太深，正文读起来费力。
