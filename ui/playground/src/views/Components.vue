<template>
  <div class="component-explorer">
    <header class="component-header">
      <h1>组件</h1>
      <div class="search-bar">
        <input type="text" v-model="searchKeyword" placeholder="搜索组件..." class="search-input" />
      </div>
    </header>

    <div class="component-layout">
      <!-- 左侧分组导航 -->
      <aside class="component-sidebar">
        <div class="sidebar-title">组件分类</div>
        <div class="group-list">
          <div
            v-for="group in componentGroups"
            :key="group.name"
            class="group-item"
            :class="{ active: activeGroup === group.name }"
            @click="setActiveGroup(group.name)"
          >
            <span class="group-name">{{ getGroupName(group.name) }}</span>
            <span class="group-count">{{ group.components.length }}</span>
          </div>
        </div>
      </aside>

      <!-- 右侧组件内容 -->
      <main class="component-content">
        <div v-if="filteredComponents.length === 0" class="no-components">
          <p>没有找到匹配的组件</p>
        </div>

        <section v-for="group in displayedGroups" :key="group.name" class="component-group" :id="`group-${group.name}`">
          <h2 class="group-title">{{ getGroupName(group.name) }} ({{ group.components.length }})</h2>

          <!-- 组件展示区 -->
          <div class="component-demo-grid">
            <div
              v-for="component in group.components"
              :key="component.name"
              class="component-demo-item"
              @click="navigateToComponent(component)"
            >
              <div class="component-name">{{ component.name }}</div>
              <div class="component-demo">
                <component :is="component.demo" />
              </div>
            </div>
          </div>
        </section>

        <!-- 子路由内容区域 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";

  interface ComponentItem {
    name: string;
    demo: any;
    description?: string;
  }

  interface ComponentGroup {
    name: string;
    components: ComponentItem[];
  }

  const searchKeyword = ref("");
  const activeGroup = ref("");
  const componentGroups = ref<ComponentGroup[]>([]);

  // 组件分组信息（示例数据）
  onMounted(() => {
    componentGroups.value = [
      {
        name: "basic",
        components: [
          { name: "Button 按钮", demo: null },
          { name: "ButtonGroup 按钮组", demo: null },
        ],
      },
      {
        name: "layout",
        components: [
          { name: "Divider 分割线", demo: null },
          { name: "Grid 栅格", demo: null },
          { name: "Space 间距", demo: null },
        ],
      },
      {
        name: "navigation",
        components: [
          { name: "Menu 导航菜单", demo: null },
          { name: "Pagination 分页", demo: null },
          { name: "Tabs 标签页", demo: null },
          { name: "Breadcrumb 面包屑", demo: null },
        ],
      },
      {
        name: "data-entry",
        components: [
          { name: "Form 表单", demo: null },
          { name: "Input 输入框", demo: null },
          { name: "Select 选择器", demo: null },
          { name: "Checkbox 复选框", demo: null },
          { name: "Radio 单选框", demo: null },
          { name: "Switch 开关", demo: null },
        ],
      },
      {
        name: "data-display",
        components: [
          { name: "Table 表格", demo: null },
          { name: "Card 卡片", demo: null },
          { name: "Tag 标签", demo: null },
          { name: "Progress 进度条", demo: null },
        ],
      },
      {
        name: "feedback",
        components: [
          { name: "Alert 警告", demo: null },
          { name: "Modal 对话框", demo: null },
          { name: "Message 消息提示", demo: null },
          { name: "Notification 通知", demo: null },
          { name: "Popover 气泡卡片", demo: null },
        ],
      },
      {
        name: "other",
        components: [
          { name: "ColorPicker 颜色选择器", demo: null },
          { name: "Upload 上传", demo: null },
        ],
      },
    ];

    // 设置默认选中第一个分组
    if (componentGroups.value.length > 0) {
      activeGroup.value = componentGroups.value[0].name;
    }
  });

  // 根据搜索关键字过滤组件
  const filteredComponents = computed(() => {
    if (!searchKeyword.value) {
      return componentGroups.value.flatMap(group => group.components);
    }

    return componentGroups.value
      .flatMap(group => group.components)
      .filter(component => component.name.toLowerCase().includes(searchKeyword.value.toLowerCase()));
  });

  // 根据当前选中的分组和搜索条件显示组件
  const displayedGroups = computed(() => {
    // 如果有搜索关键词
    if (searchKeyword.value) {
      // 创建一个新的分组，包含所有匹配的组件
      return [
        {
          name: "search-results",
          components: filteredComponents.value,
        },
      ];
    }

    // 如果选中了特定分组，仅显示该分组
    if (activeGroup.value) {
      return componentGroups.value.filter(group => group.name === activeGroup.value);
    }

    // 默认显示所有分组
    return componentGroups.value;
  });

  // 设置当前激活的分组
  const setActiveGroup = (groupName: string) => {
    activeGroup.value = groupName;

    // 滚动到对应分组
    setTimeout(() => {
      const element = document.getElementById(`group-${groupName}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // 获取分组的中文名称
  const getGroupName = (name: string) => {
    const groupNames: Record<string, string> = {
      basic: "基础组件",
      layout: "布局组件",
      navigation: "导航组件",
      "data-entry": "数据录入",
      "data-display": "数据展示",
      feedback: "反馈组件",
      other: "其他组件",
      "search-results": "搜索结果",
    };

    return groupNames[name] || name;
  };

  // 导航到组件子路由
  const router = useRouter();

  const navigateToComponent = (component: ComponentItem) => {
    const componentName = component.name.split(" ")[0].toLowerCase();
    if (componentName === "button") {
      router.push("/components/button");
    } else if (componentName === "buttongroup") {
      router.push("/components/button-group");
    } else {
      console.log(`暂未实现组件 ${component.name} 的路由`);
    }
  };
</script>

<style lang="scss" scoped>
  .component-explorer {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    width: 100%;
    margin: 0 auto;
    padding: 0 16px;
  }

  .component-header {
    position: sticky;
    top: 0;
    background-color: var(--xh-bg-color);
    padding: 16px 0;
    margin-bottom: 24px;
    z-index: 10;
    border-bottom: 1px solid var(--xh-border-color);
  }

  .component-header h1 {
    font-size: 28px;
    margin-bottom: 16px;
    color: var(--xh-text-color);
  }

  .search-bar {
    position: relative;
    max-width: 600px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid var(--xh-border-color);
    border-radius: 4px;
    transition: all 0.3s;
  }

  .search-input:focus {
    border-color: var(--xh-primary-color);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    outline: none;
  }

  /* 左右布局 */
  .component-layout {
    display: flex;
    gap: 24px;
  }

  /* 左侧边栏 */
  .component-sidebar {
    width: 200px;
    flex-shrink: 0;
    border-right: 1px solid var(--xh-border-color);
    padding-right: 16px;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--xh-border-color);
    color: var(--xh-text-color);
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
    background-color: var(--xh-bg-hover);
  }

  .group-item.active {
    background-color: var(--xh-primary-color);
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
  .component-content {
    flex: 1;
    padding-bottom: 40px;
    overflow-y: auto;
    max-height: calc(100vh - 150px);
  }

  .component-group {
    margin-bottom: 40px;
  }

  .group-title {
    font-size: 20px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--xh-border-color);
    color: var(--xh-text-color);
  }

  .component-demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .component-demo-item {
    border: 1px solid var(--xh-border-color);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
  }

  .component-demo-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .component-name {
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 500;
    border-bottom: 1px solid var(--xh-border-color);
    background-color: var(--xh-bg-color);
  }

  .component-demo {
    padding: 24px;
    background-color: var(--xh-bg-color);
  }

  .no-components {
    padding: 40px 0;
    text-align: center;
    color: var(--xh-text-color-secondary);
  }

  /* 组件演示容器 */
  .component-section {
    margin-bottom: 40px;
  }

  @media (max-width: 768px) {
    .component-layout {
      flex-direction: column;
    }

    .component-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid var(--xh-border-color);
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

    .component-demo-grid {
      grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    }
  }

  /* 子路由过渡动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
