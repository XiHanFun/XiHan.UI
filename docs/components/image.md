# Image 图片

显示一张图片，带加载状态与失败回退。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/image" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/image.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/image" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/image" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/image.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

图片与回退内容始终同时挂载在 DOM 中、依靠 hidden 互斥显隐，切换时盒子不塌陷也不跳动

<XhDemo src="image/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="image"`：**`root`** · **`image`** · `placeholder` · `fallback`

## 示例

### 回退与状态

地址错误与未提供 src 是同一个落点，status-change 报告三态，root 上的 data-state 也有一份

<XhDemo src="image/02-fallback" />

### 尺寸与裁切

同一个组件既作封面图也作缩略图：宽高比由 --xh-image-ratio 决定，画面在盒子里怎么铺由 fit 决定（取值与 CSS object-fit 同名）

<XhDemo src="image/03-size" />

### 回退延迟与原生属性

fallback-delay 决定回退内容多久后才显示，Infinity 表示加载期间一直不显示、只有失败才显示；写在 image 部件上的原生属性照常落到底层图片元素上

<XhDemo src="image/04-fallback-delay" />

### 按状态分流的回退内容

状态一落位即报告：加载中提供占位、失败提供提示与重试入口，两套内容共用同一个回退部件

<XhDemo src="image/05-status-slot" />

### 点击查看大图

写上 preview，图片就是一颗打开大图预览的按钮：点击或聚焦后按 Enter / Space 打开，预览层里可以缩放、旋转与翻转，关上后焦点回到图片

<XhDemo src="image/06-preview" />

### 一组图片共用一个预览层

图片之间不必互相识别：宿主持有地址数组与当前下标，预览层中只放一份图片实例

<XhDemo src="image/07-group-preview" />

### 懒加载

写上 lazy，图片进入视口附近才开始取，交给浏览器原生的 loading="lazy"；取到之前照常显示占位与回退内容

<XhDemo src="image/08-lazy" />

### 自行决定何时取图

src 是响应式的：进入视口前不提供地址，观察器命中后再换上，状态机立即经过一遍完整加载

<XhDemo src="image/09-lazy-observer" />

## 设计指引

### 何时使用

- 需要显示远端图片并处理加载与失败状态的场景。
- 缩略图需要点开看大图的场景。

### 何时不用

- 图片纯装饰且不会失败时，直接使用 `<img>`。
- 显示人物形象时，使用[头像](./avatar)。
- 显示矢量图元时，使用[图标](./icon)。

### 特性

- 状态通过回调通知；`fallbackDelay` 避免快速加载时回退内容闪烁。
- 回退内容可以按状态区分：加载中与失败显示不同内容。
- `fit` 决定图片在盒子里怎么铺，取值与 CSS `object-fit` 同名（`cover` / `contain` / `fill` / `none` / `scale-down`）；没写时由 `--xh-image-fit` 决定，缺省 `cover`。
- `lazy` 让图片进入视口附近才开始取，交给浏览器原生的 `loading="lazy"`；取到之前占位与回退内容照常顶着图位。
- `preview` 让点击图片打开大图预览，预览层是一台[图片预览](./image-viewer)，工具条带缩放、旋转、翻转与归零。整张图成为一颗按钮：可以聚焦，Enter / Space 也能打开，预览层关上后焦点回到图片。写成 `{ src }` 时预览层看另一张图，缩略图给小图、预览给原图。

### 组合

- 单张查看大图直接写 `preview`；一组图片要在同一个预览层里翻页时，用[图片预览](./image-viewer)把它们串起来。

### 最佳实践

- `alt` 描述图片内容，不写“图片”；纯装饰图写空 `alt`。开了 `preview` 的图片必须写 `alt`，它也是这颗按钮的名字。
- 为容器预留宽高比，否则图片加载完成时页面会跳动。

### 反模式

