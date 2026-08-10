<!-- 挂成角标 | 徽标本身随文排；外层套一层定位上下文，它就落到子元素的角上。计数、圆点、0 值收起、上限截断都在宿主这一侧 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBadge, XhButton } from "@xihan-ui/vue";

const count = ref(5);
const max = 99;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <!-- 计数角标：外层给定位上下文，徽标绝对定位到右上角；偏移逐个实例写 -->
    <span style="position: relative; display: inline-flex">
      <XhButton variant="outline">消息</XhButton>
      <XhBadge
        v-if="count > 0"
        variant="solid"
        tone="danger"
        size="sm"
        style="position: absolute; inset-block-start: -6px; inset-inline-end: -8px"
      >
        {{ count > max ? max + "+" : count }}
      </XhBadge>
    </span>

    <!-- 圆点：内容留空，内边距收成 0 再给一个直径，根本来就是胶囊圆角 -->
    <span style="position: relative; display: inline-flex">
      <XhButton variant="outline">动态</XhButton>
      <XhBadge
        variant="solid"
        tone="danger"
        style="
          position: absolute;
          inset-block-start: -4px;
          inset-inline-end: -4px;
          padding: 0;
          inline-size: 8px;
          block-size: 8px;
        "
      />
    </span>
  </div>

  <div style="display: flex; align-items: center; gap: 8px">
    <XhButton size="sm" @click="count = Math.max(0, count - 1)">减一</XhButton>
    <XhButton size="sm" @click="count += 50">加五十</XhButton>
    <XhButton size="sm" variant="ghost" @click="count = 0">归零</XhButton>
    <span style="font-size: 13px">当前 {{ count }}：为 0 收起，超过 {{ max }} 截成 {{ max }}+</span>
  </div>
</template>
