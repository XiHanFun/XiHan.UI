const n=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别 -->
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr))">
    <XhTagsInputRoot
      v-for="t in tones"
      :key="t"
      v-slot="{ value }"
      variant="outline"
      :tone="t"
      :default-value="['标签']"
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>{{ t }}</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="v in value" :key="v" :value="v">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ v }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
    </XhTagsInputRoot>
  </div>
</template>
`;export{n as default};
