const e=`<!-- 浮层内关键词过滤 | 输入框是树的兄弟节点，树的键盘处理器挂在 tree 上，打字不会被连打检索收走；换掉 collection 可见行与方向键顺序跟着重算 -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
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

interface City {
  value: string;
  label: string;
}

interface Region {
  value: string;
  label: string;
  children: City[];
}

const source: Region[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "sh", label: "上海" },
      { value: "hz", label: "杭州" },
      { value: "nj", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "bj", label: "北京" },
      { value: "tj", label: "天津" },
    ],
  },
  {
    value: "south",
    label: "华南",
    children: [
      { value: "gz", label: "广州" },
      { value: "sz", label: "深圳" },
    ],
  },
];

const keyword = ref("");

// 分区名命中就整枝留下，否则只留命中的城市；一个都不剩的分区整枝去掉
const collection = computed<Region[]>(() => {
  const key = keyword.value.trim();
  if (!key) return source;
  return source
    .map((region) => ({
      ...region,
      children: region.label.includes(key)
        ? region.children
        : region.children.filter((city) => city.label.includes(key)),
    }))
    .filter((region) => region.children.length > 0);
});

const expanded = ref<string[]>([]);

watch(keyword, () => {
  expanded.value = keyword.value.trim()
    ? collection.value.map((region) => region.value)
    : [];
});

// 收起浮层顺手把关键词清掉，下次展开还是整棵树
function onOpenChange(details: { open: boolean }): void {
  if (!details.open) keyword.value = "";
}
<\/script>

<template>
  <XhTreeSelectRoot
    v-model:expanded-value="expanded"
    :collection="collection"
    placeholder="选一个城市"
    style="max-inline-size: 320px"
    @open-change="onOpenChange"
  >
    <XhTreeSelectLabel>投放城市</XhTreeSelectLabel>
    <XhTreeSelectTrigger>
      <XhTreeSelectValueText />
      <XhTreeSelectIndicator>▾</XhTreeSelectIndicator>
    </XhTreeSelectTrigger>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <!-- 浮层里的输入框不算点在外面，浮层不会因此收起 -->
        <input
          v-model="keyword"
          type="search"
          aria-label="城市关键词"
          placeholder="输入关键词"
          style="inline-size: 100%; margin-block-end: 6px"
        />
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="region in collection"
            :key="region.value"
            :value="region.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger>▸</XhTreeSelectBranchTrigger>
              <XhTreeSelectBranchText>{{ region.label }}</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="city in region.children"
                :key="city.value"
                :value="city.value"
              >
                <XhTreeSelectItemIndicator>✓</XhTreeSelectItemIndicator>
                <XhTreeSelectItemText>{{ city.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
        <p v-if="!collection.length" style="margin: 0; padding: 4px">
          没有匹配「{{ keyword }}」的城市
        </p>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
</template>
`;export{e as default};
