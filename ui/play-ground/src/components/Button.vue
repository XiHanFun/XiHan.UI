<template>
  <div class="button-demos-page">
    <div class="page-header">
      <h1 class="page-title">按钮 Button</h1>
      <router-link to="/components" class="back-link">
        <FiArrowLeft class="back-icon" />
        返回组件列表
      </router-link>
    </div>

    <div class="button-demos">
      <!-- 按钮类型 -->
      <section class="demo-section">
        <h2>按钮类型</h2>
        <div class="demo-row">
          <XhButton>默认按钮</XhButton>
          <XhButton type="primary">主要按钮</XhButton>
          <XhButton type="success">成功按钮</XhButton>
          <XhButton type="warning">警告按钮</XhButton>
          <XhButton type="danger">危险按钮</XhButton>
          <XhButton type="info">信息按钮</XhButton>
        </div>
      </section>

      <!-- 朴素按钮 -->
      <section class="demo-section">
        <h2>朴素按钮</h2>
        <div class="demo-row">
          <XhButton plain>朴素按钮</XhButton>
          <XhButton type="primary" plain>主要按钮</XhButton>
          <XhButton type="success" plain>成功按钮</XhButton>
          <XhButton type="warning" plain>警告按钮</XhButton>
          <XhButton type="danger" plain>危险按钮</XhButton>
          <XhButton type="info" plain>信息按钮</XhButton>
        </div>
      </section>

      <!-- 图标按钮 -->
      <section class="demo-section">
        <h2>图标按钮</h2>
        <div class="demo-row">
          <XhButton :icon="FiEdit">编辑</XhButton>
          <XhButton :icon="FiTrash" type="danger">删除</XhButton>
        </div>
        <div class="demo-row">
          <XhButton :icon="FiEdit" iconPlacement="right">编辑</XhButton>
          <XhButton :icon="FiTrash" type="danger" iconPlacement="right">删除</XhButton>
        </div>
      </section>

      <!-- 按钮尺寸 -->
      <section class="demo-section">
        <h2>按钮尺寸</h2>
        <div class="demo-row">
          <XhButton size="small" type="primary">小型按钮</XhButton>
          <XhButton type="primary">默认按钮</XhButton>
          <XhButton size="large" type="primary">大型按钮</XhButton>
        </div>
        <div class="demo-row">
          <XhButton size="small" :icon="FiEdit" type="primary">编辑</XhButton>
          <XhButton :icon="FiEdit" type="primary">编辑</XhButton>
          <XhButton size="large" :icon="FiEdit" type="primary">编辑</XhButton>
        </div>
      </section>

      <!-- 按钮形状 -->
      <section class="demo-section">
        <h2>按钮形状</h2>
        <div class="demo-row">
          <XhButton round>圆角按钮</XhButton>
          <XhButton type="info" circle :icon="FiInfo"></XhButton>
          <XhButton type="warning" circle :icon="FiStar"></XhButton>
          <XhButton type="danger" circle :icon="FiTrash"></XhButton>
        </div>
      </section>

      <!-- 加载状态 -->
      <section class="demo-section">
        <h2>加载状态</h2>
        <div class="demo-row">
          <XhButton loading>加载中</XhButton>
          <XhButton type="primary" loading>加载中</XhButton>
          <XhButton type="success" loading>加载中</XhButton>
          <XhButton type="warning" loading></XhButton>
          <XhButton type="danger" loading circle></XhButton>
        </div>
      </section>

      <!-- 禁用状态 -->
      <section class="demo-section">
        <h2>禁用状态</h2>
        <div class="demo-row">
          <XhButton disabled>禁用按钮</XhButton>
          <XhButton type="primary" disabled>禁用按钮</XhButton>
          <XhButton type="success" disabled plain>禁用按钮</XhButton>
          <XhButton type="info" disabled round>禁用按钮</XhButton>
          <XhButton type="danger" disabled circle :icon="FiTrash"></XhButton>
        </div>
      </section>

      <!-- 块级按钮 -->
      <section class="demo-section">
        <h2>块级按钮</h2>
        <div class="demo-row">
          <XhButton type="primary" block>块级按钮</XhButton>
          <XhButton type="success" block round>圆角块级按钮</XhButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FiEdit, FiTrash, FiInfo, FiStar, FiArrowLeft } from "@xihan-ui/icons";
</script>

<style lang="scss" scoped>
  .button-demos-page {
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

  .button-demos {
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
