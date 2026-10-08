var e=`<!-- 一组断词符 | delimiter 给一组时其中任何一个都断词：半角逗号、全角逗号、分号都行，粘贴多行清单时换行也算；随表单提交的整串用第一个拼接 -->
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

const delimiters = [",", "，", ";", "\\n"];
<\/script>

<template>
  <XhTagsInputRoot
    v-slot="{ value }"
    :delimiter="delimiters"
    add-on-paste
    placeholder="试试输入 北京，上海;广州"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>城市</XhTagsInputLabel>
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
</template>
`;export{e as default};