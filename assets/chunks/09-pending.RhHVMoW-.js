const n=`<!-- 请求在途 | 受控的 pressed 不写回就不会动，在途期间来的意图直接丢掉；忙碌反馈由 aria-busy 与一枚转圈补在按钮上 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhSpinner, XhToggle } from "@xihan-ui/vue";

const subscribed = ref(false);
const pending = ref(false);

function onPressedChange(details: { pressed: boolean }): void {
  // 在途期间不写回 pressed，按钮就停在原来的按下态上
  if (pending.value)
    return;
  pending.value = true;
  setTimeout(() => {
    subscribed.value = details.pressed;
    pending.value = false;
  }, 1200);
}
<\/script>

<template>
  <!-- aria-disabled 而非 disabled：焦点留得住，读屏也报得出「这颗按不动」 -->
  <XhToggle
    :pressed="subscribed"
    variant="outline"
    :aria-busy="pending"
    :aria-disabled="pending"
    style="min-inline-size: 108px"
    @pressed-change="onPressedChange"
  >
    <!-- 转圈自带活区与名字，「在等什么」由它的 label 念出来 -->
    <XhSpinner v-if="pending" size="sm" label="正在提交" />
    {{ subscribed ? "已订阅" : "订阅" }}
  </XhToggle>

  <span style="font-size: 13px">
    {{ pending ? "请求在飞，这时候再点没有反应" : "点一下，落定要等 1.2 秒" }}
  </span>
</template>
`;export{n as default};
