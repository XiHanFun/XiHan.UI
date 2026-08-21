<!-- 就地改写 | 同一个 id 再 create 一次是原地改写而不是新弹一条，位置不动；loading 不自动消失，换成 success 才开始倒计时 -->
<script setup lang="ts">
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastDescription,
  XhToasterGroup,
  XhToasterRoot,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;
type Update = (id: string, options: Record<string, unknown>) => void;

const toastTranslations = { close: "关闭" };

// 命令由 XhToasterRoot 的插槽作用域交下来
function startUpload(create: Create, update: Update): void {
  create({
    id: "upload",
    type: "loading",
    title: "正在上传",
    description: "3 个文件排队中",
  });
  // 改一条已经在队列里的
  window.setTimeout(update, 1200, "upload", { description: "已传 2 / 3" });
  // 同一个 id 再 create 一次同样是就地改写
  window.setTimeout(create, 2400, {
    id: "upload",
    type: "success",
    title: "上传完成",
    description: "3 个文件已入库",
  });
}
</script>

<template>
  <XhToasterRoot v-slot="{ create, update, dismiss }">
    <XhButton variant="solid" @click="startUpload(create, update)">
      上传（loading → success）
    </XhButton>

    <XhToasterGroup>
      <template #default="{ toast }">
        <XhToastRoot
          :id="toast.id"
          :title="toast.title"
          :description="toast.description"
          :type="toast.type"
          :duration="toast.duration"
          :remove-delay="toast.removeDelay"
          :closable="toast.closable"
          :translations="toastTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhToastTitle />
          <XhToastDescription />
          <XhToastCloseTrigger />
        </XhToastRoot>
      </template>
    </XhToasterGroup>
  </XhToasterRoot>
</template>
