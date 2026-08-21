const n=`<!-- 一次性验证码 | otp 补上 autocomplete=one-time-code，隐藏输入把拼好的整串交给表单，填满那一刻发 value-complete -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPinInputHiddenInput,
  XhPinInputInput,
  XhPinInputLabel,
  XhPinInputRoot,
} from "@xihan-ui/vue";

const code = ref<string[]>([]);
const submitted = ref("");
<\/script>

<template>
  <XhPinInputRoot
    v-model:value="code"
    :length="6"
    name="code"
    placeholder="·"
    otp
    @value-complete="submitted = $event.valueAsString"
  >
    <XhPinInputLabel>短信验证码</XhPinInputLabel>
    <div style="display: flex">
      <XhPinInputInput v-for="i in 6" :key="i" :index="i - 1" />
    </div>
    <XhPinInputHiddenInput />
  </XhPinInputRoot>
  <span>填满时拿到：{{ submitted || "（未填满）" }}</span>
</template>
`;export{n as default};
