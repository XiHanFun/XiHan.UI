<!-- 落位 | placement 决定这一摞贴视口的哪个角，换的只是 group 上的 data-placement，队列本身不动 -->
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

const placements = [
  "top-start",
  "top",
  "top-end",
  "bottom-start",
  "bottom",
  "bottom-end",
] as const;

const placement = ref<(typeof placements)[number]>("top-end");
const toastTranslations = { close: "关闭" };
</script>

<template>
  <XhToasterRoot v-slot="{ create, dismiss }" :placement="placement">
    <XhButton
      v-for="p in placements"
      :key="p"
      size="sm"
      :variant="p === placement ? 'solid' : 'outline'"
      @click="placement = p"
    >
      {{ p }}
    </XhButton>
    <XhButton
      variant="ghost"
      @click="create({ title: '换个角看看', description: `现在贴在 ${placement}` })"
    >
      弹一条
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
          <XhToastCloseTrigger>✕</XhToastCloseTrigger>
        </XhToastRoot>
      </template>
    </XhToasterGroup>
  </XhToasterRoot>
</template>
