<!-- 多选 | 已选项在触发器里排成标签，超出 max-tag-count 的合并为 +N；按钮不能套按钮，带删除钮的标签只能排在触发器外 -->
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemDeleteTrigger,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["apple", "banana", "blueberry"]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot
    v-slot="{ tags }"
    v-model:value="picked"
    :collection="fruits"
    :max-tag-count="2"
    multiple
    placeholder="请选择"
  >
    <XhSelectLabel>水果（多选）</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <!-- 占位文字与标签行同时写着：有选中时标签行露面、占位让位，无选中时反过来。行里每枚标签与 +N 都是 tag 的 root，样子归 tag.css -->
        <XhSelectValueText />
        <XhSelectTagList>
          <XhSelectTag v-for="t in tags" :key="t.value" :value="t.value">{{ t.label }}</XhSelectTag>
          <XhSelectOverflowTag />
        </XhSelectTagList>
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
    <!-- 触发器外的可删标签行：按钮不能套按钮，删除钮只能放在这里 -->
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-1); margin-block-start: var(--xh-space-2)">
      <XhSelectTag v-for="v in picked" :key="v" :value="v">
        {{ fruits.find((f) => f.value === v)?.label ?? v }}
        <XhSelectItemDeleteTrigger />
      </XhSelectTag>
    </div>
  </XhSelectRoot>
  <p data-demo-output>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
