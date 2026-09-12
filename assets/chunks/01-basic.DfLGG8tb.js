const e=`<!-- 基础用法 | 一排可摘标签，每一枚都是库里的 tag：整组只占一个 Tab 位，方向键走标签，Delete 或 Backspace 摘掉，那颗叉就是 tag 的 close-trigger -->
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref([
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
]);

// 条目的去留归宿主：组件只报「用户要摘这一枚」
function remove({ value }: { value: string }) {
  tags.value = tags.value.filter(tag => tag.value !== value);
}
<\/script>

<template>
  <XhTagGroupRoot
    :collection="tags"
    label="技术栈"
    deletable
    @item-delete="remove"
  />
  <p>还剩：{{ tags.length ? tags.map((tag) => tag.label).join("、") : "（空）" }}</p>
</template>
`;export{e as default};
