const e=`<!-- 懒加载 | 节点写 hasChildren 不给 children，展开路径走到它时由 loadChildren 取回直接子项；在途与失败都显示在它那一列里，失败在父条目上按 Enter 或点重试钮再取 -->
<script setup lang="ts">
import type { CascaderLoadChildrenRequest, CascaderNode } from "@xihan-ui/headless";
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

// 只写到省一级：下一层等展开时再取
const regions: CascaderNode[] = [
  { value: "zhejiang", label: "浙江", hasChildren: true },
  { value: "jiangsu", label: "江苏", hasChildren: true },
];

// 下一层的数据在后端，这里用定时器代替一次请求
const remote: Record<string, CascaderNode[]> = {
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

// 浮层收起或展开路径离开这一支时 signal 中止，把定时器一起撤掉
function loadChildren({ node, signal }: CascaderLoadChildrenRequest): Promise<CascaderNode[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 800, remote[node.value] ?? []);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    :collection="regions"
    :load-children="loadChildren"
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
        <!-- levels 含取回的那一层；还没取回时也有一个空层，在途提示铺在它里面 -->
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
</template>
`;export{e as default};
