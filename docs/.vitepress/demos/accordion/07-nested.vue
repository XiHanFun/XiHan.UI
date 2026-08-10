<!-- 嵌套 | content 里再放一组手风琴，内外两组各自维护展开集合，方向键也各管各的 -->
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['shipping']">
      <XhAccordionItem value="shipping">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>配送</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          <!-- 内层是另一组独立的手风琴：展开集合、单开与否都自己说了算 -->
          <XhAccordionRoot :default-value="['express']" multiple>
            <XhAccordionItem value="express">
              <XhAccordionHeader>
                <XhAccordionTrigger>
                  <span>快递</span>
                  <XhAccordionIndicator />
                </XhAccordionTrigger>
              </XhAccordionHeader>
              <XhAccordionContent>次日达，节假日照常发货。</XhAccordionContent>
            </XhAccordionItem>
            <XhAccordionItem value="pickup">
              <XhAccordionHeader>
                <XhAccordionTrigger>
                  <span>自提</span>
                  <XhAccordionIndicator />
                </XhAccordionTrigger>
              </XhAccordionHeader>
              <XhAccordionContent>下单后到门店凭码取货。</XhAccordionContent>
            </XhAccordionItem>
          </XhAccordionRoot>
        </XhAccordionContent>
      </XhAccordionItem>

      <XhAccordionItem value="refund">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>退换</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>签收七日内可退，运费到付。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
