# React 适配器

`@xihan-ui/react` 是无头内核的 React 外壳。它负责三件事：把状态机接入 React 的渲染周期、把部件封装为组件、把 `connect` 产出的 props 展开到元素上。它不实现任何组件逻辑。

依赖：`react` 与 `react-dom` 是 peer 依赖，下限 19。当前版本只支持 React 19：状态机要求宿主提交完当前帧、DOM 落定之后再运行回调，`flushSync` 与 `useSyncExternalStore` 的行为是这条契约的基础。

覆盖进度：134 个组件中已覆盖 134 个，与 Vue 侧一致。
登记在 `ui/tooling/scripts/react-coverage.json`，多项门禁按它决定核对哪些组件：登记多余会核对不存在的组件，登记缺失会静默漏检，两种情况都判失败。

## 组件命名

与 Vue 侧同名：每个部件一个组件，一律 `Xh` 前缀 + 组件名 + 部件名。

```tsx
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from "@xihan-ui/react";
```

只有一个部件的组件不带部件后缀（`XhButton`、`XhSwitch`）。没有必须安装的 provider，按名称 import 即可。

## 受控与非受控

传受控属性即受控，只传 `default*` 即非受控。变更回调是普通的 React 回调，没有第二套事件：

```tsx
// 受控
<XhDialogRoot open={open} onOpenChange={({ open }) => setOpen(open)} />

// 非受控
<XhDialogRoot defaultOpen />
```

载荷与 Vue 侧的明细对象相同：`{ open }`、`{ value }`、`{ checked }`。Vue 侧额外发出裸值事件是为了 `v-model`，React 没有这层语法，只保留明细一种。

受控属性每帧读取：状态机不缓存上一次的值，浮层打开时修改 `closeOnEscape` 立即生效。

## 带载荷的插槽写成函数式 children

派生值由这一层计算，作者通过函数式 children 接收：

```tsx
<XhSelectRoot value={value} onValueChange={({ value }) => setValue(value)}>
  {({ hasValue, valueText }) => (hasValue ? valueText : "请选择")}
</XhSelectRoot>
```

类型是 `SlotChildren<P>`：传节点也可以，传函数才能获得载荷。每个组件的载荷类型（如 `SelectRootSlotProps`）都一并导出。

## asChild

要把部件的行为落到自定义元素上，传 `asChild` 并提供单个子元素：

```tsx
<XhDialogTrigger asChild>
  <MyButton>打开</MyButton>
</XhDialogTrigger>
```

同名事件先运行作者处理器；作者调用 `preventDefault()` 后，不再运行部件内部动作。这条规则同时适用于写在部件和 `asChild` 子元素上的处理器。普通回调仍保留全部参数，ref 的登记和清理不受事件取消影响。

`asChild` 必须包含恰好一个可挂载子元素，Fragment 会展开后检查，仅忽略空白和条件占位。零个或多个元素、元素旁并列的非空文本或数字都会明确报错，不会生成默认按钮或丢弃可见内容。迁移时请把内容放到一个实际宿主中；确实需要默认按钮时移除 `asChild`。ref 遵循 React 19 的普通 props 合同。

## 组合式函数

不使用现成结构时直接获取 `api`：

```tsx
const { api, service } = useDialog({ open, onOpenChange });
```

`api` 每次渲染重新求值，随状态机状态变化。上下文类型（如 `DialogContext`）也导出，便于向下透传 `api` 时标注类型。父子部件之间的 context 是内部实现，不对外开放。

## 全局配置

`XhConfigProvider` 向下提供 locale、文案覆盖、尺寸、浮层落点与七轴视觉环境：

```tsx
<XhConfigProvider config={{ locale: "zh-CN", size: "sm" }}>
  <App />
</XhConfigProvider>
```

视觉环境必须显式绑定 DOM 根，不推测 Provider 对应的元素。嵌套 Provider 自动继承外层控制器，局部 motion 只投影当前根，不修改全局 JS override：

```tsx
<XhConfigProvider config={{
  visualEnvironment: {
    root: workspaceElement,
    initial: { mode: "dark", density: "compact", motion: "reduce" },
  },
}}>
  <Workspace />
</XhConfigProvider>
```

配置经代理提供给部件 props：作者未传的属性从配置中取，传了的以作者为准。代理实现了 `ownKeys` 与 `getOwnPropertyDescriptor`：`{ ...props }` 展开在 React 中很常见，只有 `get` 陷阱的代理一经展开就退化为空对象，配置默认值会静默消失。

## 状态机接入 React

内部只有一层薄适配。`createReactRuntime()` 实现 `ReactiveRuntime` 的五个接口：

| 接口 | React 实现 |
| --- | --- |
| `cell` | 闭包存值 + 受控语义（受控时值从 `prop()` 读取，内部值不写）；写入递增版本号，经 `useSyncExternalStore` 触发重渲染 |
| `track` | 拉式：每次提交后逐项比对依赖，变化时才触发 |
| `flush` | `flushSync` 强制一次提交，回调在 DOM 落定之后运行 |
| `onMount` / `onCleanup` | `useLayoutEffect` 的挂载与清理 |

`track` 是拉式的，与 Vue 侧不同。Vue 的 `watch` 挂在响应式源上，源变化即通知；React 中 props 的变化不经过任何可订阅的源，它是下一次渲染函数的入参。推式实现在这里永远收不到 props 变化：66 个状态机中的 `track` 与 65 个 `watch` 块会全部静默失效且不报错。

