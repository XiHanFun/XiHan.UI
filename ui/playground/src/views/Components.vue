<template>
  <div class="components-page">
    <h1>组件列表</h1>

    <div class="component-list">
      <div class="component-item">
        <h2>按钮 Button</h2>
        <router-link to="/components/button">查看演示</router-link>
      </div>

      <div class="component-item">
        <h2>按钮组 ButtonGroup</h2>
        <router-link to="/components/button-group">查看演示</router-link>
      </div>

      <div class="component-item">
        <h2>图标 Icons</h2>
        <router-link to="/components/icon">查看演示</router-link>
      </div>
    </div>

    <!-- 子路由显示区域 -->
    <div class="component-demo">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
  // 导入 @/components 下的组件 (使用相对路径)
  import Button from "../components/Button.vue";
  import ButtonGroup from "../components/ButtonGroup.vue";
  import Icons from "../components/Icons.vue";

  // 组件引用，确保组件被正确导入
  const components = {
    Button,
    ButtonGroup,
    Icons,
  };
</script>
