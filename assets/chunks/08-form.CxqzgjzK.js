const n=`<!-- 随表单提交 | 写了 name 与 hidden-input 才参与提交，整份标签按断词符拼成一串；框里没内容时回车留给表单 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const tags = ref<string[]>(["Vue", "TypeScript"]);
const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("skills") ?? "");
}
<\/script>

<template>
  <form
    style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
    @submit.prevent="onSubmit"
  >
    <XhTagsInputRoot
      v-slot="{ value }"
      v-model:value="tags"
      name="skills"
      delimiter=","
      placeholder="回车落一个"
    >
      <XhTagsInputLabel>技术栈</XhTagsInputLabel>
      <XhTagsInputControl>
        <XhTagsInputItem v-for="t in value" :key="t" :value="t">
          <XhTagsInputItemPreview>
            <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
            <XhTagsInputItemDeleteTrigger />
          </XhTagsInputItemPreview>
        </XhTagsInputItem>
        <XhTagsInputInput />
      </XhTagsInputControl>
      <XhTagsInputHiddenInput />
    </XhTagsInputRoot>
    <XhButton type="submit" variant="outline" style="align-self: start">提交</XhButton>
    <span>表单收到：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
`;export{n as default};
