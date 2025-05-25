# Icon 图标

基于 IconBase 的高级图标组件，支持丰富的动画效果和交互特性。

## 基础用法

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-house" />
    <XhIcon name="bsi-heart" color="red" />
    <XhIcon name="bsi-star" size="32" />
  </div>
</template>
```

## 尺寸设置

支持多种尺寸设置方式：

```vue
<template>
  <div class="demo-container">
    <!-- 像素值 -->
    <XhIcon name="bsi-house" size="16" />
    <XhIcon name="bsi-house" size="24" />
    <XhIcon name="bsi-house" size="32" />

    <!-- em 单位 -->
    <XhIcon name="bsi-house" size="1em" />
    <XhIcon name="bsi-house" size="1.5em" />
    <XhIcon name="bsi-house" size="2em" />

    <!-- 缩放比例 -->
    <XhIcon name="bsi-house" scale="0.8" />
    <XhIcon name="bsi-house" scale="1.2" />
    <XhIcon name="bsi-house" scale="1.5" />
  </div>
</template>
```

## 动画效果

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-arrow-clockwise" animation="spin" />
    <XhIcon name="bsi-heart" animation="pulse" />
    <XhIcon name="bsi-lightning" animation="flash" />
    <XhIcon name="bsi-gear" animation="spin-pulse" />
    <XhIcon name="bsi-wrench" animation="wrench" />
    <XhIcon name="bsi-circle" animation="ring" />
    <XhIcon name="bsi-cloud" animation="float" />
  </div>
</template>
```

## 翻转效果

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-arrow-right" />
    <XhIcon name="bsi-arrow-right" flip="horizontal" />
    <XhIcon name="bsi-arrow-right" flip="vertical" />
    <XhIcon name="bsi-arrow-right" flip="both" />
  </div>
</template>
```

## 动画速度

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-arrow-clockwise" animation="spin" />
    <XhIcon name="bsi-arrow-clockwise" animation="spin" speed="fast" />
    <XhIcon name="bsi-arrow-clockwise" animation="spin" speed="slow" />
  </div>
</template>
```

## 交互效果

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-heart" hover />
    <XhIcon name="bsi-star" hover color="gold" />
    <XhIcon name="bsi-hand-thumbs-up" hover animation="pulse" />
  </div>
</template>
```

## 无障碍访问

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-house" title="首页" label="导航到首页" />
    <XhIcon name="bsi-heart" title="收藏" label="添加到收藏夹" />
  </div>
</template>
```

## 彩色图标

```vue
<template>
  <div class="demo-container">
    <!-- 彩色图标会保持原有颜色 -->
    <XhIcon name="fci-google" />
    <XhIcon name="fci-github" />
    <XhIcon name="fci-vue" />

    <!-- 也可以覆盖颜色 -->
    <XhIcon name="fci-heart" color="red" />
  </div>
</template>
```

## 组合使用

```vue
<template>
  <div class="demo-container">
    <XhIcon name="bsi-download" animation="float" hover color="blue" size="24" title="下载文件" label="点击下载" />

    <XhIcon name="bsi-upload" animation="pulse" flip="vertical" color="green" scale="1.2" speed="slow" />
  </div>
</template>
```

## API

### Props

| 属性      | 类型                                                                            | 默认值           | 说明                          |
| --------- | ------------------------------------------------------------------------------- | ---------------- | ----------------------------- |
| name      | `string`                                                                        | -                | 图标名称（必填）              |
| size      | `string \| number`                                                              | -                | 图标大小，支持像素值或CSS单位 |
| color     | `string`                                                                        | `'currentColor'` | 图标颜色                      |
| title     | `string`                                                                        | -                | 图标标题，用于无障碍访问      |
| scale     | `number \| string`                                                              | `1`              | 图标缩放比例                  |
| animation | `'spin' \| 'spin-pulse' \| 'wrench' \| 'ring' \| 'pulse' \| 'flash' \| 'float'` | -                | 动画效果                      |
| flip      | `'horizontal' \| 'vertical' \| 'both'`                                          | -                | 翻转方向                      |
| speed     | `'fast' \| 'slow'`                                                              | -                | 动画速度                      |
| label     | `string`                                                                        | -                | 图标标签，用于屏幕阅读器      |
| hover     | `boolean`                                                                       | `false`          | 是否启用悬停效果              |
| inverse   | `boolean`                                                                       | `false`          | 是否反转颜色                  |

### 注意事项

1. `size` 和 `scale` 属性可以同时使用，`size` 会被转换为 `scale` 值
2. 数字类型的 `size` 会被视为像素值，相对于 24px 基准计算缩放比例
3. 字符串类型的 `size` 支持 `px`、`em`、`rem` 等CSS单位
4. 彩色图标（如 `fci-*` 系列）会保持原有颜色，除非明确设置 `color` 属性
5. 所有动画效果都支持 CSS 自定义，可以通过样式覆盖调整