`useMachine(machine, getProps, options)` 封装了它。props 传的是 getter：每次渲染读取，状态机读到的始终是当前帧的值。

## 部分处理器挂为原生监听器

`connect` 按 DOM 语义编写，有两类处理器无法通过 React 的合成事件层：

- `pointerenter` / `pointerleave` 不冒泡。React 的同名合成事件由 `pointerover` / `pointerout` 合成，直接派发到节点上的事件无法到达。
- `stopImmediatePropagation()` 在 `SyntheticEvent` 上不存在，调用会抛错。载入态的按钮依靠它拦截同节点上作者的处理器。

这类 props 由适配器改为真实的 DOM 监听器，行为与另外两个适配器一致。

这一条由门禁保证：`check-native-events` 逐组件核对 `connect` 派发了哪些不冒泡的事件、React 侧是否逐个摘出，摘出 `connect` 未派发的名称同样判失败。`onFocusIn` / `onFocusOut` 不在其列：它们经 `reactNormalize` 归到 React 的 `onFocus` / `onBlur`，这两个合成事件挂的正是冒泡的 `focusin` / `focusout`。

## 行为原语

`@xihan-ui/react/behavior` 是单独的子入口，提供行为原语的 React 包装：滚动锁、悬停意图、滚动观察、贴底、连续输入检索五项：

```tsx
import { useHoverIntent, useScrollLock, useScrollTracker, useStickToBottom, useTypeahead } from "@xihan-ui/react/behavior";
```

自建浮层时才需要。不使用的应用不需要把它计入主入口的体积。

`useHoverIntent` 在布局提交期读取 `getTriggerEl()`，因此已渲染元素的 ref 已就位，下一次指针输入不会落在旧节点上。本次提交未渲染 trigger 时释放绑定；节点更替或 `openDelay`、`closeDelay`、`buffer` 改变时重建。content getter 和两个意图回调只更新已提交引用，不会因普通闭包更替取消挂起的计时。需要显式标注选项时，从这个子入口导入 `UseHoverIntentOptions`，不借用 core 的元素快照类型。

`useScrollLock` 在布局 effect 中加锁，首帧绘制前就生效，服务端不执行 DOM 副作用。锁跟随 active 而不是配置对象身份；关闭再开启时读取最新配置，StrictMode 清理与重建保持一致。

## 背景层

React 侧的视觉适配也位于单独的子入口，不引入就不会把 WebGL 引擎打进包：

```tsx
import { useBackground, XhBackground } from "@xihan-ui/react/backgrounds";
```

`@xihan-ui/backgrounds` 是可选 peer，使用前先安装；不使用视觉效果的应用安装本包也不会引入引擎。

`XhBackground` 是独立视觉组件，children 浮在效果之上；`useBackground` 提供画面实例，它返回的 `ref` 挂到哪个元素上，效果就铺在哪个元素上。Vue 侧另有第三种写法 `v-background`，React 没有对应物：指令是 Vue 特有的介质，挂 `ref` 是同一件事。

两种用法见[背景层](../guide/backgrounds#在-react-里用)。

## 命令式服务

对话框、轻提示、通知、顶部进度条四个服务从组件树之外调用，自带宿主树：

```ts
import { createToastService } from "@xihan-ui/react";

const toast = createToastService();
toast.success("已保存");
```

行为与命令面见[命令式服务](../runtime/services)。React 侧有一处实现差别：`createRoot().render()` 是排队的，而 Vue 的 `app.mount()` 同步完成，因此首帧提交由 `flushSync` 包裹：服务创建后紧接着发出的命令（拦截器中常见）不会因为宿主尚未渲染而丢失。

宿主树在组件树之外，无法接入组件树中的 `XhConfigProvider`。需要与应用同语言时，通过 `config` 选项提供，或之后用 `setConfig` 更新。

## 声音层

`@xihan-ui/react/sound` 是单独的子入口。`withToastSound` / `withDialogSound` 为上述两个命令式服务配置声音，调用点不需要修改；`useSoundOnPress` 为单个元素配置声音，返回值挂到该元素的 `ref` 上：

```tsx
import { setSoundPlayer, useSoundOnPress, withToastSound } from "@xihan-ui/react/sound";
```

Vue 侧由 `v-sound` 指令完成同一件事。React 没有指令介质，改为返回 ref 回调的 hook；两侧的服务包装名与选项完全同名同形。默认映射与开关见[声音层](../guide/sound#在-react-里用)。

## 服务端渲染

- `createReactRuntime()` 的 `isServer` 由 `typeof window === 'undefined'` 判定，服务端不挂事件、不读媒体查询；
- scope 的基名取自 `useId`，同一棵树两端一致，不会 hydration 不匹配；
- 主题属性建议在服务端就渲染到 `<html>` 上，见[设计令牌与主题](../guide/theme#服务端渲染)。

## 与另外两个适配器的关系

三个适配器运行同一个状态机、同一份 `connect`，输出的 DOM 属性完全一致：跨适配器一致性测试逐帧比对归一化快照，无法消除的差异即判失败。React 侧另有一道服务端渲染一致性判据。

## 相关

- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
- [Vue 适配器](./vue)
- [Web Components 适配器](./web-components)
