const e=`<!-- 受控值表 | 传了 values 就由宿主说了算：组件内部不再落值，只发变更通知；页面别处也能直接改这张表 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
} from "@xihan-ui/vue";

const defaults = { host: "127.0.0.1", port: "5173" };
const values = ref<Record<string, unknown>>({ ...defaults });
<\/script>

<template>
  <XhFormRoot
    v-model:values="values"
    :default-values="defaults"
    style="inline-size: 260px;"
  >
    <XhFormFieldGroup v-slot="{ value, setValue }" value="host">
      <XhFieldRoot>
        <XhFieldLabel>主机</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)" />
        </XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <XhFormFieldGroup v-slot="{ value, setValue }" value="port">
      <XhFieldRoot>
        <XhFieldLabel>端口</XhFieldLabel>
        <XhFieldControl>
          <input :value="value" @input="setValue(($event.target as HTMLInputElement).value)" />
        </XhFieldControl>
      </XhFieldRoot>
    </XhFormFieldGroup>

    <!-- 重置把值送回 default-values，同样经由 update:values 落到宿主这张表上 -->
    <XhFormResetTrigger>重置</XhFormResetTrigger>
  </XhFormRoot>

  <span style="font-size: 13px;">宿主持有的值：{{ JSON.stringify(values) }}</span>
</template>
`;export{e as default};
