const n=`<!-- 尺寸 | 控件高度、胶囊与输入文字一起换档，不传 size 即默认档 -->
<script setup lang="ts">
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

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
    <XhTagsInputRoot
      v-for="s in sizes"
      :key="s.label"
      v-slot="{ value }"
      :size="s.size"
      :default-value="['Vue', 'TypeScript']"
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>{{ s.label }}</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger>×</XhTagsInputItemDeleteTrigger>
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>
  </div>
</template>
`;export{n as default};
