<!-- 基础用法 | create 入队并返回 id，队列里的每条交给 XhToastRoot 渲染；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列 -->
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

// 存一份放在外面：写在模板里每渲染一次都是个新对象，白白惊动一轮 props
const toastTranslations = { close: "关闭" };
</script>

<template>
  <XhToasterRoot v-slot="{ create, dismiss, count }">
    <XhButton
      variant="solid"
      @click="create({ title: '草稿已保存', description: '内容已同步到云端' })"
    >
      弹一条
    </XhButton>
    <XhButton
      variant="outline"
      @click="
        create({
          type: 'error',
          title: '同步失败',
          description: '网络中断，稍后自动重试',
        })
      "
    >
      弹一条 error
    </XhButton>
    <span>队列：{{ count }} 条</span>

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
          <XhToastCloseTrigger>✕</XhToastCloseTrigger>
        </XhToastRoot>
      </template>
    </XhToasterGroup>
  </XhToasterRoot>
</template>
