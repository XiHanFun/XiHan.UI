---
"@xihan-ui/vue": patch
---

75 个组件的插槽写上真类型，`vue-tsc` 从此接得住插槽名与载荷键名的拼写错误。

组件是渲染函数写的，`.d.ts` 里插槽泛型一直是空的（`DefineComponent` 的 `S` 位是 `{}`），
于是 `#panel="node"`、`v-slot="{ pages, page }"` 这些载荷在消费端全是 `any`：
键名写错不报、插槽名写错不报，只在运行期渲染出 `undefined`。props 与 emits 早就有完整类型，
唯独插槽这一层没有对外描述——而无头库恰恰是靠插槽把控制权交回作者的。

现在每个带载荷的插槽都有具名载荷类型（`TabsPanelSlotProps`、`StepsRootSlotProps` 这样命名，
均从主入口导出），组件上声明 `slots: Object as SlotsType<…>`：

```vue
<template #panel="node">{{ node.lable }}</template>
<!-- TS2551: Property 'lable' does not exist on type 'TabsNodeMeta'. Did you mean 'label'? -->
```

两条形状上的取舍值得写下来：

- **键一律可选**。非可选时 `slots.default ? 作者内容 : 按 collection 铺开` 这类判断在类型上恒为真，
  而它承载的正是「没写默认插槽就铺开整套结构」的核心行为——类型不能对着它撒谎。
- **值一律写成函数类型**而不是裸载荷类型。Vue 的 `UnwrapSlotsType` 对函数类型原样保留、
  对裸类型套一层 `Slot<T>`，而 `Slot<T>` 的实参元组在 `T` 不 extends `undefined` 时是 `[T]`
  ——零参调用会变成非法，而库里到处是 `slots.default?.()`。

新增 `check-slot-types` 门禁盯住这两条与「带载荷就必须声明」，`pnpm gate` 由十七项变十八项。
