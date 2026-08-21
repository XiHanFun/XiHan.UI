const n=`<!-- 形态 | variant 只改每格的颜色槽位，跳格与粘贴铺开的行为三档一致 -->
<script setup lang="ts">
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <XhPinInputRoot v-for="v in variants" :key="v" :variant="v" :length="4" placeholder="·">
      <XhPinInputLabel>{{ v }}</XhPinInputLabel>
      <!-- 格间距长在格子自己身上，这层包裹只负责排成一行 -->
      <div style="display: flex">
        <XhPinInputInput v-for="i in 4" :key="i" :index="i - 1" />
      </div>
    </XhPinInputRoot>
  </div>
</template>
`;export{n as default};
