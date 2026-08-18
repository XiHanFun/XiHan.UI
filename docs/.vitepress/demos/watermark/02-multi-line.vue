<!-- 多行 | text 写成多行就是多行水印，图样跟着长高；空白行不占位 -->
<script setup lang="ts">
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/vue";

const lines = ["曦寒前端组件库", "zhaifanhua@gmail.com", "2026-08-11"];
</script>

<template>
  <XhWatermarkRoot :text="lines" :font-size="13">
    <XhWatermarkContent>
      <div style="padding: 32px; line-height: 1.9">
        <p>三行水印按行铺开，每行居中对齐，整块绕图样中心一起倾斜。</p>
        <p>行距按字号折算，换字号不必再调行距。</p>
      </div>
    </XhWatermarkContent>
  </XhWatermarkRoot>
</template>
