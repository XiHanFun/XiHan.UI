# Button 按钮

常用的操作按钮。

## 基础用法

基础的按钮用法。

```vue
<template>
  <div class="demo-button">
    <Button>默认按钮</Button>
    <Button type="primary">主要按钮</Button>
    <Button type="success">成功按钮</Button>
    <Button type="warning">警告按钮</Button>
    <Button type="error">错误按钮</Button>
  </div>
</template>

<script setup>
  import { Button } from "@xihan-ui/components";
</script>
```

## 无障碍支持

按钮组件完全支持 WAI-ARIA 规范，提供了完整的键盘操作和无障碍支持。

### 键盘操作

- 使用 `Tab` 键可以聚焦到按钮
- 使用 `Enter` 或 `Space` 键可以触发按钮点击事件
- 禁用状态下无法通过键盘聚焦

### 屏幕阅读器支持

```vue
<template>
  <div class="demo-button">
    <!-- 使用 aria-label 提供按钮描述 -->
    <Button aria-label="关闭对话框">×</Button>

    <!-- 使用 aria-describedby 关联描述文本 -->
    <Button aria-describedby="button-desc">提交</Button>
    <span id="button-desc" class="visually-hidden">点击后将提交表单数据</span>

    <!-- 使用 aria-pressed 表示按钮状态 -->
    <Button aria-pressed="true">已选中</Button>

    <!-- 使用 aria-expanded 表示展开状态 -->
    <Button aria-expanded="true" aria-controls="menu">菜单</Button>
    <div id="menu" role="menu" hidden>
      <!-- 菜单内容 -->
    </div>

    <!-- 使用 role 指定按钮角色 -->
    <Button role="tab" aria-selected="true">标签页 1</Button>
  </div>
</template>

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
```

### 无障碍属性说明

| 属性名          | 说明                    | 类型                                                                                  | 默认值      |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------- | ----------- |
| ariaLabel       | 按钮的 aria-label       | `string`                                                                              | `''`        |
| ariaDescribedby | 按钮的 aria-describedby | `string`                                                                              | `''`        |
| ariaPressed     | 按钮的 aria-pressed     | `boolean \| 'true' \| 'false' \| 'mixed'`                                             | `undefined` |
| ariaExpanded    | 按钮的 aria-expanded    | `boolean \| 'true' \| 'false'`                                                        | `undefined` |
| ariaControls    | 按钮的 aria-controls    | `string`                                                                              | `''`        |
| ariaHaspopup    | 按钮的 aria-haspopup    | `boolean \| 'true' \| 'false' \| 'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog'` | `undefined` |
| role            | 按钮的 role             | `string`                                                                              | `''`        |
| tabindex        | 按钮的 tabindex         | `number \| string`                                                                    | `0`         |

### 最佳实践

1. 始终为图标按钮提供 `aria-label`
2. 使用 `aria-describedby` 关联额外的描述文本
3. 为切换按钮设置 `aria-pressed` 状态
4. 为展开/折叠按钮设置 `aria-expanded` 状态
5. 为弹出菜单按钮设置 `aria-haspopup` 和 `aria-controls`
6. 使用 `role` 属性指定按钮的具体角色
7. 合理设置 `tabindex` 控制键盘导航顺序

## 不同尺寸

Button 组件提供了三种尺寸：large、medium 和 small。

```vue
<template>
  <div class="demo-button">
    <Button size="large">大型按钮</Button>
    <Button>默认按钮</Button>
    <Button size="small">小型按钮</Button>
  </div>
</template>
```

## 不同形状

Button 组件提供了三种形状：square、round 和 circle。

```vue
<template>
  <div class="demo-button">
    <Button shape="square">方形按钮</Button>
    <Button shape="round">圆角按钮</Button>
    <Button shape="circle">圆形按钮</Button>
  </div>
</template>
```

## 禁用状态

通过 `disabled` 属性指定是否禁用按钮。

```vue
<template>
  <div class="demo-button">
    <Button disabled>禁用按钮</Button>
    <Button type="primary" disabled>禁用主要按钮</Button>
  </div>
</template>
```

