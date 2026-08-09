# 轻提示容器 <Badge type="info" text="toaster" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toaster>` |
| Vue 组件 | `XhToasterGroup` `XhToasterRoot` |
| 组合式函数 | `useToaster` |
| 状态机 | `toasterMachine` |
| 皮肤 | `@xihan-ui/styled/toaster.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toaster"`：**`root`** · **`group`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `toasts` | `ToastRecord[]` |  | 受控队列：给了就由宿主说了算，内部写入只发 onToastsChange。 |
| `defaultToasts` | `ToastRecord[]` |  |  |
| `placement` | `ToastPlacement` |  | 默认落位，默认 bottom-end。 |
| `max` | `number` |  | 每个位置最多同时留几条，超出挤掉最旧的。不给即不限。 |
| `gap` | `number` |  | 同一摞内的间距（px），默认 16。 |
| `duration` | `number` |  | 单条没写 duration 时的默认停留毫秒。 |
| `removeDelay` | `number` |  | 单条没写 removeDelay 时的默认退场窗口毫秒。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，逐条下发给 toast。 |
| `translations` | `Partial<ToasterTranslations>` |  |  |
| `onToastsChange` | `(details: ToasterToastsChangeDetails) => void` |  |  |

## 状态机

**状态**：`idle`

**事件**：`TOASTS.CREATE` · `TOASTS.UPDATE` · `TOASTS.DISMISS` · `TOASTS.DISMISS_ALL`

## connect API

`useToaster` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `visibleToasts` | `ResolvedToast[]` | max 之内、按加入先后排列的可见条目，已补齐默认值。 |
| `placements` | `ToastPlacement[]` | 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 |
| `count` | `number` |  |
| `getToastsByPlacement` | `(placement: ToastPlacement) => ResolvedToast[]` |  |
| `create` | `(options?: ToastOptions) => string` | 入队并返回 id；同 id 已存在则就地改写，位置不动。 |
| `update` | `(id: string, options: Partial<ToastOptions>) => void` |  |
| `dismiss` | `(id: string) => void` |  |
| `dismissAll` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `(props?: ToasterGroupProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
