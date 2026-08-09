# 快速上手

同一个对话框，写三遍。三种写法跑的是同一个状态机、同一份 `connect`，差别只在谁负责把属性挂到 DOM 上。

## 用法一：Vue 组件

最省事的一种。组件按部件拆开，每个部件是一个 Vue 组件，你只管嵌套。

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from '@xihan-ui/vue'
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }">
    <XhDialogTrigger>打开对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>确认操作</XhDialogTitle>
      <XhDialogDescription>这条操作不可撤销。</XhDialogDescription>
      <div class="row end">
        <XhButton variant="ghost" @click="setOpen(false)">取消</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">确定</XhButton>
      </div>
      <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

打开后自动生效的行为：焦点陷入内容区、`Esc` 或点遮罩关闭、关闭后焦点回到触发按钮、页面滚动被锁、外部内容对读屏隐藏。这些都不需要你写。

### 受控与非受控

值类组件一律「受控优先」：传了受控属性就以外部为准，只传 `default*` 则由组件自持。

```vue
<script setup lang="ts">
import { XhAccordionContent, XhAccordionHeader, XhAccordionItem, XhAccordionRoot, XhAccordionTrigger, XhSwitch } from '@xihan-ui/vue'
import { ref } from 'vue'

const panels = ref<string[]>(['a'])
const wifi = ref(true)
</script>

<template>
  <!-- 受控：v-model 双向绑定 -->
  <XhSwitch v-model:checked="wifi" aria-label="Wi-Fi" />

  <!-- 非受控：只给初值，之后组件自己管 -->
  <XhSwitch :default-checked="false" aria-label="非受控开关" />

  <XhAccordionRoot v-model:value="panels" multiple>
    <XhAccordionItem value="a">
      <XhAccordionHeader>
        <XhAccordionTrigger>第一节</XhAccordionTrigger>
      </XhAccordionHeader>
      <XhAccordionContent>展开集合是 string[]，multiple 时可并存。</XhAccordionContent>
    </XhAccordionItem>
    <XhAccordionItem value="b">
      <XhAccordionHeader>
        <XhAccordionTrigger>第二节</XhAccordionTrigger>
      </XhAccordionHeader>
      <XhAccordionContent>方向键只在标题间搬焦点，永不进内容区。</XhAccordionContent>
    </XhAccordionItem>
  </XhAccordionRoot>
</template>
```

每个值类组件同时发两个事件：`value-change` 带完整明细对象（如 `{ value }`），`update:value` 带裸值供 `v-model` 用。

## 用法二：Vue 组合式函数

不想要现成的 DOM 结构时，直接拿 `api`，自己决定渲染成什么标签。

```vue
<script setup lang="ts">
import { useAccordion } from '@xihan-ui/vue'

const { api } = useAccordion({ multiple: true, defaultValue: ['a'] })
const items = [
  { value: 'a', title: '第一节', body: '内容 A' },
  { value: 'b', title: '第二节', body: '内容 B' },
]
</script>

<template>
  <section v-bind="api.getRootProps()">
    <article v-for="item in items" :key="item.value" v-bind="api.getItemProps(item)">
      <h3 v-bind="api.getHeaderProps(item)">
        <button v-bind="api.getTriggerProps(item)">{{ item.title }}</button>
      </h3>
      <div v-bind="api.getContentProps(item)">{{ item.body }}</div>
    </article>
  </section>
</template>
```

`api` 上的每个 `getXxxProps()` 返回该部件此刻应有的全部属性：`data-scope` / `data-part`、`id` 与 `aria-*` 关联、`data-state` 等状态属性、以及事件处理器。你只需要 `v-bind` 上去。

## 用法三：原生自定义元素

结构完全由你手写，用 `data-xh-part` 标出哪个节点担任哪个角色。元素是 **Light DOM 行为宿主**——它不渲染任何结构，只往你写的节点上挂属性和事件。

```html
<xh-dialog>
  <button data-xh-part="trigger">打开对话框</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">确认操作</h3>
      <p data-xh-part="description">这条操作不可撤销。</p>
      <button data-xh-part="close-trigger" aria-label="关闭">✕</button>
    </div>
  </div>
</xh-dialog>
```

```ts
import { defineXhElements } from '@xihan-ui/wc/define'
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

defineXhElements()
```

必备部件漏写不会静默失败：Web Components 适配器会在诊断通道上报 `wc.missing-part`（error）；写了解剖之外的 part 名则上报 `wc.unknown-part`（warn）。每个组件的必备部件在[组件参考](./components/)里加粗标出。

## 加上主题

三种用法共用同一套主题运行时。它把五个属性写到根元素上，皮肤按属性选择器命中：

```ts
import { createThemeController } from '@xihan-ui/system/runtime'

const theme = createThemeController({
  storageKey: 'app-theme', // 传了才持久化
  initial: { mode: 'system', density: 'comfortable' },
})

// 切到深色
theme.setPreference({ mode: 'dark' })

// 跟随系统
theme.setPreference({ mode: 'system' })

// 订阅已定型的状态
theme.subscribe(state => console.log(state.mode, state.density, state.dir))
```

五个维度分别是色彩模式、品牌、密度、对比度、书写方向，详见[设计令牌与主题](./guide/theme)。

## 接下来读什么

理解这套设计只需要三篇：

1. [解剖与部件契约](./guide/anatomy)——`data-scope` / `data-part` 是全库的地基，皮肤、测试、诊断都建在它上面；
2. [状态机运行时](./guide/machine)——组件的行为长什么样，受控值是怎么接的；
3. [connect 与属性产出](./guide/connect)——从机器状态到 DOM 属性的那一步。

然后按需求挑：[Vue 适配器](./adapters/vue)、[Web Components 适配器](./adapters/wc)、[皮肤与样式分层](./guide/styling)、[无障碍与键盘规格](./guide/a11y)。
