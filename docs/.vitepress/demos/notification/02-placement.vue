<!-- 落位 | placement 决定这一摞贴视口的哪个角，换的只是 group 上的 data-placement，队列本身不动 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationGroup,
  XhNotificationRoot,
  XhNotificationItem,
  XhNotificationItemTitle,
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
const itemTranslations = { close: "关闭" };
</script>

<template>
  <XhNotificationRoot v-slot="{ create, dismiss }" :placement="placement">
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

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :type="item.type"
          :duration="item.duration"
          :remove-delay="item.removeDelay"
          :closable="item.closable"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
