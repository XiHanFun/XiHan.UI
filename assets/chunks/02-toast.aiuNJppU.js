const t=`<!-- 给通知配声 | withToastSound 包一层现成服务，调用点一行都不用改；loading 不响，转成 success 那一刻才响 -->
<script setup lang="ts">
import type { ToastService } from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";
import { createToastService, XhButton } from "@xihan-ui/vue";
import { withToastSound } from "@xihan-ui/vue/sound";

// 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
let toast: ToastService | undefined;
function use(): ToastService {
  toast ??= withToastSound(createToastService({ placement: "top" }));
  return toast;
}
onBeforeUnmount(() => toast?.dispose());

function upload(): void {
  const id = use().loading("上传中");
  setTimeout(() => use().update(id, { type: "success", title: "上传完成" }), 1200);
}
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton variant="solid" @click="upload()">上传（静默转成功才响）</XhButton>
    <XhButton variant="outline" @click="use().success('已保存')">success</XhButton>
    <XhButton variant="outline" @click="use().warning('磁盘快满了')">warning</XhButton>
    <XhButton variant="outline" @click="use().error('同步失败，稍后自动重试')">
      error
    </XhButton>
  </div>
</template>
`;export{t as default};
