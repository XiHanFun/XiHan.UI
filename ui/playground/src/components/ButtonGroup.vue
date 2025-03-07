<template>
  <div class="button-group-demos-page">
    <div class="page-header">
      <h1 class="page-title">按钮组 ButtonGroup</h1>
      <router-link to="/components" class="back-link">
        <FiArrowLeft class="back-icon" />
        返回组件列表
      </router-link>
    </div>

    <div class="button-group-demos">
      <!-- 按钮组 -->
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
            <XhButton type="primary"><FiEdit />编辑</XhButton>
            <XhButton type="primary"><FiTrash />删除</XhButton>
          </XhButtonGroup>
        </div>
      </section>

      <!-- 尺寸一致的按钮组 -->
      <section class="demo-section">
        <h2>不同尺寸的按钮组</h2>
        <div class="demo-row">
          <XhButtonGroup size="small">
            <XhButton type="primary">小型</XhButton>
            <XhButton type="primary">按钮</XhButton>
            <XhButton type="primary">组</XhButton>
          </XhButtonGroup>
        </div>
        <div class="demo-row">
          <XhButtonGroup>
            <XhButton type="primary">默认</XhButton>
            <XhButton type="primary">按钮</XhButton>
            <XhButton type="primary">组</XhButton>
          </XhButtonGroup>
        </div>
        <div class="demo-row">
          <XhButtonGroup size="large">
            <XhButton type="primary">大型</XhButton>
            <XhButton type="primary">按钮</XhButton>
            <XhButton type="primary">组</XhButton>
          </XhButtonGroup>
        </div>
      </section>

      <!-- 不同类型的按钮组合 -->
      <section class="demo-section">
        <h2>不同类型的按钮组合</h2>
        <div class="demo-row">
          <XhButtonGroup>
            <XhButton>默认</XhButton>
            <XhButton type="primary">主要</XhButton>
            <XhButton type="success">成功</XhButton>
            <XhButton type="warning">警告</XhButton>
            <XhButton type="danger">危险</XhButton>
          </XhButtonGroup>
        </div>
      </section>

      <!-- 圆角的按钮组 -->
      <section class="demo-section">
        <h2>圆角的按钮组</h2>
        <div class="demo-row">
          <XhButtonGroup round>
            <XhButton type="primary">左侧</XhButton>
            <XhButton type="primary">中间</XhButton>
            <XhButton type="primary">右侧</XhButton>
          </XhButtonGroup>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FiEdit, FiTrash, FiChevronLeft, FiChevronRight, FiArrowLeft } from "@xihan-ui/icons";
</script>

<style lang="scss" scoped>
  .button-group-demos-page {
    width: 100%;
    padding: 20px 0;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--xh-border-color);
  }

  .page-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
  }

  .back-link {
    display: flex;
    align-items: center;
    color: var(--xh-primary-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: var(--xh-primary-color-hover);
    }
  }

  .back-icon {
    margin-right: 6px;
  }

  .button-group-demos {
    width: 100%;
  }

  .demo-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid var(--xh-border-color);
    border-radius: 8px;

    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
