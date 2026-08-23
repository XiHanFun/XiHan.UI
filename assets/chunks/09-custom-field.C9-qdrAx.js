const n=`<!-- 后端字段映射 | collection 只认 value / label / disabled / children 这几个名字，后端字段不一致就在进组件前转一道 -->
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

// 后端原样返回的树：键名与组件对不上
interface RawNode {
  code: string;
  name: string;
  frozen?: boolean;
  sub?: RawNode[];
}

interface RegionNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: RegionNode[];
}

const raw: RawNode[] = [
  {
    code: "east",
    name: "华东",
    sub: [
      {
        code: "shanghai",
        name: "上海",
        sub: [
          { code: "pudong", name: "浦东新区" },
          { code: "xuhui", name: "徐汇区" },
        ],
      },
      {
        code: "hangzhou",
        name: "杭州",
        sub: [{ code: "xihu", name: "西湖区" }],
      },
    ],
  },
  {
    code: "south",
    name: "华南",
    sub: [
      {
        code: "guangzhou",
        name: "广州",
        sub: [{ code: "tianhe", name: "天河区" }],
      },
      { code: "shenzhen", name: "深圳", frozen: true },
    ],
  },
];

function toNodes(list: RawNode[]): RegionNode[] {
  return list.map((item) => ({
    value: item.code,
    label: item.name,
    disabled: item.frozen,
    children: item.sub ? toNodes(item.sub) : undefined,
  }));
}

const regions = toNodes(raw);
const area = ref<string[][]>([]);
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="area"
    :collection="regions"
    placeholder="请选择服务区域"
  >
    <XhCascaderLabel>服务区域</XhCascaderLabel>
    <XhCascaderControl>
      <XhCascaderTrigger>
        <XhCascaderValueText />
        <XhCascaderIndicator />
      </XhCascaderTrigger>
    </XhCascaderControl>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>选中的是转换后的 value：{{ area.length ? area[0].join(" / ") : "（未选）" }}</p>
</template>
`;export{n as default};
