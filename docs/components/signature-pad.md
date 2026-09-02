# 签名板 <Badge type="info" text="signature-pad" />

一块用指针写字的画布：按下落笔、移动成迹、抬笔收一笔，画出来的是可缩放、可直接提交的 SVG。

## 何时使用

- 承诺书、回执、验收单上要留一笔手写签名。
- 交付确认、上门服务签收这类要留下"人到过、看过"的痕迹的场景。

## 何时不用

- 要的是一份已有的签名图片：那是上传，用[文件上传](./file-upload)。
- 要的是打字签名或姓名核对：那是一行文本，用[文本输入](./text-field)。
- 要的是在图片上圈画批注：本组件只画自己那块画布，不承载底图。

## 特性

- 笔迹是 SVG 填充路径，放大不糊；每一笔是同一条路径上的一条子路径。
- 第一笔落下时量一次画布并把这套坐标钉住，画布的 `viewBox` 与导出的 SVG 都写它：容器变宽变窄时，已有笔迹跟着缩放而不是留在原像素上错位。清空后重新量。
- `drawing` 一组选项调笔画外形：`size` 定粗细，`thinning` 让粗细随压感变，`simulatePressure` 决定压感是取设备值还是按落笔速度算。
- 带 `name` 即参与表单提交，提交的是一份独立的 SVG 文档；表单重置会把画布清回空。
- 笔迹变了就发 `draw`，签名定稿就发 `draw-end`——抬笔、点清空、表单重置这三条路径都发。照 `draw-end` 缓存待提交的 SVG 不会拿到过期的那一版。
- 手划出画布甚至划出窗口都跟手，抬手即收笔；落笔那根指针被捕获，手掌与第二根手指的移动不会被续进这一笔。

## 示例

### 基础用法

一块画布加一条笔迹路径就够了：按下落笔、移动成迹、抬笔收一笔

<XhDemo src="signature-pad/01-basic" />

### 标题、基准线与清空

基准线是纯画面（带 aria-hidden），清空按钮是原生 button，读屏念的是 translations 里那句

<XhDemo src="signature-pad/02-guide" />

### 参与表单

给了 name 就带上表单影子，提交的是一份独立 SVG；表单重置会把画布清回空

<XhDemo src="signature-pad/03-form" />

### 笔迹外形

drawing 调笔宽与压感：thinning 越大，划得越快笔画越细，simulatePressure 决定压感取设备值还是按速度算

<XhDemo src="signature-pad/04-pen" />

### 只读与禁用

只读画好的还看得见但改不动，禁用连清空按钮都按不动；两者都走原生 disabled，不是灰一层了事

<XhDemo src="signature-pad/05-readonly-disabled" />

### 取出签名

签名定稿时 draw-end 带上一份可直接落库的 SVG；提交前用 empty 拦一道，空签名不该走出客户端

