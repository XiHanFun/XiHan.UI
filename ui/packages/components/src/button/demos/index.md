# Button 按钮

常用的操作按钮，支持丰富的样式、图标和交互效果。

## 基础用法

基础的按钮用法。

```vue
<template>
  <xh-button>默认按钮</xh-button>
  <xh-button type="primary">主要按钮</xh-button>
  <xh-button type="success">成功按钮</xh-button>
  <xh-button type="warning">警告按钮</xh-button>
  <xh-button type="danger">危险按钮</xh-button>
  <xh-button type="info">信息按钮</xh-button>
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
  <xh-button type="primary" circle icon="bsi-plus">+</xh-button>
  <xh-button type="success" circle icon="bsi-check"></xh-button>
</template>
```

## 加载状态

通过 `loading` 属性设置按钮的加载状态。

```vue
<template>
  <xh-button loading>加载中</xh-button>
  <xh-button type="primary" loading>加载中</xh-button>
  <xh-button type="success" loading loading-icon="bsi-gear">自定义加载图标</xh-button>
</template>
```

## 图标按钮

使用 `icon` 属性为按钮添加图标。

```vue
<template>
  <xh-button icon="bsi-house">首页</xh-button>
  <xh-button type="primary" icon="bsi-download">下载</xh-button>
  <xh-button type="success" icon="bsi-check" icon-placement="right">确认</xh-button>

  <!-- 图标按钮 -->
  <xh-button icon="bsi-heart" circle></xh-button>
  <xh-button type="primary" icon="bsi-star" circle></xh-button>

  <!-- 自定义图标颜色和尺寸 -->
  <xh-button icon="bsi-heart" icon-color="red" icon-size="18">喜欢</xh-button>
</template>
```

## 文本按钮

使用 `text-button` 属性创建文本按钮。

```vue
<template>
  <xh-button text-button>文本按钮</xh-button>
  <xh-button text-button type="primary">主要文本</xh-button>
  <xh-button text-button type="danger">危险文本</xh-button>
</template>
```

## 链接按钮

使用 `link` 属性创建链接样式的按钮。

```vue
<template>
  <xh-button link>链接按钮</xh-button>
  <xh-button link type="primary">主要链接</xh-button>
  <xh-button link type="success">成功链接</xh-button>
</template>
```

## 块级按钮

使用 `block` 属性创建块级按钮。

```vue
<template>
  <xh-button block>块级按钮</xh-button>
  <xh-button type="primary" block>主要块级按钮</xh-button>
</template>
```

## 事件处理

按钮支持多种事件。

```vue
<template>
  <xh-button @click="handleClick" @focus="handleFocus" @blur="handleBlur"> 事件按钮 </xh-button>
</template>

<script setup>
  const handleClick = event => {
    console.log("按钮被点击", event);
  };

  const handleFocus = event => {
    console.log("按钮获得焦点", event);
  };

  const handleBlur = event => {
    console.log("按钮失去焦点", event);
  };
</script>
```

## 无障碍访问

支持完整的无障碍访问功能。

```vue
<template>
  <xh-button title="保存文档" label="点击保存当前文档" icon="bsi-save"> 保存 </xh-button>

  <xh-button type="danger" title="删除文件" label="警告：此操作将永久删除文件" icon="bsi-trash"> 删除 </xh-button>
</template>
```

## API

### 属性

| 属性名        | 说明                   | 类型            | 可选值                                                | 默认值               |
| ------------- | ---------------------- | --------------- | ----------------------------------------------------- | -------------------- |
| type          | 按钮类型               | string          | default / primary / success / warning / danger / info | default              |
| size          | 按钮尺寸               | string          | small / medium / large                                | medium               |
| icon          | 图标名称               | string          | —                                                     | —                    |
| iconPlacement | 图标位置               | string          | left / right                                          | left                 |
| iconColor     | 图标颜色               | string          | —                                                     | currentColor         |
| iconSize      | 图标尺寸               | string / number | —                                                     | 根据按钮尺寸自动计算 |
| plain         | 是否为朴素按钮         | boolean         | —                                                     | false                |
| round         | 是否为圆角按钮         | boolean         | —                                                     | false                |
| circle        | 是否为圆形按钮         | boolean         | —                                                     | false                |
| disabled      | 是否禁用               | boolean         | —                                                     | false                |
| loading       | 是否显示加载中状态     | boolean         | —                                                     | false                |
| loadingIcon   | 加载图标名称           | string          | —                                                     | bsi-arrow-clockwise  |
| block         | 是否为块级按钮         | boolean         | —                                                     | false                |
| textButton    | 是否为文本按钮         | boolean         | —                                                     | false                |
| link          | 是否为链接按钮         | boolean         | —                                                     | false                |
| nativeType    | 原生 type 属性         | string          | button / submit / reset                               | button               |
| autofocus     | 是否自动获取焦点       | boolean         | —                                                     | false                |
| text          | 按钮文本               | string          | —                                                     | —                    |
| title         | 按钮标题               | string          | —                                                     | —                    |
| label         | 按钮标签（无障碍访问） | string          | —                                                     | —                    |

### 事件

| 事件名 | 说明               | 回调参数            |
| ------ | ------------------ | ------------------- |
| click  | 点击按钮时触发     | (event: MouseEvent) |
| focus  | 按钮获得焦点时触发 | (event: FocusEvent) |
| blur   | 按钮失去焦点时触发 | (event: FocusEvent) |

### 插槽

| 插槽名  | 说明       |
| ------- | ---------- |
| default | 按钮的内容 |
| icon    | 自定义图标 |

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
    <xh-button type="primary" native-type="submit" :loading="submitting"> 提交 </xh-button>
    <xh-button native-type="reset">重置</xh-button>
  </form>
</template>

<script setup>
  import { ref } from "vue";

  const submitting = ref(false);

  const onSubmit = async () => {
    submitting.value = true;
    try {
      // 提交逻辑
      await submitForm();
    } finally {
      submitting.value = false;
    }
  };
</script>
```

### 按钮组合使用

```vue
<template>
  <div class="button-group">
    <xh-button type="primary" icon="bsi-arrow-left">上一步</xh-button>
    <xh-button type="primary" icon="bsi-arrow-right" icon-placement="right">下一步</xh-button>
  </div>
</template>
```

### 响应式设计

```vue
<template>
  <div class="responsive-buttons">
    <!-- 移动端使用块级按钮 -->
    <xh-button :block="isMobile" type="primary">
      {{ isMobile ? "移动端按钮" : "桌面端按钮" }}
    </xh-button>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from "vue";

  const isMobile = ref(false);

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };

  onMounted(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
  });
</script>
```

## 注意事项

1. 在使用 `loading` 状态时，按钮会自动变为禁用状态
2. 使用 `circle` 属性时，建议按钮内容保持为单个字符或仅使用图标
3. 按钮文字尽量控制在 2-4 个字符，过长的文字建议使用 `size="large"`
4. `textButton` 和 `link` 属性不能同时使用
5. 图标颜色默认继承按钮文字颜色，可通过 `iconColor` 属性自定义
6. 加载状态下会显示旋转动画，可通过 `loadingIcon` 自定义加载图标
