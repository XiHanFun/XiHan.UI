<template>
  <div class="theme-switch">
    <XhButton :type="theme === 'light' ? 'primary' : 'default'" @click="setMode('light')"> 亮色主题 </XhButton>
    <XhButton :type="theme === 'dark' ? 'primary' : 'default'" @click="setMode('dark')"> 暗色主题 </XhButton>
    <XhButton :type="mode === 'system' ? 'primary' : 'default'" @click="setMode('system')"> 跟随系统 </XhButton>
  </div>

  <!-- 按钮 -->
  <h1>按钮</h1>
  <h3>按钮类型</h3>
  <XhButton type="info">默认按钮</XhButton>
  <XhButton type="primary">主要按钮</XhButton>
  <XhButton type="success">成功按钮</XhButton>
  <XhButton type="warning">警告按钮</XhButton>
  <XhButton type="danger">危险按钮</XhButton>

  <h3>按钮尺寸</h3>
  <XhButton size="small">小按钮</XhButton>
  <XhButton size="medium">中按钮</XhButton>
  <XhButton size="large">大按钮</XhButton>

  <h3>按钮状态</h3>
  <XhButton disabled>禁用按钮</XhButton>
  <XhButton loading>加载中</XhButton>

  <h3>按钮圆角</h3>
  <XhButton round>圆角按钮</XhButton>
  <XhButton circle>圆形按钮</XhButton>

  <h3>按钮朴素</h3>
  <XhButton type="primary" plain>朴素按钮</XhButton>
  <XhButton type="primary">非朴素按钮</XhButton>

  <h3>按钮原生类型</h3>
  <XhButton native-type="button">按钮</XhButton>
  <XhButton native-type="submit">提交</XhButton>
  <XhButton native-type="reset">重置</XhButton>

  <h3>按钮自动获取焦点</h3>
  <XhButton autofocus>自动获取焦点</XhButton>

  <h3>图标按钮</h3>
  <XhButton icon="icon-search">搜索</XhButton>
  <XhButton icon="icon-edit" icon-placement="right">编辑</XhButton>
  <XhButton icon="icon-delete" circle></XhButton>

  <h3>块级按钮</h3>
  <XhButton type="primary" block>块级按钮</XhButton>

  <!-- 按钮分组 -->
  <h1>按钮组</h1>
  <h3>基础按钮组</h3>
  <XhButtonGroup size="small">
    <XhButton type="primary">按钮1</XhButton>
    <XhButton type="primary">按钮2</XhButton>
    <XhButton type="primary">按钮3</XhButton>
  </XhButtonGroup>

  <h3>垂直按钮组</h3>
  <XhButtonGroup vertical type="primary">
    <XhButton>按钮1</XhButton>
    <XhButton>按钮2</XhButton>
    <XhButton>按钮3</XhButton>
  </XhButtonGroup>

  <h3>圆角按钮组</h3>
  <XhButtonGroup round type="primary">
    <XhButton>按钮1</XhButton>
    <XhButton>按钮2</XhButton>
    <XhButton>按钮3</XhButton>
  </XhButtonGroup>

  <h3>朴素按钮组</h3>
  <XhButtonGroup plain type="primary">
    <XhButton>按钮1</XhButton>
    <XhButton>按钮2</XhButton>
    <XhButton>按钮3</XhButton>
  </XhButtonGroup>

  <h3>大尺寸按钮组</h3>
  <XhButtonGroup size="large">
    <XhButton type="primary">按钮1</XhButton>
    <XhButton type="primary">按钮2</XhButton>
    <XhButton type="primary">按钮3</XhButton>
  </XhButtonGroup>

  <!-- 图标 -->
  <h1>图标</h1>
  <div class="icons-demo">
    <!-- 基础用法 -->
    <XhIconClear />
    <XhIconSuccess color="green" />
    <XhIconWarning size="large" />
    <XhIconError />

    <!-- 主题和交互 -->
    <XhIconTrash theme="filled" />
    <XhIconAttach theme="two-tone" />
    <XhIconCancel theme="filled" :rotate="10" />
    <XhIconTo flip="horizontal" />
    <XhIconRetry clickable @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
  import { useTheme } from "@xihan-ui/hooks";
  import { iconManager } from "@xihan-ui/themes";

  const { mode, theme, setMode } = useTheme();

  const handleClick = () => {
    console.log("Icon clicked");
  };

  // 自定义图标配置
  iconManager.setConfig({
    defaultSize: "small",
    defaultTheme: "outline",
    defaultColor: "#333",
  });
</script>

<style scoped lang="scss">
  .theme-switch {
    margin-bottom: 20px;

    .xh-button + .xh-button {
      margin-left: 12px;
    }
  }

  .icons-demo {
    margin-top: 20px;
  }
</style>
