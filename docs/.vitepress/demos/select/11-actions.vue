<!-- 操作入口 | 通过插槽状态控制开合和值 -->
<script setup lang="ts">
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <XhSelectRoot
    v-slot="{ open, value, setOpen, setValue }"
    placeholder="请选择"
  >
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
    <div style="display: flex; gap: 8px; margin-block-start: 8px">
      <XhButton variant="outline" size="sm" @click="setOpen(!open)">
        {{ open ? "收起" : "展开" }}
      </XhButton>
      <XhButton variant="ghost" size="sm" :disabled="value.length === 0" @click="setValue([])">
        清空
      </XhButton>
    </div>
  </XhSelectRoot>
</template>
