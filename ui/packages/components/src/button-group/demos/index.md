# ButtonGroup 按钮组

使用 `<xh-button-group>` 标签来嵌套按钮，支持统一样式管理和键盘导航。

## 基础用法

基础的按钮组用法。

```vue
<template>
  <xh-button-group>
    <xh-button type="primary">上一页</xh-button>
    <xh-button type="primary">下一页</xh-button>
  </xh-button-group>

  <xh-button-group>
    <xh-button type="primary" icon="bsi-pencil">编辑</xh-button>
    <xh-button type="primary" icon="bsi-share">分享</xh-button>
    <xh-button type="primary" icon="bsi-trash">删除</xh-button>
  </xh-button-group>
</template>
```

## 按钮组尺寸

通过 `size` 属性统一设置按钮组内所有按钮的尺寸。

```vue
<template>
  <xh-button-group size="small">
    <xh-button>小尺寸</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>

  <xh-button-group size="medium">
    <xh-button>中等尺寸</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>

  <xh-button-group size="large">
    <xh-button>大尺寸</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>
</template>
```

## 按钮组类型

通过 `type` 属性统一设置按钮组内所有按钮的类型。

```vue
<template>
  <xh-button-group type="primary">
    <xh-button>主要</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>

  <xh-button-group type="success">
    <xh-button>成功</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>

  <xh-button-group type="warning">
    <xh-button>警告</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>
</template>
```

## 垂直按钮组

通过 `vertical` 属性创建垂直排列的按钮组。

```vue
<template>
  <xh-button-group vertical>
    <xh-button type="primary">按钮一</xh-button>
    <xh-button type="primary">按钮二</xh-button>
    <xh-button type="primary">按钮三</xh-button>
  </xh-button-group>
</template>
```

## 朴素按钮组

通过 `plain` 属性创建朴素按钮组。

```vue
<template>
  <xh-button-group plain>
    <xh-button type="primary">朴素</xh-button>
    <xh-button type="primary">按钮组</xh-button>
  </xh-button-group>
</template>
```

## 圆角按钮组

通过 `round` 属性创建圆角按钮组。

```vue
<template>
  <xh-button-group round>
    <xh-button type="primary">圆角</xh-button>
    <xh-button type="primary">按钮组</xh-button>
  </xh-button-group>
</template>
```

## 禁用按钮组

通过 `disabled` 属性禁用整个按钮组。

```vue
<template>
  <xh-button-group disabled>
    <xh-button type="primary">禁用</xh-button>
    <xh-button type="primary">按钮组</xh-button>
  </xh-button-group>
</template>
```

## 事件处理

按钮组支持多种事件，并提供按钮索引。

```vue
<template>
  <xh-button-group @click="handleClick" @focus="handleFocus" @blur="handleBlur">
    <xh-button type="primary">按钮一</xh-button>
    <xh-button type="primary">按钮二</xh-button>
    <xh-button type="primary">按钮三</xh-button>
  </xh-button-group>
</template>

<script setup>
  const handleClick = (event, index) => {
    console.log(`第 ${index + 1} 个按钮被点击`, event);
  };

  const handleFocus = (event, index) => {
    console.log(`第 ${index + 1} 个按钮获得焦点`, event);
  };

  const handleBlur = (event, index) => {
    console.log(`第 ${index + 1} 个按钮失去焦点`, event);
  };
</script>
```

## 键盘导航

按钮组支持完整的键盘导航功能。

```vue
<template>
  <xh-button-group role="toolbar" title="工具栏" label="文档编辑工具栏">
    <xh-button type="primary" icon="bsi-type-bold">粗体</xh-button>
    <xh-button type="primary" icon="bsi-type-italic">斜体</xh-button>
    <xh-button type="primary" icon="bsi-type-underline">下划线</xh-button>
  </xh-button-group>
</template>
```

**键盘操作说明：**

- `Arrow Left/Up`: 移动到上一个按钮
- `Arrow Right/Down`: 移动到下一个按钮
- `Home`: 移动到第一个按钮
- `End`: 移动到最后一个按钮

## 无障碍访问

支持完整的无障碍访问功能。

```vue
<template>
  <xh-button-group role="radiogroup" title="选择对齐方式" label="文本对齐选项">
    <xh-button type="primary" icon="bsi-text-left">左对齐</xh-button>
    <xh-button type="primary" icon="bsi-text-center">居中</xh-button>
    <xh-button type="primary" icon="bsi-text-right">右对齐</xh-button>
  </xh-button-group>
</template>
```

## 复杂示例

结合多种属性的复杂用法。

