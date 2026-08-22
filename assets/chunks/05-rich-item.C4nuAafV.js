const e=`<!-- 条目自定义内容 | 条目里长什么样归作者：勾选格与文本各就各位，前后再各加一段自己的标记 -->
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
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

// label 与 disabled 归组件读，其余字段是作者自己的，只用来渲染
const members = [
  { value: "lin", label: "林可", role: "前端工程师" },
  { value: "zhou", label: "周宁", role: "服务端工程师" },
  { value: "he", label: "何雨", role: "交互设计" },
  { value: "qin", label: "秦朗", role: "测试工程师" },
  { value: "xu", label: "许知", role: "产品经理" },
];

const value = ref<string[]>(["he"]);
<\/script>

<template>
  <div style="inline-size: 100%; max-inline-size: 560px">
    <XhTransferRoot v-model:value="value" :collection="members">
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>候选成员</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="m in members" :key="m.value" :value="m.value">
            <XhTransferItemCheckbox />
            <span
              aria-hidden="true"
              style="
                display: inline-flex;
                flex: none;
                inline-size: 24px;
                block-size: 24px;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                background: var(--xh-bg-subtle);
                font-size: 12px;
              "
            >
              {{ m.label.slice(0, 1) }}
            </span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <XhTransferItemText>{{ m.label }}</XhTransferItemText>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">{{ m.role }}</span>
            </span>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>项目组</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="m in members" :key="m.value" :value="m.value">
            <XhTransferItemCheckbox />
            <span
              aria-hidden="true"
              style="
                display: inline-flex;
                flex: none;
                inline-size: 24px;
                block-size: 24px;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                background: var(--xh-bg-subtle);
                font-size: 12px;
              "
            >
              {{ m.label.slice(0, 1) }}
            </span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <XhTransferItemText>{{ m.label }}</XhTransferItemText>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">{{ m.role }}</span>
            </span>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
`;export{e as default};
