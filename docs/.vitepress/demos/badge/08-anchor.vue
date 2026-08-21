<!-- 挂成角标 | 外层套一层定位上下文，徽标就落到子元素的角上。计数、上限截断、0 值收起、圆点都归徽标自己算，宿主只管定位 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBadge, XhButton } from "@xihan-ui/vue";

const count = ref(5);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <!-- 计数角标：给了 count 就自己出数字，超过 max 写成 99+，为 0 整枚收起 -->
    <span style="position: relative; display: inline-flex">
      <XhButton variant="outline">消息</XhButton>
      <XhBadge
        variant="solid"
        tone="danger"
        size="sm"
        :count="count"
        :label="`${count} 条未读`"
        style="position: absolute; inset-block-start: -6px; inset-inline-end: -8px"
      />
    </span>

    <!-- 圆点：只表示「有」，不表示「有几个」；同样为 0 时收起 -->
    <span style="position: relative; display: inline-flex">
      <XhButton variant="outline">动态</XhButton>
      <XhBadge
        dot
        variant="solid"
        tone="danger"
        :count="count"
        label="有新动态"
        style="position: absolute; inset-block-start: -4px; inset-inline-end: -4px"
      />
    </span>
  </div>

  <div style="display: flex; align-items: center; gap: 8px">
    <XhButton size="sm" @click="count = Math.max(0, count - 1)">减一</XhButton>
    <XhButton size="sm" @click="count += 50">加五十</XhButton>
    <XhButton size="sm" variant="ghost" @click="count = 0">归零</XhButton>
    <span style="font-size: 13px">当前 {{ count }}：为 0 收起，超过 99 截成 99+</span>
  </div>
</template>
