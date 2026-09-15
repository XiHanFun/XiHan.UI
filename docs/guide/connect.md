# connect 与属性产出

`connect` 是无头内核的出口：输入是服务与归一化器，输出是一组 props-getter。它把状态机的当前状态翻译为 DOM 此刻应有的属性。

```ts
export function connectAccordion<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T>;
```

`connect` 中没有任何 DOM 写操作，也没有任何框架 API。它是一个纯函数：同样的服务状态，产出同样的属性字典。

## api 的成员

以手风琴为例：

```ts
export interface AccordionApi<T extends PropTypes = PropTypes> {
  // 状态与操作
  value: string[];
  setValue: (next: string[]) => void;
  isOpen: (value: string) => boolean;

  // 每个部件一个 getter
  getRootProps: () => T["element"];
  getItemProps: (props: AccordionItemProps) => T["element"];
  getHeaderProps: (props: AccordionItemProps) => T["element"];
  getTriggerProps: (props: AccordionItemProps) => T["button"];
  getContentProps: (props: AccordionItemProps) => T["element"];
  getIndicatorProps: (props: AccordionItemProps) => T["element"];
}
```

两类成员：

- 状态与操作：当前值、判定函数、命令式方法，供模板外使用；
- props-getter：每个部件一个，名字固定为 `get` + 部件名的大驼峰 + `Props`。

部件本身有身份的（条目、标签页面板等），getter 接收一个描述该条目的参数；单例部件的 getter 不接收参数。

## getter 的内容

```ts
getTriggerProps: item => normalize.button({
  ...parts.trigger.attrs, // data-scope + data-part
  [ITEM_VALUE_ATTR]: item.value, // 集合导航用的身份标记
  "id": triggerId(item.value), // 由 scope 派生，同页多实例不冲突
  "type": "button",
  "aria-controls": contentId(item.value), // 与 content 的 id 对上
  "aria-expanded": isOpen(item.value) ? "true" : "false",
  "aria-disabled": item.disabled ? "true" : "false",
  "data-state": stateAttr(item), // 皮肤钩子
  "data-disabled": dataAttr(item.disabled),
  "onClick": () => { /* send({ type: 'ITEM.TOGGLE', … }) */ },
  "onKeydown": onTriggerKeydown(item),
});
```

五类内容，缺一不可：

| 类别 | 例子 | 消费方 |
| --- | --- | --- |
| 结构标识 | `data-scope` `data-part` | 皮肤、测试、诊断 |
| 无障碍语义 | `role` `aria-expanded` `aria-controls` | 读屏 |
| 状态钩子 | `data-state` `data-disabled` | 皮肤 |
| id 关联 | `id` `aria-labelledby` | 读屏；id 由 `scope.partId()` 派生 |
| 事件处理器 | `onClick` `onKeydown` | 适配器绑到 DOM |

id 一律由 `scope` 派生而不是随意生成，这样同一页面挂载多个实例时 `aria-controls` 指向的仍是自身的内容。跨适配器一致性测试会抹除 id 的具体值、把 IDREF 属性翻译为 `@part(...)` 再比对：各适配器的关联结构必须完全一致。

## 归一化器

`normalize` 按元素类型分为若干 getter：`element` / `button` / `input` / `label` / `output` / `select` / `textarea` / `img`。`connect` 按部件实际渲染的标签选择对应的 getter，适配器即可针对性地转换。

```ts
// 无头场景：恒等归一化，原样获得属性字典
import { normalizeProps } from "@xihan-ui/core";

const api = connectAccordion(service, normalizeProps);
api.getTriggerProps({ value: "a" });
// { 'data-scope': 'accordion', 'data-part': 'trigger', 'aria-expanded': 'false', … }
```

Vue 适配器传入 `vueNormalize`（把 `onKeydown` 一类的键改写为 Vue 识别的形态），Web Components 适配器传入 `wcNormalize`。接入新框架时实现一份 `NormalizeProps` 即可，`connect` 不需修改。

## 无障碍属性上的刻意选择

`connect` 中对 ARIA 的处理有一批经过明确权衡，阅读组件源码时会反复见到：

- 使用 `aria-disabled` 而非 `disabled`，当禁用项仍需可聚焦时（手风琴的禁用条目、加载中的按钮）。原生 `disabled` 会使元素失去焦点，读屏用户无法 Tab 到它，也读不到不可用的原因。
- 不输出 `tabindex` 的组件是刻意的。手风琴不做 roving tabindex，每个触发器都是独立的 Tab 停靠点：这是 APG 对该模式的规定，不是遗漏。
- `hidden` 使用 `!open || undefined`，使属性在展开时彻底消失而不是 `hidden="false"`。
- 纯装饰部件设置 `aria-hidden="true"`，例如指示箭头。

## 直接使用 api 渲染

三种宿主都可以直接使用 `connect`，不必经过现成组件。

Vue 中使用组合式函数：

```vue
<script setup lang="ts">
import { useAccordion } from "@xihan-ui/vue";

const { api } = useAccordion({ multiple: true, defaultValue: ["a"] });
</script>

<template>
  <section v-bind="api.getRootProps()">
    <!-- 自行决定渲染标签 -->
  </section>
</template>
```

完全脱离框架时自行创建服务：

```ts
import { createCounterIdGenerator, createScope, createService, normalizeProps } from "@xihan-ui/core";
import { createVanillaRuntime } from "@xihan-ui/core/vanilla";
import { accordionMachine, connectAccordion } from "@xihan-ui/headless";

const runtime = createVanillaRuntime();
const scope = createScope(rootEl, createCounterIdGenerator());
const service = createService(accordionMachine, {
  props: () => ({ multiple: true }),
  runtime,
  scope,
});
runtime.start();

const api = connectAccordion(service, normalizeProps);
runtime.subscribe(() => {
  // 任一格子变化即重读 api，把属性写到 DOM 上
});
```

## 相关

- [解剖与部件契约](./anatomy)：`data-scope` / `data-part` 的来源
- [状态机运行时](./machine)：`service` 的来源

- [无障碍与键盘规格](./a11y)：这些 ARIA 属性对应的规格出处
