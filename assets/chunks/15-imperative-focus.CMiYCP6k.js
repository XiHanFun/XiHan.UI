const n=`<!-- 命令式聚焦与展开 | trigger 部件就是原生按钮，拿到它即可 focus / blur；开合交给宿主写 open -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/vue";

const regions = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [{ value: "nanjing", label: "南京" }],
  },
];

const trigger = ref<InstanceType<typeof XhCascaderTrigger> | null>(null);
const area = ref<string[][]>([]);

// 组件实例的 $el 就是那个按钮
const triggerEl = () => trigger.value?.$el as HTMLButtonElement | undefined;
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels, open, setOpen }"
    v-model:value="area"
    :collection="regions"
    placeholder="请选择地区"
  >
    <XhCascaderLabel>收货地区</XhCascaderLabel>
    <XhCascaderTrigger ref="trigger">
      <XhCascaderValueText />
      <XhCascaderIndicator />
    </XhCascaderTrigger>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem
            v-for="node in lv.items"
            :key="node.value"
            :value="node.value"
          >
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
    <div style="display: flex; gap: 8px; margin-block-start: 12px">
      <XhButton size="sm" variant="outline" @click="triggerEl()?.focus()">
        聚焦
      </XhButton>
      <XhButton size="sm" variant="outline" @click="triggerEl()?.blur()">
        失焦
      </XhButton>
      <XhButton size="sm" variant="outline" @click="setOpen(!open)">
        {{ open ? "收起" : "展开" }}
      </XhButton>
    </div>
  </XhCascaderRoot>
</template>
`;export{n as default};
