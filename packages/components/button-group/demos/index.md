## 按钮组

使用 `<xh-button-group>` 标签来嵌套按钮。

```vue
<template>
  <xh-button-group>
    <xh-button type="primary">上一页</xh-button>
    <xh-button type="primary">下一页</xh-button>
  </xh-button-group>

  <xh-button-group>
    <xh-button type="primary" icon="edit">编辑</xh-button>
    <xh-button type="primary" icon="share">分享</xh-button>
    <xh-button type="primary" icon="delete">删除</xh-button>
  </xh-button-group>

  <xh-button-group size="small">
    <xh-button>小尺寸</xh-button>
    <xh-button>按钮组</xh-button>
  </xh-button-group>
</template>
```

### ButtonGroup API

#### 属性

| 属性名 | 说明                   | 类型   | 可选值                 | 默认值 |
| ------ | ---------------------- | ------ | ---------------------- | ------ |
| size   | 按钮组内按钮的统一尺寸 | string | small / medium / large | —      |

#### 插槽

| 插槽名  | 说明                                 |
| ------- | ------------------------------------ |
| default | 按钮组的内容，通常是多个 Button 组件 |
