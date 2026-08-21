const n=`<!-- 定高滚动 | 用 --xh-listbox-content-max-h 压住列表高度，条目多了就在容器里滚；方向键走到哪条，视图跟到哪条 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhListboxRoot } from "@xihan-ui/vue";

const tracks = Array.from({ length: 40 }, (_, i) => ({
  value: \`track-\${i + 1}\`,
  label: \`第 \${i + 1} 首\`,
}));

const picked = ref<string[]>(["track-1"]);
<\/script>

<template>
  <XhListboxRoot
    v-model:value="picked"
    :collection="tracks"
    label="曲目"
    style="max-inline-size: 320px; --xh-listbox-content-max-h: 180px"
  />
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
`;export{n as default};
