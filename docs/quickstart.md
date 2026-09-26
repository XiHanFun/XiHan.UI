# 快速上手

同一个对话框的三种写法。三种写法运行同一个状态机、同一份 `connect`，差别只在由谁把属性写到 DOM 上。

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

值类组件一律受控优先：传入受控属性时以外部为准，只传 `default*` 时由组件自行持有。

```vue
<script setup lang="ts">
import { XhAccordionContent, XhAccordionHeader, XhAccordionItem, XhAccordionRoot, XhAccordionTrigger, XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const panels = ref<string[]>(["a"]);
const wifi = ref(true);
</script>

<template>
  <!-- 受控：v-model 双向绑定 -->
  <XhSwitch v-model:checked="wifi" aria-label="Wi-Fi" />

  <!-- 非受控：只给初值，之后由组件持有 -->
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
      <XhAccordionContent>方向键只在标题间移动焦点，不进入内容区。</XhAccordionContent>
    </XhAccordionItem>
  </XhAccordionRoot>
</template>
```

每个值类组件同时发出两个事件：`value-change` 携带完整明细对象（如 `{ value }`），`update:value` 携带裸值供 `v-model` 使用。

## 用法二：Vue 组合式函数

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

## 用法三：原生自定义元素

结构完全由作者编写，用 `data-xh-part` 标出节点的角色。元素是 Light DOM 行为宿主：它不渲染任何结构，只向作者编写的节点写入属性和事件。

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

三种用法共用同一套八轴视觉环境运行时，皮肤与 Portal 都消费同一组已解析属性：

```ts
import { createVisualEnvironmentController } from "@xihan-ui/tokens/runtime";

const visual = createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => console.error("视觉偏好持久化失败", detail),
  initial: { mode: "system", density: "comfortable", motion: "system", transparency: "system" },
});

// 切到深色
visual.setPreference({ mode: "dark" });

// 跟随系统
visual.setPreference({ mode: "system" });

// 订阅已定型的状态
visual.subscribe(state => console.log(state.mode, state.density, state.motion, state.transparency));
```

七个维度分别是色彩模式、品牌、密度、书写方向、对比度、动效与透明材质，详见[设计令牌与主题](./guide/theme)。

## 延伸阅读

理解这套设计的三篇核心文档：

1. [解剖与部件契约](./guide/anatomy)：`data-scope` / `data-part` 是全库的基础，皮肤、测试、诊断都建立在它之上；
2. [状态机运行时](./guide/machine)：组件行为的定义方式与受控值的接入；
3. [connect 与属性产出](./guide/connect)：从状态机状态到 DOM 属性。

按需求继续阅读：[Vue 适配器](./adapters/vue)、[Web Components 适配器](./adapters/web-components)、[皮肤与样式分层](./guide/styling)、[无障碍与键盘规格](./guide/a11y)。
