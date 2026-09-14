# MatrixCode 二维码 <Badge type="info" text="alpha" />

把一段文本画成二维码，`format` 选码制。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/matrix-code" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/matrix-code.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/matrix-code" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/matrix-code" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/matrix-code.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

给 value 就画码，版本按内容长度自动选；缺省 M 级纠错、4 个模块的静区

<XhDemo src="matrix-code/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="matrix-code"`：**`root`** · `logo`

## 示例

### 码制

qr 之外还有三种：工业打标用的 Data Matrix（rectangular 从矩形尺寸里挑）、运单证件用的 PDF417、票务用的 Aztec

<XhDemo src="matrix-code/02-format" />

### 纠错级别

L / M / Q / H 依次能容忍更多污损，同样的内容也因此占更多模块

<XhDemo src="matrix-code/03-level" />

### 边长与静区

pixelSize 是整块的像素边长；margin 的单位是模块数，静区含在里面不额外占地方

<XhDemo src="matrix-code/04-size-margin" />

### 可及名字

缺省拿 value 当 aria-label；内容不是给人念的时候用 label 换一句人话

<XhDemo src="matrix-code/05-label" />

### 码点形状

square / dot / rounded；三种形状的墨都盖住每个模块的格心，读码器按格心取样

<XhDemo src="matrix-code/06-module-shape" />

### 码眼形状

只作用于三个定位图形，7×7 的外环加内心结构保持不变，读码器靠它找码

<XhDemo src="matrix-code/07-eye-shape" />

### 中心 logo

落位与尺寸由组件给出，那片模块先被底色挖空；放 logo 就把 level 提到 Q 或 H

<XhDemo src="matrix-code/08-logo" />

### 换色

颜色不是 props，写三个 CSS 变量即可：码点必须比底色深且对比要足，反相码一部分读码器不认

<XhDemo src="matrix-code/09-color" />

### GS1

gs1 打开后最前面放 FNC1，读码器把内容当 GS1 元素串：变长 AI 后面用 GS（U+001D）隔开下一个；医药 UDI 用 GS1 DataMatrix，零售 2D 迁移用 GS1 QR

<XhDemo src="matrix-code/10-gs1" />

## 设计指引

### 何时使用

- 跨设备传递地址、配对码：`qr`。
- 工业零件打标、电子元件、医药 UDI、追溯标签这类要在很小的面积上放码的地方：`data-matrix`。
- 运单、证件、登机牌这类要放几百字节又只能横向扫描的地方：`pdf417`。
- 车票、登机牌、票务这类要在低分辨率下也扫得出、边上留不出静区的地方：`aztec`。

### 何时不用

- 用户就在这台设备上：给一条可点的链接。
- 内容很长：二维码会密到扫不出来，改成短链。
- 只有几十个字符的货号、运单号，让扫描枪一枪读：用[条形码](./bar-code)。

### 特性

- `format` 四种码制：`qr`（缺省，ISO/IEC 18004）、`data-matrix`（ISO/IEC 16022，含 2024 版并入的矩形扩展）、`pdf417`（ISO/IEC 15438）、`aztec`（ISO/IEC 24778）；给了不认识的值不画码，根落到 error 态。
- `gs1` 把码变成 GS1 QR / GS1 DataMatrix：最前面放 FNC1，变长 AI 之间用内容里的 GS（U+001D）分隔。
- `level` 的取值域随码制：QR 四档 L / M / Q / H，越高越能容忍污损，同样的内容也因此占更多模块；PDF417 九档 0–8，缺省按数据量取规范推荐档；Aztec 是纠错码字至少占的百分比 5–95，缺省 33。给了码制不认的值不画码。
- QR：`eyeShape` 换码眼形状；中心可以放 logo。
- Data Matrix：纠错率随尺寸固定，没有级别可挑；`rectangular` 从矩形尺寸里挑，窄条标签放得下；没有码眼，L 形定位图形随码点形状一起换。
- PDF417：`columns` 指定数据列数 1–30，缺省挑宽高比最接近 3:1 的一档；它是条不是点，不吃 `moduleShape`。
- Aztec：牛眼居中，不需要静区，缺省 `margin` 为 0。
- `moduleShape` 换码点形状；三种形状的墨都盖住每个模块的格心，读码器按格心取样。
- `margin` 是静区，缺省按码制的规范值；`pixelSize` 是宽度，高按模块比例。
- 配色可换。

