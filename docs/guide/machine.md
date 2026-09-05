# 状态机运行时

`@xihan-ui/core` 里的状态机是一台**薄**的有限状态机运行时：零第三方运行时依赖。组件的全部行为写在这里，因此它必须与框架无关——响应式由宿主框架经一个 `ReactiveRuntime` 接口注入。

## 一台机器长什么样

```ts
import type { AccordionSchema } from './accordion.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<AccordionSchema>()

export const accordionMachine = createMachine({
  name: 'accordion',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      onChange: value => prop('onValueChange')?.({ value }),
    })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'VALUE.SET': { actions: ['setValue'] },
      },
    },
  },
  implementations: {
    actions: {
      toggleItem: ({ context, prop, event }) => { /* … */ },
      setValue: ({ context, prop, event }) => { /* … */ },
    },
  },
})
```

`setup<Schema>()` 是类型锚：一次绑定 schema，之后 `prop()` / `context.get()` / 事件类型全部自动推断，不用在每处重复写泛型。它同时给出 `guards`，即 `and` / `or` / `not` 三个组合子。

## 配置的各个面

| 字段 | 作用 |
| --- | --- |
| `context` | 机器自己的状态。用 `cell()` 声明的格子自带受控语义 |
| `refs` | 不参与响应式的引用（DOM 取值器、宿主注入的配置、层注册器等） |
| `computed` | 由 context / props 派生的只读值 |
| `props` | 宿主传进来的属性，经 `prop('x')` 读取 |
| `initialState` | 初始状态，可读 props 决定 |
| `states` | 状态节点：`on` 转移表、`entry` / `exit` 动作、`effects` 副作用、`tags` |
| `watch` | 追踪外部值变化并触发动作，受控回写走这里 |
| `implementations` | `actions` / `guards` / `effects` 的具名实现 |

**具名实现是硬约束。** `states` 里只能出现动作名、守卫名、副作用名的字符串；裸内联函数会在 `createMachine` 时直接抛 `MachineError`（守卫只放行 `and` / `or` / `not` 组合子的产物）。开发模式下还会自检：转移表里引用了 `implementations` 里不存在的名字，同样报错。这条约束换来的是——状态图是可静态分析的数据，测试能算转移覆盖率，而不是一堆闭包。

## 受控与非受控：`cell`

值类组件的取值语义统一在 `cell` 一处，不由各组件自己判断：

```ts
value: cell<string[]>(() => ({
  value: prop('value'), // 传了就是受控
  defaultValue: prop('defaultValue') ?? [], // 只传它就是非受控
  onChange: value => prop('onValueChange')?.({ value }),
}))
```

规则：

- `value !== undefined` → **受控**。`context.set()` 不改内部值，只调 `onChange` 通知宿主；真正的值始终从 `prop('value')` 读。
- `value === undefined` → **非受控**。内部持有值，变更时也调 `onChange`。
- 从受控变回 `undefined` 表示转成非受控，不会强制复位。

浮层类组件的开关不走 `cell`，而是走「意图 + 回写」两段式，因为状态本身就是机器的状态节点：

```ts
'OPEN': [
  { guard: 'isOpenControlled', actions: ['invokeOnOpen'] }, // 受控：只发意图
  { target: 'open', actions: ['invokeOnOpen'] }, // 非受控：直接转移
],
'CONTROLLED.OPEN': { target: 'open' }, // 宿主写回 open 后由 watch 派发
```

`watch` 追踪 `prop('open')`，宿主把新值写回来时才派发 `CONTROLLED.OPEN` / `CONTROLLED.CLOSE`。受控组件因此永远不会「自己动」。

## 转移表的匹配顺序

一个事件可以配一组转移，**按书写顺序取第一条守卫通过的**：

```ts
'OPEN': [
  { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
  { target: 'open', actions: ['invokeOnOpen'] }, // 无 guard = 兜底
]
```

没有任何一条匹配时事件被丢弃，不报错。

## 副作用

`effects` 声明在状态节点上，进入该状态时启动、离开时清理。对话框的遮罩装配就是一个 effect：

```ts
states: {
  open: {
    effects: ['trackOverlay'], // 装配消隐层 → 焦点域 → 滚动锁 → 背景失活
  },
}
```

副作用拿得到 `refs`（宿主注入的 DOM 取值器与运行时配置）、`send`、`flush`，返回一个清理函数。`setTimeoutEffect` / `setIntervalEffect` 是两个现成的定时器 effect 工厂。

## 服务与响应式运行时

机器配置是纯数据，跑起来需要一个**服务**：

```ts
import { createService } from '@xihan-ui/core'

const service = createService(accordionMachine, {
  props: () => ({ multiple: true, defaultValue: ['a'] }),
  runtime, // ReactiveRuntime，由宿主提供
  scope, // DOM 环境抽象
})
```

`ReactiveRuntime` 是机器与框架之间唯一的接口，要实现的东西不多：`cell`（受控格子）、`track`（依赖追踪）、`flush`（微任务冲刷）、`onMount` / `onCleanup`。

| 运行时 | 来源 | 用在哪 |
| --- | --- | --- |
| Vue | `@xihan-ui/vue` 内部的 `createVueRuntime()` | Vue 适配器 |
| vanilla | `@xihan-ui/core/vanilla` 的 `createVanillaRuntime()` | Web Components 适配器、测试、benchmark |

vanilla 运行时是一个同步 dirty 循环的微 signal 实现，也是这套契约的参考实现——想接第三个框架，照它写一份即可。

## 服务对外的面

`connect` 拿到的 `service` 就是下面这些：

| 成员 | 用途 |
| --- | --- |
| `state` | `get()` / `previous()` / `matches(...)` / `hasTag()` |
| `context` | 读写 context 格子 |
| `computed` | 读派生值 |
| `prop` | 读 props |
| `refs` | 读写非响应式引用 |
| `event` | 读当前 / 上一个事件 |
| `send` | 派发事件 |
| `scope` | DOM 环境：`getDoc()` / `getWin()` / `partId()` / `getActiveElement()` 等 |
| `machine` / `getStatus()` | 机器配置本身与生命周期状态 |

注意**没有**「直接改状态」的口子。状态只能由事件驱动转移，这条限制让「当前状态」始终可以由事件序列复现——跨适配器一致性测试正是靠这一点比对两套适配器。

调试时可以给 `createService` 传 `inspect`，逐条拿到转移、动作、副作用与事件：

```ts
createService(dialogMachine, {
  props: () => ({}),
  runtime,
  inspect: e => console.log(e.type, e.state, e.detail),
})
```

## 相关

- [connect 与属性产出](./connect)：从服务到 DOM 属性
- [行为原语](./behavior)：effects 里调用的那些东西
- [测试与质量门禁](./testing)：转移覆盖率与一致性判据
