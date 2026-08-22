const t=`<!-- 出错的那一步 | 步序只认下标，「这一步出错了」是宿主自己的数据：在那一步的 item 上换掉标记与颜色令牌 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from "@xihan-ui/vue";

const steps = [
  { title: "提交材料", description: "已通过" },
  { title: "资质审核", description: "材料不齐，被打回" },
  { title: "签署合同", description: "等待中" },
];

// 出错的那一步
const errorAt = 1;

// 当前档与已走过档一起换成危险色，写在 item 上，序号、标题与连接线都从这里继承
const errorTokens = {
  "--xh-steps-indicator-border-current": "var(--xh-fg-danger)",
  "--xh-steps-indicator-fg-current": "var(--xh-fg-danger)",
  "--xh-steps-indicator-border-completed": "var(--xh-fg-danger)",
  "--xh-steps-indicator-bg-completed": "var(--xh-fg-danger)",
  "--xh-steps-title-fg-active": "var(--xh-fg-danger)",
  "--xh-steps-separator-bg-completed": "var(--xh-fg-danger)",
};

const current = ref(1);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhStepsRoot v-model:step="current" :count="steps.length">
      <XhStepsList>
        <XhStepsItem
          v-for="(s, i) in steps"
          :key="s.title"
          :value="i"
          :style="i === errorAt ? errorTokens : undefined"
        >
          <XhStepsTrigger>
            <XhStepsIndicator>
              {{ i === errorAt ? "!" : current > i ? "" : i + 1 }}
            </XhStepsIndicator>
            <XhStepsTitle>{{ s.title }}</XhStepsTitle>
            <XhStepsDescription>{{ s.description }}</XhStepsDescription>
          </XhStepsTrigger>
          <XhStepsSeparator />
        </XhStepsItem>
      </XhStepsList>
    </XhStepsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton size="sm" variant="outline" @click="current = 2">
        走到第三步
      </XhButton>
      <XhButton size="sm" variant="outline" @click="current = 1">
        退回第二步
      </XhButton>
      <span>第二步无论是当前步还是已走过，都停在危险色上</span>
    </div>
  </div>
</template>
`;export{t as default};