### 组合

- 外面套[卡片](./card)；旁边配[剪贴板](./clipboard)给出文本形式的同一内容。

### 最佳实践

- 放 logo 就把纠错级别提到 Q 或 H，否则遮住的模块补不回来。
- 静区不能省，贴边的码扫不出来；Data Matrix 只要一格，PDF417 两格，QR 要四格，Aztec 不需要。
- 旁边同时给出文本或链接：不是所有人都能扫。
- 对当前码制没有意义的选项（给 Data Matrix 传 `level`、给 QR 传 `rectangular`、给 PDF417 传 `moduleShape`）会往诊断通道报一条警告，按没给处理；别靠它们切换码制。

### 反模式

- 深色主题下直接反色：读码器默认深码点浅底，反色的码很多设备扫不出来。
- 二维码印得太小。
- 给 Data Matrix 放 logo：它没有可挑的纠错级别，挖掉的那块补不回来，组件会按没放处理。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-matrix-code>` |
| Vue 组件 | `XhMatrixCode` `XhMatrixCodeLogo` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/matrix-code.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `number` |  | PDF417 的数据列数 1–30，缺省在宽高比最接近 3:1 的那一档里挑。 只对 pdf417 有意义，给别的码制会往诊断通道报一条警告，按没给处理。 |
| `eyeShape` | `MatrixCodeEyeShape` |  | 码眼形状，缺省 square。时序图形与校正图形不受它影响，一律保持方块——它们是透视校正的几何基准。 只对 qr 有意义，给别的码制会往诊断通道报一条警告，按没给处理。 |
| `format` | `MatrixCodeFormat` |  | 码制，缺省 qr。给了不认识的值不画码，根落到 `error` 态。 |
| `gs1` | `boolean` |  | GS1 模式：在最前面放 FNC1，读码器据此把内容当 GS1 元素串解释，即 GS1 QR / GS1 DataMatrix； 变长 AI 之间用内容里的 GS（U+001D）分隔。 |
| `label` | `string` |  | 可及名字，缺省用 value；给了全空白的名字等于没给。 |
| `level` | `MatrixCodeLevel` |  | 纠错级别，取值域随码制：qr 是 L / M / Q / H（缺省 M）；pdf417 是 0–8（缺省按数据量取规范推荐档）； aztec 是纠错码字至少占的百分比 5–95（缺省 33）。给了码制不认的值不画码，根落到 `error` 态。 data-matrix 没有级别可挑，给了会往诊断通道报一条警告，按没给处理。 |
| `logo` | `boolean` |  | 码面正中是否留一块给 logo。 留出来的那片模块会被底色盖住，对读码器而言等于人为污损：放 logo 就把 level 提到 Q 或 H， L 与 M 那点纠错余量赔不起这一块。损伤量见 `logoDamage`；超出所选级别的余量时 会往诊断通道报一条 `matrix-code.logo-damage` 警告，码照画。 只对 qr 有意义：Data Matrix 的纠错余量随尺寸固定、没有可挑的级别，放 logo 会报一条警告并按没放处理。 |
| `margin` | `number` |  | 静区宽度，单位是模块数，缺省按码制的规范值（qr 4、data-matrix 1）；静区含在 viewBox 里，不占额外尺寸。 |
| `moduleShape` | `MatrixCodeModuleShape` |  | 码点形状，缺省 square。pdf417 是条不是点，给了会往诊断通道报一条警告，按没给处理。 |
| `pixelSize` | `number` |  | 像素宽度，缺省 160；高按模块比例算出，正方形码宽高相等。两者都写成根上的内联尺寸。 |
| `rectangular` | `boolean` |  | 从矩形尺寸（含矩形扩展 DMRE）里挑，缺省从正方形尺寸里挑。 只对 data-matrix 有意义，给别的码制会往诊断通道报一条警告，按没给处理。 |
| `value` | `string` |  | 要编码的内容；空串不画码。QR 按 UTF-8 取字节走字节模式；Data Matrix 走 ASCII 模式，Latin-1 以外的字符按 UTF-8 并声明 ECI。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'empty' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `format` | `MatrixCodeFormat` | 解析后的码制。给了不认识的值时保持原样透出，好让错误信息与 data-format 都指着那个值。 |
| `modules` | `readonly (readonly boolean[])[]` | 模块矩阵，[行][列]，true = 深色；没画出码时是空数组。 |
| `version` | `number` | QR 实际用到的版本；别的码制与没画出码时为 0。 |
| `columns` | `number` | 模块列数与行数，不含静区；正方形码两者相等，pdf417 的行数已含每个码字行占的 3 个模块高，没画出码时为 0。 |
| `rows` | `number` |  |
| `margin` | `number` | 解析后的静区宽度，单位是模块数。 |
| `viewBox` | `string` | 根的 viewBox，含静区。 |
| `path` | `string` | 除 QR 三个码眼以外的模块合成的那条 `&lt;path&gt;` 的 d；没画出码时是空串，此时不该生成 path 节点。 码眼永远不在这一条里，与形状无关。 |
| `eyePath` | `string` | QR 三个码眼合成的那条 `&lt;path&gt;` 的 d；别的码制与没画出码时是空串，此时不该生成第二个 path 节点。 两条分开画与形状无关：码眼的颜色可以与码点不同，合成一条就没地方单独上色。 |
| `logoArea` | `MatrixCodeLogoArea \| undefined` | logo 的落位与挖空矩形；没留位时为 undefined。 |
| `logoDamage` | `MatrixCodeLogoDamage \| undefined` | 挖空对码面造成的损伤；没留 logo 位时为 undefined。 |
| `state` | `MatrixCodeState` | 当前状态。 |
| `error` | `string \| undefined` | 编码失败的原因；其余状态为 undefined。 |
| `label` | `string \| undefined` | 解析后的可及名字；没给名字时为 undefined，此时根退出无障碍树。 |
| `getRootProps` | `() => T['element']` |  |
| `getLogoProps` | `() => T['element']` | 铺到 logo 部件上的落位；没留位时宽高都是 0，那块连同里面的图形一起不渲染。 |

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

`@xihan-ui/styles/matrix-code.css` 使用 `[data-scope="matrix-code"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-columns` | undefined \| String(columns) |
| `root` | `data-format` | props.format |
| `root` | `data-level` | 'M' \| String(pdfLevel) \| undefined |
| `root` | `data-logo` | ''（条件成立时才出现） |
| `root` | `data-rows` | undefined \| String(rows) |
| `root` | `data-state` | 'empty' |
| `root` | `data-version` | undefined \| String(version) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-matrix-code-bg` | `root` | `background`<br>`fill` | `default`<br>`xh-geom=logo-clear` | `--xh-color-neutral-0` | matrix-code 的 root 部件 background、fill 覆盖槽。 |
| `--xh-matrix-code-eye-fg` | `root` | `fill` | `xh-geom=eyes` | `currentColor` | matrix-code 的 root 部件 fill 覆盖槽。 |
| `--xh-matrix-code-fg` | `root` | `color` | `default` | `--xh-color-neutral-950` | matrix-code 的 root 部件 color 覆盖槽。 |
| `--xh-matrix-code-placeholder-bg` | `root` | `background` | `state=empty`<br>`state=error` | `--xh-bg-subtle` | matrix-code 的 root 部件 background 覆盖槽。 |
| `--xh-matrix-code-placeholder-border` | `root` | `box-shadow` | `state=empty`<br>`state=error` | `--xh-border-default` | matrix-code 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-matrix-code-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | matrix-code 的 root 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
