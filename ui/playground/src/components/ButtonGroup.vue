<template>
  <div class="button-group-demos-page">
    <div class="button-group-demos">
      <!-- 按钮组 -->
      <section class="demo-section">
        <h2>按钮组</h2>
        <div class="demo-row">
          <XhButtonGroup>
            <XhIcon :name="'fei-chevron-right'" :scale="1" />
            <XhButton type="primary"> 上一页</XhButton>
            <XhButton type="primary" :icon="FeiChevronRight" iconPlacement="right">下一页</XhButton>
          </XhButtonGroup>
        </div>
        <div class="demo-row">
          <XhButtonGroup>
            <XhButton type="primary" :icon="FeiEdit"></XhButton>
            <XhButton type="primary" :icon="FeiTrash"></XhButton>
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
  import { FeiEdit, FeiTrash, FeiChevronLeft, FeiChevronRight, FeiArrowLeft } from "@xihan-ui/icons/packs/fei";
</script>
