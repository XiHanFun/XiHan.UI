<!-- 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一个菜单，逐个展开对比 -->
<script setup lang="ts">
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhMenuRoot size="sm">
      <XhMenuTrigger>sm</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="profile">个人资料</XhMenuItem>
          <XhMenuItem value="settings">偏好设置</XhMenuItem>
          <XhMenuItem value="logout">退出登录</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>

    <!-- 不写 size 就是缺省档 -->
    <XhMenuRoot>
      <XhMenuTrigger>缺省</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="profile">个人资料</XhMenuItem>
          <XhMenuItem value="settings">偏好设置</XhMenuItem>
          <XhMenuItem value="logout">退出登录</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>

    <XhMenuRoot size="lg">
      <XhMenuTrigger>lg</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="profile">个人资料</XhMenuItem>
          <XhMenuItem value="settings">偏好设置</XhMenuItem>
          <XhMenuItem value="logout">退出登录</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  </div>
</template>
