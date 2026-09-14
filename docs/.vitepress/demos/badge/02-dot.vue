<!-- 圆点与落点 | dot 只表示「有」不表示「有几个」；placement 决定挂在哪个角，rtl 下 end 自动落到左边 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarRoot, XhBadge, XhButton } from "@xihan-ui/vue";

const corners = ["top-end", "top-start", "bottom-end", "bottom-start"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge dot tone="danger" label="有新消息">
        <XhButton variant="outline">消息</XhButton>
      </XhBadge>

      <!-- 在线状态点挂在头像右下角 -->
      <XhBadge dot tone="success" placement="bottom-end" label="在线">
        <XhAvatarRoot>
          <XhAvatarFallback>曦</XhAvatarFallback>
        </XhAvatarRoot>
      </XhBadge>

      <XhBadge dot tone="neutral" placement="bottom-end" label="离线">
        <XhAvatarRoot>
          <XhAvatarFallback>寒</XhAvatarFallback>
        </XhAvatarRoot>
      </XhBadge>
    </div>

    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge v-for="c in corners" :key="c" :count="9" tone="danger" :placement="c">
        <XhButton variant="outline">{{ c }}</XhButton>
      </XhBadge>
    </div>
  </div>
</template>
