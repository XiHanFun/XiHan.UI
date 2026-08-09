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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar>` |
| Vue 组件 | `XhAvatarFallback` `XhAvatarImage` `XhAvatarRoot` |
| 组合式函数 | `useAvatar` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/avatar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="avatar"`：`root` · `image` · **`fallback`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `onStatusChange` | `(details: AvatarStatusChangeDetails) => void` |  | 状态落位时通知，过渡态 idle 不通知。 |

## 状态机

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
