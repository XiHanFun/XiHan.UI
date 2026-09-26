来源：https://ui.docs.xihanfun.com/components/bar-code

# BarCode 条形码 `alpha`

将一段文本绘制为一维条形码，`format` 选择码制。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/bar-code" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/bar-code.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/bar-code" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/bar-code" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/bar-code.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

提供 value 即绘制码，默认 Code 128，接受任意 ASCII；人读文字印在条下

```vue
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";
</script>

<template>
  <XhBarCode value="XH-2026-0915" />
</template>
```

```html
<xh-bar-code value="XH-2026-0915">
  <svg data-xh-part="root"></svg>
</xh-bar-code>
```

## 组件结构

加粗的是必需部件。

`data-scope="bar-code"`：**`root`**

## 示例

### 码制

零售商品用 EAN / UPC，外箱用 ITF-14，工业标签用 Code 39；定长数字码制的校验位可省略，组件补齐

```vue
<script setup lang="ts">
import type { BarCodeFormat } from "@xihan-ui/headless";
import { XhBarCode } from "@xihan-ui/vue";

const samples: { format: BarCodeFormat; value: string; name: string }[] = [
  { format: "ean13", value: "400638133393", name: "EAN-13" },
  { format: "ean8", value: "9638507", name: "EAN-8" },
  { format: "upca", value: "03600029145", name: "UPC-A" },
  { format: "upce", value: "0425261", name: "UPC-E" },
  { format: "itf14", value: "1540014128876", name: "ITF-14" },
  { format: "code39", value: "XH-0915", name: "Code 39" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div v-for="item in samples" :key="item.format" style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :format="item.format" :value="item.value" :height="48" />
      <span style="font-size: 12px">{{ item.name }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="ean13" value="400638133393" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">EAN-13</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="ean8" value="9638507" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">EAN-8</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="upca" value="03600029145" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">UPC-A</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="upce" value="0425261" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">UPC-E</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="itf14" value="1540014128876" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">ITF-14</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="code39" value="XH-0915" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">Code 39</span>
  </div>
</div>
```

### GS1-128

gs1 开启后起始符后放置 FNC1；定长 AI 直接连写，变长 AI 后面用 GS（U+001D）与下一个隔开

```vue
<script setup lang="ts">
import { BAR_FNC1_CHAR } from "@xihan-ui/headless";
import { XhBarCode } from "@xihan-ui/vue";

// (01) GTIN 定长 14 位、(17) 有效期定长 6 位、(10) 批号变长——它后面才需要分隔，(21) 序列号收尾
const value = ["0109501101530003", "17250630", "10ABC123", BAR_FNC1_CHAR, "21SN001"].join("");
</script>

<template>
  <div style="display: grid; gap: 6px; justify-items: start">
    <XhBarCode :value="value" gs1 label="GS1-128 物流标签" />
    <span style="font-size: 12px">(01)09501101530003 (17)250630 (10)ABC123 (21)SN001</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 6px; justify-items: start">
  <xh-bar-code id="bar-code-gs1" gs1 label="GS1-128 物流标签">
    <svg data-xh-part="root"></svg>
  </xh-bar-code>
  <span style="font-size: 12px">(01)09501101530003 (17)250630 (10)ABC123 (21)SN001</span>
</div>

<script type="module">
  // GS 是控制字符，写不进 HTML 特性，走 property 赋值
  // (01) GTIN 定长 14 位、(17) 有效期定长 6 位、(10) 批号变长——它后面才需要分隔，(21) 序列号收尾
  const host = document.getElementById("bar-code-gs1");
  host.value = ["0109501101530003", "17250630", "10ABC123", "\u001D", "21SN001"].join("");
</script>
```

### 尺寸与静区

barWidth 是最窄条的像素宽，整张码等比放大；height 只改条高；margin 是两侧静区的模块数

```vue
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";

const value = "SIZE";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :value="value" :bar-width="1" :height="40" />
      <span style="font-size: 12px">barWidth 1 · height 40</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :value="value" />
      <span style="font-size: 12px">缺省：barWidth 2 · height 64 · margin 10</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode :value="value" :bar-width="3" :height="40" :margin="2" />
      <span style="font-size: 12px">barWidth 3 · height 40 · margin 2</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="SIZE" bar-width="1" height="40">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">barWidth 1 · height 40</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="SIZE">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">缺省：barWidth 2 · height 64 · margin 10</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="SIZE" bar-width="3" height="40" margin="2">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">barWidth 3 · height 40 · margin 2</span>
  </div>
</div>
```

