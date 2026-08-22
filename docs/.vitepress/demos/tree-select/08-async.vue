<!-- 异步加载子节点 | 展开某个分支才去要它的子节点：先摆一行禁用占位，数据回来就地换掉，显示文本随之取到新 label -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

interface Node {
  value: string;
  label: string;
  disabled?: boolean;
  children?: Node[];
}

// 占位行也是一个真节点：它得在 collection 里，方向键才走得到它
function pending(owner: string): Node[] {
  return [{ value: `${owner}-pending`, label: "加载中…", disabled: true }];
}

const collection = ref<Node[]>([
  { value: "east", label: "华东", children: pending("east") },
  { value: "north", label: "华北", children: pending("north") },
]);

const cities: Record<string, string[]> = {
  east: ["上海", "杭州", "南京"],
  north: ["北京", "天津"],
};

const expanded = ref<string[]>([]);
const picked = ref<string[]>([]);
const loaded = new Set<string>();

function fetchChildren(value: string): void {
  if (loaded.has(value)) return;
  loaded.add(value);
  window.setTimeout(() => {
    const branch = collection.value.find((node) => node.value === value);
    if (!branch) return;
    branch.children = cities[value].map((name, index) => ({
      value: `${value}-${index}`,
      label: name,
    }));
  }, 800);
}

function onExpandedChange(details: { value: string[] }): void {
  expanded.value = details.value;
  for (const value of details.value) fetchChildren(value);
}
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="picked"
    :collection="collection"
    :expanded-value="expanded"
    placeholder="选一个城市"
    style="max-inline-size: 320px"
    @expanded-change="onExpandedChange"
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
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="city in region.children"
                :key="city.value"
                :value="city.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ city.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
