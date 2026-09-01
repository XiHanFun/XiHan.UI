<!-- 无壳内联形态 | ghost 档不占一块面，开关收成只占文字宽度的小药丸，适合在一段回答里穿插好几处 -->
<script setup lang="ts">
import {
  XhReasoningContent,
  XhReasoningDuration,
  XhReasoningIcon,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
} from "@xihan-ui/vue";

const notes = [
  {
    id: "a",
    start: 0,
    end: 2400,
    text: "先确认这次只改皮肤：解剖与事件都不动，公开面就只增不减。",
  },
  {
    id: "b",
    start: 0,
    end: 700,
    text: "再看形态轴：ghost 关掉底与描边，缩进由左侧那条竖线接管。",
  },
];
</script>

<template>
  <div class="reasoning-inline-demo">
    <p>把两处思考穿插在同一段回答里，它们不再各自占一张卡：</p>
    <XhReasoningRoot
      v-for="note in notes"
      :key="note.id"
      variant="ghost"
      :start-time="note.start"
      :end-time="note.end"
    >
      <template #default="{ durationMs }">
        <XhReasoningTrigger>
          <XhReasoningIcon />
          <XhReasoningIndicator />
          <XhReasoningLabel>思考过程</XhReasoningLabel>
          <XhReasoningDuration>
            {{ ((durationMs ?? 0) / 1000).toFixed(1) }} 秒
          </XhReasoningDuration>
        </XhReasoningTrigger>
        <XhReasoningContent>{{ note.text }}</XhReasoningContent>
      </template>
    </XhReasoningRoot>
  </div>
</template>

<style scoped>
.reasoning-inline-demo {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-2);
}
</style>
