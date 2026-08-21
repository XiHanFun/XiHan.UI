const t=`<!-- 区分大小写 | 缺省不区分，开了 case-sensitive 就按写法比 -->
<script setup lang="ts">
import { XhHighlight } from "@xihan-ui/vue";

const text = "XiHan UI 与 xihan ui 是同一个名字的两种写法。";
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhHighlight :text="text" keyword="ui" />
    <XhHighlight :text="text" keyword="ui" case-sensitive />
  </div>
</template>
`;export{t as default};
