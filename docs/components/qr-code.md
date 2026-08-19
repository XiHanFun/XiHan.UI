# 二维码 <Badge type="info" text="qr-code" />

把一段文本画成二维码。

## 何时使用

- 跨设备传递地址、配对码、票据。

## 何时不用

- 用户就在这台设备上：给一条可点的链接。
- 内容很长：二维码会密到扫不出来，改成短链。

## 特性

- `level` 四档纠错（L / M / Q / H）：越高越能容忍污损，同样的内容也因此占更多模块。
- `moduleShape` 与 `eyeShape` 换码点与码眼的形状；三种形状的墨都盖住每个模块的格心，读码器按格心取样。
- `margin` 是静区，`pixelSize` 是边长。
- 中心可以放 logo，配色可换。

## 示例

### 基础用法

给 value 就画码，版本按内容长度自动选；缺省 M 级纠错、4 个模块的静区

<XhDemo src="qr-code/01-basic" />

### 纠错级别

L / M / Q / H 依次能容忍更多污损，同样的内容也因此占更多模块

<XhDemo src="qr-code/02-level" />

### 边长与静区

pixelSize 是整块的像素边长；margin 的单位是模块数，静区含在里面不额外占地方

<XhDemo src="qr-code/03-size-margin" />

### 可及名字

缺省拿 value 当 aria-label；内容不是给人念的时候用 label 换一句人话

<XhDemo src="qr-code/04-label" />

### 码点形状

square / dot / rounded；三种形状的墨都盖住每个模块的格心，读码器按格心取样

<XhDemo src="qr-code/05-module-shape" />

### 码眼形状

只作用于三个定位图形，7×7 的外环加内心结构保持不变，读码器靠它找码

<XhDemo src="qr-code/06-eye-shape" />

### 中心 logo

落位与尺寸由组件给出，那片模块先被底色挖空；放 logo 就把 level 提到 Q 或 H

<XhDemo src="qr-code/07-logo" />

### 换色

颜色不是 props，写三个 CSS 变量即可：码点必须比底色深且对比要足，反相码一部分读码器不认

<XhDemo src="qr-code/08-color" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-qr-code>` |
| Vue 组件 | `XhQrCode` `XhQrCodeLogo` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/qr-code.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="qr-code"`：**`root`** · `logo`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `eyeShape` | `QrEyeShape` |  | 码眼形状，缺省 square。时序图形与校正图形不受它影响，一律保持方块——它们是透视校正的几何基准。 |
| `label` | `string` |  | 可及名字，缺省用 value；给了全空白的名字等于没给。 |
| `level` | `QrLevel` |  | 纠错级别 L / M / Q / H，缺省 M。 |
| `logo` | `boolean` |  | 码面正中是否留一块给 logo。 留出来的那片模块会被底色盖住，对读码器而言等于人为污损：放 logo 就把 level 提到 Q 或 H， L 与 M 那点纠错余量赔不起这一块。损伤量见 `logoDamage`；超出所选级别的余量时 会往诊断通道报一条 `qr-code.logo-damage` 警告，码照画。 |
| `margin` | `number` |  | 静区宽度，单位是模块数，缺省 4；静区含在 viewBox 里，不占额外尺寸。 |
| `moduleShape` | `QrModuleShape` |  | 码点形状，缺省 square。 |
| `pixelSize` | `number` |  | 像素边长，缺省 160；写成根上的内联宽高。 |
| `value` | `string` |  | 要编码的内容，按 UTF-8 取字节走字节模式；空串不画码。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `modules` | `readonly (readonly boolean[])[]` | 模块矩阵，[行][列]，true = 深色；没画出码时是空数组。 |
| `version` | `number` | 实际用到的版本；没画出码时为 0。 |
| `count` | `number` | 每边模块数，不含静区；没画出码时为 0。 |
| `margin` | `number` | 解析后的静区宽度，单位是模块数。 |
| `viewBox` | `string` | 根的 viewBox，含静区。 |
| `path` | `string` | 除三个码眼以外的模块合成的那条 `&lt;path&gt;` 的 d；没画出码时是空串，此时不该生成 path 节点。 码眼永远不在这一条里，与形状无关。 |
| `eyePath` | `string` | 三个码眼合成的那条 `&lt;path&gt;` 的 d；没画出码时是空串，此时不该生成第二个 path 节点。 两条分开画与形状无关：码眼的颜色可以与码点不同，合成一条就没地方单独上色。 |
| `logoArea` | `QrCodeLogoArea \| undefined` | logo 的落位与挖空矩形；没留位时为 undefined。 |
| `logoDamage` | `QrCodeLogoDamage \| undefined` | 挖空对码面造成的损伤；没留 logo 位时为 undefined。 |
| `state` | `QrCodeState` | 当前状态。 |
| `error` | `string \| undefined` | 编码失败的原因；其余状态为 undefined。 |
| `label` | `string \| undefined` | 解析后的可及名字；没给名字时为 undefined，此时根退出无障碍树。 |
| `getRootProps` | `() => T['element']` |  |
| `getLogoProps` | `() => T['element']` | 铺到 logo 部件上的落位；没留位时宽高都是 0，那块连同里面的图形一起不渲染。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | 'true' \| undefined |
| `root` | `aria-label` | undefined \| props.label |
| `root` | `role` | undefined \| 'img' |

## 样式

默认皮肤 `@xihan-ui/styles/qr-code.css` 按部件选择：`[data-scope="qr-code"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-level` | props.level |
| `root` | `data-logo` | ''（条件成立时才出现） |
| `root` | `data-modules` | undefined \| String(count) |
| `root` | `data-state` | 'empty' |
| `root` | `data-version` | undefined \| String(version) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-qr-code-bg` · `--xh-qr-code-eye-fg` · `--xh-qr-code-fg` · `--xh-qr-code-placeholder-bg` · `--xh-qr-code-placeholder-border` · `--xh-qr-code-radius`

## 组合

- 外面套[卡片](./card)；旁边配[剪贴板](./clipboard)给出文本形式的同一内容。

## 最佳实践

- 放 logo 就把纠错级别提到 Q 或 H，否则遮住的模块补不回来。
- 静区不能省，贴边的二维码扫不出来。
- 旁边同时给出文本或链接：不是所有人都能扫。

## 反模式

- 深色主题下直接反色：读码器默认深码点浅底，反色的码很多设备扫不出来。
- 二维码印得太小。
