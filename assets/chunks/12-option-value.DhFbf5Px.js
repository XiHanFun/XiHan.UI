const n=`<!-- 标签用对象 | 组件里存的是标识那一份，显示哪一份由作者定：条目文本渲染 label，提交仍按标识拼串 -->
<script setup lang="ts">
import { ref } from "vue";
import {
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

interface Option {
  value: string;
  label: string;
}

// 显示名与标识的对照表由宿主自己拿着，组件只认标识
const options = ref<Option[]>([
  { value: "u-1", label: "张三" },
  { value: "u-2", label: "李四" },
  { value: "u-3", label: "王五" },
]);

const value = ref<string[]>(["u-1"]);
let seq = 0;

function labelOf(id: string): string {
  return options.value.find((option) => option.value === id)?.label ?? id;
}

// 组件报回来的是框里打的那串文本：同名的换成它的标识，没见过的现造一条对照
function onValueChange(details: { value: string[] }) {
  const next: string[] = [];
  for (const raw of details.value) {
    const known =
      options.value.find((option) => option.value === raw) ??
      options.value.find((option) => option.label === raw);
    if (known) {
      if (!next.includes(known.value)) {
        next.push(known.value);
      }
      continue;
    }
    seq += 1;
    const created = { value: \`u-new-\${seq}\`, label: raw };
    options.value = [...options.value, created];
    next.push(created.value);
  }
  value.value = next;
}
<\/script>

<template>
  <XhTagsInputRoot
    v-slot="{ value: tags }"
    :value="value"
    name="reviewers"
    placeholder="打名字回车"
    style="max-inline-size: 420px"
    @value-change="onValueChange"
  >
    <XhTagsInputLabel>评审人</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in tags" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ labelOf(t) }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger />
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput />
    </XhTagsInputControl>
    <XhTagsInputHiddenInput />
  </XhTagsInputRoot>
  <p>提交出去的是标识：{{ value.join(",") || "（无）" }}</p>
  <p>框里看到的是名字：{{ value.map(labelOf).join("、") || "（无）" }}</p>
</template>
`;export{n as default};
