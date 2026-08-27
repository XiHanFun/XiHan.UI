# Vue 适配器

`@xihan-ui/vue` 是无头内核的 Vue 3 外壳。它做三件事：把机器接到 Vue 的响应式上、把部件包成组件、把 `connect` 产出的 props 展开到 vnode 上。**不实现任何组件逻辑。**

依赖：`vue` 是 peer 依赖（由你的项目提供）；`@xihan-ui/backgrounds` 与 `@xihan-ui/sound` 是**可选** peer，不用视觉效果或音效就不必装。

## 组件命名

每个部件一个组件，一律 `Xh` 前缀 + 组件名 + 部件名：

```ts
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from '@xihan-ui/vue'
```

只有一个部件的组件不带部件后缀（`XhButton`、`XhSwitch`、`XhBadge`）。全部 733 个导出组件按组件分组列在[组件参考](../components/)里。

没有插件，不需要 `app.use()`。按名字 import 即可，`sideEffects: false` 让打包器摇掉没用到的部分。

## 事件与 v-model

值类组件同时发两个事件：

```ts
emits: {
  'value-change': (details: PayloadOf<AccordionProps, 'onValueChange'>) => true,
  'update:value': (value: PayloadOf<AccordionProps, 'onValueChange'>['value']) => true,
}
```

| 事件 | 载荷 | 用途 |
| --- | --- | --- |
| `value-change` | 完整明细对象，如 `{ value }` | 需要拿到全部上下文时 |
| `update:value` | 裸值 | 供 `v-model` 用 |

```vue
<template>
  <!-- 双向绑定 -->
  <XhAccordionRoot v-model:value="panels" multiple />

  <!-- 或者自己接明细 -->
  <XhAccordionRoot :value="panels" @value-change="onChange" />
</template>
```

具体的绑定名按组件而定：开关是 `v-model:checked`，浮层是 `v-model:open`，输入框是 `v-model:value`。

## 受控与非受控

传受控属性即受控，只传 `default*` 即非受控：

```vue
<template>
  <XhSwitch v-model:checked="wifi" />      <!-- 受控 -->
  <XhSwitch :default-checked="false" />     <!-- 非受控 -->
</template>
```

受控时组件**永远不会自己动**：它只发出变更意图，等你把新值写回来才真的改。这条语义收在机器的 `cell` 与 `watch` 里，不由各组件自己判断。详见[状态机运行时](../guide/machine#受控与非受控-cell)。

## 作用域插槽

根组件通过作用域插槽把命令式方法交出来：

```vue
<template>
  <XhDialogRoot v-slot="{ setOpen }">
    <XhDialogTrigger>打开</XhDialogTrigger>
    <XhDialogContent>
      <XhButton @click="setOpen(false)">取消</XhButton>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

### 载荷有类型

插槽载荷都写进了组件的 `SlotsType`，所以 `vue-tsc` 接得住两类拼写错误：

```vue
<template>
  <XhTabsRoot :collection="tabs">
    <!-- ✓ node 是 TabsNodeMeta，字段可补全 -->
    <template #panel="node">{{ node.label }}</template>

    <!-- ✗ TS2551: Property 'lable' does not exist on type 'TabsNodeMeta'. Did you mean 'label'? -->
    <template #panel="node">{{ node.lable }}</template>

    <!-- ✗ TS2339: 组件没有这个插槽 -->
    <template #panle>…</template>
  </XhTabsRoot>
</template>
```

载荷类型本身也从主入口导出（`TabsPanelSlotProps`、`StepsRootSlotProps` 这样命名），
需要把插槽内容拆成子组件时可以直接拿来标注 props。

插槽键在类型上一律是**可选**的：组件内部靠「作者写没写这个插槽」决定要不要按 `collection` 铺开默认结构，
键若非可选，那条判断在类型上就恒为真了。

不想用现成 DOM 结构时，直接拿 `api` 自己渲染：

```vue
<script setup lang="ts">
import { useAccordion } from '@xihan-ui/vue'

const { api } = useAccordion(
  { multiple: true, defaultValue: ['a'] },
  details => console.log(details.value), // onValueChange
)
</script>

<template>
  <section v-bind="api.getRootProps()">
    <article v-bind="api.getItemProps({ value: 'a' })">
      <h3 v-bind="api.getHeaderProps({ value: 'a' })">
        <button v-bind="api.getTriggerProps({ value: 'a' })">第一节</button>
      </h3>
      <div v-bind="api.getContentProps({ value: 'a' })">内容</div>
    </article>
  </section>
</template>
```

`api` 是一个 `ComputedRef`，随机器状态变化重新求值。纯展示型组件（`XhBadge` 这类没有状态机的）不提供组合式函数。

上下文类型（`AccordionContext` 等）也一并导出，便于把 `api` 往下透传时标注类型。父子组件之间的 provide / inject 是内部实现，不对外开放——要自定义结构请直接用组合式函数拿 `api`，而不是接进现成组件的上下文。

## 机器接到 Vue 响应式

内部只有一层薄适配。`createVueRuntime()` 实现 `ReactiveRuntime` 的五个口子：

| 接口 | Vue 实现 |
| --- | --- |
| `cell` | `shallowRef` + 受控语义（受控时值从 `prop()` 读，内部 ref 不写） |
| `track` | `watch(deps, fn, { flush: 'pre' })` |
| `flush` | `nextTick` |
| `onMount` / `onCleanup` | `onMounted` / `onBeforeUnmount`（不在组件内则立即执行 / 忽略） |

`useMachine(machine, props, scope)` 把它包起来。props 传的是 getter 而不是对象，每次展开成新对象让机器的身份缓存失效——这样在模板里原地改某个 prop 也收得到。

## 背景层

Vue 侧的视觉适配在**单独的子入口**，不引就不会把 WebGL 引擎打进包：

```ts
import { useBackground, vBackground, XhBackground } from '@xihan-ui/vue/backgrounds'
```

三种用法见[背景层](../guide/backgrounds#在-vue-里用)。

## 声音层

同样是单独的子入口。`withToastSound` / `withDialogSound` 给命令式反馈服务配上声音，调用点一行都不用改；`v-sound` 给单个元素配声：

```ts
import { setSoundPlayer, vSound, withToastSound } from '@xihan-ui/vue/sound'
```

默认映射与开关见[声音层](../guide/sound#在-vue-里用)。

## 服务端渲染

- `createVueRuntime()` 的 `isServer` 由 `typeof window === 'undefined'` 判定，服务端不挂事件、不读媒体查询；
- id 由 `createVueIdGenerator()` 生成，同一棵树两端一致，不会 hydration 不匹配；
- 主题属性建议在服务端就渲染到 `<html>` 上，见[设计令牌与主题](../guide/theme#服务端渲染)。

## 与 Web Components 适配器的关系

两者跑同一个机器、同一份 `connect`，输出的 DOM 属性完全一致——跨适配器一致性测试逐帧比对归一化快照，抹不掉的差异即判失败。

选哪个：Vue 项目用这个；需要在多个框架 / 无框架页面里复用同一套组件时用[自定义元素](./web-components)。两者可以在同一页面共存。

## 相关

- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
- [Web Components 适配器](./web-components)
