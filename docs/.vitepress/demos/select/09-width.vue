<!-- 宽度 | 触发器与浮层各有自己的宽度槽位，写在根部件上即可；装不下的文本在行内以省略号收口 -->
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const plans = [
  { value: "basic", label: "基础版" },
  { value: "pro", label: "专业版" },
  { value: "long", label: "旗舰版 · 含无限席位与专属客户成功经理的年度合约" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot :default-value="['long']" placeholder="请选择">
      <XhSelectLabel>缺省宽度</XhSelectLabel>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator>▾</XhSelectIndicator>
      </XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            <XhSelectItem v-for="p in plans" :key="p.value" :value="p.value">
              <XhSelectItemText>{{ p.label }}</XhSelectItemText>
              <XhSelectItemIndicator>✓</XhSelectItemIndicator>
            </XhSelectItem>
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>

    <XhSelectRoot
      :default-value="['long']"
      placeholder="请选择"
      style="--xh-select-trigger-min-w: 15rem; --xh-select-content-min-w: 22rem"
    >
      <XhSelectLabel>加宽</XhSelectLabel>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator>▾</XhSelectIndicator>
      </XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            <XhSelectItem v-for="p in plans" :key="p.value" :value="p.value">
              <XhSelectItemText>{{ p.label }}</XhSelectItemText>
              <XhSelectItemIndicator>✓</XhSelectItemIndicator>
            </XhSelectItem>
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  </div>
</template>
