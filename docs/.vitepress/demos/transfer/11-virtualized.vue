<!-- 双侧虚拟化 | 每个面板拥有独立窗口，搬运与搜索仍按该侧完整可见集合计算 -->
<script setup lang="ts">
import type { CollectionVirtualizer, TransferItem, TransferSide } from "@xihan-ui/headless";
import {
  XhTransferItem, XhTransferItemCheckbox, XhTransferItemText, XhTransferList,
  XhTransferRoot, XhTransferSourcePanel, XhTransferTargetPanel, XhTransferToSourceTrigger,
  XhTransferToTargetTrigger, XhVirtualizerContent, XhVirtualizerItem, XhVirtualizerRoot,
  XhVirtualizerViewport,
} from "@xihan-ui/vue";
import { computed, defineComponent, onMounted, onUpdated, reactive, ref } from "vue";

const items: TransferItem[] = Array.from({ length: 500 }, (_, index) => ({ value: `permission-${index + 1}`, label: `权限 ${index + 1}` }));
const value = ref(items.slice(0, 20).map(item => item.value));
const bridges = reactive<Partial<Record<TransferSide, CollectionVirtualizer>>>({});
const virtualizers = computed(() => ({ ...bridges }));

const BridgeCapture = defineComponent({
  props: { side: { type: String, required: true }, bridge: { type: Object, required: true } },
  setup(props, { slots }) {
    const publish = () => { bridges[props.side as TransferSide] = props.bridge as CollectionVirtualizer; };
    onMounted(publish); onUpdated(publish);
    return () => slots.default?.();
  },
});
</script>

<template>
  <XhTransferRoot v-model:value="value" :collection="items" :virtualizers="virtualizers">
    <XhTransferSourcePanel v-slot="{ items: panelItems }">
      <XhVirtualizerRoot v-slot="slot" :count="panelItems.length" :estimate-size="36" :viewport-tab-index="-1">
        <BridgeCapture side="source" :bridge="slot.collectionVirtualizer">
          <XhTransferList style="overflow: visible; max-block-size: none">
            <XhVirtualizerViewport style="block-size: 220px"><XhVirtualizerContent>
              <XhVirtualizerItem v-for="virtualItem in slot.virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
                <XhTransferItem :value="panelItems[virtualItem.index].value"><XhTransferItemCheckbox /><XhTransferItemText>{{ panelItems[virtualItem.index].label }}</XhTransferItemText></XhTransferItem>
              </XhVirtualizerItem>
            </XhVirtualizerContent></XhVirtualizerViewport>
          </XhTransferList>
        </BridgeCapture>
      </XhVirtualizerRoot>
    </XhTransferSourcePanel>
    <XhTransferToTargetTrigger /><XhTransferToSourceTrigger />
    <XhTransferTargetPanel v-slot="{ items: panelItems }">
      <XhVirtualizerRoot v-slot="slot" :count="panelItems.length" :estimate-size="36" :viewport-tab-index="-1">
        <BridgeCapture side="target" :bridge="slot.collectionVirtualizer">
          <XhTransferList style="overflow: visible; max-block-size: none">
            <XhVirtualizerViewport style="block-size: 220px"><XhVirtualizerContent>
              <XhVirtualizerItem v-for="virtualItem in slot.virtualItems" :key="virtualItem.key" :value="virtualItem.index" style="block-size: 36px">
                <XhTransferItem :value="panelItems[virtualItem.index].value"><XhTransferItemCheckbox /><XhTransferItemText>{{ panelItems[virtualItem.index].label }}</XhTransferItemText></XhTransferItem>
              </XhVirtualizerItem>
            </XhVirtualizerContent></XhVirtualizerViewport>
          </XhTransferList>
        </BridgeCapture>
      </XhVirtualizerRoot>
    </XhTransferTargetPanel>
  </XhTransferRoot>
</template>
