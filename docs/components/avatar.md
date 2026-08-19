# 头像 <Badge type="info" text="avatar" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

图片加载失败或未提供时落到 fallback

<XhDemo src="avatar/01-basic" />

### 加载失败回退

图片地址取不到时切到 fallback，切换由状态机决定而不是 CSS

<XhDemo src="avatar/02-fallback" />

### 排成一列

头像本身不管布局，叠放与间距由外层容器决定

<XhDemo src="avatar/03-group" />

### 尺寸

size 三档只换直径，回退字的字号跟着一起缩放；缺省档不输出 data-size

<XhDemo src="avatar/04-size" />

### 形状

圆角是一个组件令牌，整圆、圆角方、直角都是同一个槽位换值；图片的圆角从根继承，不用另设

<XhDemo src="avatar/05-shape" />

### 图标当回退

fallback 是普通插槽，放图标和放缩写字一样；没有名字可写时用图标表示「某位用户」

<XhDemo src="avatar/06-icon" />

### 自定义直径与配色

三档之外的直径、底色、字色各是一个组件令牌；按人名分配颜色就是逐个实例覆盖

<XhDemo src="avatar/07-custom" />

### 加载状态

status-change 在状态落位时通知，过渡态 idle 不通知；没给地址等同于取不到，直接落 error 让回退接管

<XhDemo src="avatar/08-status" />

### 成组与溢出计数

组内共用的直径、字号、形状在容器上写一次，自定义属性沿继承流给每一枚；超出上限的收成一枚「+N」，它只是又一枚落回退态的头像

<XhDemo src="avatar/09-group-overflow" />

### 挂状态点与角标

根自己就是定位上下文，角标直接写进默认插槽；要挂到圆外就把根的裁剪打开，图片的圆角取自自身，不靠根裁

<XhDemo src="avatar/10-badge" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar>` |
| Vue 组件 | `XhAvatarFallback` `XhAvatarImage` `XhAvatarRoot` |
| 组合式函数 | `useAvatar` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/avatar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="avatar"`：`root` · `image` · **`fallback`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，缺省 md；缺省档不输出 data-size |
| `onStatusChange` | `(details: AvatarStatusChangeDetails) => void` |  | 状态落位时通知，过渡态 idle 不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `AvatarStatusChangeDetails` | 加载状态变化；detail 为 `{ status: 'loading' \| 'loaded' \| 'error' }` |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR`

**判据**：`hasSrc`

## connect API

`useAvatar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `AvatarStatus` |  |
| `loaded` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getFallbackProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-avatar-bg` · `--xh-avatar-fg` · `--xh-avatar-font-size` · `--xh-avatar-font-weight` · `--xh-avatar-radius` · `--xh-avatar-size`
