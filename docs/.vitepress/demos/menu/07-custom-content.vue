<!-- 菜单里的非条目内容 | content 里可以直接放任意节点；不是 item 就不进方向键行程，也选不中 -->
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger>账号</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <!-- 这一块是普通节点：方向键从首个条目起步，不会停在它上面 -->
        <div style="display: grid; gap: 4px; padding: 8px 8px 6px">
          <span style="font-weight: 600">曦寒</span>
          <span style="font-size: 12px; color: var(--xh-fg-muted)">
            已用 6.2 GB / 20 GB
          </span>
        </div>

        <XhMenuSeparator />

        <XhMenuItem value="profile">个人资料</XhMenuItem>
        <XhMenuItem value="billing">账单与用量</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="logout">退出登录</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
