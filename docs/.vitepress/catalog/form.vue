<script setup lang="ts">
import { XhFieldControl, XhFieldLabel, XhFieldRoot, XhFormFieldGroup, XhFormRoot, XhFormSubmitTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhFormRoot :default-values="{ email: 'you@example.com', nickname: '' }" style="inline-size: 220px">
    <XhFormFieldGroup v-slot="{ value }" name="email">
      <XhFieldRoot required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl><input type="email" :value="value"></XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <XhFormFieldGroup v-slot="{ value }" name="nickname">
      <XhFieldRoot>
        <XhFieldLabel>昵称</XhFieldLabel>
        <XhFieldControl><input :value="value" placeholder="可选"></XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <div><XhFormSubmitTrigger>提交</XhFormSubmitTrigger></div>
  </XhFormRoot>
</template>
