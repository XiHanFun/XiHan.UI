const t=`<!-- 上限与清空 | max 限制每个位置同时显示几条，超出挤掉最旧的；dismissAll 把队列直接倒掉，不走退场窗口 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhToastCloseTrigger,
  XhToastDescription,
  XhToasterGroup,
  XhToasterRoot,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";

const seq = ref(0);
const toastTranslations = { close: "关闭" };

function nextTitle(): string {
  seq.value += 1;
  return \`第 \${seq.value} 条通知\`;
}
<\/script>

<template>
  <XhToasterRoot
    v-slot="{ create, dismiss, dismissAll, count }"
    :max="3"
    :gap="12"
    :duration="20000"
  >
    <XhButton
      variant="solid"
      @click="create({ title: nextTitle(), description: '连按几下看最旧的被挤掉' })"
    >
      连着弹
    </XhButton>
    <XhButton variant="ghost" @click="dismissAll()">全部清空</XhButton>
    <span>队列：{{ count }} 条（上限 3）</span>

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
`;export{t as default};
