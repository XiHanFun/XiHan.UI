# connect 与属性产出

`connect` 是无头内核的出口：**输入是服务与归一化器，输出是一组 props-getter**。它把「机器现在处于什么状态」翻译成「DOM 上此刻该有哪些属性」。

```ts
export function connectAccordion<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T>
```

`connect` 里没有任何 DOM 写操作，也没有任何框架 API。它是一个纯函数：同样的服务状态，产出同样的属性字典。

## api 上有什么

以手风琴为例：

```ts
export interface AccordionApi<T extends PropTypes = PropTypes> {
  // 状态与操作
  value: string[]
  setValue: (next: string[]) => void
  isOpen: (value: string) => boolean

  // 每个部件一个 getter
  getRootProps: () => T['element']
  getItemProps: (props: AccordionItemProps) => T['element']
  getHeaderProps: (props: AccordionItemProps) => T['element']
  getTriggerProps: (props: AccordionItemProps) => T['button']
  getContentProps: (props: AccordionItemProps) => T['element']
  getIndicatorProps: (props: AccordionItemProps) => T['element']
}
```

两类成员：

- **状态与操作**——当前值、判定函数、命令式方法，给你在模板外用；
- **props-getter**——每个部件一个，名字固定是 `get` + 部件名的大驼峰 + `Props`。

部件本身有身份的（条目、标签页面板这类），getter 收一个描述该条目的参数；单例部件的 getter 不收参数。

## getter 里装了什么

```ts
getTriggerProps: item => normalize.button({
  ...parts.trigger.attrs, // data-scope + data-part
  [ITEM_VALUE_ATTR]: item.value, // 集合导航用的身份标记
  'id': triggerId(item.value), // 由 scope 派生，同页多实例不冲突
  'type': 'button',
  'aria-controls': contentId(item.value), // 与 content 的 id 对上
  'aria-expanded': isOpen(item.value) ? 'true' : 'false',
  'aria-disabled': item.disabled ? 'true' : 'false',
  'data-state': stateAttr(item), // 皮肤钩子
  'data-disabled': dataAttr(item.disabled),
  'onClick': () => { /* send({ type: 'ITEM.TOGGLE', … }) */ },
  'onKeydown': onTriggerKeydown(item),
})
```

五类内容，缺一不可：

| 类别 | 例子 | 谁消费 |
| --- | --- | --- |
| 结构标识 | `data-scope` `data-part` | 皮肤、测试、诊断 |
| 无障碍语义 | `role` `aria-expanded` `aria-controls` | 读屏 |
| 状态钩子 | `data-state` `data-disabled` | 皮肤 |
| id 关联 | `id` `aria-labelledby` | 读屏；id 由 `scope.partId()` 派生 |
| 事件处理器 | `onClick` `onKeydown` | 适配器绑到 DOM |

id 一律由 `scope` 派生而不是随手生成，这样同一页面挂多个实例时 `aria-controls` 指向的仍然是自己那份内容。跨适配器一致性测试会把 id 的具体值抹掉、把 IDREF 属性翻译成 `@part(...)` 再比对——两套适配器的关联结构必须完全一致。

## 归一化器

`normalize` 按元素类型分成若干 getter：`element` / `button` / `input` / `label` / `output` / `select` / `textarea` / `img`。`connect` 按部件实际渲染成什么标签选对应的那个，适配器就能针对性地转换。

```ts
// 无头场景：恒等归一化，原样拿到属性字典
import { normalizeProps } from '@xihan-ui/core'

const api = connectAccordion(service, normalizeProps)
api.getTriggerProps({ value: 'a' })
// { 'data-scope': 'accordion', 'data-part': 'trigger', 'aria-expanded': 'false', … }
```

Vue 适配器传的是 `vueNormalize`（把 `onKeydown` 一类的键改写成 Vue 认的形态），Web Components 适配器传 `wcNormalize`。要接第三个框架，实现一份 `NormalizeProps` 即可，`connect` 一行不用改。

## 无障碍属性上的几处刻意选择

`connect` 里对 ARIA 的处理有一批是明确权衡过的，读组件源码时会反复见到：

- **`aria-disabled` 而非 `disabled`**，当禁用项仍需可聚焦时（手风琴的禁用条目、加载中的按钮）。原生 `disabled` 会让元素丢掉焦点，读屏用户就再也 Tab 不到它，也读不到「为什么不能点」。
- **不输出 `tabindex` 的组件是刻意的**。手风琴不做 roving tabindex，每个触发器都是独立的 Tab 停靠点——这是 APG 对该模式的规定，不是遗漏。
- **`hidden` 用 `!open || undefined`**，让属性在展开时彻底消失而不是 `hidden="false"`。
- **纯装饰部件挂 `aria-hidden="true"`**，比如指示箭头。

## 自己拿 api 渲染

三种宿主都可以直接用 `connect`，不必经过现成组件。

Vue 里走组合式函数：

```vue
<script setup lang="ts">
import { useAccordion } from '@xihan-ui/vue'

const { api } = useAccordion({ multiple: true, defaultValue: ['a'] })
</script>

<template>
  <section v-bind="api.getRootProps()">
    <!-- 自己决定渲染成什么标签 -->
  </section>
</template>
```

完全脱离框架时自己建服务：

```ts
import { createScope, createCounterIdGenerator, normalizeProps } from '@xihan-ui/core'
import { accordionMachine, connectAccordion } from '@xihan-ui/headless'
import { createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'

const runtime = createVanillaRuntime()
const scope = createScope(rootEl, createCounterIdGenerator())
const service = createService(accordionMachine, {
  props: () => ({ multiple: true }),
  runtime,
  scope,
})
runtime.start()

const api = connectAccordion(service, normalizeProps)
runtime.subscribe(() => {
  // 任一格子变化即重读 api，把属性刷到 DOM 上
})
```

## 相关

- [解剖与部件契约](./anatomy)：`data-scope` / `data-part` 从哪来
- [状态机运行时](./machine)：`service` 从哪来
- [无障碍与键盘规格](./a11y)：这些 ARIA 属性对应的规格出处
