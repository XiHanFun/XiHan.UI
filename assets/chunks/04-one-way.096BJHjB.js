const e=`<!-- 单向搬运 | oneWay 把往回搬那条路整个封死，右侧不再接受勾选，往回的按钮也就不必写 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "cpu", label: "CPU 用量" },
  { value: "mem", label: "内存用量" },
  { value: "disk", label: "磁盘 IO" },
  { value: "net", label: "网络吞吐" },
  { value: "qps", label: "请求量" },
];

const value = ref<string[]>([]);
<\/script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot v-model:value="value" :collection="items" one-way>
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>可订阅指标</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger>›</XhTransferToTargetTrigger>

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已订阅</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <!-- 右侧的勾选格由组件自己隐去：这一侧勾不了任何东西 -->
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
`;export{e as default};
