<!-- 入库前统一改写 | 给了 value 就由宿主说了算：组件只发变更意图，写回什么形状在这里定 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const tags = ref<string[]>(["#vue"]);

// 统一成小写并补上井号，重复的那一份丢掉
function onValueChange(details: { value: string[] }) {
  const next: string[] = [];
  for (const raw of details.value) {
    const tag = raw.trim().toLowerCase();
    const normalized = tag.startsWith("#") ? tag : `#${tag}`;
    if (normalized !== "#" && !next.includes(normalized)) {
      next.push(normalized);
    }
  }
  tags.value = next;
}
</script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    :value="tags"
    placeholder="打 Vue 回车，落进去的是 #vue"
    style="max-inline-size: 420px"
    @value-change="onValueChange"
  >
    <XhTagsInputLabel>话题</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
  </XhTagsInputRoot>
  <p>当前：{{ tags.length ? tags.join("、") : "（无）" }}</p>
</template>