<XhDemo src="signature-pad/06-export" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-signature-pad>` |
| Vue 组件 | `XhSignaturePadClearTrigger` `XhSignaturePadControl` `XhSignaturePadGuide` `XhSignaturePadHiddenInput` `XhSignaturePadLabel` `XhSignaturePadRoot` `XhSignaturePadSegment` `XhSignaturePadStatus` |
| 组合式函数 | `useSignaturePad` |
| 状态机 | `signaturePadMachine` |
| 皮肤 | `@xihan-ui/styles/signature-pad.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="signature-pad"`：**`root`** · `label` · **`control`** · `guide` · **`segment`** · `clear-trigger` · `status` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 整块不可交互：落笔不认，清空按钮也按不动。 |
| `readOnly` | `boolean` |  | 只读：画好的签名照常显示，但改不动。 |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验未通过的标记，只改外观与表单影子上的 aria-invalid。 |
| `name` | `string` |  | 表单字段名；给了表单影子才带 name 并参与提交。 |
| `drawing` | `SignaturePadDrawingOptions` |  | 笔迹外形。缺省即 4px 恒定粗细。 |
| `translations` | `Partial<SignaturePadTranslations>` |  |  |
| `onDraw` | `(details: SignaturePadDrawDetails) => void` |  | 每收进一个点通知一次，清空与表单重置时也通知一次（路径为空）。 |
| `onDrawEnd` | `(details: SignaturePadDrawEndDetails) => void` |  | 签名定稿时通知一次并带上可直接提交的 SVG：抬笔、清空、表单重置这三条路径都发。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `draw` | `SignaturePadDrawDetails` | 笔迹变了就通知一次（含清空与表单重置）；detail 为 `{ paths: string[], path: string }` |
| `draw-end` | `SignaturePadDrawEndDetails` | 签名定稿时通知一次（抬笔、清空、表单重置）；detail 为 `{ paths: string[], svg: string }`，svg 可直接落库 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSignaturePadRoot` | `default` | `SignaturePadRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`drawing` · `idle`

**事件**：`DRAW.START` · `DRAW.MOVE` · `DRAW.END` · `STROKES.CLEAR` · `FORM.RESET`

**判据**：`canDraw`

## connect API

`useSignaturePad` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `paths` | `readonly string[]` | 逐笔的填充轮廓 d 串，按落笔先后排列。 |
| `empty` | `boolean` | 一笔都没画。 |
| `drawing` | `boolean` | 笔正落在画布上。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `statusText` | `string` | 签没签的那句话，写进 status 部件；适配器在作者没自己写文字时把它填进节点。 |
| `toSvg` | `() => string` | 当前签名的独立 SVG 文档，与表单影子提交的是同一份；空签名为空串。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getGuideProps` | `() => T['element']` |  |
| `getSegmentProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getStatusProps` | `() => T['element']` | 状态出口：一块 role=status 的活区域，签上与清空都会播报一次。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份视觉隐藏的原生输入，随表单提交当前签名。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on clear-trigger, 未禁用且非只读 | 清空整块画布；按钮是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-label` | translations?.label |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'img' |
| `guide` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations?.clearTrigger |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |
| `hidden-input` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-invalid` | 'true' \| 'false' |

- **签名天然依赖指针，用键盘和读屏做不出来。凡是要求签名的流程，必须同时提供一条不依赖指针的替代路径**——打字签名、上传签名图、或线下核验。只放一块画布就等于把这些用户挡在流程之外。
- 画布报的是 `role="img"`，不是控件：它不接键盘、不进 Tab 序列，把它伪装成控件只会让读屏用户走进一个走不通的地方。
- 画布的名字来自 `label` 部件；没渲染标题时退回 `translations.label`。
- **签没签靠 `status` 部件播报**。画布是 `role="img"`，名字恒定，签上、清空、表单重置之后读屏念出来都是同一句话，用户无从确认自己那一笔留住了没有。`status` 是一块 `role="status"` 的活区域，值变一次播报一次，文案走 `translations.statusEmpty` / `translations.statusSigned`。要求签名的表单请把它渲染出来。
- 基准线是纯画面，带 `aria-hidden`，读屏不会念它。没有 `translations.guide` 这条文案：给一条装饰线起名字只会让读屏多念一句没有信息量的话。
- 清空按钮是原生 `<button>`，Enter / Space 由平台激活；按钮里只放图标时读屏念的是 `translations.clearTrigger`。

## 样式

默认皮肤 `@xihan-ui/styles/signature-pad.css` 按部件选择：`[data-scope="signature-pad"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-drawing` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-drawing` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `guide` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-empty` | ''（条件成立时才出现） |
| `clear-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `clear-trigger` | `data-empty` | ''（条件成立时才出现） |
| `status` | `data-empty` | ''（条件成立时才出现） |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-signature-pad-aspect-ratio` · `--xh-signature-pad-bg` · `--xh-signature-pad-bg-disabled` · `--xh-signature-pad-border` · `--xh-signature-pad-border-drawing` · `--xh-signature-pad-clear-bg` · `--xh-signature-pad-clear-bg-active` · `--xh-signature-pad-clear-bg-disabled` · `--xh-signature-pad-clear-bg-hover` · `--xh-signature-pad-clear-border` · `--xh-signature-pad-clear-fg` · `--xh-signature-pad-clear-gap` · `--xh-signature-pad-clear-h` · `--xh-signature-pad-clear-px` · `--xh-signature-pad-clear-radius` · `--xh-signature-pad-control-border-invalid` · `--xh-signature-pad-gap` · `--xh-signature-pad-guide-stroke` · `--xh-signature-pad-ink` · `--xh-signature-pad-label-fg` · `--xh-signature-pad-label-font-size` · `--xh-signature-pad-label-font-weight` · `--xh-signature-pad-radius` · `--xh-signature-pad-status-fg` · `--xh-signature-pad-status-font-size`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

