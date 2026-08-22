const n=`<!-- 候选词一键添加 | 根插槽给出 addValue 与 atMax：输入框之外再开一条加标签的路，上限一样管得住 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const suggestions = ["文档", "无障碍", "设计令牌", "组件库"];
const tags = ref<string[]>(["文档"]);
<\/script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, addValue, atMax }"
    v-model:value="tags"
    :max="3"
    placeholder="回车落一个"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>话题（最多 3 个）</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="s in suggestions"
        :key="s"
        size="sm"
        variant="outline"
        :disabled="atMax || value.includes(s)"
        @click="addValue(s)"
      >
        {{ s }}
      </XhButton>
    </div>
  </XhTagsInputRoot>
</template>
`;export{n as default};
