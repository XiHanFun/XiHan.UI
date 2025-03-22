<template>
  <div class="icon-explorer">
    <header class="icon-header">
      <h1>图标</h1>
      <div class="search-bar">
        <input type="text" v-model="searchKeyword" placeholder="搜索图标..." class="search-input" />
      </div>
    </header>

    <div class="icon-layout">
      <!-- 左侧分组导航 -->
      <aside class="icon-sidebar">
        <div class="sidebar-title">图标分组</div>
        <div class="group-list">
          <div
            v-for="group in iconGroups"
            :key="group.name"
            class="group-item"
            :class="{ active: activeGroup === group.name }"
            @click="setActiveGroup(group.name)"
          >
            <span class="group-name">{{ group.displayName }}</span>
            <span class="group-count">{{ group.count }}</span>
          </div>
        </div>
      </aside>

      <!-- 右侧图标内容 -->
      <main class="icon-content">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载图标...</p>
        </div>

        <div v-else-if="displayedIcons.length === 0" class="no-icons">
          <p>没有找到匹配的图标</p>
        </div>

        <section v-else class="icon-group" :id="`group-${activeGroup}`">
          <h2 class="group-title">{{ activeGroup }} ({{ displayedIcons.length }})</h2>
          <div class="icon-grid">
            <div
              v-for="icon in displayedIcons"
              :key="icon.name"
              class="icon-item"
              @click="copyIconName(icon.name)"
              :class="{ copied: copiedIcon === icon.name && copied }"
            >
              <div class="icon-wrapper">
                <component :is="icon.component" />
              </div>
              <div class="icon-name">
                {{ icon.name }}
                <span v-if="copiedIcon === icon.name && copied" class="copied-tooltip">已复制!</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { Icons } from "@xihan-ui/icons";

  // 定义响应式变量
  const searchKeyword = ref("");
  const loading = ref(true);
  const activeGroup = ref("");
  const copiedIcon = ref("");
  const copied = ref(false);

  // 将Icons数组转换为对象格式，以便于通过名称访问
  const iconsMap = computed(() => {
    return Icons.reduce(
      (acc, group) => {
        acc[group.name] = group;
        return acc;
      },
      {} as Record<string, any>,
    );
  });

  // 构建图标组列表
  const iconGroups = computed(() => {
    return Icons.map(group => ({
      name: group.name,
      displayName: group.displayName,
      count: group.count,
    }));
  });

  // 初始化当前选中的图标分组
  onMounted(() => {
    // 模拟加载效果
    setTimeout(() => {
      if (Icons.length > 0) {
        activeGroup.value = Icons[0].name;
      }
      loading.value = false;
    }, 500);
  });

  // 设置当前选中的图标分组
  const setActiveGroup = (name: string) => {
    activeGroup.value = name;
  };

  // 处理图标显示
  const displayedIcons = computed(() => {
    if (!activeGroup.value || !iconsMap.value[activeGroup.value]) {
      return [];
    }

    const groupData = iconsMap.value[activeGroup.value];

    // 过滤图标名称和非组件属性
    const iconsArray = Object.entries(groupData)
      .filter(([key]) => !["name", "displayName", "count"].includes(key))
      .map(([key, component]) => ({
        name: key,
        component,
      }));

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return iconsArray.filter(icon => icon.name.toLowerCase().includes(keyword));
    }

    return iconsArray;
  });

  // 复制图标名称
  const copyIconName = (name: string) => {
    navigator.clipboard
      .writeText(name)
      .then(() => {
        copiedIcon.value = name;
        copied.value = true;

        // 2秒后恢复
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      })
      .catch(err => {
        console.error("无法复制图标名称", err);
      });
  };
</script>

<style scoped>
  .icon-explorer {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    width: 100%;
    margin: 0 auto;
    padding: 0 16px;
  }

  .icon-header {
    position: sticky;
    top: 0;
    background-color: var(--xh-bg-color, #fff);
    padding: 16px 0;
    margin-bottom: 24px;
    z-index: 10;
    border-bottom: 1px solid var(--xh-border-color, rgba(0, 0, 0, 0.1));
  }

  .icon-header h1 {
    font-size: 28px;
    margin-bottom: 16px;
    color: var(--xh-text-color, #333);
  }

  .search-bar {
    position: relative;
    max-width: 600px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid var(--xh-border-color, #ddd);
    border-radius: 4px;
    transition: all 0.3s;
  }

  .search-input:focus {
    border-color: var(--xh-primary-color, #1890ff);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    outline: none;
  }

  /* 左右布局 */
  .icon-layout {
    display: flex;
    gap: 24px;
  }

  /* 左侧边栏 */
  .icon-sidebar {
    width: 200px;
    flex-shrink: 0;
    border-right: 1px solid var(--xh-border-color, #eee);
    padding-right: 16px;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--xh-border-color, #eee);
    color: var(--xh-text-color, #333);
  }

  .group-list {
    max-height: calc(100vh - 150px);
    overflow-y: auto;
  }

  .group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .group-item:hover {
    background-color: var(--xh-bg-hover, #f5f5f5);
  }

  .group-item.active {
    background-color: var(--xh-primary-color, #1890ff);
    color: white;
  }

  .group-name {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .group-count {
    font-size: 12px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 2px 6px;
    min-width: 24px;
    text-align: center;
  }

  .group-item.active .group-count {
    background-color: rgba(255, 255, 255, 0.2);
  }

  /* 右侧内容区 */
  .icon-content {
    flex: 1;
    padding-bottom: 40px;
    overflow-y: auto;
    max-height: calc(100vh - 150px);
    position: relative;
  }

  .icon-group {
    margin-bottom: 40px;
  }

  .group-title {
    font-size: 20px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--xh-border-color, #eee);
    color: var(--xh-text-color, #333);
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .icon-item:hover {
    background-color: var(--xh-bg-hover, #f9f9f9);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .copied {
    background-color: var(--xh-info-bg, #e6f7ff) !important;
    border: 1px solid var(--xh-info-border, #91d5ff);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    height: 40px;
    color: var(--xh-text-color-secondary, #666);
    margin-bottom: 8px;
  }

  .icon-name {
    font-size: 12px;
    text-align: center;
    color: var(--xh-text-color-secondary, #666);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    position: relative;
  }

  .copied-tooltip {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 2;
  }

  .no-icons {
    padding: 40px 0;
    text-align: center;
    color: var(--xh-text-color-secondary, #999);
  }

  .loading-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--xh-border-color, #f3f3f3);
    border-top: 3px solid var(--xh-primary-color, #1890ff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .icon-layout {
      flex-direction: column;
    }

    .icon-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid var(--xh-border-color, #eee);
      padding-right: 0;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }

    .group-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-height: none;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .group-item {
      flex: 0 0 auto;
    }

    .icon-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
    }

    .icon-item {
      padding: 12px 6px;
    }

    .icon-wrapper {
      font-size: 20px;
    }

    .icon-name {
      font-size: 10px;
    }
  }
</style>
