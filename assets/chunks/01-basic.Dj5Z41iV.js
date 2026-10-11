var e=`<!-- 基础用法 | 一组字段收进原生 fieldset：legend 是该组的名字，说明文案自动派生 id 并接入 aria-describedby -->
<script setup lang="ts">
import { XhCheckbox, XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhFieldsetRoot style="inline-size: 320px;">
    <XhFieldsetLegend>通知方式</XhFieldsetLegend>
    <XhCheckbox default-checked>站内消息</XhCheckbox>
    <XhCheckbox>邮件</XhCheckbox>
    <XhCheckbox>短信</XhCheckbox>
    <XhFieldsetDescription>至少保留一种，重要变更会照此通知你</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
`;export{e as default};