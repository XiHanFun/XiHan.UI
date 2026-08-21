const t=`<!-- 状态码页 | 404 / 403 / 500 三档各并进一族语气色，操作槽里放这一页的回退出口 -->
<script setup lang="ts">
import {
  XhButton,
  XhResultAction,
  XhResultDescription,
  XhResultIcon,
  XhResultRoot,
  XhResultTitle,
} from "@xihan-ui/vue";

const pages = [
  {
    status: "404",
    glyph: "?",
    title: "页面不存在",
    description: "地址可能敲错了，或者这条记录已经被删掉。",
    action: "回到首页",
  },
  {
    status: "403",
    glyph: "⊘",
    title: "没有权限",
    description: "这块内容需要更高的角色，找管理员要一下。",
    action: "申请权限",
  },
  {
    status: "500",
    glyph: "!",
    title: "服务出错",
    description: "请求没能处理完，稍后再试一次。",
    action: "重试",
  },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <XhResultRoot
      v-for="p in pages"
      :key="p.status"
      :status="p.status"
      size="sm"
      style="inline-size: 220px"
    >
      <XhResultIcon>{{ p.glyph }}</XhResultIcon>
      <XhResultTitle>{{ p.status }} {{ p.title }}</XhResultTitle>
      <XhResultDescription>{{ p.description }}</XhResultDescription>
      <XhResultAction>
        <XhButton size="sm" variant="outline">{{ p.action }}</XhButton>
      </XhResultAction>
    </XhResultRoot>
  </div>
</template>
`;export{t as default};
