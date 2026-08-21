const e=`<!-- 形态·语气·尺寸 | 三个视觉轴只写在根上，触发器与浮层都从这里继承 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPopselectContent,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
} from "@xihan-ui/vue";

const plans = [
  { value: "free", label: "免费版" },
  { value: "pro", label: "专业版" },
  { value: "team", label: "团队版" },
];

const outline = ref<string[]>(["free"]);
const subtle = ref<string[]>(["pro"]);
const ghost = ref<string[]>(["team"]);
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
    <XhPopselectRoot v-model:value="outline" :collection="plans" variant="outline" size="sm">
      <XhPopselectTrigger>outline · sm</XhPopselectTrigger>
      <XhPopselectPositioner>
        <XhPopselectContent />
      </XhPopselectPositioner>
    </XhPopselectRoot>

    <XhPopselectRoot
      v-model:value="subtle"
      :collection="plans"
      variant="subtle"
      tone="success"
      size="md"
    >
      <XhPopselectTrigger>subtle · success</XhPopselectTrigger>
      <XhPopselectPositioner>
        <XhPopselectContent />
      </XhPopselectPositioner>
    </XhPopselectRoot>

    <XhPopselectRoot
      v-model:value="ghost"
      :collection="plans"
      variant="ghost"
      tone="danger"
      size="lg"
    >
      <XhPopselectTrigger>ghost · danger · lg</XhPopselectTrigger>
      <XhPopselectPositioner>
        <XhPopselectContent />
      </XhPopselectPositioner>
    </XhPopselectRoot>
  </div>
</template>
`;export{e as default};
