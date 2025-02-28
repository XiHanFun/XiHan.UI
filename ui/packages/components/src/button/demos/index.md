# Button 按钮

常用的操作按钮。

## 基础用法

基础的按钮用法。

```vue
<template>
  <xh-button>默认按钮</xh-button>
  <xh-button type="primary">主要按钮</xh-button>
  <xh-button type="success">成功按钮</xh-button>
  <xh-button type="warning">警告按钮</xh-button>
  <xh-button type="danger">危险按钮</xh-button>
</template>
```

## 朴素按钮

通过 `plain` 属性可以设置为朴素按钮。

```vue
<template>
  <xh-button plain>朴素按钮</xh-button>
  <xh-button type="primary" plain>主要按钮</xh-button>
  <xh-button type="success" plain>成功按钮</xh-button>
  <xh-button type="warning" plain>警告按钮</xh-button>
  <xh-button type="danger" plain>危险按钮</xh-button>
</template>
```

## 禁用状态

通过 `disabled` 属性指定按钮是否被禁用。

```vue
<template>
  <xh-button disabled>禁用按钮</xh-button>
  <xh-button type="primary" disabled>主要按钮</xh-button>
  <xh-button type="success" disabled>成功按钮</xh-button>
</template>
```

## 按钮尺寸

使用 `size` 属性来设置按钮的大小。

```vue
<template>
  <xh-button size="small">小型按钮</xh-button>
  <xh-button>默认按钮</xh-button>
  <xh-button size="large">大型按钮</xh-button>
</template>
```

## 圆角按钮

通过 `round` 设置圆角按钮，通过 `circle` 设置圆形按钮。

```vue
<template>
  <xh-button round>圆角按钮</xh-button>
  <xh-button type="primary" circle>圆</xh-button>
</template>
```

## 加载状态

通过 `loading` 属性设置按钮的加载状态。

```vue
<template>
  <xh-button loading>加载中</xh-button>
  <xh-button type="primary" loading>加载中</xh-button>
</template>
```

## API

### 属性

| 属性名     | 说明               | 类型    | 可选值                                         | 默认值  |
| ---------- | ------------------ | ------- | ---------------------------------------------- | ------- |
| type       | 按钮类型           | string  | default / primary / success / warning / danger | default |
| size       | 按钮尺寸           | string  | small / medium / large                         | medium  |
| plain      | 是否为朴素按钮     | boolean | —                                              | false   |
| round      | 是否为圆角按钮     | boolean | —                                              | false   |
| circle     | 是否为圆形按钮     | boolean | —                                              | false   |
| disabled   | 是否禁用           | boolean | —                                              | false   |
| loading    | 是否显示加载中状态 | boolean | —                                              | false   |
| nativeType | 原生 type 属性     | string  | button / submit / reset                        | button  |
| autofocus  | 是否自动获取焦点   | boolean | —                                              | false   |

### 插槽

| 插槽名  | 说明       |
| ------- | ---------- |
| default | 按钮的内容 |

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式：

| 名称                     | 说明         | 默认值                 |
| ------------------------ | ------------ | ---------------------- |
| --xh-button-text-color   | 按钮文字颜色 | var(--xh-text-color)   |
| --xh-button-bg-color     | 按钮背景颜色 | var(--xh-white)        |
| --xh-button-border-color | 按钮边框颜色 | var(--xh-border-color) |
| --xh-border-radius       | 按钮圆角大小 | 4px                    |
| --xh-font-size           | 按钮字体大小 | 14px                   |

## 最佳实践

### 在表单中使用

```vue
<template>
  <form @submit.prevent="onSubmit">
    <xh-button type="primary" native-type="submit">提交</xh-button>
    <xh-button native-type="reset">重置</xh-button>
  </form>
</template>
```

### 按钮组合使用

```vue
<template>
  <div class="button-group">
    <xh-button type="primary">上一步</xh-button>
    <xh-button type="primary">下一步</xh-button>
  </div>
</template>
```

## 注意事项

1. 在使用 `loading` 状态时，按钮会自动变为禁用状态
2. 使用 `circle` 属性时，建议按钮内容保持为单个字符
3. 按钮文字尽量控制在 2-4 个字符，过长的文字建议使用 `size="large"`
