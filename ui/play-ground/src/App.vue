<template>
  <div class="app">
    <header class="header">
      <h1>XiHan UI</h1>
      <div class="theme-switch">
        <button @click="toggleTheme">
          {{ theme === "light" ? "🌙" : "☀️" }}
        </button>
      </div>
    </header>

    <main class="main">
      <section class="demo-section">
        <h2>按钮类型</h2>
        <div class="demo-row">
          <XhButton>默认按钮</XhButton>
          <XhButton type="primary">主要按钮</XhButton>
          <XhButton type="success">成功按钮</XhButton>
          <XhButton type="warning">警告按钮</XhButton>
          <XhButton type="danger">危险按钮</XhButton>
          <XhButton type="info">信息按钮</XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>朴素按钮</h2>
        <div class="demo-row">
          <XhButton plain>朴素按钮</XhButton>
          <XhButton type="primary" plain>主要按钮</XhButton>
          <XhButton type="success" plain>成功按钮</XhButton>
          <XhButton type="warning" plain>警告按钮</XhButton>
          <XhButton type="danger" plain>危险按钮</XhButton>
          <XhButton type="info" plain>信息按钮</XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>图标按钮</h2>
        <div class="demo-row">
          <XhButton :icon="FiEdit">编辑</XhButton>
          <XhButton :icon="FiTrash" type="danger">删除</XhButton>
        </div>
        <div class="demo-row">
          <XhButton :icon="FiEdit" iconPlacement="right">编辑</XhButton>
          <XhButton :icon="FiTrash" type="danger" iconPlacement="right">删除</XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>按钮尺寸</h2>
        <div class="demo-row">
          <XhButton size="small" type="primary">小型按钮</XhButton>
          <XhButton type="primary">默认按钮</XhButton>
          <XhButton size="large" type="primary">大型按钮</XhButton>
        </div>
        <div class="demo-row">
          <XhButton size="small" :icon="FiEdit" type="primary">编辑</XhButton>
          <XhButton :icon="FiEdit" type="primary">编辑</XhButton>
          <XhButton size="large" :icon="FiEdit" type="primary">编辑</XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>按钮形状</h2>
        <div class="demo-row">
          <XhButton round>圆角按钮</XhButton>
          <XhButton type="info" circle :icon="FiInfo"></XhButton>
          <XhButton type="warning" circle :icon="FiStar"></XhButton>
          <XhButton type="danger" circle :icon="FiTrash"></XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>加载状态</h2>
        <div class="demo-row">
          <XhButton loading>加载中</XhButton>
          <XhButton type="primary" loading>加载中</XhButton>
          <XhButton type="success" loading>加载中</XhButton>
          <XhButton type="warning" loading></XhButton>
          <XhButton type="danger" loading circle></XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>禁用状态</h2>
        <div class="demo-row">
          <XhButton disabled>禁用按钮</XhButton>
          <XhButton type="primary" disabled>禁用按钮</XhButton>
          <XhButton type="success" disabled plain>禁用按钮</XhButton>
          <XhButton type="info" disabled round>禁用按钮</XhButton>
          <XhButton type="danger" disabled circle :icon="FiTrash"></XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>块级按钮</h2>
        <div class="demo-row">
          <XhButton type="primary" block>块级按钮</XhButton>
          <XhButton type="success" block round>圆角块级按钮</XhButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>按钮组</h2>
        <div class="demo-row">
          <XhButtonGroup>
            <XhButton type="primary" :icon="FiChevronLeft">上一页</XhButton>
            <XhButton type="primary" :icon="FiChevronRight" iconPlacement="right">下一页</XhButton>
          </XhButtonGroup>
        </div>
        <div class="demo-row">
          <XhButtonGroup>
            <XhButton type="primary" :icon="FiEdit"></XhButton>
            <XhButton type="primary" :icon="FiTrash"></XhButton>
          </XhButtonGroup>
        </div>
        <div class="demo-row">
          <XhButtonGroup vertical>
            <XhButton type="primary" :icon="FiEdit">编辑</XhButton>
            <XhButton type="primary" :icon="FiTrash">删除</XhButton>
          </XhButtonGroup>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import {
    FiEdit,
    FiTrash,
    FiInfo,
    FiStar,
    FiChevronLeft,
    FiChevronRight,
    FiMessage as FiMessageSquare,
  } from "@xihan-ui/icons";

  const theme = ref("light");

  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme.value);
  };
</script>

<style lang="scss">
  .app {
    min-height: 100vh;
    background-color: var(--xh-bg-color);
    color: var(--xh-text-color);
    transition: all 0.3s;
  }

  .header {
    padding: 20px;
    border-bottom: 1px solid var(--xh-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .theme-switch {
      button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.3s;

        &:hover {
          background-color: var(--xh-border-color-light);
        }
      }
    }
  }

  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .demo-section {
    margin-bottom: 40px;

    h2 {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 20px;
      color: var(--xh-text-color);
      position: relative;
      padding-left: 12px;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background-color: var(--xh-primary-color);
        border-radius: 2px;
      }
    }
  }

  .demo-row {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
