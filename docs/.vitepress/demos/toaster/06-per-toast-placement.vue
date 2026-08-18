<!-- 逐条落位 | 单条通知自带 placement 就盖掉 toaster 的默认落位；placements 报出眼下有条目的位置，一个位置一摞 -->
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

const spots = [
  { placement: "top-start", label: "左上" },
  { placement: "top-end", label: "右上" },
  { placement: "bottom", label: "正下" },
] as const;

const toastTranslations = { close: "关闭" };

function pop(create: Create, placement: string, label: string): void {
  create({
    placement,
    title: `落在${label}`,
    description: "每个位置各排各的队，互不挤占",
  });
}
</script>

<template>
  <XhToasterRoot v-slot="{ create, dismiss, placements }" :duration="8000">
    <XhButton
      v-for="spot in spots"
      :key="spot.placement"
      size="sm"
      variant="outline"
      @click="pop(create, spot.placement, spot.label)"
    >
      弹到{{ spot.label }}
    </XhButton>
    <span>眼下有条目的位置：{{ placements.join("、") || "（无）" }}</span>

    <!-- 一个位置一摞，没有条目的位置不必渲染 -->
    <XhToasterGroup v-for="p in placements" :key="p" :placement="p">
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
