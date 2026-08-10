# 图片 <Badge type="info" text="image" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

图片与回退内容始终同挂 DOM、靠 hidden 互斥显隐，换人时盒子不塌也不跳

<XhDemo src="image/01-basic" />

### 回退与状态

地址写坏和压根没给 src 是同一个落点，status-change 把三态报出来，root 上的 data-status 也有一份

<XhDemo src="image/02-fallback" />

### 尺寸与裁切

同一个组件既当封面图也当缩略图：宽高比由 --xh-image-ratio 定，画面怎么填由 --xh-image-fit 定

<XhDemo src="image/03-size" />

### 回退延迟与原生属性

fallback-delay 决定回退内容多久才露面，Infinity 表示加载期间一直不露面、只有失败才显；写在 image 部件上的原生属性照常落到底层图片元素上

<XhDemo src="image/04-fallback-delay" />

### 按状态分流的回退内容

根插槽把 status 交出来：加载中给占位、失败给提示与重试入口，两套内容共用同一个回退部件

<XhDemo src="image/05-status-slot" />

### 点开看大图

缩略图的点击与键盘由属性透传自己接，放大层是一个对话框，里面再放一份独立的图片实例

<XhDemo src="image/06-preview" />

### 一组图共用一个预览层

图与图之间不必互相认识：宿主拿着地址数组与当前下标，预览层里只放一份图片实例

<XhDemo src="image/07-group-preview" />

### 自己决定何时取图

src 是响应式的：进入视口前不给地址，观察器命中再换上，机器立刻走一遍完整加载

<XhDemo src="image/08-lazy-observer" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image>` |
| Vue 组件 | `XhImageFallback` `XhImageImage` `XhImageRoot` |
| 组合式函数 | `useImage` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/image.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="image"`：**`root`** · **`image`** · `fallback`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `fallbackDelay` | `number` |  | 加载超过这么久（毫秒）才让回退内容露面，默认 0（立刻露面）。 Infinity 表示加载期间永不显示回退内容，只有失败才显。 |
| `onStatusChange` | `(details: ImageStatusChangeDetails) => void` |  | 状态每次真正落位时通知一次；过渡态 idle 不通知。 |

## 状态机

**事件**：`SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR` · `after.fallbackDelay`

**判据**：`hasSrc`

## connect API

`useImage` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ImageStatus` |  |
| `loaded` | `boolean` |  |
| `showFallback` | `boolean` | 回退内容此刻是否该露面：加载失败恒为真，加载途中要看 fallbackDelay 是否已过。 |
| `getRootProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getFallbackProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
