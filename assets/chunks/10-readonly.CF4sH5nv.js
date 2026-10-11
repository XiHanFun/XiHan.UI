var e=`<!-- 只读 | 格子带上原生 readonly，值受控且宿主不回写：可聚焦、可选中复制，不可修改 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

// 传了 value 就由宿主说了算，不回写值就恒定不变
const code = ["8", "1", "9", "2"];
<\/script>

<template>
  <XhPinInputRoot :length="4" :value="code" read-only>
    <XhPinInputLabel>上一次的验证码</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
    </div>
  </XhPinInputRoot>
  <span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
</template>
`;export{e as default};