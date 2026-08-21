const n=`<!-- 外部触发的输入会话 | 输入部件平时收起，按「添加」才露面并聚焦；打字时给候选，选中即落标签，失焦按 blur-behavior 收尾 -->
<script setup lang="ts">
import { nextTick, ref } from "vue";
import {
  XhButton,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
} from "@xihan-ui/vue";

const domains = ["@qq.com", "@163.com", "@gmail.com"];

const mails = ref<string[]>(["hi@xihan.dev"]);
const typing = ref(false);
const input = ref<InstanceType<typeof XhTagsInputInput> | null>(null);

// 输入框由外部按钮开合，露面后焦点要自己送进去
function start() {
  typing.value = true;
  nextTick(() => {
    (input.value?.$el as HTMLInputElement | undefined)?.focus();
  });
}

// 候选：拿已经打出来的前缀拼几个完整地址
function options(text: string): string[] {
  const prefix = text.split("@")[0] ?? "";
  return prefix ? domains.map((domain) => prefix + domain) : [];
}
<\/script>

<template>
  <XhTagsInputRoot
    v-slot="{ value, inputValue, addValue, setInputValue, atMax }"
    v-model:value="mails"
    :max="4"
    blur-behavior="add"
    placeholder="打前缀选后缀"
    style="max-inline-size: 420px"
  >
    <XhTagsInputLabel>通知邮箱（最多 4 个）</XhTagsInputLabel>
    <XhTagsInputControl>
      <XhTagsInputItem v-for="t in value" :key="t" :value="t">
        <XhTagsInputItemPreview>
          <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
          <XhTagsInputItemDeleteTrigger>×</XhTagsInputItemDeleteTrigger>
        </XhTagsInputItemPreview>
      </XhTagsInputItem>
      <XhTagsInputInput v-if="typing" ref="input" @blur="typing = false" />
      <XhButton
        v-else
        size="sm"
        variant="outline"
        :disabled="atMax"
        @click="start"
      >
        ＋ 添加
      </XhButton>
    </XhTagsInputControl>

    <!-- 候选面板是作者自己的节点：按下不放焦点，点完把框里的半截文本清掉 -->
    <div
      v-if="typing && options(inputValue).length"
      style="
        display: flex;
        flex-direction: column;
        margin-block-start: 4px;
        border: 1px solid var(--xh-border-subtle);
        border-radius: var(--xh-radius-md);
        overflow: hidden;
      "
    >
      <button
        v-for="opt in options(inputValue)"
        :key="opt"
        type="button"
        style="
          padding: 6px 10px;
          border: 0;
          background: none;
          color: var(--xh-fg-default);
          font: inherit;
          text-align: start;
          cursor: pointer;
        "
        @mousedown.prevent
        @click="
          addValue(opt);
          setInputValue('');
        "
      >
        {{ opt }}
      </button>
    </div>
  </XhTagsInputRoot>
</template>
`;export{n as default};
