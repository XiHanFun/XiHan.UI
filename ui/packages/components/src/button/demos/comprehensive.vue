<template>
  <div class="button-comprehensive-demo">
    <h2>Button 组件综合演示</h2>

    <section class="demo-section">
      <h3>基础按钮类型</h3>
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
      <h3>按钮尺寸</h3>
      <div class="demo-row">
        <XhButton size="small">小型按钮</XhButton>
        <XhButton size="medium">中型按钮</XhButton>
        <XhButton size="large">大型按钮</XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>图标按钮</h3>
      <div class="demo-row">
        <XhButton icon="bsi-house">首页</XhButton>
        <XhButton type="primary" icon="bsi-download">下载</XhButton>
        <XhButton type="success" icon="bsi-check" icon-placement="right">确认</XhButton>
        <XhButton icon="bsi-heart" circle></XhButton>
        <XhButton type="primary" icon="bsi-star" circle></XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>加载状态</h3>
      <div class="demo-row">
        <XhButton :loading="loading1" @click="toggleLoading1">
          {{ loading1 ? "加载中..." : "点击加载" }}
        </XhButton>
        <XhButton type="primary" :loading="loading2" loading-icon="bsi-gear" @click="toggleLoading2">
          {{ loading2 ? "处理中..." : "自定义加载图标" }}
        </XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>按钮状态</h3>
      <div class="demo-row">
        <XhButton plain>朴素按钮</XhButton>
        <XhButton round>圆角按钮</XhButton>
        <XhButton disabled>禁用按钮</XhButton>
        <XhButton text-button>文本按钮</XhButton>
        <XhButton link>链接按钮</XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>块级按钮</h3>
      <div class="demo-column">
        <XhButton block>块级按钮</XhButton>
        <XhButton type="primary" block icon="bsi-download">块级下载按钮</XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>事件处理</h3>
      <div class="demo-row">
        <XhButton type="primary" @click="handleClick" @focus="handleFocus" @blur="handleBlur"> 事件按钮 </XhButton>
        <XhButton type="success" icon="bsi-bell" @click="showNotification"> 通知 </XhButton>
      </div>
      <div class="event-log">
        <h4>事件日志：</h4>
        <ul>
          <li v-for="(log, index) in eventLogs" :key="index">{{ log }}</li>
        </ul>
      </div>
    </section>

    <section class="demo-section">
      <h3>无障碍访问</h3>
      <div class="demo-row">
        <XhButton title="保存文档" label="点击保存当前文档到本地" icon="bsi-save" type="primary"> 保存 </XhButton>
        <XhButton title="删除文件" label="警告：此操作将永久删除文件" icon="bsi-trash" type="danger"> 删除 </XhButton>
      </div>
    </section>

    <section class="demo-section">
      <h3>表单按钮</h3>
      <form @submit.prevent="handleSubmit" class="demo-form">
        <div class="form-group">
          <input v-model="formData.name" placeholder="请输入姓名" />
        </div>
        <div class="form-group">
          <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
        </div>
        <div class="form-actions">
          <XhButton type="primary" native-type="submit" :loading="submitting" icon="bsi-check">
            {{ submitting ? "提交中..." : "提交" }}
          </XhButton>
          <XhButton native-type="reset" @click="resetForm">重置</XhButton>
        </div>
      </form>
    </section>

    <section class="demo-section">
      <h3>响应式设计</h3>
      <div class="demo-row">
        <XhButton :size="isMobile ? 'large' : 'medium'" :block="isMobile">
          {{ isMobile ? "移动端按钮" : "桌面端按钮" }}
        </XhButton>
        <XhButton @click="toggleMobile"> 切换视图: {{ isMobile ? "移动端" : "桌面端" }} </XhButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import XhButton from "../src/Button";

  // 加载状态
  const loading1 = ref(false);
  const loading2 = ref(false);

  // 表单数据
  const formData = reactive({
    name: "",
    email: "",
  });

  const submitting = ref(false);

  // 事件日志
  const eventLogs = ref<string[]>([]);

  // 响应式状态
  const isMobile = ref(false);

  // 方法
  const toggleLoading1 = () => {
    loading1.value = true;
    setTimeout(() => {
      loading1.value = false;
    }, 2000);
  };

  const toggleLoading2 = () => {
    loading2.value = true;
    setTimeout(() => {
      loading2.value = false;
    }, 3000);
  };

  const addEventLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 5) {
      eventLogs.value.pop();
    }
  };

  const handleClick = (event: MouseEvent) => {
    addEventLog("按钮被点击");
    console.log("Button clicked:", event);
  };

  const handleFocus = (event: FocusEvent) => {
    addEventLog("按钮获得焦点");
    console.log("Button focused:", event);
  };

  const handleBlur = (event: FocusEvent) => {
    addEventLog("按钮失去焦点");
    console.log("Button blurred:", event);
  };

  const showNotification = () => {
    addEventLog("显示通知");
    alert("这是一个通知！");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert("请填写完整信息");
      return;
    }

    submitting.value = true;
    addEventLog("表单提交中...");

    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 2000));
      addEventLog("表单提交成功");
      alert("提交成功！");
    } catch (error) {
      addEventLog("表单提交失败");
      alert("提交失败！");
    } finally {
      submitting.value = false;
    }
  };

  const resetForm = () => {
    formData.name = "";
    formData.email = "";
    addEventLog("表单已重置");
  };

  const toggleMobile = () => {
    isMobile.value = !isMobile.value;
    addEventLog(`切换到${isMobile.value ? "移动端" : "桌面端"}视图`);
  };
</script>

<style scoped>
  .button-comprehensive-demo {
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
    gap: 15px;
    flex-wrap: wrap;
  }

  .demo-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .demo-form {
    max-width: 400px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
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

  /* 响应式设计 */
  @media (max-width: 768px) {
    .demo-row {
      flex-direction: column;
      align-items: stretch;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
