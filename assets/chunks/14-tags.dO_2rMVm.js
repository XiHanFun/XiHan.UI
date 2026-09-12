const e=`<!-- 多选标签 | 内建标签形态：触发器里的标签行最多摆 maxTagCount 枚（缺省 3），其余合成一枚 +N；每枚标签与 +N 都是库里的 tag（语气与尺寸随控件，形态按控件的面派），触发器里纯展示，触发器外配删除钮即可删，那颗钮就是 tag 的 close-trigger -->
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

const options = [
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "lit", label: "Lit" },
  { value: "preact", label: "Preact" },
];

const picked = ref<string[]>(["vue", "svelte", "solid"]);
<\/script>

<template>
  <XhSelectRoot
    v-slot="{ tags }"
    v-model:value="picked"
    :collection="options"
    :max-tag-count="2"
    multiple
    placeholder="请选择"
    style="inline-size: 280px"
  >
    <XhSelectLabel>技术栈</XhSelectLabel>
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
          <XhSelectItem v-for="o in options" :key="o.value" :value="o.value">
            <XhSelectItemText>{{ o.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
    <!-- 触发器外的可删标签行：按钮不能套按钮，删除钮只能放在这里 -->
    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-block-start: 6px">
      <XhSelectTag v-for="v in picked" :key="v" :value="v">
        {{ options.find((o) => o.value === v)?.label ?? v }}
        <XhSelectItemDeleteTrigger />
      </XhSelectTag>
    </div>
  </XhSelectRoot>
</template>
`;export{e as default};