## 加载状态

通过 `loading` 属性指定按钮的加载状态。

```vue
<template>
  <div class="demo-button">
    <Button loading>加载中</Button>
    <Button type="primary" loading>加载中</Button>
  </div>
</template>
```

## 文本按钮

通过 `text` 属性指定按钮为文本按钮。

```vue
<template>
  <div class="demo-button">
    <Button text>文本按钮</Button>
    <Button type="primary" text>主要文本按钮</Button>
  </div>
</template>
```

## 幽灵按钮

通过 `ghost` 属性指定按钮为幽灵按钮。

```vue
<template>
  <div class="demo-button">
    <Button ghost>幽灵按钮</Button>
    <Button type="primary" ghost>主要幽灵按钮</Button>
  </div>
</template>
```

## 块级按钮

通过 `block` 属性指定按钮为块级按钮。

```vue
<template>
  <div class="demo-button">
    <Button block>块级按钮</Button>
    <Button type="primary" block>主要块级按钮</Button>
  </div>
</template>
```

## 带图标的按钮

通过插槽添加图标。

```vue
<template>
  <div class="demo-button">
    <Button>
      <template #prefix>
        <Icon name="search" />
      </template>
      搜索
    </Button>
    <Button type="primary">
      上传
      <template #suffix>
        <Icon name="upload" />
      </template>
    </Button>
  </div>
</template>
```

## API

### 属性

| 属性名    | 说明             | 类型                                                                                | 默认值      |
| --------- | ---------------- | ----------------------------------------------------------------------------------- | ----------- |
| type      | 按钮类型         | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'submit'` | `'default'` |
| size      | 按钮尺寸         | `'small' \| 'medium' \| 'large'`                                                    | `'medium'`  |
| shape     | 按钮形状         | `'square' \| 'round' \| 'circle'`                                                   | `'square'`  |
| color     | 自定义颜色       | `string`                                                                            | `''`        |
| textColor | 自定义文字颜色   | `string`                                                                            | `''`        |
| text      | 是否为文本按钮   | `boolean`                                                                           | `false`     |
| block     | 是否为块级按钮   | `boolean`                                                                           | `false`     |
| loading   | 是否处于加载状态 | `boolean`                                                                           | `false`     |
| disabled  | 是否禁用         | `boolean`                                                                           | `false`     |
| ghost     | 是否为幽灵按钮   | `boolean`                                                                           | `false`     |
| round     | 是否为圆角按钮   | `boolean`                                                                           | `false`     |
| circle    | 是否为圆形按钮   | `boolean`                                                                           | `false`     |
| dashed    | 是否为虚线按钮   | `boolean`                                                                           | `false`     |
| strong    | 是否为粗体按钮   | `boolean`                                                                           | `false`     |
| bordered  | 是否显示边框     | `boolean`                                                                           | `true`      |
| focusable | 是否可聚焦       | `boolean`                                                                           | `true`      |
| keyboard  | 是否支持键盘操作 | `boolean`                                                                           | `true`      |
| tag       | 按钮标签         | `keyof HTMLElementTagNameMap`                                                       | `'button'`  |
| attrType  | 按钮类型         | `'button' \| 'submit' \| 'reset'`                                                   | `'button'`  |

### 事件

| 事件名          | 说明               | 类型                          |
| --------------- | ------------------ | ----------------------------- |
| click           | 点击按钮时触发     | `(event: MouseEvent) => void` |
| focus           | 按钮获得焦点时触发 | `(event: FocusEvent) => void` |
| blur            | 按钮失去焦点时触发 | `(event: FocusEvent) => void` |
| change          | 按钮状态改变时触发 | `(value: any) => void`        |
| loading-change  | 加载状态改变时触发 | `(loading: boolean) => void`  |
| disabled-change | 禁用状态改变时触发 | `(disabled: boolean) => void` |

### 插槽

| 插槽名  | 说明         |
| ------- | ------------ |
| default | 按钮内容     |
| prefix  | 按钮前缀图标 |
| suffix  | 按钮后缀图标 |
| loading | 加载图标     |