```vue
<template>
  <div class="demo-container">
    <!-- 工具栏按钮组 -->
    <xh-button-group type="primary" size="small" role="toolbar" title="编辑工具栏" @click="handleToolbarClick">
      <xh-button icon="bsi-save" title="保存">保存</xh-button>
      <xh-button icon="bsi-copy" title="复制">复制</xh-button>
      <xh-button icon="bsi-clipboard" title="粘贴">粘贴</xh-button>
    </xh-button-group>

    <!-- 分页按钮组 -->
    <xh-button-group round>
      <xh-button :disabled="currentPage === 1" @click="prevPage"> 上一页 </xh-button>
      <xh-button disabled>{{ currentPage }} / {{ totalPages }}</xh-button>
      <xh-button :disabled="currentPage === totalPages" @click="nextPage"> 下一页 </xh-button>
    </xh-button-group>

    <!-- 垂直操作按钮组 -->
    <xh-button-group vertical plain type="success">
      <xh-button icon="bsi-plus">新增</xh-button>
      <xh-button icon="bsi-pencil">编辑</xh-button>
      <xh-button icon="bsi-trash" type="danger">删除</xh-button>
    </xh-button-group>
  </div>
</template>

<script setup>
  import { ref } from "vue";

  const currentPage = ref(1);
  const totalPages = ref(10);

  const handleToolbarClick = (event, index) => {
    const actions = ["save", "copy", "paste"];
    console.log(`执行操作: ${actions[index]}`);
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
</script>
```

## API

### 属性

| 属性名   | 说明                     | 类型    | 可选值                                                | 默认值  |
| -------- | ------------------------ | ------- | ----------------------------------------------------- | ------- |
| size     | 按钮组内按钮的统一尺寸   | string  | small / medium / large                                | medium  |
| type     | 按钮组内按钮的统一类型   | string  | default / primary / success / warning / danger / info | default |
| vertical | 是否为垂直按钮组         | boolean | —                                                     | false   |
| round    | 是否为圆角按钮组         | boolean | —                                                     | false   |
| plain    | 是否为朴素按钮组         | boolean | —                                                     | false   |
| disabled | 是否禁用整个按钮组       | boolean | —                                                     | false   |
| title    | 按钮组标题               | string  | —                                                     | —       |
| label    | 按钮组标签（无障碍访问） | string  | —                                                     | —       |
| role     | 按钮组角色               | string  | group / toolbar / radiogroup                          | group   |

### 事件

| 事件名 | 说明                 | 回调参数                           |
| ------ | -------------------- | ---------------------------------- |
| click  | 按钮组内按钮被点击   | (event: MouseEvent, index: number) |
| focus  | 按钮组内按钮获得焦点 | (event: FocusEvent, index: number) |
| blur   | 按钮组内按钮失去焦点 | (event: FocusEvent, index: number) |

### 插槽

| 插槽名  | 说明                                 |
| ------- | ------------------------------------ |
| default | 按钮组的内容，通常是多个 Button 组件 |

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式：

| 名称                            | 说明           | 默认值                 |
| ------------------------------- | -------------- | ---------------------- |
| --xh-button-group-border-color  | 按钮组边框颜色 | var(--xh-border-color) |
| --xh-button-group-border-radius | 按钮组圆角大小 | 4px                    |
| --xh-button-group-gap           | 按钮组间距     | 0                      |

## 最佳实践

### 工具栏使用

```vue
<template>
  <xh-button-group role="toolbar" title="文档编辑工具栏">
    <xh-button icon="bsi-type-bold" :class="{ active: isBold }" @click="toggleBold"> 粗体 </xh-button>
    <xh-button icon="bsi-type-italic" :class="{ active: isItalic }" @click="toggleItalic"> 斜体 </xh-button>
  </xh-button-group>
</template>
```

### 分页组件

```vue
<template>
  <xh-button-group>
    <xh-button :disabled="!hasPrev" @click="goPrev"> 上一页 </xh-button>
    <xh-button
      v-for="page in visiblePages"
      :key="page"
      :type="page === currentPage ? 'primary' : 'default'"
      @click="goToPage(page)"
    >
      {{ page }}
    </xh-button>
    <xh-button :disabled="!hasNext" @click="goNext"> 下一页 </xh-button>
  </xh-button-group>
</template>
```

### 响应式设计

```vue
<template>
  <xh-button-group :vertical="isMobile">
    <xh-button>按钮一</xh-button>
    <xh-button>按钮二</xh-button>
    <xh-button>按钮三</xh-button>
  </xh-button-group>
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

1. 按钮组会覆盖子按钮的 `size`、`type`、`plain`、`round` 等属性
2. 子按钮的个别属性（如 `disabled`）仍然有效，不会被按钮组覆盖
3. 键盘导航只在非禁用的按钮之间移动
4. 使用 `role="toolbar"` 时，建议为每个按钮设置 `title` 属性
5. 垂直按钮组在移动端体验更好
6. 按钮组内的按钮会自动处理边框合并，无需额外样式
