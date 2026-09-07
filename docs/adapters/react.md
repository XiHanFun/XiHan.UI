# React 适配器

`@xihan-ui/react` 是无头内核的 React 外壳。它做三件事：把机器接到 React 的渲染周期上、把部件包成组件、把 `connect` 产出的 props 展开到元素上。**不实现任何组件逻辑。**

依赖：`react` 与 `react-dom` 是 peer 依赖，下限 19。这一版只支持 React 19——机器要求「宿主提交完这一帧、DOM 落定之后再跑回调」，`flushSync` 与 `useSyncExternalStore` 的行为是这条契约的地基。

铺开进度：126 个组件里已铺 51 个，真源是 `ui/tooling/scripts/react-coverage.json`，十几张门禁按它决定该核哪些组件。没铺到的组件在这个包里没有导出。

## 组件命名

与 Vue 侧同名：每个部件一个组件，一律 `Xh` 前缀 + 组件名 + 部件名。

```tsx
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from "@xihan-ui/react";
```

只有一个部件的组件不带部件后缀（`XhButton`、`XhSwitch`）。没有 provider 要装，按名字 import 即可。

## 受控与非受控

传受控属性即受控，只传 `default*` 即非受控。变更回调是普通的 React 回调，没有第二套事件：

```tsx
// 受控
<XhDialogRoot open={open} onOpenChange={({ open }) => setOpen(open)} />

// 非受控
<XhDialogRoot defaultOpen />
```

载荷与 Vue 侧的明细对象是同一个：`{ open }`、`{ value }`、`{ checked }`。Vue 那边额外发一个裸值事件是为了 `v-model`，React 没有这层语法，就只留明细一种。

受控属性是**每帧现读**的：机器不缓存上一次拿到的值，浮层开着的时候改 `closeOnEscape` 当场生效。

## 带载荷的插槽写成函数式 children

派生值由这一层算好，作者拿函数式 children 接：

```tsx
<XhSelectRoot value={value} onValueChange={({ value }) => setValue(value)}>
  {({ hasValue, valueText }) => (hasValue ? valueText : "请选择")}
</XhSelectRoot>
```

类型是 `SlotChildren<P>`——给节点也行，给函数才拿得到载荷。每个组件的载荷类型（`SelectRootSlotProps` 这类）都一并导出。

## asChild

要把部件的行为落到自己的元素上，传 `asChild` 并给单个子元素：

```tsx
<XhDialogTrigger asChild>
  <MyButton>打开</MyButton>
</XhDialogTrigger>
```

props 合并的顺序是子元素在先、部件在后：同名事件处理器两边都会跑，作者那个先跑。

## 组合式函数

不想用现成结构就直接拿 `api`：

```tsx
const { api, service } = useDialog({ open, onOpenChange });
```

`api` 每次渲染重新求值，随机器状态变化。上下文类型（`DialogContext` 这类）也导出，便于把 `api` 往下透传时标注类型。父子部件之间的 context 是内部实现，不对外开放。

## 全局配置

`XhConfigProvider` 往下喂 locale、文案覆盖、尺寸与浮层落点：

```tsx
<XhConfigProvider config={{ locale: "zh-CN", size: "sm" }}>
  <App />
</XhConfigProvider>
```

配置是经代理喂给部件 props 的：作者没传的属性从配置里取，传了的以作者为准。代理实现了 `ownKeys` 与 `getOwnPropertyDescriptor`——`{ ...props }` 这种展开在 React 里到处都是，只有 `get` 陷阱的代理一展开就退化成空对象，配置默认值会静默消失。

## 机器接到 React

内部只有一层薄适配。`createReactRuntime()` 实现 `ReactiveRuntime` 的五个口子：

| 接口 | React 实现 |
| --- | --- |
| `cell` | 闭包存值 + 受控语义（受控时值从 `prop()` 现读，内部值不写）；写入撞版本号，经 `useSyncExternalStore` 推重渲 |
| `track` | 拉式：每次提交后逐项比对依赖，变了才触发 |
| `flush` | `flushSync` 逼出一次提交，回调在 DOM 落定之后跑 |
| `onMount` / `onCleanup` | `useLayoutEffect` 的挂载与清理 |

`track` 是拉式的，这一条与 Vue 侧不同。Vue 的 `watch` 挂在响应式源上，源一动就通知；React 这边 props 的变化不经过任何可订阅的源，它就是下一次渲染函数的入参。推式实现在这里会永远收不到 props 变化——54 个机器里的 `track` 与 53 个 `watch` 块全部静默失效，而且不报错。

`useMachine(machine, getProps, options)` 把它包起来。props 传的是 getter：每次渲染现取，机器读到的永远是这一帧的值。

## 有些处理器要挂成原生监听器

`connect` 是按 DOM 语义写的，有两类处理器过不了 React 的合成事件层：

- `pointerenter` / `pointerleave` 不冒泡。React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的，直接派到节点上的那一种到不了。
- `stopImmediatePropagation()` 在 `SyntheticEvent` 上不存在，调用直接抛。载入态的按钮靠它拦同节点上作者的处理器。

这类 props 由适配器改装成真实的 DOM 监听器，行为与另外两家适配器一致。

## 行为原语

`@xihan-ui/react/behavior` 是单独的子入口，装的是行为原语的 React 包装——滚动锁、悬停意图、滚动观察、贴底、连敲检索五件：

```tsx
import { useHoverIntent, useScrollLock, useScrollTracker, useStickToBottom, useTypeahead } from "@xihan-ui/react/behavior";
```

自建浮层才用得上。不用的应用不必把它压进主入口的体积。

## 命令式服务

对话框、轻提示、通知、顶部进度条四个服务从组件树之外调起，自带宿主树：

```ts
import { createToastService } from "@xihan-ui/react";

const toast = createToastService();
toast.success("保存好了");
```

行为与命令面见[命令式服务](../runtime/services)。React 侧有一处实现上的差别：`createRoot().render()` 是排队的，而 Vue 的 `app.mount()` 当场渲完，所以首帧提交由 `flushSync` 包住——服务建好之后紧接着发的那条命令（拦截器里很常见）不会因为宿主还没渲出来而被丢掉。

宿主树在组件树之外，接不到组件树里的 `XhConfigProvider`。要让它跟应用同语言，从 `config` 选项给，或之后用 `setConfig` 推。

## 服务端渲染

- `createReactRuntime()` 的 `isServer` 由 `typeof window === 'undefined'` 判定，服务端不挂事件、不读媒体查询；
- scope 的基名取自 `useId`，同一棵树两端一致，不会 hydration 不匹配；
- 主题属性建议在服务端就渲染到 `<html>` 上，见[设计令牌与主题](../guide/theme#服务端渲染)。

## 与另外两家适配器的关系

三家跑同一个机器、同一份 `connect`，输出的 DOM 属性完全一致——跨适配器一致性测试逐帧比对归一化快照，抹不掉的差异即判失败。React 侧还多一道服务端渲染一致性判据。

## 相关

- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
- [Vue 适配器](./vue)
- [Web Components 适配器](./web-components)
