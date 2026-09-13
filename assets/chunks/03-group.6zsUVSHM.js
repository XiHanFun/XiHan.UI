const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 分组 | 按类别组织选项 -->
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxGroup,
  XhListboxGroupLabel,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "bangkok", label: "Bangkok 曼谷" },
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];
<\/script>

<template>
  <XhListboxRoot :default-value="['beijing']" style="inline-size: min(100%, 300px)">
    <XhListboxLabel>城市</XhListboxLabel>
    <XhListboxContent>
      <XhListboxGroup v-for="g in groups" :key="g.value" :value="g.value">
        <XhListboxGroupLabel>{{ g.label }}</XhListboxGroupLabel>
        <XhListboxItem v-for="c in g.items" :key="c.value" :value="c.value">
          <XhListboxItemText>{{ c.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxGroup>
    </XhListboxContent>
  </XhListboxRoot>
</template>
`;export{n as default};
