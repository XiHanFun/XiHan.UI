# @xihan-ui/icons

一个功能强大、高度可定制的 Vue 3 图标库，支持多种流行的图标集。

## 特性

✨ **支持多种图标集** - 集成了 30+ 个流行的图标库
🎨 **高度可定制** - 支持颜色、大小、动画等属性
⚡ **按需加载** - 支持 Tree Shaking，只打包使用的图标
🎯 **TypeScript 支持** - 完整的类型定义
🌐 **无障碍友好** - 符合 WAI-ARIA 规范
🎭 **丰富的动画效果** - 内置多种动画和变换效果

## 安装

```bash
npm install @xihan-ui/icons
# 或
pnpm add @xihan-ui/icons
# 或
yarn add @xihan-ui/icons
```

## 基础用法

```vue
<template>
  <div>
    <!-- 使用预定义图标 -->
    <TestHeart />
    <TestStar color="red" size="24" />

    <!-- 使用 IconBase 组件 -->
    <IconBase
      path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      color="gold"
      size="32"
    />
  </div>
</template>

<script setup>
  import { TestHeart, TestStar, IconBase } from "@xihan-ui/icons";
</script>
```

## API 参考

### IconBase Props

| 属性          | 类型                                   | 默认值           | 说明         |
| ------------- | -------------------------------------- | ---------------- | ------------ |
| `path`        | `string`                               | -                | SVG 路径数据 |
| `size`        | `string \| number`                     | `"1em"`          | 图标大小     |
| `color`       | `string`                               | `"currentColor"` | 图标颜色     |
| `fill`        | `string`                               | -                | 填充色       |
| `stroke`      | `string`                               | -                | 描边色       |
| `strokeWidth` | `string \| number`                     | -                | 描边宽度     |
| `spin`        | `boolean`                              | `false`          | 旋转动画     |
| `rotate`      | `number`                               | -                | 旋转角度     |
| `flip`        | `"horizontal" \| "vertical" \| "both"` | -                | 翻转方向     |
| `title`       | `string`                               | -                | 可访问性标题 |

### 动画效果

```vue
<template>
  <div>
    <!-- 旋转动画 -->
    <TestHeart spin />

    <!-- 脉冲动画 -->
    <TestStar class="xh-icon-pulse" />

    <!-- 闪烁动画 -->
    <TestHeart class="xh-icon-flash" />

    <!-- 浮动动画 -->
    <TestStar class="xh-icon-float" />
  </div>
</template>
```

### 尺寸变体

```vue
<template>
  <div>
    <TestHeart class="xh-icon-xs" />
    <!-- 0.75em -->
    <TestHeart class="xh-icon-sm" />
    <!-- 0.875em -->
    <TestHeart />
    <!-- 1em -->
    <TestHeart class="xh-icon-lg" />
    <!-- 1.25em -->
    <TestHeart class="xh-icon-xl" />
    <!-- 1.5em -->
    <TestHeart class="xh-icon-2xl" />
    <!-- 2em -->
  </div>
</template>
```

## 支持的图标集

| 前缀  | 图标集                | 许可证     | 数量  |
| ----- | --------------------- | ---------- | ----- |
| `Adi` | Ant Design Icons      | MIT        | ~800  |
| `Bxi` | BoxIcons              | MIT        | ~1600 |
| `Bsi` | Bootstrap Icons       | MIT        | ~1800 |
| `Fa`  | Font Awesome          | CC BY 4.0  | ~2000 |
| `Fei` | Feather               | MIT        | ~280  |
| `Hei` | Heroicons             | MIT        | ~230  |
| `Luc` | Lucide                | ISC        | ~1200 |
| `Mdi` | Material Design Icons | Apache-2.0 | ~7000 |
| ...   | ...                   | ...        | ...   |

## 开发

```bash
# 下载图标包
pnpm download

# 生成图标组件
pnpm generate

# 更新所有（下载 + 生成 + 构建）
pnpm update

# 构建
pnpm build
```

## 许可证

MIT License
