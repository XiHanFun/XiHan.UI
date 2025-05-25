<template>
  <div class="icon-demo">
    <h2>Icon 组件示例</h2>

    <section class="demo-section">
      <h3>基础用法</h3>
      <div class="demo-row">
        <XhIcon name="bsi-house" />
        <XhIcon name="bsi-heart" color="red" />
        <XhIcon name="bsi-star" size="32" />
      </div>
    </section>

    <section class="demo-section">
      <h3>尺寸设置</h3>
      <div class="demo-row">
        <XhIcon name="bsi-house" size="16" />
        <XhIcon name="bsi-house" size="24" />
        <XhIcon name="bsi-house" size="32" />
        <XhIcon name="bsi-house" size="1.5em" />
        <XhIcon name="bsi-house" scale="2" />
      </div>
    </section>

    <section class="demo-section">
      <h3>动画效果</h3>
      <div class="demo-row">
        <XhIcon name="bsi-arrow-clockwise" animation="spin" />
        <XhIcon name="bsi-heart" animation="pulse" />
        <XhIcon name="bsi-lightning" animation="flash" />
        <XhIcon name="bsi-gear" animation="spin-pulse" />
      </div>
    </section>

    <section class="demo-section">
      <h3>翻转效果</h3>
      <div class="demo-row">
        <XhIcon name="bsi-arrow-right" />
        <XhIcon name="bsi-arrow-right" flip="horizontal" />
        <XhIcon name="bsi-arrow-right" flip="vertical" />
        <XhIcon name="bsi-arrow-right" flip="both" />
      </div>
    </section>

    <section class="demo-section">
      <h3>交互效果</h3>
      <div class="demo-row">
        <XhIcon name="bsi-heart" hover />
        <XhIcon name="bsi-star" hover color="gold" />
        <XhIcon name="bsi-hand-thumbs-up" hover animation="pulse" />
      </div>
    </section>

    <section class="demo-section">
      <h3>组合使用</h3>
      <div class="demo-row">
        <XhIcon name="bsi-download" animation="float" hover color="blue" size="24" title="下载文件" />
        <XhIcon name="bsi-upload" animation="pulse" flip="vertical" color="green" scale="1.2" speed="slow" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import XhIcon from "../src/Icon";
</script>

<style scoped>
  .icon-demo {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .demo-section {
    margin-bottom: 30px;
  }

  .demo-section h3 {
    margin-bottom: 15px;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }

  .demo-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .demo-row .xh-icon {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .demo-row .xh-icon:hover {
    transform: scale(1.1);
  }
</style>
