var e=`<!-- 双侧虚拟化 | 每个面板拥有独立窗口，搬运与搜索仍按该侧完整可见集合计算 -->
<script setup lang="ts">
import type { CollectionVirtualizer, TransferItem, TransferSide } from "@xihan-ui/headless";
import {
  XhTransferEmpty,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { computed, defineComponent, onMounted, onUpdated, reactive, ref } from "vue";

const items: TransferItem[] = Array.from({ length: 500 }, (_, index) => ({ value: \`permission-\${index + 1}\`, label: \`权限 \${index + 1}\` }));
const value = ref(items.slice(0, 20).map(item => item.value));
const bridges = reactive<Partial<Record<TransferSide, CollectionVirtualizer>>>({});
const virtualizers = computed(() => ({ ...bridges }));

const BridgeCapture = defineComponent({
  props: { side: { type: String, required: true }, bridge: { type: Object, required: true } },
  setup(props, { slots }) {
    const publish = (): void => {
      bridges[props.side as TransferSide] = props.bridge as CollectionVirtualizer;
    };
    onMounted(publish);
    onUpdated(publish);
    return () => slots.default?.();
  },
});
<\/script>

<template>
  <div style="inline-size: 100%; max-inline-size: 640px">
    <XhTransferRoot v-model:value="value" :collection="items" :virtualizers="virtualizers" searchable>
      <XhTransferSourcePanel v-slot="{ items: panelItems }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索待选权限" />
        <XhVirtualizerRoot v-slot="slot" :count="panelItems.length" :estimate-size="36" :viewport-tab-index="-1">
          <BridgeCapture side="source" :bridge="slot.collectionVirtualizer">
            <XhTransferList>
              <XhVirtualizerViewport>
                <XhVirtualizerContent>
                  <XhVirtualizerItem v-for="virtualItem in slot.virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
                    <XhTransferItem :value="panelItems[virtualItem.index].value">
                      <XhTransferItemCheckbox />
                      <XhTransferItemText>{{ panelItems[virtualItem.index].label }}</XhTransferItemText>
                    </XhTransferItem>
                  </XhVirtualizerItem>
                </XhVirtualizerContent>
              </XhVirtualizerViewport>
            </XhTransferList>
          </BridgeCapture>
        </XhVirtualizerRoot>
        <XhTransferEmpty>暂无待选权限</XhTransferEmpty>
      </XhTransferSourcePanel>
      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />
      <XhTransferTargetPanel v-slot="{ items: panelItems }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索已选权限" />
        <XhVirtualizerRoot v-slot="slot" :count="panelItems.length" :estimate-size="36" :viewport-tab-index="-1">
          <BridgeCapture side="target" :bridge="slot.collectionVirtualizer">
            <XhTransferList>
              <XhVirtualizerViewport>
                <XhVirtualizerContent>
                  <XhVirtualizerItem v-for="virtualItem in slot.virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
                    <XhTransferItem :value="panelItems[virtualItem.index].value">
                      <XhTransferItemCheckbox />
                      <XhTransferItemText>{{ panelItems[virtualItem.index].label }}</XhTransferItemText>
                    </XhTransferItem>
                  </XhVirtualizerItem>
                </XhVirtualizerContent>
              </XhVirtualizerViewport>
            </XhTransferList>
          </BridgeCapture>
        </XhVirtualizerRoot>
        <XhTransferEmpty>暂无已选权限</XhTransferEmpty>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
`;export{e as default};