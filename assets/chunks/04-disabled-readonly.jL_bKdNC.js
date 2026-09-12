const t=`<!-- 禁用与只读 | disabled 整个控件退出 Tab 序列、标签一起置灰；read-only 仍可聚焦浏览，但加不进也删不掉，删除钮留在原地按不动、标签不置灰 -->
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
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-inline-size: 420px">
    <XhTagsInputRoot v-slot="{ value }" :default-value="['Vue', 'Vite']" disabled>
      <XhTagsInputLabel>禁用</XhTagsInputLabel>
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

    <XhTagsInputRoot v-slot="{ value }" :default-value="['Vue', 'Vite']" read-only>
      <XhTagsInputLabel>只读</XhTagsInputLabel>
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
`;export{t as default};
