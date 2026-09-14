# XiHan.UI 三端适配器

仅在编写组件用法或修改适配器时读取。具体 props、事件和 parts 必须以当前组件文档和公开类型为准。

## 1. 共同契约

- 三端消费同一 Headless `connect`。
- props、事件载荷、parts、状态属性和默认值语义一致。
- 框架命名差异只存在于语法层，不改变功能。
- 复合组件必须显式渲染完成其 required parts。
- 样式由共享 CSS 处理，不在适配器写设计属性内联样式。

## 2. Vue

- 组件使用 `Xh<Component><Part>` 命名导出。
- 受控值使用对应 `v-model:<name>` 或显式 prop + emit。
- emit 的载荷是 details 对象。
- 带数据的插槽必须声明 `SlotsType`。
- Boolean props 只有确实需要区分缺省值时使用 `default: undefined`。

```vue
<script setup lang="ts">
import {
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from '@xihan-ui/vue'
</script>

<template>
  <XhDialogRoot>
    <XhDialogTrigger>打开</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>确认操作</XhDialogTitle>
      <XhDialogCloseTrigger>关闭</XhDialogCloseTrigger>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

## 3. React

- 使用与 Vue 对应的命名部件。
- 受控回调读取 details，例如 `onOpenChange={({ open }) => setOpen(open)}`。
- 带载荷内容使用函数式 children；普通内容使用 JSX children。
- 原生不冒泡事件必须通过原生监听桥接。
- ref 直接作为 React 19 prop 处理，不创建旧式兼容包装。

```tsx
import {
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from '@xihan-ui/react'

export function Example() {
  return (
    <XhDialogRoot>
      <XhDialogTrigger>打开</XhDialogTrigger>
      <XhDialogContent>
        <XhDialogTitle>确认操作</XhDialogTitle>
        <XhDialogCloseTrigger>关闭</XhDialogCloseTrigger>
      </XhDialogContent>
    </XhDialogRoot>
  )
}
```

## 4. Web Components

- 先调用 `defineXhElements()`；主入口 import 不自动注册。
- 自定义元素使用 Light DOM，不自动生成作者结构。
- 作者用 `data-xh-part` 声明节点角色。
- 元素升级后写入 `data-scope`、`data-part`、ARIA 和事件。
- `data-xh-part` 是输入声明，`data-part` 是接线结果，不能混用。
- 浮层 required parts 在升级前由 `undefined.css` 收起，避免裸内容闪现。

```html
<script type="module">
  import { defineXhElements } from '@xihan-ui/web-components/define'
  import '@xihan-ui/styles'

  defineXhElements()
</script>

<xh-dialog>
  <button data-xh-part="trigger">打开</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">确认操作</h2>
      <button data-xh-part="close-trigger">关闭</button>
    </div>
  </div>
</xh-dialog>
```

## 5. 样式接入

全量皮肤：

```ts
import '@xihan-ui/styles'
```

按组件引入时，先引层序/令牌，再引组件皮肤：

```ts
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles/button.css'
```

覆盖优先级：

1. 修改语义令牌。
2. 修改组件公开槽。
3. 在 `@layer xihan.overrides` 中按 parts 覆盖。

不得使用框架类名替代稳定 parts，也不得设置 `--xh-_` 开头的私有槽。
