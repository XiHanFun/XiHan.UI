# BarCode 条形码 <Badge type="info" text="alpha" />

把一段文本画成一维条形码，`format` 选码制。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/bar-code" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/bar-code.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/bar-code" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/bar-code" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/bar-code.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

给 value 就画码，缺省 Code 128，任意 ASCII 都收；人读文字印在条下

<XhDemo src="bar-code/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="bar-code"`：**`root`**

## 示例

### 码制

零售商品用 EAN / UPC，外箱用 ITF-14，工业标签用 Code 39；定长数字码制的校验位可省，组件补上

<XhDemo src="bar-code/02-format" />

### GS1-128

gs1 打开后起始符后放 FNC1；定长 AI 直接连写，变长 AI 后面用 GS（U+001D）隔开下一个

<XhDemo src="bar-code/03-gs1" />

### 尺寸与静区

barWidth 是最窄条的像素宽，整张码等比放大；height 只改条高；margin 是两侧静区的模块数

<XhDemo src="bar-code/04-size" />

### 人读文字

text 关掉只剩条；EAN 的守卫条照规范比数据条长 5X，不随文字走

<XhDemo src="bar-code/05-text" />

### 换色

颜色不是 props，写两个 CSS 变量即可：条必须比底色深且对比要足，反相码扫不出来

<XhDemo src="bar-code/06-color" />

## 设计指引

### 何时使用

- 货号、运单号、序列号要让扫描枪一枪读出。
- 商品零售码（EAN / UPC）、外箱码（ITF-14）、GS1 物流标签（GS1-128）。

### 何时不用

- 内容超过几十个字符、或含非 ASCII：一维码会拉得很长，改用[二维码](./matrix-code)。
- 用户就在这台设备上：给一条可点的链接或可复制的文本。

### 特性

- `format` 七种码制：`code128`（缺省）、`ean13` / `ean8` / `upca` / `upce`、`itf14`、`code39`；给了不认识的值不画码，根落到 error 态。
- 定长数字码制收不带校验位的长度（补上）与带校验位的长度（核对），对不上就不画。
- `gs1` 把 Code 128 变成 GS1-128：起始符后放 FNC1，内容里的 GS（U+001D）编成变长 AI 之间的分隔。
- `text` 控制条下的人读文字；EAN / UPC 的数字逐位落在自己那格下面，守卫条按规范延长。
- `barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，缺省按码制的规范值。
- `itf14` 缺省带上下承载条；`code39` 可选 mod 43 校验字符。

### 组合

- 外面套[卡片](./card)；旁边配[剪贴板](./clipboard)给出文本形式的同一内容。

### 最佳实践

- 静区不能省，贴边的条码扫不出来；缺省值就是规范值，非要压缩也别低于码制要求。
- 屏幕上 `barWidth` 至少 2：1 像素宽的条在缩放过的屏幕上会糊成灰。
- 旁边同时给出文本：不是所有人都能扫。
- 内容里有小写或标点就用 `code128`；`code39` 只认大写字母、数字与七个符号。

### 反模式

- 深色主题下直接反色：读码器按深条浅底取样，反相码扫不出来。
- 用 `height` 把条压得很矮：扫描线一歪就出了条的范围。
- 把校验位自己算错再传进来：组件会拒画，直接传不带校验位的长度让它补。

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
| `barWidth` | `number` |  | 最窄条的像素宽（X 尺寸），缺省 2；整张码的宽度由它乘模块数得出。 |
| `bearerBars` | `boolean` |  | 上下承载条：itf14 印在瓦楞纸上防止短读的两根横条，缺省画； 只对 itf14 有意义，给别的码制会往诊断通道报一条警告，按没给处理。 |
| `checksum` | `boolean` |  | 附 mod 43 校验字符。只对 code39 有意义——其余码制的校验位是规范必带的， 给了会往诊断通道报一条警告，按没给处理。 |
| `format` | `BarCodeFormat` |  | 码制，缺省 code128。给了不认识的值不画码，根落到 `error` 态。 |
| `gs1` | `boolean` |  | GS1-128：起始符后放 FNC1，内容里的 GS（U+001D）编成变长 AI 之间的分隔。 只对 code128 有意义，给别的码制会往诊断通道报一条警告，按没给处理。 |
| `height` | `number` |  | 条的像素高，缺省 64；不含守卫条的延长段、人读文字与承载条。 |
| `label` | `string` |  | 可及名字，缺省用 value；给了全空白的名字等于没给。 |
| `margin` | `number` |  | 两侧静区，单位是模块数；缺省按码制的规范值（code128 / itf14 / code39 10，ean13 11，upca / upce 9，ean8 7）。 |
| `text` | `boolean` |  | 条下面是否印人读文字，缺省印。 |
| `value` | `string` |  | 要编码的内容；空串不画码。定长数字码制收不带或带校验位的两种长度，带了就核对。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `format` | `BarCodeFormat` | 解析后的码制。给了不认识的值时保持原样透出，好让错误信息与 data-format 都指着那个值。 |
| `runs` | `readonly number[]` | 条空交替的宽度（模块），首元素是条；没画出码时是空数组。 |
| `modules` | `number` | 不含静区的模块数；没画出码时为 0。 |
| `encoded` | `string` | 实际编进码里的内容，含补上的校验位；没画出码时是空串。 |
| `margin` | `number` | 解析后的静区宽度，单位是模块数。 |
| `pixelWidth` | `number` | 根的像素宽高，也是 viewBox 的尺寸。 |
| `pixelHeight` | `number` |  |
| `viewBox` | `string` | 根的 viewBox。 |
| `path` | `string` | 全部条（含守卫条的延长段与承载条）合成的那条 `&lt;path&gt;` 的 d；没画出码时是空串，此时不该生成 path 节点。 |
| `text` | `readonly BarCodeTextRun[]` | 人读文字，每段一个 `&lt;text&gt;`；关了 `text` 或没画出码时是空数组。 |
| `fontSize` | `number` | 人读文字的字号，像素。 |
| `state` | `BarCodeState` | 当前状态。 |
| `error` | `string \| undefined` | 编码失败的原因；其余状态为 undefined。 |
| `label` | `string \| undefined` | 解析后的可及名字；没给名字时为 undefined，此时根退出无障碍树。 |
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

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
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

`background` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
