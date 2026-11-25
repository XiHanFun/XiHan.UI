<!-- 设计文档行内的令牌取值：在句子或表格单元格里写 <XhTokenValue name="--xh-text-label-size" px />，
     印出这一档真正生效的值，不手抄数字。缺省顺着别名展开到字面量；px 把 rem 按 16px 根字号换成像素。 -->
<script setup lang="ts">
import type { TokenMode } from "./token-modes.data";
import { computed } from "vue";
import { data } from "./token-modes.data";
import { createTokenResolver } from "./token-resolve";

const props = withDefaults(
  defineProps<{
    name: string;
    /** 取哪一档的值；不写是缺省档 */
    mode?: TokenMode;
    /** 关掉时保留 var(--xh-…) 写法 */
    resolve?: boolean;
    /** rem 换成像素（按 16px 根字号） */
    px?: boolean;
  }>(),
  { mode: undefined, resolve: true, px: false },
);

const resolver = createTokenResolver(data);

const text = computed(() => {
  const value = resolver.value(props.name, props.mode ?? "default", props.resolve);
  if (value === undefined)
    return "（未定义）";
  const rem = /^(-?(?:\d+(?:\.\d+)?|\.\d+))rem$/.exec(value);
  return props.px && rem ? `${Number(rem[1]) * 16}px` : value;
});
</script>

<template>
  <span class="xh-token-value">{{ text }}</span>
</template>