- 失败时不显示任何内容，用户会以为页面损坏。
- 用大图作为背景却不做降级。
- 在 image 部件上直接写 `loading="lazy"`：图片载好之前是收起的，浏览器永远不会去取收起的图片。懒加载用 `lazy`。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image>` |
| Vue 组件 | `XhImageFallback` `XhImageImage` `XhImagePlaceholder` `XhImageRoot` |
| 组合式函数 | `useImage` |
| 状态机 | `imageMachine` |
| 皮肤 | `@xihan-ui/styles/image.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `fit` | `ImageFit` |  | 图片在盒子里的铺法，与 CSS object-fit 同名。没写时由皮肤的 `--xh-image-fit` 决定，缺省 cover； 写了就按它铺，压过那个变量。 |
| `lazy` | `boolean` |  | 进入视口附近才去取图，交给浏览器原生的 `loading="lazy"`，默认 false。 等着取图期间图片元素不收起（收起的图片浏览器永远不会去取），由皮肤把它叠在图位上、保持透明。 |
| `preview` | `boolean \| ImagePreviewOptions` |  | 点击图片打开大图预览，默认 false。开了以后整张图是一颗按钮：可以聚焦，Enter / Space 也能打开； 预览层关上后焦点回到图片。没有可看的图（src 与 preview.src 都没给）时不生效。 |
| `fallbackDelay` | `number` |  | 加载超过该时长（毫秒）才显示回退内容，默认 0（立即显示）。 Infinity 表示加载期间永不显示回退内容，只有失败才显示。 |
| `onStatusChange` | `(details: ImageStatusChangeDetails) => void` |  | 状态每次实际落定时通知一次；过渡态 idle 不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ImageStatusChangeDetails` | 加载状态变化；detail 为 `{ status: 'loading' \| 'loaded' \| 'error' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhImageRoot` | `default` | `ImageRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhImageRoot` | `children` | `SlotChildren<ImageRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'loading' \| 'idle' \| 'loaded' \| 'error' |
| `image` | 'loading' \| 'idle' \| 'loaded' \| 'error' |
| `placeholder` | 'loading' \| 'idle' \| 'loaded' \| 'error' |
| `fallback` | 'loading' \| 'idle' \| 'loaded' \| 'error' |

以下名称仅用于内部状态机。

**状态**：`idle` · `loading` · `loaded` · `error`

**事件**：`SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR` · `after.fallbackDelay` · `PART.RENDERED` · `PREVIEW.OPEN` · `PREVIEW.CLOSE`

**判据**：`hasSrc` · `canPreview`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ImageStatus` |  |
| `loaded` | `boolean` |  |
| `showFallback` | `boolean` | 回退内容当前是否应显示：加载失败恒为真，加载途中取决于 fallbackDelay 是否已过。 |
| `showPlaceholder` | `boolean` | 占位层当前是否应显示：来源决议中与加载中为真，落定或失败后为假。 |
| `previewable` | `boolean` | 开了预览、也有可看的图：root 此时是一颗打开预览的按钮。 |
| `previewOpen` | `boolean` | 大图预览当前开着。 |
| `previewItem` | `ImageViewerItem \| null` | 预览层里看的那张图（地址取 preview.src，缺省取 src；替代文本取 alt）；不可预览时为 null。 |
| `setPreviewOpen` | `(open: boolean) => void` | 打开或收起大图预览；不可预览时打开无效。适配器把它接在预览层的 open 变化上。 |
| `getRootProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getPlaceholderProps` | `() => T['element']` | 加载期间铺在图位上的占位层，纯装饰。 |
| `getFallbackProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | preview enabled | 整张图片占一个 Tab 位；没开预览、或没有可看的图时不可聚焦 |
| `Enter` / `Space` | focus on root (preview enabled) | 打开大图预览。root 是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏）；预览层关上后焦点回到图片 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-haspopup` | 'dialog'（条件成立时才出现） |
| `root` | `role` | 'button'（条件成立时才出现） |
| `placeholder` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/image.css` 按 `[data-scope="image"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-image` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-interactive` | ''（条件成立时才出现） |
| `root` | `data-state` | 'loading' \| 'idle' \| 'loaded' \| 'error' |
| `image` | `data-fit` | props.fit |
| `image` | `data-state` | 'loading' \| 'idle' \| 'loaded' \| 'error' |
| `placeholder` | `data-state` | 'loading' \| 'idle' \| 'loaded' \| 'error' |
| `fallback` | `data-state` | 'loading' \| 'idle' \| 'loaded' \| 'error' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-image-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | image 的 root 部件 background 覆盖槽。 |
| `--xh-image-fallback-bg` | `fallback` | `background` | `default` | `--xh-bg-subtle-opaque` | image 的 fallback 部件 background 覆盖槽。 |
| `--xh-image-fallback-fg` | `fallback` | `color` | `default` | `--xh-fg-subtle` | image 的 fallback 部件 color 覆盖槽。 |
| `--xh-image-fallback-font-size` | `fallback` | `font-size` | `default` | `--xh-text-caption-size` | image 的 fallback 部件 font-size 覆盖槽。 |
| `--xh-image-fallback-min-h` | `fallback` | `min-block-size` | `default` | `--xh-control-h-lg` | image 的 fallback 部件 min-block-size 覆盖槽。 |
| `--xh-image-fallback-px` | `fallback` | `padding-inline` | `default` | `--xh-space-4` | image 的 fallback 部件 padding-inline 覆盖槽。 |
| `--xh-image-fallback-py` | `fallback` | `padding-block` | `default` | `--xh-space-2` | image 的 fallback 部件 padding-block 覆盖槽。 |
| `--xh-image-fit` | `image` | `object-fit` | `default` | `cover` | image 的 image 部件 object-fit 覆盖槽。 |
| `--xh-image-h` | `root` | `block-size` | `default` | `auto` | image 的 root 部件 block-size 覆盖槽。 |
| `--xh-image-placeholder-bg` | `placeholder` | `background` | `default` | `--xh-bg-subtle-opaque` | image 的 placeholder 部件 background 覆盖槽。 |
| `--xh-image-placeholder-fg` | `placeholder` | `color` | `default` | `--xh-fg-subtle` | image 的 placeholder 部件 color 覆盖槽。 |
| `--xh-image-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | image 的 root 部件 border-radius 覆盖槽。 |
| `--xh-image-ratio` | `root` | `aspect-ratio` | `default` | `auto` | image 的 root 部件 aspect-ratio 覆盖槽。 |
| `--xh-image-w` | `root` | `inline-size` | `default` | `100%` | image 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` · `xh-fade-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
