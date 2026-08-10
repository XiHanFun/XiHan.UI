<!-- 拦截切换 | 受控下 value-change 只是意图，宿主校验不过就不写回 value，标签页原地不动 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const value = ref("draft");
const dirty = ref(true);
const notice = ref("");

// 只单向绑 value，写不写回由这里说了算
function onValueChange(details: { value: string | null }): void {
  if (dirty.value) {
    notice.value = "草稿还没保存，切不过去";
    return;
  }
  notice.value = "";
  value.value = details.value ?? value.value;
}

function save(): void {
  dirty.value = false;
  notice.value = "已保存，现在可以切走了";
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTabsRoot :value="value" @value-change="onValueChange">
      <XhTabsList>
        <XhTabsTrigger value="draft">草稿</XhTabsTrigger>
        <XhTabsTrigger value="preview">预览</XhTabsTrigger>
        <XhTabsTrigger value="publish">发布</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="draft">草稿面板：内容改过还没保存。</XhTabsContent>
      <XhTabsContent value="preview">预览面板。</XhTabsContent>
      <XhTabsContent value="publish">发布面板。</XhTabsContent>
    </XhTabsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" :disabled="!dirty" @click="save">
        保存草稿
      </XhButton>
      <span>{{ notice || `当前：${value}` }}</span>
    </div>
  </div>
</template>
