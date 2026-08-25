<!-- 全局服务 | 轻提示没有容器组件，那一摞由 createToastService 渲染；模块作用域随处可调（请求拦截器、store） -->
<script setup lang="ts">
import type { ToastService } from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";
import { createToastService, XhButton } from "@xihan-ui/vue";

// 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
let toast: ToastService | undefined;
function use(): ToastService {
  toast ??= createToastService({ placement: "top" });
  return toast;
}
onBeforeUnmount(() => toast?.dispose());

function save(): void {
  const id = use().loading("保存中");
  setTimeout(() => use().update(id, { type: "success", title: "已保存" }), 900);
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton variant="solid" @click="save()">保存（loading 转 success）</XhButton>
    <XhButton variant="outline" @click="use().success('已发布')">success</XhButton>
    <XhButton variant="outline" @click="use().warning('配额即将用尽')">warning</XhButton>
    <XhButton variant="outline" @click="use().error('同步失败')">error</XhButton>
  </div>
</template>
