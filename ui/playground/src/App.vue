<template>
  <div class="app">
    <header class="header">
      <h1>XiHan UI</h1>
      <div class="nav">
        <router-link to="/components" class="nav-link">组件</router-link>
        <router-link to="/icons" class="nav-link">图标</router-link>
      </div>
      <div class="theme-switch">
        <button @click="toggleTheme">
          {{ theme === "light" ? "🌙" : "☀️" }}
        </button>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { generateFingerprint } from "@xihan-ui/utils";

  const theme = ref("light");
  const fingerprint = ref("");

  // 在组件挂载时设置主题和获取指纹
  onMounted(async () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    theme.value = savedTheme;
    document.documentElement.setAttribute("data-theme", savedTheme);

    // 在onMounted中使用await
    fingerprint.value = await generateFingerprint();
    console.log("浏览器指纹：", fingerprint.value);
  });

  // 切换主题并保存到本地存储
  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme.value);
    localStorage.setItem("theme", theme.value);
  };
</script>

<style lang="scss">
  :root {
    --app-header-height: 64px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .app {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    background-color: var(--xh-bg-color);
    color: var(--xh-text-color);
    transition: all 0.3s;
  }

  .header {
    height: var(--app-header-height);
    padding: 0 20px;
    border-bottom: 1px solid var(--xh-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: var(--xh-bg-color);

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .nav {
      display: flex;
      gap: 16px;

      .nav-link {
        padding: 8px 16px;
        text-decoration: none;
        color: var(--xh-text-color);
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: var(--xh-border-color-light);
        }

        &.router-link-active {
          background-color: var(--xh-primary-color);
          color: white;
        }
      }
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
    padding-top: var(--app-header-height);
    flex: 1;
    overflow-y: auto;
    width: 100%;
    height: calc(100vh - var(--app-header-height));
  }
</style>
