# 状态机运行时

`@xihan-ui/core` 中的状态机是一台轻量的有限状态机运行时：零第三方运行时依赖。组件的全部行为写在这里，因此它必须与框架无关：响应式由宿主框架经 `ReactiveRuntime` 接口注入。

## 状态机的形态

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

`setup<Schema>()` 是类型锚：一次绑定 schema，之后 `prop()` / `context.get()` / 事件类型全部自动推断，不需要在每处重复写泛型。它同时给出 `guards`，即 `and` / `or` / `not` 三个组合子。

## 配置的各个面

| 字段 | 作用 |
| --- | --- |
| `context` | 状态机自身的状态。用 `cell()` 声明的格子自带受控语义 |
| `refs` | 不参与响应式的引用（DOM 取值器、宿主注入的配置、层注册器等） |
| `computed` | 由 context / props 派生的只读值 |
| `props` | 宿主传入的属性，经 `prop('x')` 读取 |
| `initialState` | 初始状态，可读 props 决定 |
| `states` | 状态节点：`on` 转移表、`entry` / `exit` 动作、`effects` 副作用、`tags` |
| `watch` | 追踪外部值变化并触发动作，受控回写走这里 |
| `implementations` | `actions` / `guards` / `effects` 的具名实现 |

具名实现是硬约束。`states` 中只能出现动作名、守卫名、副作用名的字符串；裸内联函数会在 `createMachine` 时直接抛出 `MachineError`（守卫只放行 `and` / `or` / `not` 组合子的产物）。`createMachine` 在开发与生产模式都会检查静态列表并递归审计组合 guard：转移表中引用了 `implementations` 中不存在的名字同样报错。实现必须是对应分组自身的数据属性函数；原型链成员、访问器和非函数值都不构成实现，审计也不会为了检查而调用 getter。这条约束的收益是状态图成为可静态分析的数据，测试可以计算转移覆盖率，而不是一组闭包。运行时得知名字的那部分（函数形态的 `entry` / `exit` / `effects` 与 `action()` / `guard()`）缺项时怎么处理，见下文[运行时不变式](#运行时不变式)。

## 受控与非受控：`cell`

值类组件的取值语义统一在 `cell` 一处，不由各组件自行判断：

```ts
value: cell<string[]>(() => ({
  value: prop("value"), // 传了就是受控
  defaultValue: prop("defaultValue") ?? [], // 只传它就是非受控
  onChange: value => prop("onValueChange")?.({ value }),
}));
```

规则：

- `value !== undefined` → 受控。`context.set()` 不修改内部值，只调用 `onChange` 通知宿主；实际值始终从 `prop('value')` 读取。
- `value === undefined` → 非受控。内部持有值，变更时同样调用 `onChange`。
- 从受控变回 `undefined` 表示转为非受控，不会强制复位。

浮层类组件的开关不经过 `cell`，而是采用意图与回写两段式，因为状态本身就是状态机的状态节点：

<!-- eslint-skip -->

```ts
'OPEN': [
  { guard: 'isOpenControlled', actions: ['invokeOnOpen'] }, // 受控：只发意图
  { target: 'open', actions: ['invokeOnOpen'] }, // 非受控：直接转移
],
'CONTROLLED.OPEN': { target: 'open' }, // 宿主写回 open 后由 watch 派发
```

`watch` 追踪 `prop('open')`，宿主写回新值时才派发 `CONTROLLED.OPEN` / `CONTROLLED.CLOSE`。受控组件因此不会自行变更状态。

### 初值的读取时机

`default*` 只给非受控状态提供初值，不追踪之后的变化；表单重置与 `reset` 例外，它们按当下的 `default*` 重算落点。三端对初值的取法相同，区别只在组件什么时候拿齐 props：

| 适配器 | 初值取自 | 之后再改 `default*` |
| --- | --- | --- |
| Vue | setup 时的 props | 不影响当前值 |
| React | 首次渲染的 props | 不影响当前值 |
| Web Components | 状态第一次被写入之前最后一次赋的值 | 写入之后不影响当前值 |

Vue 与 React 的 props 随组件一起创建，建立那一刻就是齐的。自定义元素的属性可以在连接之后才到：HTML 里的元素先被升级、连接，脚本排在之后的任务里才赋 `defaultValue`。元素因此把状态第一次被写入当作初始化的终点——在这之前给任一 `default*` 赋值，元素按新的初值重建状态机，结果与连接前就写好相同；升级前赋在实例上的值在连接时就计入。「写入」指挂载完成后状态节点变化（开合、勾选），或 `value` 这类对外报告变化的 `cell` 被改写，用户交互、方法调用、表单重置都算。赋值按内容比较，内容相同的新数组或对象不算换了初值。

运行中要换一份初值：Vue 与 React 换 `key` 重建组件，Web Components 换一个元素。只想改当前值就用受控属性。

## 转移表的匹配顺序

一个事件可以配置一组转移，按书写顺序取第一条守卫通过的：

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

副作用可以获取 `refs`（宿主注入的 DOM 取值器与运行时配置）、`send`、`flush`，返回一个清理函数。`setTimeoutEffect` / `setIntervalEffect` 是两个现成的定时器 effect 工厂。

### 运行时不变式

- **名字缺失即停机。** 函数形态的 `entry`、`exit`、`effects` 与实现里调用的 `action()`、`guard()` 只能在运行时得知名字：运行时先解析整份列表、经自有数据属性一次取得全部函数快照再执行，任一名字缺失都以 `MISSING_ACTION`、`MISSING_GUARD` 或 `MISSING_EFFECT` 上报、停止服务并抛出原错误，开发与生产一致。缺失 guard 不按 `false` 继续选分支，缺失 action 不被跳过，列表后部缺失 effect 也不会让前部 effect 先取得资源。`inspect` 只观察、不参与错误决策，观察器自身抛错被隔离，不能遮蔽 `MISSING_*`、阻止停机或替换原错误对象。
- **一批 effect 是一个事务。** 同一状态节点的一批 effect 先建在途路径登记，整批成功才保留为活动批次；后一项初始化抛错或挂载期间丢失路径所有权时，在途登记被摘除，已交出的 cleanup 立即按资源取得逆序全部回滚，某项 cleanup 抛错不阻断其余回滚。事务只能回滚已经返回给服务的 cleanup：单个 effect 在返回前取得了多项资源，要在自己的初始化抛错时逆序回滚。成功挂载的 cleanup 同样逆序执行；每条状态路径只有一份活动登记（返回 `void` 的也占位），机器内部重复挂载抛 `DUPLICATE_EFFECT_PATH`，不把两批 cleanup 隐式合并；退出状态时先从清理表摘除该路径再调 cleanup，崩溃停机时不会重复执行。
- **停机不可逆。** 停机一开始就进入 `Stopped`、关闭事件入口并清空待处理事件与 tracker，然后清完所有 effect 并运行 machine exit；cleanup 或 exit 里同步 `send` 不再推进机器，服务停止后重复 mount 也不会复活。effect 执行前路径就已处于「挂载中」：setup 里同步重入宿主 mount 在服务边界命中 `DUPLICATE_SERVICE_MOUNT`，按崩溃停机释放全部资源；setup 里同步停机时，迟到返回的 cleanup 当场逆序释放，当次 choreography 立即终止，不再运行后续 entry 或根 effect，这次紧急清理的异常仍会暴露。
- **首次挂载的顺序固定。** 首次 mount 是不可重入的初始化边界：state effect → machine entry → state entry → 根 effect。根 effect 是整个生命周期的资源（层、焦点域、观察器），建起时读到的是进入完毕的初态，初态 entry 挑好的锚点（高亮项、焦点格）对它可见。四步全部提交前 `send` 按调用顺序进 FIFO，提交后先处理挂载前累积的 tracker 再统一消费队列；初始化失败或停机清空队列，不用半提交的状态继续转移。初始化来源与根 effect 用与用户状态路径不相交的内部标识，`__init__` 是合法的用户状态名，也可以与根 effect 同时使用。
- **异常一个不丢。** 无回滚异常时保留原初始化异常；回滚也失败（含 effect 初始化中缺项且 cleanup 失败）时以 `AggregateError` 同时携带原异常与全部回滚异常，最外层 `MachineError` 把这条异常链留在 `cause`。清理、exit 与原始崩溃同时抛错时，抛出与诊断通道收到同一份完整聚合异常，正常停机只有 cleanup 或 exit 失败时同理。可以抛出任意值：`null`、`undefined` 等非 `Error` 值用安全格式化的崩溃信息并在 `MachineError.cause` 保留原值，单个 cleanup 或 exit 抛出 `undefined` 也记为真实异常；抛出值无法转为文本时诊断使用稳定的「无法格式化的异常」文案。

## 服务与响应式运行时

状态机配置是纯数据，运行需要一个服务：

```ts
import { createService } from "@xihan-ui/core";

const service = createService(accordionMachine, {
  props: () => ({ multiple: true, defaultValue: ["a"] }),
  runtime, // ReactiveRuntime，由宿主提供
  scope, // DOM 环境抽象
});
```

`ReactiveRuntime` 是状态机与框架之间唯一的接口，需要实现的成员不多：`cell`（受控格子）、`track`（依赖追踪）、`flush`（微任务冲刷）、`onMount` / `onCleanup`。

| 运行时 | 来源 | 用途 |
| --- | --- | --- |
| Vue | `@xihan-ui/vue` 内部的 `createVueRuntime()` | Vue 适配器 |
| React | `@xihan-ui/react` 内部的 `createReactRuntime()` | React 适配器 |
| vanilla | `@xihan-ui/core/vanilla` 的 `createVanillaRuntime()` | Web Components 适配器、测试、benchmark |

vanilla 运行时是一个同步 dirty 循环的微 signal 实现，也是这套契约的参考实现：接入新框架时按它实现一份即可。

### 适配器里的运行时

Vue 与 React 适配器各有一层薄适配，实现同样的五个接口：

| 接口 | Vue（`createVueRuntime()`） | React（`createReactRuntime()`） |
| --- | --- | --- |
| `cell` | `shallowRef` + 受控语义（受控时值从 `prop()` 读，内部 ref 不写） | 闭包存值 + 受控语义（受控时值从 `prop()` 读取，内部值不写）；写入递增版本号，经 `useSyncExternalStore` 触发重渲染 |
| `track` | `watch(deps, fn, { flush: 'pre' })` | 拉式：每次提交后逐项比对依赖，变化时才触发 |
| `flush` | `nextTick` | `flushSync` 强制一次提交，回调在 DOM 落定之后运行 |
| `onMount` / `onCleanup` | `onMounted` / `onBeforeUnmount`（不在组件内则立即执行 / 忽略） | `useLayoutEffect` 的挂载与清理 |

React 的 `track` 是拉式的，与 Vue 不同。Vue 的 `watch` 挂在响应式源上，源变化即通知；React 中 props 的变化不经过任何可订阅的源，它是下一次渲染函数的入参。推式实现在这里永远收不到 props 变化：106 个状态机中的 `track` 与 102 个 `watch` 块会全部静默失效且不报错。

两端都由 `useMachine` 封装，props 传的是 getter 而不是对象：

- Vue 的 `useMachine(machine, props, scope)`：在模板中原地修改某个 prop 也能生效。getter 的求值放在一个 `computed` 里：连接层每读一个 prop 都会经过它，依赖没动时复用同一份展开结果（状态机的身份缓存跟着命中），依赖一动就产出新对象，身份缓存照旧失效。失效面与组件自己的重渲一致，getter 因此必须只读响应式来源——组件 props、`attrs`、ref、注入的上下文、全局配置。读普通变量或普通数组的长度不会让它重算；那类来源本来也驱动不了 `computed(() => connectX(...))` 的重算。
- React 的 `useMachine(machine, getProps, options)`：每次渲染读取，状态机读到的始终是当前帧的值。getter 的求值带一份记忆，钥匙有两把：渲染轮次与机器版本号。前者盖住组件 props 与渲染期赋值的 ref，后者是「任意一台机器的 cell 变过一次」的全局计数，盖住那些从别的机器现读的派生 props（取色器里内嵌的滑杆、分页里内嵌的页长下拉）。连接层一趟要读十几个 prop，两把钥匙都没动时它们共用同一份展开结果；任一动了当场作废。因此 getter 应当只读这两类来源。确实要在同一拍生效、等不到下一轮渲染的状态（气泡确认的挂起态就是一例）落 ref 之后调一次 `invalidateMachineProps()` 让记忆作废，别默默地读。

## 服务的对外接口

`connect` 获得的 `service` 包含以下成员：

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
| `machine` / `getStatus()` | 状态机配置本身与生命周期状态 |

没有直接修改状态的入口。状态只能由事件驱动转移，这条限制使当前状态始终可以由事件序列复现：跨适配器一致性测试正是依靠这一点比对各适配器。

调试时可以给 `createService` 传入 `inspect`，逐条获取转移、动作、副作用与事件：

```ts
createService(dialogMachine, {
  props: () => ({}),
  runtime,
  inspect: e => console.log(e.type, e.state, e.detail),
});
```

## 相关

- [connect 与属性产出](./connect)：从服务到 DOM 属性
- [行为原语](./behavior)：effects 中调用的原语
- [测试与质量门禁](./testing)：转移覆盖率与一致性判据
