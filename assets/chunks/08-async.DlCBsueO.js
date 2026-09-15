const e=`<!-- 首次全量加载与空集合 | 第一次展开才取整棵树；正式 Loading/Empty 与候选树互斥，状态文字不进入选值或键盘导航，底部按钮可重放有数据与零集合响应 -->
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectEmpty,
  XhTreeSelectFooter,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectLoading,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

const CITY_TREE: Node[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "east-shanghai", label: "上海" },
      { value: "east-hangzhou", label: "杭州" },
      { value: "east-nanjing", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "north-beijing", label: "北京" },
      { value: "north-tianjin", label: "天津" },
    ],
  },
];

const collection = ref<Node[]>([]);
const expanded = ref<string[]>([]);
const picked = ref<string[]>([]);
const loading = ref(false);
let requested = false;
let timer: number | undefined;

function load(mode: "cities" | "empty"): void {
  if (timer !== undefined)
    window.clearTimeout(timer);
  loading.value = true;
  collection.value = [];
  expanded.value = [];
  picked.value = [];
  timer = window.setTimeout(() => {
    timer = undefined;
    collection.value = mode === "cities" ? CITY_TREE : [];
    loading.value = false;
  }, 800);
}

function onOpenChange(details: { open: boolean }): void {
  if (!details.open || requested)
    return;
  requested = true;
  load("cities");
}

onBeforeUnmount(() => {
  if (timer !== undefined)
    window.clearTimeout(timer);
});
<\/script>

<template>
  <XhTreeSelectRoot
    v-model:value="picked"
    :collection="collection"
    :expanded-value="expanded"
    :loading="loading"
    placeholder="选一个城市"
    style="max-inline-size: 320px"
    @expanded-value-change="expanded = $event.value"
    @open-change="onOpenChange"
  >
    <XhTreeSelectLabel>投放城市</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="region in collection"
            :key="region.value"
            :value="region.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>{{ region.label }}</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="city in region.children ?? []"
                :key="city.value"
                :value="city.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ city.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
        <XhTreeSelectLoading>正在加载城市…</XhTreeSelectLoading>
        <XhTreeSelectEmpty>暂无可选城市</XhTreeSelectEmpty>
        <XhTreeSelectFooter>
          <button type="button" :disabled="loading" @click="load('cities')">加载城市</button>
          <button type="button" :disabled="loading" @click="load('empty')">加载空集合</button>
        </XhTreeSelectFooter>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
`;export{e as default};
