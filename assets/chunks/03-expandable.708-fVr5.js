var e=`<!-- 展开全文 | 真被裁了才在文字之后露出一颗展开按钮；文字本身照常可选中，展开与收起只归按钮管 -->
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";

const translations = { expand: "展开", collapse: "收起" };
<\/script>

<template>
  <div style="inline-size: 360px; max-inline-size: 100%">
    <XhTruncate :lines="2" expandable :translations="translations">
      本次更新改进了组件主题、键盘交互与响应式布局。按下文字下方的按钮可查看完整内容，再按一次即可收起。
    </XhTruncate>
  </div>
</template>
`;export{e as default};