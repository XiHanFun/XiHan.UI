const n=`<!-- 子节点按需加载 | 先给分支塞一个禁用的占位子节点让子列开得出来，展开到它时才去取真数据换掉占位 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
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

interface RegionNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: RegionNode[];
}

// 下一层的数据在后端，这里用定时器代替一次请求
const remote: Record<string, RegionNode[]> = {
  zhejiang: [
    { value: "hangzhou", label: "杭州" },
    { value: "ningbo", label: "宁波" },
    { value: "wenzhou", label: "温州" },
  ],
  jiangsu: [
    { value: "nanjing", label: "南京" },
    { value: "suzhou", label: "苏州" },
  ],
};

// 占位子节点：children 非空才算分支，子列才开得出来；禁用让方向键跳过它，也点不动
function pending(parent: string): RegionNode {
  return { value: \`\${parent}:pending\`, label: "加载中…", disabled: true };
}

const regions = ref<RegionNode[]>([
  { value: "zhejiang", label: "浙江", children: [pending("zhejiang")] },
  { value: "jiangsu", label: "江苏", children: [pending("jiangsu")] },
]);

const loading = ref<string[]>([]);
const loaded = ref<string[]>([]);

// 点开或键盘走到这一支时才取它的子节点，取回来把占位那一条整个换掉
function load(value: string) {
  const children = remote[value];
  if (!children || loading.value.includes(value) || loaded.value.includes(value)) {
    return;
  }
  loading.value = [...loading.value, value];
  setTimeout(() => {
    const node = regions.value.find((item) => item.value === value);
    if (node) {
      node.children = children;
    }
    loading.value = loading.value.filter((v) => v !== value);
    loaded.value = [...loaded.value, value];
  }, 800);
}

const area = ref<string[][]>([]);
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="area"
    :collection="regions"
    placeholder="请选择地区"
  >
    <XhCascaderLabel>收货地区</XhCascaderLabel>
    <XhCascaderControl>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator />
      </XhCascaderTrigger>
    </XhCascaderControl>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem
            v-for="node in lv.items"
            :key="node.value"
            :value="node.value"
            @click="load(node.value)"
            @focus="load(node.value)"
          >
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <span
              v-if="loading.includes(node.value)"
              style="flex: none; color: var(--xh-fg-subtle); font-size: 12px"
            >
              取数中
            </span>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>当前路径：{{ area.length ? area[0].join(" / ") : "（未选）" }}</p>
</template>
`;export{n as default};
