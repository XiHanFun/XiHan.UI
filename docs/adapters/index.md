# 三端共同约定

Vue、React 与 Web Components 三个适配器是同一个无头内核的三层外壳：把状态机接进宿主的响应式，把部件封装成组件或元素，把 `connect` 产出的属性铺到 DOM 上，自己不实现任何组件逻辑。本页收三端共用的约定，各端的页面只写接法与本端独有的部分：

- [Vue 适配器](./vue)
- [React 适配器](./react)
- [Web Components 适配器](./web-components)，第三方编写同形态的元素见[编写自己的元素](./authoring)

## 同一份行为

三个适配器运行同一个状态机、同一份 `connect`，输出的 DOM 属性完全一致：跨适配器一致性测试逐帧比对归一化快照，无法消除的差异即判失败，React 侧另有一道服务端渲染一致性判据。文档站每个组件页的示例多套写法并排，便于逐帧对照。

按宿主选：Vue、React 项目用各自的适配器，要在多个框架或无框架页面中复用同一套组件时用自定义元素。三端可以在同一页面共存：诊断通道是全局的，层栈按文档共享，几套适配器的浮层叠放在同一个层栈里。状态机怎样接进各自的响应式见[状态机运行时 · 适配器里的运行时](../guide/machine#适配器里的运行时)。

## 组件命名

Vue 与 React 每个部件一个组件，一律 `Xh` 前缀 + 组件名 + 部件名（`XhDialogRoot`、`XhDialogTrigger`）；只有一个部件的组件不带部件后缀（`XhButton`、`XhSwitch`、`XhBadge`）。两端的 props 类型同名，以 `Xh<组件名>Props` 从主入口导出；插槽与函数式 children 的载荷类型、上下文类型（如 `AccordionContext`）与上下文读钩子（如 `useAccordionContext()`）同样一一对应。上下文只由库内部件提供，提供方不导出。

自定义元素的标签是 `xh-<组件名>`，结构由作者写在 Light DOM 里，用 `data-xh-part` 标出角色节点；有标准结构的元素也可以只写宿主标签。

## 受控与非受控

传受控属性即受控，只传 `default*` 即非受控。受控时组件不会自行改变：它只发出变更意图，由使用者写回新值后才真正改变。这条语义收在状态机的 `cell` 与 `watch` 中，不由各组件自行判断，见[受控与非受控：`cell`](../guide/machine#受控与非受控-cell)。受控属性每帧读取，状态机不缓存上一次的值：浮层打开时修改 `closeOnEscape` 立即生效。

`default*` 只给非受控状态提供初值，之后修改不影响当前值，只改变表单重置的落点；要换初值，Vue 与 React 换 `key`，Web Components 换一个元素。三端各在什么时候读初值见[初值的读取时机](../guide/machine#初值的读取时机)。

变更的载荷三端相同，都是无头内核的明细对象：`{ open }`、`{ value }`、`{ checked }`。

| 端 | 写法 |
| --- | --- |
| Vue | `@value-change` 收明细；另发只带裸值的 `update:value`，供 `v-model` 使用 |
| React | `onValueChange` 回调收明细，没有第二套事件 |
| Web Components | `value-change` 的 `CustomEvent`，明细在 `detail` 上 |

## asChild 与事件取消

Vue 与 React 里支持 `asChild` 的部件可以把行为接到作者提供的单个子节点上。子节点必须恰好一个可挂载元素：Fragment 会展开后检查，仅忽略空白、注释和条件占位；零个或多个元素、元素旁并列的非空文本或数字都会明确报错，不会生成默认按钮或丢弃可见内容。需要默认按钮时移除 `asChild`，组合多个内容时提供一个实际宿主节点。

同名事件先运行作者写在部件或 `asChild` 子节点上的处理器；作者调用 `preventDefault()` 后，部件内部动作不再执行。普通回调保留全部参数，ref 的登记和清理不受事件取消影响。

## 全局配置

三端各有一处全局出口：Vue 的 `provideXhConfig`、React 的 `XhConfigProvider`、Web Components 的 `setXhConfig` 与 `<xh-config>`。语言与文案、尺寸档、浮层落点、视觉环境与组件级缺省 `defaults` 都从这里给，嵌套的出口逐键合并、内层胜出，见[全局配置](../runtime/config)。

## 子入口

行为原语、背景层、声音层与语言包放在各自的子入口，不引入就不进包：

| 子入口 | Vue | React | Web Components | 内容 |
| --- | --- | --- | --- | --- |
| `behavior` | 有 | 有 | — | 滚动锁、悬停意图、滚动观察、贴底、连敲检索与当前断点的包装，见[行为原语](../guide/behavior#在-vue-react-中使用) |
| `backgrounds` | 有 | 有 | 有 | 背景层，`@xihan-ui/backgrounds` 是可选 peer，见[背景层](../guide/backgrounds) |
| `sound` | 有 | 有 | — | 声音层，`@xihan-ui/sound` 是可选 peer，见[声音层](../guide/sound) |
| `locale` | 有 | 有 | 有 | 十份内建语言包，见[国际化](../guide/i18n#内建语言包) |

各端其余的子入口列在各自页面的「子入口一览」里。

## 服务端渲染

- 运行时的 `isServer` 由 `typeof window === 'undefined'` 判定，服务端不挂事件、不读媒体查询。
- 组件 id 两端一致（Vue 由 `createVueIdGenerator()` 生成，React 取自 `useId`），不会 hydration 不匹配。
- 视觉环境属性建议在服务端就渲染到 `<html>` 上，见[安装与接入 · 服务端渲染](../installation#服务端渲染)。
- 自定义元素在 JS 到达之前不会升级，`@xihan-ui/styles` 的 `not-defined.css` 先收起浮层子树，见[皮肤与样式分层 · 升级前的形态](../guide/styling#升级前的形态)。

## 相关

- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
- [解剖与部件契约](../guide/anatomy)