### 人读文字

text 关闭后只剩条；EAN 的守卫条按规范比数据条长 5X，不随文字变化

```vue
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode format="ean13" value="590123412345" />
      <span style="font-size: 12px">缺省印文字</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode format="ean13" value="590123412345" :text="false" />
      <span style="font-size: 12px">text=false</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: start">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="ean13" value="590123412345">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">缺省印文字</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code format="ean13" value="590123412345" text="false">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">text=false</span>
  </div>
</div>
```

### 换色

颜色不是 props，写两个 CSS 变量即可：条必须比底色深且对比充足，反相码无法扫描

```vue
<script setup lang="ts">
import { XhBarCode } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode value="COLOR" :height="48" />
      <span style="font-size: 12px">缺省</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <!-- 只换条色，人读文字跟着走 -->
      <XhBarCode value="COLOR" :height="48" style="--xh-bar-code-fg: #1d4ed8" />
      <span style="font-size: 12px">深蓝条</span>
    </div>
    <div style="display: grid; gap: 6px; justify-items: center">
      <XhBarCode value="COLOR" :height="48" style="--xh-bar-code-bg: #fff7ed; --xh-bar-code-fg: #431407" />
      <span style="font-size: 12px">暖底深棕</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: end">
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="COLOR" height="48">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">缺省</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <!-- 只换条色，人读文字跟着走 -->
    <xh-bar-code value="COLOR" height="48" style="--xh-bar-code-fg: #1d4ed8">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">深蓝条</span>
  </div>
  <div style="display: grid; gap: 6px; justify-items: center">
    <xh-bar-code value="COLOR" height="48" style="--xh-bar-code-bg: #fff7ed; --xh-bar-code-fg: #431407">
      <svg data-xh-part="root"></svg>
    </xh-bar-code>
    <span style="font-size: 12px">暖底深棕</span>
  </div>
</div>
```

## 设计指引

### 何时使用

- 货号、运单号、序列号需要被扫描枪一次读出。
- 商品零售码（EAN / UPC）、外箱码（ITF-14）、GS1 物流标签（GS1-128）。

### 何时不用

- 内容超过几十个字符或含非 ASCII 字符时，一维码会过长，改用[二维码](./matrix-code)。
- 用户就在当前设备上时，提供可点击的链接或可复制的文本。

### 特性