- 画布宽度铺满外层容器，高度由宽高比（`--xh-signature-pad-aspect-ratio`，默认 5 / 2）决定，窄屏上自动变矮。
- 签到一半转屏、拖动面板改宽度，已有笔迹按 `viewBox` 整体缩放，接着写下去的新笔与它落在同一套坐标里。
- 触摸设备上画布关掉了浏览器的滚动与缩放手势，否则手指一划页面就滚走了。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 画布与基准线不分左右：笔迹按落笔坐标记录，方向由写的人决定。
- 标题与清空按钮的排布跟着文档方向走，皮肤全用逻辑属性。

## 组合

- 与[字段](./field)搭配：标题、说明与错误提示交给字段，签名板只管画布。
- 放进[表单](./form)里，`name` 一给就跟着提交与重置走。
- 与[对话框](./dialog)搭配做"签名确认"：确认按钮的可用状态读 `empty`。

### 节点形状是硬约束

画布这一族部件必须落在特定标签上，写错了不会报错，只是一笔都画不出来：

- `control` 必须是 `<svg>`；
- `guide` 必须是 `control` 里面的 `<line>`；
- `segment` 必须是 `control` 里面的 `<path>`；
- `clear-trigger` 必须是原生 `<button>`，`hidden-input` 必须是原生 `<input>`。

`viewBox` 由组件自己写，作者不要在 `control` 上再写一个。

### 两个适配器的分工

- **Vue**：`XhSignaturePadRoot` 的默认插槽给出 `empty` / `paths` / `drawing` / `statusText` 与 `toSvg()` / `clear()`；也可以用 `useSignaturePad()` 自己拿。`XhSignaturePadGuide` 与 `XhSignaturePadSegment` 必须写在 `XhSignaturePadControl` 里面——SVG 命名空间由那棵子树带下去，挪出去就成了 HTML 元素，画不出东西。
- **Web Components**：结构由作者自己写（Light DOM，不投影插槽）。`<xh-signature-pad>` 上有 `clear()`、`toSvg()` 与只读的 `empty`；提交前取签名用 `toSvg()`，不必去缓存上一次 `draw-end`。
- 两边的 `status` 部件里都不必自己写字：节点为空时由适配器填内建文案；写了字就以作者写的为准。

## 最佳实践

- 给清空按钮留一句可见文字或稳定的图标语义，别只靠一个叉。
- **清空之后要把焦点安顿好**：按钮被禁用或被收起时焦点会掉回 `<body>`，键盘用户每清一次就丢一次位置。要么让按钮始终可按（本组件的默认做法），要么清空后显式把焦点交给下一个落点。
- 提交前用 `empty` 拦一道：空签名与"签了但很潦草"是两回事，前者应该在客户端就挡住。
- 要缓存待提交的 SVG 就照 `draw-end` 缓存：清空与表单重置同样会发它，缓存不会停在旧的那一版。不要去嗅探清空按钮的点击。
- 存的是 SVG 文本，不是位图。要生成位图请在服务端渲染，别在前端截屏。

## 反模式

- 把画布做成小小一条：手写需要面积，太窄的画布只会逼人写出自己都认不出的字。
- 让签名成为唯一的确认方式，却不给替代路径——这是可达性问题，不是体验问题。
- 拿签名图当身份凭证。它证明的是"有人在这块画布上划过"，不是"谁划的"。
