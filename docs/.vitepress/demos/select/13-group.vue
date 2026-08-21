<!-- 分组 | 条目分段展示：段落壳与段标题由作者写，条目照旧归到同一份集合，方向键与连打检索跨段贯通 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSelectContent,
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

const groups = [
  {
    id: "select-group-fruit",
    label: "水果",
    items: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
    ],
  },
  {
    id: "select-group-vegetable",
    label: "蔬菜",
    items: [
      { value: "carrot", label: "胡萝卜" },
      { value: "celery", label: "芹菜" },
    ],
  },
];

const picked = ref<string[]>([]);
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>食材</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText />
      <XhSelectIndicator />
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <!-- 段标题只是普通节点，不带条目标记，导航与检索都跳过它 -->
          <div v-for="g in groups" :key="g.id" role="group" :aria-labelledby="g.id">
            <div :id="g.id" style="padding: 4px 8px; color: var(--xh-fg-subtle); font-size: 12px">
              {{ g.label }}
            </div>
            <XhSelectItem v-for="o in g.items" :key="o.value" :value="o.value">
              <XhSelectItemText>{{ o.label }}</XhSelectItemText>
              <XhSelectItemIndicator />
            </XhSelectItem>
          </div>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
