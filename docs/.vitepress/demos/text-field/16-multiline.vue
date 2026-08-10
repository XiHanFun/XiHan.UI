<!-- 多行与自动长高 | 组合式函数把同一份状态交给作者自写的多行部件，高度在每次输入后按内容重新量 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { useTextField } from "@xihan-ui/vue";

const { api } = useTextField({ placeholder: "说点什么", maxLength: 120 });

const rootProps = computed(() => api.value.getRootProps());
const labelProps = computed(() => api.value.getLabelProps());

// type 是给单行输入框的，多行部件不要它
const inputProps = computed(() => {
  const props = { ...(api.value.getInputProps() as Record<string, unknown>) };
  delete props.type;
  return props;
});

const count = computed(() => api.value.value.length);
const atLimit = computed(() => api.value.atLimit);

const height = ref("64px");

function autosize(event: Event) {
  const el = event.target as HTMLTextAreaElement;
  // 先收回自动高度再量，内容变少时才缩得回去
  el.style.blockSize = "auto";
  height.value = `${el.scrollHeight}px`;
}
</script>

<template>
  <div v-bind="rootProps">
    <label v-bind="labelProps">留言</label>
    <textarea
      v-bind="inputProps"
      :style="{
        inlineSize: '260px',
        blockSize: height,
        paddingBlock: '6px',
        lineHeight: '1.6',
        overflow: 'hidden',
        resize: 'none',
      }"
      @input="autosize"
    />
    <span>{{ count }} / 120{{ atLimit ? "（已到上限）" : "" }}</span>
  </div>
</template>
