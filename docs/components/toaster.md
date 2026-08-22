# 轻提示容器 <Badge type="info" text="toaster" />

管理一摞轻提示：落位、上限、排队与移除。

## 何时使用

- 应用里只要用到[轻提示](./toast)就需要它——挂一次，全局共用。

## 何时不用

- 不需要单独考虑：它是轻提示的必备宿主。

## 特性

- `placement` 决定这一摞落在哪一角；也可以按条逐个指定落位。
- `max` 限制同时显示几条，超出的排队。
- 已经在显示的提示可以就地改写（同一个 id 覆盖内容），用来做"上传中 → 上传完成"。
- 支持手动收走与一键清空。

## 示例

### 基础用法

create 入队并返回 id，队列里的每条由作者渲染成一条通知；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列

<XhDemo src="toaster/01-basic" />

### 落位

placement 决定这一摞贴视口的哪个角，换的只是 group 上的 data-placement，队列本身不动

<XhDemo src="toaster/02-placement" />

### 就地改写

同一个 id 再 create 一次是原地改写而不是新弹一条，位置不动；loading 不自动消失，换成 success 才开始倒计时

<XhDemo src="toaster/03-update" />

### 上限与清空

max 限制每个位置同时显示几条，超出挤掉最旧的；dismissAll 把队列直接倒掉，不走退场窗口

<XhDemo src="toaster/04-max" />

### 手动收走

create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口

<XhDemo src="toaster/05-manual-dismiss" />

### 逐条落位

单条通知自带 placement 就盖掉 toaster 的默认落位；placements 报出眼下有条目的位置，一个位置一摞

<XhDemo src="toaster/06-per-toast-placement" />

### 全局服务

createToastService 自带宿主与默认模板，模块作用域随处可调（请求拦截器、store）；组件树内的组合用法见前几例

<XhDemo src="toaster/07-global-service" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toaster>` |
| Vue 组件 | `XhToasterGroup` `XhToasterRoot` |
| 组合式函数 | `useToaster` |
| 状态机 | `toasterMachine` |
| 皮肤 | `@xihan-ui/styles/toaster.css` |

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

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `toasts-change` | `ToasterToastsChangeDetails` | 队列变化；detail 为 `{ toasts: ToastRecord[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToasterGroup` | `default` | `ToasterGroupSlotProps` |  |
| `XhToasterRoot` | `default` | `ToasterRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.region |
| `root` | `role` | 'region' |

## 样式

默认皮肤 `@xihan-ui/styles/toaster.css` 按部件选择：`[data-scope="toaster"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-count` | list.length |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-count` | group.length |
| `group` | `data-empty` | ''（条件成立时才出现） |
| `group` | `data-placement` | props.placement |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toaster-inset` · `--xh-toaster-layer`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与全局服务配合：业务代码不接触组件，直接调服务。

## 最佳实践

- 整个应用只挂一个，挂在最外层。
- 落位躲开固定的操作条与移动端手势区。

## 反模式

- 每个页面各挂一个：多摞提示互相盖。
- `max` 设得太大，一屏被提示占满。
