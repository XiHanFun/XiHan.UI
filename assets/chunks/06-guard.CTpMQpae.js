const e=`<!-- 拦下一次切换 | 受控时 value-change 是唯一出口：宿主不写回，值就原样不动，条件不满足的那一段永远切不过去 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";

const stage = ref<string | null>("draft");
const saved = ref(false);
const blocked = ref("");

// 单选模式下裸值就是字符串或 null
function onValueChange(details: { value: string | null }) {
  if (details.value === "publish" && !saved.value) {
    blocked.value = "还有未保存的改动，先保存再发布";
    return;
  }
  blocked.value = "";
  stage.value = details.value;
}
<\/script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot :value="stage" disallow-empty @value-change="onValueChange">
      <XhToggleGroupItem value="draft">草稿</XhToggleGroupItem>
      <XhToggleGroupItem value="review">送审</XhToggleGroupItem>
      <XhToggleGroupItem value="publish">发布</XhToggleGroupItem>
    </XhToggleGroupRoot>
    <span style="font-size: 13px;">当前：{{ stage }}</span>
  </span>

  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <button type="button" :disabled="saved" @click="saved = true">
      {{ saved ? "已保存" : "保存改动" }}
    </button>
    <span v-if="blocked" style="font-size: 13px;">{{ blocked }}</span>
  </span>
</template>
`;export{e as default};
