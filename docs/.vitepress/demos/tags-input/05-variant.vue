<!-- 形态 | variant 只改控件的颜色槽位，标签的形态按控件的面派：subtle 控件里是描边标签，其余是淡底标签；落标签与删标签的行为三档一致 -->
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

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
    <XhTagsInputRoot
      v-for="v in variants"
      :key="v"
      v-slot="{ value }"
      :variant="v"
      :default-value="['Vue', 'TypeScript']"
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>{{ v }}</XhTagsInputLabel>
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
  </div>
</template>
