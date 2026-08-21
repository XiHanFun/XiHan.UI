<!-- 轨道内文案与滑块标记 | 轨道的子节点全由作者决定，data-state 同时打在轨道与滑块上 -->
<script setup lang="ts">
import { XhIcon, useSwitch } from "@xihan-ui/vue";
import { CheckIcon, XIcon } from "@xihan-ui/icons";

const { api: trackApi } = useSwitch({ defaultChecked: true });
const { api: markApi } = useSwitch({});
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <!-- 文案与滑块同为轨道的直接子节点：开态文案在左、滑块在右，关态反过来 -->
    <button
      v-bind="trackApi.getRootProps()"
      style="
        inline-size: auto;
        min-inline-size: 64px;
        justify-content: space-between;
        gap: 6px;
        padding-inline: 8px;
      "
    >
      <span v-if="trackApi.checked" style="font-size: 12px; color: var(--xh-fg-on-brand)">
        开
      </span>
      <span v-bind="trackApi.getThumbProps()" style="translate: none" />
      <span v-if="!trackApi.checked" style="font-size: 12px">关</span>
    </button>

    <!-- 滑块里也能放东西：属性来自 getThumbProps，内容照写不误 -->
    <button v-bind="markApi.getRootProps()">
      <span
        v-bind="markApi.getThumbProps()"
        style="display: inline-flex; align-items: center; justify-content: center; font-size: 11px"
      >
        <XhIcon :icon="markApi.checked ? CheckIcon : XIcon" />
      </span>
    </button>
  </div>
</template>
