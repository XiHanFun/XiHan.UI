# Vue 适配器

`@xihan-ui/vue` 是无头内核的 Vue 3 外壳。三端共用的约定（同一份行为、命名、受控与非受控、asChild、全局配置、子入口、服务端渲染）见[三端共同约定](./)，本页只写 Vue 的接法与独有部分。

## 依赖

`vue` 是 peer 依赖（`^3.5.0`，由项目提供）；`@xihan-ui/backgrounds`、`@xihan-ui/sound` 与 `@xihan-ui/code-highlight` 是可选 peer，不使用视觉效果、音效与代码着色时不需要安装。

## 引入与注册

每个部件一个组件，命名规则见[三端共同约定 · 组件命名](./#组件命名)：

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

全部导出组件按组件分组列在[组件参考](../components/)。

默认按名称 import，`sideEffects: false` 让打包器移除未使用的部分；也可以交给 unplugin-vue-components 按需自动引入，或用插件全量注册，见[注册方式](#注册方式)。

### 注册方式

四种写法，产物里的组件从少到多：

| 写法 | 产物里的组件 | 模板里的类型 |
| --- | --- | --- |
| 按名称 import | 只有用到的 | 来自 import |
| `@xihan-ui/vue/resolver` 配 unplugin-vue-components | 只有用到的 | unplugin-vue-components 生成的 `components.d.ts` |
| Nuxt 项目装 [`@xihan-ui/vue/nuxt`](#nuxt) | 只有用到的 | Nuxt 生成的组件声明 |
| `@xihan-ui/vue/plugin` 全量注册 | 全部组件 | 引入插件模块即生效 |

#### 自动引入

```ts
// vite.config.ts
import vue from "@vitejs/plugin-vue";
import { XiHanUIResolver } from "@xihan-ui/vue/resolver";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue(), Components({ resolvers: [XiHanUIResolver()], dts: true })],
});
```

解析器只认 `Xh` 前缀，`<XhButton>` 与 `<xh-button>` 都解析到 `@xihan-ui/vue` 的同名导出；名字拼错时打包器会报主入口没有这个导出，不会静默忽略。皮肤不随组件引入：入口处引一次 `@xihan-ui/styles`，或者交给 `@xihan-ui/styles/vite` 按用到的组件注入，见[按用到的组件自动注入](../installation#按用到的组件自动注入)。

#### 全量注册

```ts
// main.ts
import { XiHanUI } from "@xihan-ui/vue/plugin";
import { createApp } from "vue";
import App from "./App.vue";
import "@xihan-ui/styles";

createApp(App).use(XiHanUI).mount("#app");
```

插件引用全部组件，产物不再摇树，适合原型、内部后台这类不在意首包体积的场景。引入插件模块的同时就给 `GlobalComponents` 补上了全部组件的类型，Volar 与 vue-tsc 在模板里直接校验 props，不需要另配 `types`。

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

受控与非受控的规则见[三端共同约定 · 受控与非受控](./#受控与非受控)：

```vue
<template>
  <XhSwitch v-model:checked="wifi" />      <!-- 受控 -->
  <XhSwitch :default-checked="false" />     <!-- 非受控 -->
</template>
```

`default*` 只在 setup 时读取一次。

## 插槽与组合式函数

### 作用域插槽

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

#### 载荷有类型

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

载荷类型本身也从主入口导出（命名如 `DialogRootSlotProps`、`StepsRootSlotProps`），需要把插槽内容拆成子组件时可以直接用于标注 props。

插槽键在类型上一律可选：组件内部按作者是否编写该插槽决定是否按 `collection` 铺开默认结构，键若非可选，该判断在类型上恒为真。

### 组合式函数

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

上下文类型（`AccordionContext` 等）也一并导出，便于向下透传 `api` 时标注类型。

自行编写的部件放进现成组件时，用读钩子取所在组件的上下文：`useAccordionContext()` 取整个组件的 `api`，`useAccordionItemContext()` 取所在条目的身份。每个部件的上下文都有对应的读钩子，名字与 React 一一对应，只在对应部件之内取得到。上下文只由库内部件提供，提供方（provide）不导出；完全自定义结构时用组合式函数获取 `api`。

## asChild

规则见[三端共同约定 · asChild 与事件取消](./#aschild-与事件取消)。Vue 侧另有两点：作者的处理器数组仍按原顺序运行，`stopImmediatePropagation()` 仍可停止同节点后续处理器。

## 子入口一览

| 子入口 | 内容 |
| --- | --- |
| `@xihan-ui/vue/behavior` | 滚动锁、悬停意图、滚动观察、贴底、连敲检索与当前断点的 Vue 包装，见[行为原语](../guide/behavior#在-vue-react-中使用) |
| `@xihan-ui/vue/backgrounds` | `useBackground`、`vBackground`、`XhBackground` 三种用法，不引入就不会把 WebGL 引擎打进包，见[背景层](../guide/backgrounds#在-vue-里用) |
| `@xihan-ui/vue/sound` | `withNotificationSound` / `withDialogSound` 给命令式服务配声，`v-sound` 给单个元素配声，见[声音层](../guide/sound#在-vue-中使用) |
| `@xihan-ui/vue/locale` | 十份内建语言包，见[国际化](../guide/i18n#内建语言包) |
| `@xihan-ui/vue/resolver` | unplugin-vue-components 的组件解析器，见[自动引入](#自动引入) |
| `@xihan-ui/vue/plugin` | 全量注册与全局组件类型，见[全量注册](#全量注册) |
| `@xihan-ui/vue/nuxt` | Nuxt 模块，见下文 [Nuxt](#nuxt) |

## 服务端渲染

共同的几条见[三端共同约定 · 服务端渲染](./#服务端渲染)；Nuxt 项目交给下面的模块。

### Nuxt

`@xihan-ui/vue/nuxt` 是 Nuxt 模块。装上 `@xihan-ui/vue` 与 `@xihan-ui/styles` 后只写一行：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@xihan-ui/vue/nuxt"],
});
```

模块接好三件事，各有一个开关：

| 做什么 | 选项 | 缺省 |
| --- | --- | --- |
| 组件自动注册：模板里直接写 `<XhButton>` / `<xh-button>`，按用到的组件从主入口导入，照常摇树 | `components` | `true` |
| 注入令牌与皮肤，排在应用自己的样式之前 | `styles`：`"layered"`；宿主有无层 reset 时用 `"unlayered"`；`false` 自己引 | `"layered"` |
| SSR 首帧主题：服务端把八轴视觉环境渲染到 `<html>` 上，head 里一段内联脚本在首帧前读回读者存过的偏好，客户端随后接管成视觉环境控制器 | `visualEnvironment`：`{ storageKey, initial }`；`false` 由应用自己管 | `{}` |

选项写在 `xihanUI` 下，或写在模块元组的第二项（后者优先）：

```ts
export default defineNuxtConfig({
  modules: ["@xihan-ui/vue/nuxt"],
  xihanUI: {
    visualEnvironment: {
      storageKey: "my-app-visual",
      initial: { density: "compact" },
    },
  },
});
```

控制器经 `useNuxtApp().$xhVisual` 交给应用，切明暗、密度等调 `setPreference`。写了 `storageKey` 时偏好存进 localStorage，下次打开的首帧就是那一套，不会先闪一下浅色。`initial` 里写了的轴压过读者存的值，要留给读者自己选的轴不要写进 `initial`；写错的值在构建时就报。

```vue
<script setup lang="ts">
const { $xhVisual } = useNuxtApp();

function toggleDark() {
  $xhVisual.setPreference({ mode: $xhVisual.getState().mode === "dark" ? "light" : "dark" });
}
</script>
```

服务端没有媒体查询与存储：那一端的 `$xhVisual` 按 `initial` 解出，`system` 轴取基线。按明暗分支渲染的内容放到 `onMounted` 之后，免得水合对不上。完整示例在仓库的 [`examples/nuxt`](https://github.com/XiHanFun/XiHan.UI/tree/dev/examples/nuxt)，CI 每轮都对着本仓刚构建的包装一遍，类型检查、构建并检查首屏。

## 本端独有

### 原生属性透传与严格模板检查

组件上没声明成 prop 的属性按 Vue 的属性透传落到根元素上：给 `XhFormRoot` 写 `id`，外部的提交按钮就能用 `form="…"` 关联到这张表单；`class`、`style`、`aria-*`、`data-*` 同理。组件的类型只列出自己的 prop，没有把根元素的原生属性并进来——把几百个原生属性并进每个组件，会让 prop 表与类型提示都淹没在里面。

开启 vue-tsc 的 `strictTemplates`（或单开 `checkUnknownProps`）后，这类透传属性会被报成未知属性。在项目的 `env.d.ts` 里扩一次 `ComponentCustomProps` 即可，组件自己的 prop 照常受检，拼错的属性名仍然会报：

<!-- eslint-skip -->

```ts
// env.d.ts
import type { HTMLAttributes } from 'vue'

declare module 'vue' {
  interface ComponentCustomProps extends Omit<HTMLAttributes, 'class' | 'style'> {}
}
```

这条扩充对项目里所有组件生效（第三方组件同样放行原生属性），由项目自己决定是否开启。表单、按钮等元素专有的属性（`novalidate`、`form`）不在通用原生属性里，需要时把对应的 `FormHTMLAttributes`、`ButtonHTMLAttributes` 一并并进去。

升级时同样建议开启 `checkUnknownProps` 与 `checkUnknownEvents`：移除或改名的属性不会报错，只会被当成原生属性透传到根元素上而静默失效，这两项检查能把它们一次扫出来。

### 组件的 props 类型

每个组件的 props 类型以 `Xh<组件名>Props` 从主入口导出，名字与 React 一一对应。它就是组件在模板与 `h()` 里接受的 props：声明的 prop、`emits` 对应的 `on*` 监听，以及 `class`、`style`、`key`、`ref`；上一节扩进 `ComponentCustomProps` 的原生属性也在其中。选中值随类型收窄的根组件（Select、Combobox、Listbox、CheckboxGroup、RadioGroup、ToggleGroup、Table、Form）带类型参数，缺省与 React 相同：

```ts
import type { XhSelectRootProps } from "@xihan-ui/vue";

// 值类型是 number：defaultValue 与 collection 里的 value 都按 number 检查
const selectProps: XhSelectRootProps<number> = {
  defaultValue: 1,
  collection: [{ value: 1, label: "一" }, { value: 2, label: "二" }],
};
```

这些类型由组件定义推导而来，SFC 的 `defineProps<…>()` 解析不了推导出的类型。封装组件时用它标注 `h()` 的参数、算好的 props 对象或配置项。

## 相关

- [三端共同约定](./)
- [组件参考](../components/)：全部组件与部件
- [connect 与属性产出](../guide/connect)
