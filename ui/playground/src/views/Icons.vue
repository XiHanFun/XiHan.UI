<template>
  <div class="icon-explorer">
    <header class="icon-header">
      <h1>图标库</h1>
      <div class="search-bar">
        <input type="text" v-model="searchKeyword" placeholder="搜索图标..." class="search-input" />
      </div>
      <div class="stats">
        <span>共 {{ totalIcons }} 个图标</span>
        <span v-if="searchKeyword">，找到 {{ filteredIcons.length }} 个匹配</span>
      </div>
    </header>

    <!-- 复制成功提示 -->
    <div v-if="showCopyTip" class="global-copy-tip">
      <span>已复制: {{ copiedIcon }}</span>
    </div>

    <div class="icon-layout">
      <!-- 左侧分组导航 -->
      <aside class="icon-sidebar">
        <div class="sidebar-title">图标分组</div>
        <div class="group-list">
          <div
            v-for="group in iconGroups"
            :key="group.id"
            class="group-item"
            :class="{ active: activeGroup === group.id }"
            @click="setActiveGroup(group.id)"
          >
            <span class="group-name">{{ group.name }}</span>
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

        <div v-else-if="!displayedIcons || displayedIcons.length === 0" class="no-icons">
          <p>没有找到匹配的图标</p>
        </div>

        <section v-else class="icon-section">
          <h2 class="section-title">
            {{ getActiveGroupDisplayName() }}
            <span class="count">({{ displayedIcons.length }})</span>
          </h2>
          <div class="icon-grid">
            <div
              v-for="iconName in displayedIcons"
              :key="iconName"
              class="icon-item"
              @click="copyIconName(iconName)"
              :class="{ copied: copiedIcon === iconName && showCopyTip }"
              :title="`点击复制: ${iconName}`"
            >
              <div class="icon-wrapper">
                <XhIcon :name="iconName" :scale="1" />
              </div>
              <div class="icon-name">
                {{ iconName }}
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
  import { IconBase, listIcons } from "@xihan-ui/icons";

  // 响应式数据
  const searchKeyword = ref("");
  const loading = ref(true);
  const activeGroup = ref("all");
  const copiedIcon = ref("");
  const showCopyTip = ref(false);

  // 获取所有已注册的图标
  const registeredIcons = computed(() => {
    return listIcons();
  });

  // 总图标数量
  const totalIcons = computed(() => {
    return Object.keys(registeredIcons.value).length;
  });

  // 根据前缀分组图标
  const groupedIcons = computed(() => {
    const grouped: Record<string, string[]> = { all: [] };

    Object.keys(registeredIcons.value).forEach(iconName => {
      // 添加到全部分组
      grouped.all.push(iconName);

      // 根据图标名称前缀分组 (kebab-case 格式: adi-account-book-fill -> adi)
      const parts = iconName.split("-");
      if (parts.length > 0) {
        const prefix = parts[0];
        if (!grouped[prefix]) {
          grouped[prefix] = [];
        }
        grouped[prefix].push(iconName);
      }
    });

    return grouped;
  });

  // 创建图标分组数据
  const iconGroups = computed(() => {
    const groups: Array<{ id: string; name: string; count: number }> = [];

    // 添加"全部"分组
    groups.push({
      id: "all",
      name: "全部图标",
      count: groupedIcons.value.all?.length || 0,
    });

    // 根据前缀创建分组
    const prefixMap: Record<string, string> = {
      fa: "Font Awesome",
      adi: "Ant Design Icons",
      bsi: "Bootstrap Icons",
      bxi: "BoxIcons",
      cii: "Circum Icons",
      csg: "CSS.GG",
      fci: "Flat Color Icons",
      fei: "Feather Icons",
      fli: "Fluent Icons",
      goi: "Google Icons",
      gri: "Grommet Icons",
      hei: "Heroicons",
      imf: "Iconify",
      ioi: "Ionicons",
      lia: "Lucide Icons",
      luc: "Lucide",
      phi: "Phosphor Icons",
      poi: "Polaris Icons",
      rdi: "Radix Icons",
      rmi: "Remix Icon",
      sii: "Simple Icons",
      sli: "Simple Line Icons",
      tbi: "Tabler Icons",
      tfi: "Themify Icons",
      tpi: "Typicons",
      vci: "VS Code Icons",
      wri: "Weather Icons",
    };

    Object.keys(groupedIcons.value).forEach(prefix => {
      if (prefix !== "all" && groupedIcons.value[prefix].length > 0) {
        groups.push({
          id: prefix,
          name: prefixMap[prefix] || prefix,
          count: groupedIcons.value[prefix].length,
        });
      }
    });

    return groups.sort((a, b) => {
      if (a.id === "all") return -1;
      if (b.id === "all") return 1;
      return a.name.localeCompare(b.name);
    });
  });

  // 过滤后的图标
  const filteredIcons = computed(() => {
    const currentGroupIcons = groupedIcons.value[activeGroup.value] || [];

    if (!searchKeyword.value) {
      return currentGroupIcons;
    }

    const keyword = searchKeyword.value.toLowerCase();
    return currentGroupIcons.filter(iconName => iconName.toLowerCase().includes(keyword));
  });

  // 显示的图标
  const displayedIcons = computed(() => {
    return filteredIcons.value;
  });

  // 初始化
  onMounted(() => {
    // 模拟加载效果
    setTimeout(() => {
      loading.value = false;
    }, 500);
  });

  // 设置当前选中的图标分组
  const setActiveGroup = (id: string) => {
    activeGroup.value = id;
  };

  // 复制图标名称
  const copyIconName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      copiedIcon.value = name;
      showCopyTip.value = true;

      // 2秒后隐藏提示
      setTimeout(() => {
        showCopyTip.value = false;
      }, 2000);
    } catch (err) {
      console.error("无法复制图标名称", err);
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = name;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      copiedIcon.value = name;
      showCopyTip.value = true;
      setTimeout(() => {
        showCopyTip.value = false;
      }, 2000);
    }
  };

  // 获取当前选中的图标分组的显示名称
  const getActiveGroupDisplayName = () => {
    const group = iconGroups.value.find(g => g.id === activeGroup.value);
    return group ? group.name : "未知分组";
  };
