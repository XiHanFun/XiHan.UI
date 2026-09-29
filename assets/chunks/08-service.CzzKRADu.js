const t=`<!-- 全局服务 | createNotificationService 自带宿主，传 preset: 'toast' 即轻提示；模块作用域随处可调用（请求拦截器、store） -->
<script setup lang="ts">
import type { NotificationService } from "@xihan-ui/vue";
import { createNotificationService, XhButton } from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

// 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
let toast: NotificationService | undefined;
function use(): NotificationService {
  toast ??= createNotificationService({ preset: "toast" });
  return toast;
}
onBeforeUnmount(() => toast?.dispose());

function save(): void {
  const id = use().loading("保存中");
  setTimeout(() => use().update(id, { loading: false, tone: "success", title: "已保存" }), 900);
}
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton variant="solid" @click="save()">保存（loading 收尾成 success）</XhButton>
    <XhButton variant="outline" @click="use().success('已发布')">success</XhButton>
    <XhButton variant="outline" @click="use().warning('配额即将用尽')">warning</XhButton>
    <XhButton variant="outline" @click="use().danger('同步失败')">danger</XhButton>
  </div>
</template>
`;export{t as default};
