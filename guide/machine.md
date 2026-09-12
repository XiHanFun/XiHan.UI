来源：https://ui.docs.xihanfun.com/guide/machine

# 状态机运行时

`@xihan-ui/core` 里的状态机是一台**薄**的有限状态机运行时：零第三方运行时依赖。组件的全部行为写在这里，因此它必须与框架无关——响应式由宿主框架经一个 `ReactiveRuntime` 接口注入。

## 一台机器长什么样

```ts
import type { AccordionSchema } from "./accordion.types";
import { setup } from "@xihan-ui/core";

const { createMachine } = setup<AccordionSchema>();

export const accordionMachine = createMachine({
  name: "accordion",
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop("value"),
      defaultValue: prop("defaultValue") ?? [],
      onChange: value => prop("onValueChange")?.({ value }),
    })),
  }),
  initialState: () => "idle",
  states: {
    idle: {
      on: {
        "ITEM.TOGGLE": { actions: ["toggleItem"] },
        "VALUE.SET": { actions: ["setValue"] },
      },
    },
  },
  implementations: {
    actions: {
      toggleItem: ({ context, prop, event }) => { /* … */ },
      setValue: ({ context, prop, event }) => { /* … */ },
    },
  },
});
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

**具名实现是硬约束。** `states` 里只能出现动作名、守卫名、副作用名的字符串；裸内联函数会在 `createMachine` 时直接抛 `MachineError`（守卫只放行 `and` / `or` / `not` 组合子的产物）。`createMachine` 在开发与生产模式都会检查静态列表并递归审计组合 guard：转移表里引用了 `implementations` 里不存在的名字，同样报错。实现必须是对应分组自身的数据属性函数；原型链成员、访问器和非函数值都不构成实现，审计也不会为了检查而调用 getter。这条约束换来的是——状态图是可静态分析的数据，测试能算转移覆盖率，而不是一堆闭包。

函数形态的 `entry`、`exit`、`effects` 以及实现内部调用的 `action()`、`guard()` 只能在运行时得知名字。运行时会先解析整份 action 或 effect 列表，再通过自有数据属性一次取得全部函数快照，之后才执行 action 或初始化 effect；任一名字缺失都会用 `MISSING_ACTION`、`MISSING_GUARD` 或 `MISSING_EFFECT` 上报、停止服务并抛出原错误，开发与生产行为一致。缺失 guard 不会按 `false` 继续选择分支，缺失 action 不会被跳过，列表后部缺失 effect 也不会让前部 effect 先取得资源。缺项发生在 effect 初始化中且 cleanup 也失败时，抛出的 `AggregateError` 同时保留缺项错误与全部回滚异常。

`inspect` 只观察这些运行事件，不参与错误决策；观察器自身抛错会被隔离，不能遮蔽 `MISSING_*`、阻止停机或替换诊断中的原错误对象。

## 受控与非受控：`cell`

值类组件的取值语义统一在 `cell` 一处，不由各组件自己判断：

```ts
value: cell<string[]>(() => ({
  value: prop("value"), // 传了就是受控
  defaultValue: prop("defaultValue") ?? [], // 只传它就是非受控
  onChange: value => prop("onValueChange")?.({ value }),
}));
```

规则：

- `value !== undefined` → **受控**。`context.set()` 不改内部值，只调 `onChange` 通知宿主；真正的值始终从 `prop('value')` 读。
- `value === undefined` → **非受控**。内部持有值，变更时也调 `onChange`。
- 从受控变回 `undefined` 表示转成非受控，不会强制复位。

浮层类组件的开关不走 `cell`，而是走「意图 + 回写」两段式，因为状态本身就是机器的状态节点：

<!-- eslint-skip -->

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

<!-- eslint-skip -->

```ts
'OPEN': [
  { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
  { target: 'open', actions: ['invokeOnOpen'] }, // 无 guard = 兜底
]
```

没有任何一条匹配时事件被丢弃，不报错。

## 副作用

`effects` 声明在状态节点上，进入该状态时启动、离开时清理。对话框的遮罩装配就是一个 effect：

<!-- eslint-skip -->

```ts
states: {
  open: {
    effects: ['trackOverlay'], // 装配消隐层 → 焦点域 → 滚动锁 → 背景失活
  },
}
```

副作用拿得到 `refs`（宿主注入的 DOM 取值器与运行时配置）、`send`、`flush`，返回一个清理函数。`setTimeoutEffect` / `setIntervalEffect` 是两个现成的定时器 effect 工厂。

同一状态节点的一批 effect 在执行前会先建立在途路径登记，整批成功后才保留为活动批次。如果后一项初始化抛错或挂载期间丢失路径所有权，在途登记会被摘除，本批已取得的 cleanup 会立即按资源取得逆序全部回滚；某项 cleanup 抛错不会阻断其余回滚。无回滚异常时保留原初初始化异常；回滚也失败时通过 `AggregateError` 同时携带初始化异常和全部回滚异常。最外层的 `MachineError` 会把这份原始异常链保留在 `cause` 中。

事务只能回滚 effect 已经返回给服务的 cleanup。单个 effect 如果在返回前已取得多项资源，它自身必须在内部初始化抛错时逆序回滚；服务无法释放从未交出的句柄。

成功挂载的 cleanup 同样按资源取得逆序执行。每条状态路径只能存在一份活动 effect 登记，返回 `void` 的 effect 也会占用该路径；重复挂载会抛出 `DUPLICATE_EFFECT_PATH` 不变式错误，而不是把两批 cleanup 隐式合并。退出状态时，服务会先从清理表摘除该路径，再调用 cleanup，因此 cleanup 抛错也不会在崩溃停机时被重复执行。

停机一开始就进入 `Stopped`、关闭事件入口并清空待处理事件与 tracker，然后继续清完所有 effect 并运行 machine exit。清理、exit 与原始崩溃同时抛错时，抛出和诊断通道都收到同一份完整聚合异常；正常停机只有 cleanup 或 exit 失败时也遵守同一规则。cleanup 或 exit 里同步调用 `send` 不会再推进机器；服务停止后宿主重复触发 mount 也不会把它复活。

effect 执行前路径就已处于“挂载中”。setup 里同步重入宿主 mount 会在服务边界命中 `DUPLICATE_SERVICE_MOUNT`，并按崩溃停机释放当前全部资源；同一状态路径在机器内部非法重复挂载时才报告 `DUPLICATE_EFFECT_PATH`。setup 里同步停机后，该 effect 迟到返回的 cleanup 会当场按逆序释放，当次 choreography 立即终止，不会再运行后续 entry 或根 effect；这次紧急清理的异常仍会暴露。

首次 mount 的完整 choreography 是一个不可重入的初始化边界。state effect、machine entry、根 effect 与 state entry 全部提交前，其中的 `send` 只会按调用顺序进入 FIFO；提交后先处理挂载前累积的 tracker，再统一消费事件队列。初始化失败或停机会清空该队列，不会用半提交的状态继续转移。初始化来源和根 effect 使用与用户状态路径不相交的内部标识，因此 `__init__` 是合法的用户状态名，也可以与根 effect 同时使用。

状态机允许 JavaScript 抛出任意值。`null`、`undefined` 和其他非 `Error` 值会使用安全格式化的崩溃信息，并在 `MachineError.cause` 中保留原值；即使单个 cleanup 或 exit 抛出 `undefined`，也会被记录为真实异常并向外抛出。抛出值自身无法转为文本时，诊断使用稳定的“无法格式化的异常”文案。

## 服务与响应式运行时

机器配置是纯数据，跑起来需要一个**服务**：

```ts
import { createService } from "@xihan-ui/core";

const service = createService(accordionMachine, {
  props: () => ({ multiple: true, defaultValue: ["a"] }),
  runtime, // ReactiveRuntime，由宿主提供
  scope, // DOM 环境抽象
});
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
});
```

## 相关

- [connect 与属性产出](./connect)：从服务到 DOM 属性
- [行为原语](./behavior)：effects 里调用的那些东西
- [测试与质量门禁](./testing)：转移覆盖率与一致性判据
