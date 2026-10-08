var e=`<!-- 大树虚拟化 | 完整树数据负责层级、选中与键盘语义，窗口只挂载可见行；Virtualizer 的 count 取展开后的可见行数，窗口里的行平铺渲染，缩进按层级由作者给 -->
<script setup lang="ts">
import { flattenTree } from "@xihan-ui/headless";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 二十个部门，每个部门五十位成员
const departments = Array.from({ length: 20 }, (_, d) => ({
  value: \`dept-\${d + 1}\`,
  label: \`部门 \${d + 1}\`,
  children: Array.from({ length: 50 }, (_, m) => ({
    value: \`dept-\${d + 1}-\${m + 1}\`,
    label: \`成员 \${d + 1}-\${m + 1}\`,
  })),
}));

const expanded = ref<string[]>(["dept-1"]);
// 可见行随展开集合现算：count 与窗口里渲染哪一行都按它
const rows = computed(() => flattenTree(departments, expanded.value));

// 平铺的行没有子层容器顶出缩进，按层级补上
function indent(level: number): Record<string, string> {
  return { marginInlineStart: \`calc(var(--xh-tree-select-indent, var(--xh-space-4)) * \${level - 1})\` };
}
<\/script>

<template>
  <XhVirtualizerRoot
    v-slot="{ virtualItems, collectionVirtualizer }"
    :count="rows.length"
    :estimate-size="36"
    :viewport-tab-index="-1"
  >
    <XhTreeSelectRoot
      v-model:expanded-value="expanded"
      :collection="departments"
      :virtualizer="collectionVirtualizer"
      placeholder="选一位成员"
    >
      <XhTreeSelectLabel>负责人</XhTreeSelectLabel>
      <XhTreeSelectControl>
        <XhTreeSelectTrigger>
          <XhTreeSelectValueText />
          <XhTreeSelectIndicator />
        </XhTreeSelectTrigger>
      </XhTreeSelectControl>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree style="overflow: visible">
            <XhVirtualizerViewport style="block-size: 240px">
              <XhVirtualizerContent>
                <XhVirtualizerItem
                  v-for="virtualItem in virtualItems"
                  :key="virtualItem.key"
                  :value="virtualItem.index"
                  style="block-size: 36px"
                >
                  <XhTreeSelectBranch
                    v-if="rows[virtualItem.index].branch"
                    :value="rows[virtualItem.index].value"
                    :style="indent(rows[virtualItem.index].level)"
                  >
                    <XhTreeSelectBranchControl>
                      <XhTreeSelectBranchTrigger />
                      <XhTreeSelectBranchText>{{ rows[virtualItem.index].label }}</XhTreeSelectBranchText>
                      <XhTreeSelectItemIndicator />
                    </XhTreeSelectBranchControl>
                  </XhTreeSelectBranch>
                  <XhTreeSelectItem
                    v-else
                    :value="rows[virtualItem.index].value"
                    :style="indent(rows[virtualItem.index].level)"
                  >
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>{{ rows[virtualItem.index].label }}</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhVirtualizerItem>
              </XhVirtualizerContent>
            </XhVirtualizerViewport>
          </XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  </XhVirtualizerRoot>
</template>
`;export{e as default};