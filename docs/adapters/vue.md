# Vue 适配器

`@xihan-ui/vue` 是无头内核的 Vue 3 外壳。它负责三件事：把状态机接入 Vue 的响应式、把部件封装为组件、把 `connect` 产出的 props 展开到 vnode 上。它不实现任何组件逻辑。

依赖：`vue` 是 peer 依赖（由项目提供）；`@xihan-ui/backgrounds` 与 `@xihan-ui/sound` 是可选 peer，不使用视觉效果或音效时不需要安装。

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
} from "@xihan-ui/vue";
```

只有一个部件的组件不带部件后缀（`XhButton`、`XhSwitch`、`XhBadge`）。全部 1052 个导出组件按组件分组列在[组件参考](../components/)。

没有插件，不需要 `app.use()`。按名称 import 即可，`sideEffects: false` 让打包器移除未使用的部分。

## 配置与视觉环境

`provideXhConfig` 接收响应式配置。八轴视觉环境必须显式给出对应 DOM 根；嵌套 provide 自动接父控制器，局部 motion 不改全局 JS override：

```ts
provideXhConfig({
  locale: "zh-CN",
  visualEnvironment: {
    root: workspaceElement,
    initial: { mode: "dark", density: "compact", motion: "reduce" },
  },
});
```

物理 Portal 会由 Core 从该根桥接已解析八轴到实例壳，Vue 适配器不复制视觉状态。

## 事件与 v-model

值类组件同时发两个事件：

<!-- eslint-skip -->

```ts
emits: {
  'value-change': (details: PayloadOf<AccordionProps, 'onValueChange'>) => true,
  'update:value': (value: PayloadOf<AccordionProps, 'onValueChange'>['value']) => true,
}
```

| 事件 | 载荷 | 用途 |
| --- | --- | --- |
| `value-change` | 完整明细对象，如 `{ value }` | 需要全部上下文时 |
| `update:value` | 裸值 | 供 `v-model` 使用 |

```vue
<template>
  <!-- 双向绑定 -->
  <XhAccordionRoot v-model:value="panels" multiple />

  <!-- 或自行处理明细 -->
  <XhAccordionRoot :value="panels" @value-change="onChange" />
</template>
```

具体的绑定名按组件而定：开关是 `v-model:checked`，浮层是 `v-model:open`，输入框是 `v-model:value`。

## asChild 与事件取消

支持 `asChild` 的部件可以把行为接到作者提供的单个子节点上。Fragment 会展开后检查，仅忽略空白、注释和条件占位；零个或多个可挂载子节点、元素旁并列的非空文本或数字都会明确报错，不会生成默认按钮或丢弃可见内容。需要默认按钮时移除 `asChild`，组合多个内容时提供一个实际宿主节点。

作者写在部件或子节点上的事件处理器先执行；调用 `preventDefault()` 后，部件内部动作不再执行。作者的处理器数组仍按原顺序运行，`stopImmediatePropagation()` 仍可停止同节点后续处理器。普通回调保留全部参数，ref 的登记和清理不受事件取消影响。

## 受控与非受控

传受控属性即受控，只传 `default*` 即非受控：

```vue
<template>
  <XhSwitch v-model:checked="wifi" />      <!-- 受控 -->
  <XhSwitch :default-checked="false" />     <!-- 非受控 -->
</template>
```

受控时组件不会自行改变：它只发出变更意图，由使用者写回新值后才真正改变。这条语义收在状态机的 `cell` 与 `watch` 中，不由各组件自行判断。详见[状态机运行时](../guide/machine#受控与非受控-cell)。

## 作用域插槽

根组件通过作用域插槽提供命令式方法：

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

插槽载荷都写进了组件的 `SlotsType`，`vue-tsc` 可以捕获两类拼写错误：

```vue
<template>
  <XhTabsRoot :collection="tabs">
    <!-- ✓ node 是 TabsNodeMeta，字段可补全 -->
    <template #panel="node">{{ node.label }}</template>
  </XhTabsRoot>
</template>
```

两类拼写错误分别如下：

```vue
<template>
  <!-- ✗ TS2551: Property 'lable' does not exist on type 'TabsNodeMeta'. Did you mean 'label'? -->
  <XhTabsRoot :collection="tabs">
    <template #panel="node">{{ node.lable }}</template>
  </XhTabsRoot>

  <!-- ✗ TS2339: 组件没有这个插槽 -->
  <XhTabsRoot :collection="tabs">
    <template #panle>…</template>
  </XhTabsRoot>
