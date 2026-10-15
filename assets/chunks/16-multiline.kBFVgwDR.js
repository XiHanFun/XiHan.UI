var e=`<!-- 多行与自动增高 | input 部件写为 textarea 即多行宿主；autoSize 使高度跟随内容，对象形态固定行数上下限（达到 maxRows 后内部滚动） -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldCount,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const note = ref("");
<\/script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 320px">
    <XhTextFieldRoot v-model:value="note" :auto-size="{ minRows: 2, maxRows: 6 }" :max-length="120" show-count placeholder="说点什么">
      <XhTextFieldLabel>备注（2-6 行自动长高）</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput as="textarea" />
      </XhTextFieldControl>
      <XhTextFieldCount />
    </XhTextFieldRoot>

    <XhTextFieldRoot auto-size placeholder="不设行数界限：随内容长高，到上限后框内滚动">
      <XhTextFieldLabel>随写随长</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput as="textarea" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </div>
</template>
`;export{e as default};