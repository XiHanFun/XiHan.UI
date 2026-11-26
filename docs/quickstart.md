# 快速上手

同一个对话框的四种写法：Vue 组件、React 组件、Vue 组合式函数与原生自定义元素。四种写法运行同一个状态机、同一份 `connect`，差别只在由谁把属性写到 DOM 上。

## 用法一：Vue 组件

最直接的一种。组件按部件拆分，每个部件是一个 Vue 组件，按结构嵌套即可。

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
} from "@xihan-ui/vue";
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

打开后自动生效的行为：焦点捕获在内容区、`Esc` 或点击遮罩关闭、关闭后焦点回到触发按钮、页面滚动锁定、外部内容对读屏隐藏。这些行为不需要额外编写。

### 受控与非受控

传入受控属性（如 `v-model:checked`）时以外部为准，只传 `default*` 时由组件自行持有；值类组件同时发出携带明细对象的 `value-change` 与供 `v-model` 使用的 `update:value`。规则见[三端共同约定 · 受控与非受控](./adapters/#受控与非受控)，Vue 的写法见 [Vue 适配器 · 事件与 v-model](./adapters/vue#事件与-v-model)。

## 用法二：React 组件

部件与 Vue 侧同名，一个部件一个组件。根的函数式 children 拿到展开态与 `setOpen`：

```tsx
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";

export function ConfirmDialog() {
  return (
    <XhDialogRoot>
      {({ setOpen }) => (
        <>
          <XhDialogTrigger>打开对话框</XhDialogTrigger>
          <XhDialogContent>
            <XhDialogTitle>确认操作</XhDialogTitle>
            <XhDialogDescription>这条操作不可撤销。</XhDialogDescription>
            <div className="row end">
              <XhButton variant="ghost" onClick={() => setOpen(false)}>取消</XhButton>
              <XhButton variant="solid" onClick={() => setOpen(false)}>确定</XhButton>
            </div>
            <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
          </XhDialogContent>
        </>
      )}
    </XhDialogRoot>
  );
}
```

受控写法是 `open` 加 `onOpenChange={({ open }) => setOpen(open)}`，只给 `defaultOpen` 即非受控；回调收到的是与 Vue 侧相同的明细对象。更多见 [React 适配器](./adapters/react)。

## 用法三：Vue 组合式函数

不需要现成的 DOM 结构时，直接使用 `api`，自行决定渲染的标签。

```vue
<script setup lang="ts">
import { useAccordion } from "@xihan-ui/vue";

const { api } = useAccordion({ multiple: true, defaultValue: ["a"] });
const items = [
  { value: "a", title: "第一节", body: "内容 A" },
  { value: "b", title: "第二节", body: "内容 B" },
];
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

`api` 上的每个 `getXxxProps()` 返回该部件当前应有的全部属性：`data-scope` / `data-part`、`id` 与 `aria-*` 关联、`data-state` 等状态属性，以及事件处理器。用 `v-bind` 绑定即可。

## 用法四：原生自定义元素

结构写在 Light DOM 里，用 `data-xh-part` 标出节点的角色，元素向这些节点写入属性和事件。提供了标准结构的元素（对话框在内）一个部件都不写时按标准结构生成，见各组件页。

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
import { defineXhElements } from "@xihan-ui/web-components/define";
import "@xihan-ui/styles";

defineXhElements();
```

缺少必备部件不会静默失败：Web Components 适配器会在诊断通道报告 `wc.missing-part`（error）；写了解剖之外的 part 名则报告 `wc.unknown-part`（warn）。每个组件的必备部件在[组件参考](./components/)中加粗标出。

## 接入主题

四种用法共用同一套八轴视觉环境运行时（色彩模式、品牌、密度、书写方向、对比度、动效、透明度与材质），皮肤与 Portal 都消费同一组已解析属性。在应用入口建一台 `createVisualEnvironmentController`，之后用 `setPreference` 切换、`subscribe` 订阅，完整写法见[设计令牌与主题 · 八轴视觉环境运行时](./guide/theme#八轴视觉环境运行时)。

## 延伸阅读

理解这套设计的三篇核心文档：

1. [解剖与部件契约](./guide/anatomy)：`data-scope` / `data-part` 是全库的基础，皮肤、测试、诊断都建立在它之上；
2. [状态机运行时](./guide/machine)：组件行为的定义方式与受控值的接入；
3. [connect 与属性产出](./guide/connect)：从状态机状态到 DOM 属性。

按需求继续阅读：[三端共同约定](./adapters/)、[Vue 适配器](./adapters/vue)、[React 适配器](./adapters/react)、[Web Components 适配器](./adapters/web-components)、[皮肤与样式分层](./guide/styling)、[无障碍与键盘规格](./guide/a11y)。
