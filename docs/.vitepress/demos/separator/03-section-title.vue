<!-- 分节标题 | 分隔线自己不排版：一行里放两条、中间留出标题，两侧各自撑开；语义由标题文字给，线只是装饰 -->
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- 标题居中：两侧各一条，等分剩下的宽度 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <XhSeparator decorative style="flex: 1" />
      <span style="font-size: 13px">基本信息</span>
      <XhSeparator decorative style="flex: 1" />
    </div>

    <p style="margin: 0">姓名、部门、入职时间</p>

    <!-- 标题靠左：只在右边留一条 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-size: 13px">联系方式</span>
      <XhSeparator decorative style="flex: 1" />
    </div>

    <p style="margin: 0">邮箱、电话</p>
  </div>
</template>
