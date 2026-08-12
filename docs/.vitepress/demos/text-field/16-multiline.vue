<!-- 多行与自动长高 | XhTextFieldInput 写 as="textarea" 即多行宿主；autoSize 让高度跟内容走，对象形态钉行数上下限（顶到 maxRows 后内部滚动） -->
<script setup lang="ts">
import { ref } from "vue";
import { XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";

const note = ref("");
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 320px">
    <XhTextFieldRoot v-model:value="note" v-slot="{ value, atLimit }" :auto-size="{ minRows: 2, maxRows: 6 }" :max-length="120" placeholder="说点什么">
      <XhTextFieldLabel>备注（2-6 行自动长高）</XhTextFieldLabel>
      <XhTextFieldInput as="textarea" />
      <p style="margin: 4px 0 0; font-size: 12px" :style="{ color: atLimit ? 'var(--xh-fg-danger)' : 'var(--xh-fg-subtle)' }">
        {{ value.length }} / 120
      </p>
    </XhTextFieldRoot>

    <XhTextFieldRoot auto-size placeholder="不设行数界限，完全跟内容走">
      <XhTextFieldLabel>随写随长</XhTextFieldLabel>
      <XhTextFieldInput as="textarea" />
    </XhTextFieldRoot>
  </div>
</template>