</script>

<style scoped>
  /* 全局复制成功提示 */
  .global-copy-tip {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    z-index: 9999;
    font-size: 14px;
    animation: fadeInOut 2s ease-in-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -10px);
    }
    10% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    90% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -10px);
    }
  }

  .icon-explorer {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    width: 100%;
    margin: 0 auto;
    padding: 0 16px;
    min-height: 100vh;
    background-color: #fafafa;
  }

  .icon-header {
    position: sticky;
    top: 0;
    background-color: #fff;
    padding: 20px 0;
    margin-bottom: 24px;
    z-index: 10;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .icon-header h1 {
    font-size: 32px;
    margin-bottom: 16px;
    color: #262626;
    font-weight: 600;
  }

  .search-bar {
    position: relative;
    max-width: 600px;
    margin-bottom: 12px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    transition: all 0.3s;
    background-color: #fff;
  }

  .search-input:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    outline: none;
  }

  .stats {
    color: #8c8c8c;
    font-size: 14px;
  }

  /* 左右布局 */
  .icon-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  /* 左侧边栏 */
  .icon-sidebar {
    width: 240px;
    flex-shrink: 0;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 120px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    color: #262626;
  }

  .group-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .group-item:hover {
    background-color: #f5f5f5;
  }

  .group-item.active {
    background-color: #1890ff;
    color: white;
  }

  .group-name {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .group-count {
    font-size: 12px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 2px 8px;
    min-width: 24px;
    text-align: center;
    margin-left: 8px;
  }

  .group-item.active .group-count {
    background-color: rgba(255, 255, 255, 0.2);
  }

  /* 右侧内容区 */
  .icon-content {
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    min-height: 600px;
  }

  .icon-section {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 24px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    color: #262626;
    font-weight: 600;
  }

  .count {
    color: #8c8c8c;
    font-weight: 400;
    font-size: 18px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid transparent;
    background-color: #fafafa;
  }

  .icon-item:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #e8e8e8;
  }

  .copied {
    background-color: #e6f7ff !important;
    border-color: #91d5ff !important;
    transform: scale(1.05);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    height: 48px;
    color: #595959;
    margin-bottom: 12px;
  }

  .icon-name {
    font-size: 12px;
    text-align: center;
    color: #8c8c8c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.4;
  }

  .no-icons {
    padding: 60px 0;
    text-align: center;
    color: #bfbfbf;
    font-size: 16px;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f0f0f0;
    border-top: 3px solid #1890ff;
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

  /* 响应式设计 */
  @media (max-width: 768px) {
    .icon-layout {
      flex-direction: column;
    }

    .icon-sidebar {
      width: 100%;
      position: static;
      max-height: none;
    }

    .group-list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .group-item {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .icon-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .icon-item {
      padding: 16px 8px;
    }

    .icon-wrapper {
      font-size: 24px;
      height: 40px;
    }

    .icon-name {
      font-size: 11px;
    }
  }

  @media (max-width: 480px) {
    .icon-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
    }

    .icon-item {
      padding: 12px 6px;
    }

    .icon-wrapper {
      font-size: 20px;
      height: 36px;
    }
  }
</style>
