<template>
  <div class="button-group-comprehensive-demo">
    <h2>ButtonGroup 组件综合演示</h2>

    <section class="demo-section">
      <h3>基础按钮组</h3>
      <div class="demo-row">
        <XhButtonGroup>
          <XhButton>按钮一</XhButton>
          <XhButton>按钮二</XhButton>
          <XhButton>按钮三</XhButton>
        </XhButtonGroup>
      </div>
    </section>

    <section class="demo-section">
      <h3>按钮组类型</h3>
      <div class="demo-column">
        <XhButtonGroup type="primary">
          <XhButton>主要</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup type="success">
          <XhButton>成功</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup type="warning">
          <XhButton>警告</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup type="danger">
          <XhButton>危险</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>
      </div>
    </section>

    <section class="demo-section">
      <h3>按钮组尺寸</h3>
      <div class="demo-column">
        <XhButtonGroup size="small">
          <XhButton>小尺寸</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup size="medium">
          <XhButton>中等尺寸</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup size="large">
          <XhButton>大尺寸</XhButton>
          <XhButton>按钮组</XhButton>
        </XhButtonGroup>
      </div>
    </section>

    <section class="demo-section">
      <h3>垂直按钮组</h3>
      <div class="demo-row">
        <XhButtonGroup vertical>
          <XhButton type="primary">按钮一</XhButton>
          <XhButton type="primary">按钮二</XhButton>
          <XhButton type="primary">按钮三</XhButton>
        </XhButtonGroup>

        <XhButtonGroup vertical plain>
          <XhButton type="success">新增</XhButton>
          <XhButton type="warning">编辑</XhButton>
          <XhButton type="danger">删除</XhButton>
        </XhButtonGroup>
      </div>
    </section>

    <section class="demo-section">
      <h3>按钮组样式</h3>
      <div class="demo-column">
        <XhButtonGroup plain>
          <XhButton type="primary">朴素</XhButton>
          <XhButton type="primary">按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup round>
          <XhButton type="success">圆角</XhButton>
          <XhButton type="success">按钮组</XhButton>
        </XhButtonGroup>

        <XhButtonGroup disabled>
          <XhButton type="warning">禁用</XhButton>
          <XhButton type="warning">按钮组</XhButton>
        </XhButtonGroup>
      </div>
    </section>

    <section class="demo-section">
      <h3>工具栏按钮组</h3>
      <div class="demo-column">
        <XhButtonGroup role="toolbar" title="文档编辑工具栏" label="文档编辑工具" @click="handleToolbarClick">
          <XhButton icon="bsi-type-bold" title="粗体">B</XhButton>
          <XhButton icon="bsi-type-italic" title="斜体">I</XhButton>
          <XhButton icon="bsi-type-underline" title="下划线">U</XhButton>
        </XhButtonGroup>

        <XhButtonGroup role="toolbar" type="primary" size="small" title="文件操作工具栏">
          <XhButton icon="bsi-save" title="保存">保存</XhButton>
          <XhButton icon="bsi-copy" title="复制">复制</XhButton>
          <XhButton icon="bsi-clipboard" title="粘贴">粘贴</XhButton>
          <XhButton icon="bsi-trash" title="删除">删除</XhButton>
        </XhButtonGroup>
      </div>
    </section>

    <section class="demo-section">
      <h3>分页按钮组</h3>
      <div class="demo-row">
        <XhButtonGroup @click="handlePaginationClick">
          <XhButton :disabled="currentPage === 1">上一页</XhButton>
          <XhButton v-for="page in visiblePages" :key="page" :type="page === currentPage ? 'primary' : 'default'">
            {{ page }}
          </XhButton>
          <XhButton :disabled="currentPage === totalPages">下一页</XhButton>
        </XhButtonGroup>
      </div>
      <div class="pagination-info">当前页: {{ currentPage }} / {{ totalPages }}</div>
    </section>

    <section class="demo-section">
      <h3>单选按钮组</h3>
      <div class="demo-column">
        <XhButtonGroup role="radiogroup" title="文本对齐方式" label="选择文本对齐方式" @click="handleAlignmentClick">
          <XhButton icon="bsi-text-left" :type="alignment === 'left' ? 'primary' : 'default'"> 左对齐 </XhButton>
          <XhButton icon="bsi-text-center" :type="alignment === 'center' ? 'primary' : 'default'"> 居中 </XhButton>
          <XhButton icon="bsi-text-right" :type="alignment === 'right' ? 'primary' : 'default'"> 右对齐 </XhButton>
        </XhButtonGroup>

        <div class="alignment-preview">
          <p :style="{ textAlign: alignment }">这是一段示例文本，当前对齐方式：{{ alignment }}</p>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h3>事件处理</h3>
      <div class="demo-row">
        <XhButtonGroup @click="handleGroupClick" @focus="handleGroupFocus" @blur="handleGroupBlur">
          <XhButton type="primary">事件按钮1</XhButton>
          <XhButton type="primary">事件按钮2</XhButton>
          <XhButton type="primary">事件按钮3</XhButton>
        </XhButtonGroup>
      </div>
      <div class="event-log">
        <h4>事件日志：</h4>
        <ul>
          <li v-for="(log, index) in eventLogs" :key="index">{{ log }}</li>
        </ul>
      </div>
    </section>

    <section class="demo-section">
      <h3>响应式设计</h3>
      <div class="demo-row">
        <XhButtonGroup :vertical="isMobile">
          <XhButton>响应式</XhButton>
          <XhButton>按钮组</XhButton>
          <XhButton>示例</XhButton>
        </XhButtonGroup>

        <XhButton @click="toggleMobile"> 切换视图: {{ isMobile ? "移动端" : "桌面端" }} </XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>复杂示例</h3>
      <div class="demo-complex">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <XhButtonGroup role="toolbar" size="small" title="主工具栏">
            <XhButton icon="bsi-file-plus" type="primary">新建</XhButton>
            <XhButton icon="bsi-folder-open">打开</XhButton>
            <XhButton icon="bsi-save">保存</XhButton>
          </XhButtonGroup>

          <XhButtonGroup role="toolbar" size="small" title="编辑工具栏">
            <XhButton icon="bsi-arrow-counterclockwise">撤销</XhButton>
            <XhButton icon="bsi-arrow-clockwise">重做</XhButton>
          </XhButtonGroup>
        </div>

        <!-- 侧边操作栏 -->
        <div class="sidebar">
          <XhButtonGroup vertical plain>
            <XhButton icon="bsi-plus" type="success">添加</XhButton>
            <XhButton icon="bsi-pencil" type="warning">编辑</XhButton>
            <XhButton icon="bsi-trash" type="danger">删除</XhButton>
            <XhButton icon="bsi-gear">设置</XhButton>
          </XhButtonGroup>
        </div>

        <!-- 底部状态栏 -->
        <div class="statusbar">
          <XhButtonGroup size="small">
            <XhButton>状态: 就绪</XhButton>
            <XhButton>行: {{ currentLine }}</XhButton>
            <XhButton>列: {{ currentColumn }}</XhButton>
          </XhButtonGroup>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import XhButtonGroup from "../src/ButtonGroup";
  import XhButton from "../../button/src/Button";

  // 分页状态
  const currentPage = ref(3);
  const totalPages = ref(10);

  const visiblePages = computed(() => {
    const pages = [];
    const start = Math.max(1, currentPage.value - 2);
    const end = Math.min(totalPages.value, currentPage.value + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  // 对齐状态
  const alignment = ref<"left" | "center" | "right">("left");

  // 事件日志
  const eventLogs = ref<string[]>([]);

  // 响应式状态
  const isMobile = ref(false);

  // 复杂示例状态
  const currentLine = ref(42);
  const currentColumn = ref(15);

  // 方法
  const addEventLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 8) {
      eventLogs.value.pop();
    }
  };

  const handleToolbarClick = (event: MouseEvent, index: number) => {
    const tools = ["粗体", "斜体", "下划线", "保存", "复制", "粘贴", "删除"];
    addEventLog(`工具栏操作: ${tools[index] || `按钮${index + 1}`}`);
  };

  const handlePaginationClick = (event: MouseEvent, index: number) => {
    if (index === 0 && currentPage.value > 1) {
      // 上一页
      currentPage.value--;
      addEventLog(`切换到第 ${currentPage.value} 页`);
    } else if (index === visiblePages.value.length + 1 && currentPage.value < totalPages.value) {
      // 下一页
      currentPage.value++;
      addEventLog(`切换到第 ${currentPage.value} 页`);
    } else if (index > 0 && index <= visiblePages.value.length) {
      // 具体页码
      const page = visiblePages.value[index - 1];
      currentPage.value = page;
      addEventLog(`切换到第 ${page} 页`);
    }
  };

  const handleAlignmentClick = (event: MouseEvent, index: number) => {
    const alignments: Array<"left" | "center" | "right"> = ["left", "center", "right"];
    alignment.value = alignments[index];
    addEventLog(`文本对齐: ${alignment.value}`);
  };

  const handleGroupClick = (event: MouseEvent, index: number) => {
    addEventLog(`按钮组点击: 第 ${index + 1} 个按钮`);
  };

  const handleGroupFocus = (event: FocusEvent, index: number) => {
    addEventLog(`按钮组焦点: 第 ${index + 1} 个按钮获得焦点`);
  };

  const handleGroupBlur = (event: FocusEvent, index: number) => {
    addEventLog(`按钮组焦点: 第 ${index + 1} 个按钮失去焦点`);
  };

  const toggleMobile = () => {
    isMobile.value = !isMobile.value;
    addEventLog(`切换到${isMobile.value ? "移动端" : "桌面端"}视图`);
  };

  // 模拟编辑器状态更新
  setInterval(() => {
    currentLine.value = Math.floor(Math.random() * 100) + 1;
    currentColumn.value = Math.floor(Math.random() * 80) + 1;
  }, 3000);
</script>

<style scoped>
  .button-group-comprehensive-demo {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
  }

  .demo-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: #fff;
  }

  .demo-section h3 {
    margin-bottom: 20px;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 2px solid #007bff;
    padding-bottom: 8px;
  }

  .demo-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .demo-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .pagination-info {
    margin-top: 15px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
  }

  .alignment-preview {
    margin-top: 15px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
  }

  .alignment-preview p {
    margin: 0;
    font-size: 14px;
    color: #333;
  }

  .event-log {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #007bff;
  }

  .event-log h4 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 14px;
  }

  .event-log ul {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
  }

  .event-log li {
    padding: 4px 0;
    font-size: 12px;
    color: #666;
    border-bottom: 1px solid #e9ecef;
  }

  .event-log li:last-child {
    border-bottom: none;
  }

  .demo-complex {
    display: grid;
    grid-template-areas:
      "toolbar toolbar"
      "sidebar content"
      "statusbar statusbar";
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 20px;
    min-height: 300px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background: #fafafa;
  }

  .toolbar {
    grid-area: toolbar;
    display: flex;
    gap: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ddd;
  }

  .sidebar {
    grid-area: sidebar;
    padding-right: 15px;
    border-right: 1px solid #ddd;
  }

  .statusbar {
    grid-area: statusbar;
    padding-top: 15px;
    border-top: 1px solid #ddd;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .demo-row {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar {
      flex-direction: column;
      gap: 10px;
    }

    .demo-complex {
      grid-template-areas:
        "toolbar"
        "sidebar"
        "statusbar";
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }

    .sidebar {
      padding-right: 0;
      border-right: none;
      border-bottom: 1px solid #ddd;
      padding-bottom: 15px;
    }
  }
</style>
