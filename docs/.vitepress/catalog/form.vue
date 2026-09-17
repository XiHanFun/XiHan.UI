<script setup lang="ts">
import { XhFieldControl, XhFieldLabel, XhFieldRoot, XhFormFieldGroup, XhFormRoot, XhFormSubmitTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhFormRoot :default-values="{ email: 'you@example.com' }" style="inline-size: var(--xh-doc-catalog-w)">
    <XhFormFieldGroup v-slot="{ value }" name="email">
      <XhFieldRoot required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl><input type="email" :value="value"></XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>
    <div><XhFormSubmitTrigger>提交</XhFormSubmitTrigger></div>
  </XhFormRoot>
</template>
