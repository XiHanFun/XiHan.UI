<!-- 元素配声 | v-sound 默认放 click，给字符串即指名；键盘敲 Enter 一样响，禁用态不响 -->
<script setup lang="ts">
import { XhButton } from "@xihan-ui/vue";
import { vSound } from "@xihan-ui/vue/sound";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhButton v-sound variant="solid">默认 click</XhButton>
    <XhButton v-sound="'send'" variant="outline">发送</XhButton>
    <XhButton v-sound="{ sound: 'toggle-on', volume: 0.6 }" variant="outline">
      指定音量
    </XhButton>
    <XhButton v-sound disabled variant="outline">禁用不响</XhButton>
  </div>
</template>
