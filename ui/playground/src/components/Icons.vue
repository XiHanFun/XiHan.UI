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
            :class="{
              active: activeGroup === group.id,
              'is-colored': group.isColored === true,
              'is-special': group.category === 'special',
            }"
            @click="setActiveGroup(group.id)"
            :title="group.name"
          >
            <div class="group-info">
              <div class="group-name">{{ group.name }}</div>
              <div class="group-meta">
                <div class="group-badges">
                  <span v-if="group.isColored === true" class="color-badge">彩色</span>
                  <span v-else-if="group.isColored === false && group.category !== 'special'" class="mono-badge"
                    >单色</span
                  >
                </div>
                <span class="group-count">{{ group.count }}</span>
              </div>
            </div>
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
              :class="{
                copied: copiedIcon === iconName && showCopyTip,
              }"
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
  import * as iconsInfo from "@xihan-ui/icons/packs";

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

  // 判断是否为彩色图标
  const isColoredIcon = (iconName: string): boolean => {
    // 彩色图标库的前缀
    const coloredPrefixes = [
      "fci", // Flat Color Icons
      "csg", // CSS.GG (部分彩色)
      "goi", // Google Icons (部分彩色)
      "poi", // Pokemon Icons (彩色)
      "imf", // Iconify (部分彩色)
    ];

    const prefix = iconName.split("-")[0];
    return coloredPrefixes.includes(prefix);
  };

  // 根据前缀分组图标
  const groupedIcons = computed(() => {
    const grouped: Record<string, string[]> = { all: [], colored: [], monochrome: [] };

    Object.keys(registeredIcons.value).forEach(iconName => {
      // 添加到全部分组
      grouped.all.push(iconName);

      // 根据是否为彩色图标分组
      if (isColoredIcon(iconName)) {
        grouped.colored.push(iconName);
      } else {
        grouped.monochrome.push(iconName);
      }

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
    const groups: Array<{
      id: string;
      name: string;
      count: number;
      isColored?: boolean;
      category?: string;
    }> = [];

    // 添加特殊分组
    groups.push({
      id: "all",
      name: "全部图标",
      count: groupedIcons.value.all?.length || 0,
      category: "special",
    });

    // 根据前缀创建分组
    const prefixMap: Record<
      string,
      {
        name: string;
        isColored: boolean;
        category: string;
      }
    > = {
      fa: { name: "Font Awesome", isColored: false, category: "popular" },
      adi: { name: "Ant Design Icons", isColored: false, category: "design-system" },
      bsi: { name: "Bootstrap Icons", isColored: false, category: "popular" },
      bxi: { name: "BoxIcons", isColored: false, category: "general" },
      cii: { name: "Circum Icons", isColored: false, category: "general" },
      csg: { name: "CSS.GG", isColored: true, category: "general" },
      fci: { name: "Flat Color Icons", isColored: true, category: "colored" },
      fei: { name: "Feather Icons", isColored: false, category: "popular" },
      fli: { name: "Fluent Icons", isColored: false, category: "design-system" },
      goi: { name: "Google Icons", isColored: true, category: "design-system" },
      gri: { name: "Grommet Icons", isColored: false, category: "general" },
      hei: { name: "Heroicons", isColored: false, category: "popular" },
      imf: { name: "Iconify", isColored: true, category: "general" },
      ioi: { name: "Ionicons", isColored: false, category: "mobile" },
      lia: { name: "Lucide Icons", isColored: false, category: "popular" },
      luc: { name: "Lucide", isColored: false, category: "popular" },
      phi: { name: "Phosphor Icons", isColored: false, category: "general" },
      poi: { name: "Pokemon Icons", isColored: true, category: "themed" },
      rdi: { name: "Radix Icons", isColored: false, category: "design-system" },
      rmi: { name: "Remix Icon", isColored: false, category: "general" },
      sii: { name: "Simple Icons", isColored: false, category: "brand" },
      sli: { name: "Simple Line Icons", isColored: false, category: "general" },
      tbi: { name: "Tabler Icons", isColored: false, category: "popular" },
      tfi: { name: "Themify Icons", isColored: false, category: "general" },
      tpi: { name: "Typicons", isColored: false, category: "general" },
      vci: { name: "VS Code Icons", isColored: false, category: "development" },
      wri: { name: "Weather Icons", isColored: false, category: "themed" },
    };

    Object.keys(groupedIcons.value).forEach(prefix => {
      if (!["all", "colored", "monochrome"].includes(prefix) && groupedIcons.value[prefix].length > 0) {
        const info = prefixMap[prefix];
        groups.push({
          id: prefix,
          name: info?.name || prefix,
          count: groupedIcons.value[prefix].length,
          isColored: info?.isColored || false,
          category: info?.category || "general",
        });
      }
    });

    // 按字母排序
    return groups.sort((a, b) => {
      // 特殊分组排在前面
      if (a.category === "special" && b.category !== "special") return -1;
      if (b.category === "special" && a.category !== "special") return 1;

      // 特殊分组内部排序（只有 all 分组）
      if (a.category === "special" && b.category === "special") {
        return 0; // 只有一个特殊分组，无需排序
      }

      // 其他分组按名称字母排序
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
