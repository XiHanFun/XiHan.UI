<!-- 限制可输入的字符 | beforeinput 直接写在 input 部件上，非法字符进不了框，值与框里的内容始终一致 -->
<script setup lang="ts">
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";

// 这次要插入的文本：键入与输入法走 data，粘贴与拖入走 dataTransfer
function incoming(event: Event): string {
  const e = event as InputEvent;
  return e.data ?? e.dataTransfer?.getData("text/plain") ?? "";
}

function onlyDigits(event: Event) {
  const text = incoming(event);
  if (text !== "" && /\D/.test(text)) {
    event.preventDefault();
  }
}

function noSpace(event: Event) {
  if (/\s/.test(incoming(event))) {
    event.preventDefault();
  }
}
</script>

<template>
  <XhTextFieldRoot placeholder="只收数字" :max-length="11">
    <XhTextFieldLabel>手机号</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput inputmode="numeric" @beforeinput="onlyDigits" />
    </XhTextFieldControl>
  </XhTextFieldRoot>

  <XhTextFieldRoot placeholder="空格进不来">
    <XhTextFieldLabel>账号</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 200px">
      <XhTextFieldInput @beforeinput="noSpace" />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