</template>
```

载荷类型本身也从主入口导出（命名如 `TabsPanelSlotProps`、`StepsRootSlotProps`），需要把插槽内容拆成子组件时可以直接用于标注 props。

插槽键在类型上一律可选：组件内部按作者是否编写该插槽决定是否按 `collection` 铺开默认结构，键若非可选，该判断在类型上恒为真。

不使用现成 DOM 结构时，直接使用 `api` 自行渲染：

```vue
<script setup lang="ts">
import { useAccordion } from "@xihan-ui/vue";

const { api } = useAccordion(
  { multiple: true, defaultValue: ["a"] },
  details => console.log(details.value), // onValueChange
);
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

`api` 是一个 `ComputedRef`，随状态机状态变化重新求值。纯展示型组件（如 `XhBadge` 等没有状态机的组件）不提供组合式函数。

上下文类型（`AccordionContext` 等）也一并导出，便于向下透传 `api` 时标注类型。父子组件之间的 provide / inject 是内部实现，不对外开放；自定义结构请直接用组合式函数获取 `api`，不接入现成组件的上下文。

## 状态机接入 Vue 响应式

内部只有一层薄适配。`createVueRuntime()` 实现 `ReactiveRuntime` 的五个接口：

| 接口 | Vue 实现 |
| --- | --- |
| `cell` | `shallowRef` + 受控语义（受控时值从 `prop()` 读，内部 ref 不写） |
| `track` | `watch(deps, fn, { flush: 'pre' })` |
| `flush` | `nextTick` |
| `onMount` / `onCleanup` | `onMounted` / `onBeforeUnmount`（不在组件内则立即执行 / 忽略） |

`useMachine(machine, props, scope)` 封装了它。props 传的是 getter 而不是对象，因此在模板中原地修改某个 prop 也能生效。

getter 的求值放在一个 `computed` 里：连接层每读一个 prop 都会经过它，依赖没动时复用同一份展开结果（状态机的身份缓存跟着命中），依赖一动就产出新对象，身份缓存照旧失效。失效面与组件自己的重渲一致，getter 因此必须只读响应式来源——组件 props、`attrs`、ref、注入的上下文、全局配置。读普通变量或普通数组的长度不会让它重算；那类来源本来也驱动不了 `computed(() => connectX(...))` 的重算，只是以前靠每次重新展开碰巧读到过新值。

## 行为原语

`@xihan-ui/vue/behavior` 单独提供滚动锁、悬停意图、滚动观察、贴底和连敲检索的 Vue 包装。`useHoverIntent` 到 mounted 后才读取模板 ref，并持续观察 trigger 与三个计时参数；trigger 暂时为 `null` 时释放旧绑定，节点重新出现后再建立。content getter 与回调现读当前响应式选项，不会因浮层内容挂载或普通闭包换代重启安全三角。选项对象本身也可传 ref 或 getter；显式类型使用该子入口的 `UseHoverIntentOptions`。

`useScrollLock` 在组件 mounted 后才读取模板 ref，并以 post watcher 跟随 active；释放时先清本地句柄，清理抛错后再次激活仍可建立。active 为真期间不因配置对象更新重锁，关闭再开启才读取新配置。

## 背景层

Vue 侧的视觉适配位于单独的子入口，不引入就不会把 WebGL 引擎打进包：

```ts
import { useBackground, vBackground, XhBackground } from "@xihan-ui/vue/backgrounds";
```

三种用法见[背景层](../guide/backgrounds#在-vue-里用)。

## 声音层

同样是单独的子入口。`withToastSound` / `withDialogSound` 为命令式反馈服务配置声音，调用点不需要修改；`v-sound` 为单个元素配置声音：

```ts
import { setSoundPlayer, vSound, withToastSound } from "@xihan-ui/vue/sound";
```

默认映射与开关见[声音层](../guide/sound#在-vue-里用)。

## 服务端渲染

- `createVueRuntime()` 的 `isServer` 由 `typeof window === 'undefined'` 判定，服务端不挂事件、不读媒体查询；
- id 由 `createVueIdGenerator()` 生成，同一棵树两端一致，不会 hydration 不匹配；
- 主题属性建议在服务端就渲染到 `<html>` 上，见[设计令牌与主题](../guide/theme#服务端渲染)。

## 与 Web Components 适配器的关系

两者运行同一个状态机、同一份 `connect`，输出的 DOM 属性完全一致：跨适配器一致性测试逐帧比对归一化快照，无法消除的差异即判失败。

Vue 项目使用本适配器；需要在多个框架或无框架页面中复用同一套组件时使用[自定义元素](./web-components)。两者可以在同一页面共存。

## 相关

- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
- [Web Components 适配器](./web-components)
