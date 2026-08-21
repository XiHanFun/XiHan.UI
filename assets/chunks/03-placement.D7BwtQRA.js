const n=`<!-- 放置位与箭头 | placement 只是首选位，空间不够时定位引擎会自动翻面；arrow 指回触发器 -->
<script setup lang="ts">
import {
  XhMenuArrow,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhMenuRoot placement="right-start" :offset="12">
    <XhMenuTrigger>贴右侧展开</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="profile">个人资料</XhMenuItem>
        <XhMenuItem value="settings">偏好设置</XhMenuItem>
        <XhMenuItem value="logout">退出登录</XhMenuItem>
      </XhMenuContent>
      <!-- 箭头挂在 positioner 上，位置由引擎回填 -->
      <XhMenuArrow />
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
`;export{n as default};
