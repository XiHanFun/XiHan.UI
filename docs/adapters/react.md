# React 适配器

`@xihan-ui/react` 是无头内核的 React 外壳，已覆盖全部组件，与 Vue 侧一致。三端共用的约定（同一份行为、命名、受控与非受控、asChild、全局配置、子入口、服务端渲染）见[三端共同约定](./)，本页只写 React 的接法与独有部分。

## 依赖

`react` 与 `react-dom` 是 peer 依赖，下限 19。当前版本只支持 React 19：状态机要求宿主提交完当前帧、DOM 落定之后再运行回调，`flushSync` 与 `useSyncExternalStore` 的行为是这条契约的基础。`@xihan-ui/backgrounds`、`@xihan-ui/sound` 与 `@xihan-ui/code-highlight` 是可选 peer，不使用视觉效果、音效与代码着色时不需要安装。

## 引入与注册

每个部件一个组件，命名与 Vue 侧相同，见[三端共同约定 · 组件命名](./#组件命名)：

```tsx
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from "@xihan-ui/react";
```

没有必须安装的 provider，按名称 import 即可。

## 事件与受控

变更回调是普通的 React 回调，没有第二套事件；受控与非受控的规则见[三端共同约定 · 受控与非受控](./#受控与非受控)。

受控：

```tsx
<XhDialogRoot open={open} onOpenChange={({ open }) => setOpen(open)} />;
```

非受控：

```tsx
<XhDialogRoot defaultOpen />;
```

`default*` 只在首次渲染时读取。

## 插槽与组合式函数

### 带载荷的插槽写成函数式 children

派生值由这一层计算，作者通过函数式 children 接收：

```tsx
<XhSelectRoot value={value} onValueChange={({ value }) => setValue(value)}>
  {({ displayText }) => displayText || "请选择"}
</XhSelectRoot>;
```

类型是 `SlotChildren<P>`：传节点也可以，传函数才能获得载荷。每个组件的载荷类型（如 `SelectRootSlotProps`）都一并导出。

每个组件的 props 类型同样导出，命名为 `Xh<组件名>Props`，与 Vue 一一对应，如 `XhDialogContentProps`。它在根元素的原生属性之上并入组件自己的 prop；选中值随类型收窄的根组件带类型参数，如 `XhSelectRootProps<number>`。

### 组合式函数

不使用现成结构时直接获取 `api`：

```tsx
const { api, service } = useDialog({ open, onOpenChange });
```

`api` 每次渲染重新求值，随状态机状态变化。上下文类型（如 `DialogContext`）也导出，便于向下透传 `api` 时标注类型。自行编写的部件放进现成组件时，用读钩子取所在组件的上下文，如 `useDialogContext()`；每个部件的上下文都有对应的读钩子，名字与 Vue 一一对应，只在对应部件之内取得到。上下文只由库内部件提供，Provider 不导出。

## asChild

要把部件的行为落到自定义元素上，传 `asChild` 并提供单个子元素：

```tsx
<XhDialogTrigger asChild>
  <MyButton>打开</MyButton>
</XhDialogTrigger>;
```

子元素与事件取消的规则见[三端共同约定 · asChild 与事件取消](./#aschild-与事件取消)；ref 遵循 React 19 的普通 props 合同。

## 子入口一览

| 子入口 | 内容 |
| --- | --- |
| `@xihan-ui/react/behavior` | 滚动锁、悬停意图、滚动观察、贴底、连续输入检索与当前断点六项 hook，自建浮层时才需要，见[行为原语](../guide/behavior#在-vue-react-中使用) |
| `@xihan-ui/react/backgrounds` | `XhBackground` 组件与 `useBackground` hook，不引入就不会把 WebGL 引擎打进包，见[背景层](../guide/backgrounds#在-react-里用) |
| `@xihan-ui/react/sound` | `withNotificationSound` / `withDialogSound` 给命令式服务配声，`useSoundOnPress` 给单个元素配声，见[声音层](../guide/sound#在-react-中使用) |
| `@xihan-ui/react/locale` | 十份内建语言包，见[国际化](../guide/i18n#内建语言包) |

## 服务端渲染

共同的几条见[三端共同约定 · 服务端渲染](./#服务端渲染)。

### React Server Components

用到客户端能力的模块（组件、hook、全局配置的 Provider、命令式服务）在产物里带 `'use client'`，Next.js App Router 的服务端组件可以直接从 `@xihan-ui/react` 导入组件并渲染，props 可序列化即可：

```tsx
// app/page.tsx（服务端组件）
import { XhButton } from "@xihan-ui/react";

export default function Page() {
  return <XhButton type="submit">提交</XhButton>;
}
```

从服务端组件传给组件的 props 必须可序列化，事件回调、`ref` 与函数式 children 只能写在客户端组件里。语言包同样含函数式文案（如 `deleteItem: label => …`），所以全局配置的 Provider 放进自己的客户端组件，再由布局引用：

```tsx
// app/providers.tsx
"use client";
import { XhConfigProvider } from "@xihan-ui/react";
import { zhCN } from "@xihan-ui/react/locale";

export function Providers({ children }: { children: React.ReactNode }) {
  return <XhConfigProvider config={zhCN}>{children}</XhConfigProvider>;
}
```

```tsx
// app/layout.tsx（服务端组件）
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

语言包（`@xihan-ui/react/locale`）与 `mergeXhConfig` 不带指令，服务端代码里也能读取和调用。哪些模块带指令由构建时的同一份判定决定。

## 本端独有

### 配置经代理传给部件

`XhConfigProvider` 的配置经代理提供给部件 props：作者未传的属性从配置中取，传了的以作者为准。代理实现了 `ownKeys` 与 `getOwnPropertyDescriptor`：`{ ...props }` 展开在 React 中很常见，只有 `get` 陷阱的代理一经展开就退化为空对象，配置默认值会静默消失。全局配置的字段与写法见[全局配置](../runtime/config)。

### 部分处理器挂为原生监听器

`connect` 按 DOM 语义编写，有两类处理器无法通过 React 的合成事件层：

- `pointerenter` / `pointerleave` 不冒泡。React 的同名合成事件由 `pointerover` / `pointerout` 合成，直接派发到节点上的事件无法到达。
- `stopImmediatePropagation()` 在 `SyntheticEvent` 上不存在，调用会抛错。载入态的按钮依靠它拦截同节点上作者的处理器。

这类 props 由适配器改为真实的 DOM 监听器，行为与另外两个适配器一致。

`onFocusIn` / `onFocusOut` 不在其列：它们经 `reactNormalize` 归到 React 的 `onFocus` / `onBlur`，这两个合成事件挂的正是冒泡的 `focusin` / `focusout`。

### 命令式服务

对话框、通知、顶部进度条三个服务从组件树之外调用，自带宿主树；轻提示是通知服务的 `preset: "toast"`：

```ts
import { createNotificationService } from "@xihan-ui/react";

const toast = createNotificationService({ preset: "toast" });
toast.success("已保存");
```

行为与命令面见[命令式服务](../runtime/services)。React 侧有一处实现差别：`createRoot().render()` 是排队的，而 Vue 的 `app.mount()` 同步完成，因此首帧提交由 `flushSync` 包裹：服务创建后紧接着发出的命令（拦截器中常见）不会因为宿主尚未渲染而丢失。

宿主树在组件树之外，无法接入组件树中的 `XhConfigProvider`。需要与应用同语言时，通过 `config` 选项提供，或之后用 `setConfig` 更新。

## 相关

- [三端共同约定](./)
- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
