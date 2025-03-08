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
            <span class="group-name">{{ getGroupName(group.name) }}</span>
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
          <h2 class="group-title">{{ getGroupName(activeGroup) }} ({{ displayedIcons.length }})</h2>
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
import { ref, reactive, computed, onMounted } from "vue";

interface IconItem {
  name: string;
  component: any;
}

interface IconGroup {
  name: string;
  count: number;
  icons?: IconItem[];
  loaded: boolean;
}

// 图标分组信息
const iconGroups = ref<IconGroup[]>([]);
const activeGroup = ref("");
const searchKeyword = ref("");
const copiedIcon = ref("");
const loading = ref(true);

// 缓存已加载的图标
const loadedIcons = reactive<Record<string, IconItem[]>>({});

// 初始化图标分组信息
onMounted(async () => {
  // 预设的图标分组信息
  const groupsInfo = [
    { name: "fi", displayName: "Feather Icons", count: 287 },
    { name: "ai", displayName: "Ant Design Icons", count: 789 },
    { name: "bi", displayName: "BoxIcons", count: 1500 },
    { name: "bs", displayName: "Bootstrap Icons", count: 1340 },
    { name: "ci", displayName: "Circum Icons", count: 282 },
    { name: "cg", displayName: "Carbon", count: 1784 },
    { name: "di", displayName: "Devicons", count: 191 },
    { name: "fa", displayName: "Font Awesome", count: 1612 },
    { name: "fc", displayName: "Flat Color Icons", count: 329 },
    { name: "gi", displayName: "Game Icons", count: 1063 },
    { name: "go", displayName: "Github Octicons", count: 458 },
    { name: "gr", displayName: "Grommet Icons", count: 614 },
    { name: "hi", displayName: "Heroicons", count: 452 },
    { name: "im", displayName: "IcoMoon", count: 491 },
    { name: "io", displayName: "Ionicons", count: 1332 },
    { name: "lia", displayName: "Line Awesome", count: 1544 },
    { name: "lu", displayName: "Lucide", count: 1024 },
    { name: "pi", displayName: "Phosphor Icons", count: 4804 },
    { name: "ri", displayName: "Remix Icons", count: 2271 },
    { name: "rx", displayName: "Radix Icons", count: 319 },
    { name: "si", displayName: "Simple Icons", count: 2309 },
    { name: "sl", displayName: "Simple Line Icons", count: 189 },
    { name: "tb", displayName: "Tabler Icons", count: 3460 },
    { name: "tfi", displayName: "Themify Icons", count: 352 },
    { name: "ti", displayName: "Typicons", count: 336 },
    { name: "vsc", displayName: "VS Code Icons", count: 1052 },
    { name: "wi", displayName: "Weather Icons", count: 219 }
  ];

  // 转换为内部数据结构
  iconGroups.value = groupsInfo.map(group => ({
    name: group.name,
    count: group.count,
    loaded: false
  }));

  // 默认选中第一个分组并加载
  if (iconGroups.value.length > 0) {
    activeGroup.value = iconGroups.value[0].name;
    await loadGroupIcons(activeGroup.value);
  }
});

// 异步加载图标组
const loadGroupIcons = async (groupName: string) => {
  // 如果已经加载过，直接返回缓存
  if (loadedIcons[groupName]) {
    return;
  }

  loading.value = true;

  try {
    // 动态导入特定前缀的图标
    const iconsModule = await import(`@xihan-ui/icons`);

    // 筛选出符合前缀的图标
    const filteredIcons: IconItem[] = [];
    for (const [name, component] of Object.entries(iconsModule)) {
      if (name === "default") continue;

      // 检查图标名称是否以指定前缀开头（忽略大小写）
      const prefix = name.slice(0, 2).toLowerCase();
      if (prefix === groupName.toLowerCase()) {
        filteredIcons.push({ name, component });
      }
    }

    // 缓存已加载的图标
    loadedIcons[groupName] = filteredIcons;

    // 更新分组信息中的实际数量
    const groupIndex = iconGroups.value.findIndex(g => g.name === groupName);
    if (groupIndex !== -1) {
      iconGroups.value[groupIndex].count = filteredIcons.length;
      iconGroups.value[groupIndex].loaded = true;
    }
  } catch (error) {
    console.error(`加载图标组 ${groupName} 失败:`, error);
    loadedIcons[groupName] = [];
  } finally {
    loading.value = false;
  }
};

// 根据搜索关键词和当前选中分组过滤图标
const displayedIcons = computed(() => {
  if (!loadedIcons[activeGroup.value]) {
    return [];
  }

  if (!searchKeyword.value) {
    return loadedIcons[activeGroup.value];
  }

  return loadedIcons[activeGroup.value].filter(icon =>
    icon.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 设置当前激活的分组
const setActiveGroup = async (groupName: string) => {
  activeGroup.value = groupName;

  // 如果该组图标还未加载，则加载
  if (!loadedIcons[groupName]) {
    await loadGroupIcons(groupName);
  }

  // 滚动到对应分组
  setTimeout(() => {
    const element = document.getElementById(`group-${groupName}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
};

// 获取图标组的中文名称
const getGroupName = (prefix: string) => {
  const group = iconGroups.value.find(g => g.name === prefix);
  if (group) {
    return group.displayName || prefix.toUpperCase();
  }

  const groupNames: Record<string, string> = {
    ci: "Circum Icons",
    fa: "Font Awesome",
    io: "Ionicons",
    ti: "Typicons",
    go: "Github Octicons",
    fi: "Feather Icons",
    lu: "Lucide",
    gi: "Game Icons",
    wi: "Weather Icons",
    di: "Devicons",
    ai: "Ant Design Icons",
    bs: "Bootstrap Icons",
    ri: "Remix Icons",
    fc: "Flat Color Icons",
    gr: "Grommet Icons",
    hi: "Heroicons",
    si: "Simple Icons",
    sl: "Simple Line Icons",
    im: "IcoMoon",
    bi: "BoxIcons",
    cg: "Carbon",
    vsc: "VS Code Icons",
    tb: "Tabler Icons",
    tfi: "Themify Icons",
    rx: "Radix Icons",
    pi: "Phosphor Icons",
    lia: "Line Awesome",
    "search-results": "搜索结果"
  };

  return groupNames[prefix] || prefix.toUpperCase();
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