- `format` 支持七种码制：`code128`（默认）、`ean13` / `ean8` / `upca` / `upce`、`itf14`、`code39`；未知值不绘制，根进入 error 状态。
- 定长数字码制接受不带校验位的长度（自动补齐）与带校验位的长度（自动核对），不匹配时不绘制。
- `gs1` 把 Code 128 变为 GS1-128：起始符后放 FNC1，内容中的 GS（U+001D）编码为变长 AI 之间的分隔符。
- `text` 控制条下的人读文字；EAN / UPC 的数字逐位落在对应条的下方，守卫条按规范延长。
- `barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，默认取码制的规范值。
- `itf14` 默认带上下承载条；`code39` 可选 mod 43 校验字符。

### 组合

- 外层放[卡片](./card)；旁边配[剪贴板](./clipboard)提供同一内容的文本形式。

### 最佳实践

- 保留静区，贴边的条码无法扫描；默认值即规范值，压缩时不低于码制要求。
- 屏幕上 `barWidth` 至少为 2：1 像素宽的条在缩放后的屏幕上会模糊。
- 同时给出文本，不是所有人都能扫描。
- 内容含小写或标点时使用 `code128`；`code39` 只支持大写字母、数字与七个符号。

### 反模式

- 深色主题下直接反色：读码器按深条浅底取样，反相码无法扫描。
- 用 `height` 把条压得过矮，扫描线稍有倾斜就会超出条的范围。
- 自行计算错误的校验位再传入：组件会拒绝绘制，应传不带校验位的长度由组件补齐。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-bar-code>` |
| Vue 组件 | `XhBarCode` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/bar-code.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `barWidth` | `number` |  | 最窄条的像素宽度（X 尺寸），默认 2；整张码的宽度由它乘以模块数得出。 |
| `bearerBars` | `boolean` |  | 上下承载条：itf14 印在瓦楞纸上防止短读的两根横条，默认绘制； 只对 itf14 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。 |
| `checksum` | `boolean` |  | 附加 mod 43 校验字符。只对 code39 有意义：其余码制的校验位是规范必带的， 提供时向诊断通道报告一条警告，按未提供处理。 |
| `format` | `BarCodeFormat` |  | 码制，默认 code128。提供未知值时不绘制，根落到 `error` 态。 |
| `gs1` | `boolean` |  | GS1-128：起始符后放置 FNC1，内容中的 GS（U+001D）编码为变长 AI 之间的分隔。 只对 code128 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。 |
| `height` | `number` |  | 条的像素高度，默认 64；不含守卫条的延长段、人读文字与承载条。 |
| `label` | `string` |  | 可及名，默认使用 value；提供全空白的名字等同于未提供。 |
| `margin` | `number` |  | 两侧静区，单位为模块数；默认按码制的规范值（code128 / itf14 / code39 10，ean13 11，upca / upce 9，ean8 7）。 |
| `text` | `boolean` |  | 条下方是否打印人读文字，默认打印。 |
| `value` | `string` |  | 要编码的内容；空串不绘制。定长数字码制接受不带或带校验位的两种长度，带校验位时校验。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `format` | `BarCodeFormat` | 解析后的码制。提供未知值时原样透出，使错误信息与 data-format 都指向该值。 |
| `runs` | `readonly number[]` | 条空交替的宽度（模块），首元素为条；未绘制时为空数组。 |
| `modules` | `number` | 不含静区的模块数；未绘制时为 0。 |
| `encoded` | `string` | 实际编入码中的内容，含补齐的校验位；未绘制时为空串。 |
| `margin` | `number` | 解析后的静区宽度，单位为模块数。 |
| `pixelWidth` | `number` | 根的像素宽高，也是 viewBox 的尺寸。 |
| `pixelHeight` | `number` |  |
| `viewBox` | `string` | 根的 viewBox。 |
| `path` | `string` | 全部条（含守卫条的延长段与承载条）合成的 `&lt;path&gt;` 的 d；未绘制时为空串，此时不应生成 path 节点。 |
| `text` | `readonly BarCodeTextRun[]` | 人读文字，每段一个 `&lt;text&gt;`；关闭 `text` 或未绘制时为空数组。 |
| `fontSize` | `number` | 人读文字的字号，像素。 |
| `state` | `BarCodeState` | 当前状态。 |
| `error` | `string \| undefined` | 编码失败的原因；其余状态为 undefined。 |
| `label` | `string \| undefined` | 解析后的可及名；未提供名字时为 undefined，此时根退出无障碍树。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | undefined \| props.label |
| `root` | `role` | undefined \| 'img' |

## 样式参考

### 皮肤

`@xihan-ui/styles/bar-code.css` 使用 `[data-scope="bar-code"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-format` | props.format |
| `root` | `data-modules` | undefined \| String(modules) |
| `root` | `data-state` | 'empty' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-bar-code-bg` | `root` | `background` | `default` | `--xh-color-neutral-0` | bar-code 的 root 部件 background 覆盖槽。 |
| `--xh-bar-code-fg` | `root` | `color` | `default` | `--xh-color-neutral-950` | bar-code 的 root 部件 color 覆盖槽。 |
| `--xh-bar-code-font-family` | `root` | `font-family` | `xh-geom=text` | `--xh-font-family-mono` | bar-code 的 root 部件 font-family 覆盖槽。 |
| `--xh-bar-code-placeholder-bg` | `root` | `background` | `state=empty`<br>`state=error` | `--xh-bg-subtle` | bar-code 的 root 部件 background 覆盖槽。 |
| `--xh-bar-code-placeholder-border` | `root` | `box-shadow` | `state=empty`<br>`state=error` | `--xh-border-default` | bar-code 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-bar-code-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | bar-code 的 root 部件 border-radius 覆盖槽。 |
| `--xh-bar-code-text-fg` | `root` | `fill` | `xh-geom=text` | `currentColor` | bar-code 的 root 部件 fill 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态（见[动效规范](../design/motion#角色)）。

`background-color` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
