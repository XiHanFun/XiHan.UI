const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 展开全文 | 点击文本展开或收起 -->
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="inline-size: 360px; max-inline-size: 100%">
    <XhTruncate :lines="2" expandable>
      本次更新改进了组件主题、键盘交互与响应式布局。点击这段文字可查看完整内容，再次点击即可收起。
    </XhTruncate>
  </div>
</template>
`;export{n as default};
