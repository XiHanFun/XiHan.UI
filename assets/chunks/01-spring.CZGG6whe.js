var e=`<!-- 弹簧 | 感知参数换算为物理参数，曲线是解析解直接采样的，右侧的方块按同一条曲线运动 -->
<script setup lang="ts">
import { animate, createSpring, springToLinearEasing } from "@xihan-ui/motion";
import {
  XhButton,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { computed, onBeforeUnmount, ref, useTemplateRef } from "vue";

// 滑块的值恒为数组，单滑块只有一项
const duration = ref<[number]>([0.5]);
const bounce = ref<[number]>([0.3]);

const solver = computed(() => createSpring({ duration: duration.value[0], bounce: bounce.value[0] }));

// 曲线画在 0..1 的归一化坐标里，y 轴翻过来让 1 在上方
const path = computed(() => {
  const spring = solver.value;
  const seconds = spring.durationMs / 1000;
  const points: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const value = spring(t * seconds);
    points.push(\`\${(t * 280).toFixed(1)},\${(110 - value * 80).toFixed(1)}\`);
  }
  return \`M \${points.join(" L ")}\`;
});

const box = useTemplateRef<HTMLElement>("box");
let handle: { cancel: () => void } | null = null;

function play() {
  const el = box.value;
  if (!el)
    return;
  handle?.cancel();
  const spring = solver.value;
  // 走到轨道另一头：轨道宽减去方块宽与两侧内距
  const distance = el.parentElement!.clientWidth - el.offsetWidth - 2 * el.offsetLeft;
  handle = animate(
    el,
    [{ translate: "0 0" }, { translate: \`\${distance}px 0\` }],
    { duration: spring.durationMs, easing: springToLinearEasing(spring, 48), fill: "forwards" },
  );
}

onBeforeUnmount(() => handle?.cancel());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-4); width: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-5)">
      <XhSliderRoot
        :value="duration"
        :min="0.15"
        :max="1.2"
        :step="0.05"
        style="inline-size: var(--xh-control-w)"
        @update:value="duration = $event as [number]"
      >
        <XhSliderLabel>时长 {{ duration[0].toFixed(2) }}s</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb />
        </XhSliderControl>
      </XhSliderRoot>
      <XhSliderRoot
        :value="bounce"
        :min="-0.8"
        :max="0.8"
        :step="0.05"
        style="inline-size: var(--xh-control-w)"
        @update:value="bounce = $event as [number]"
      >
        <XhSliderLabel>弹性 {{ bounce[0].toFixed(2) }}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb />
        </XhSliderControl>
      </XhSliderRoot>
    </div>

    <svg viewBox="0 0 280 120" style="width: 100%; height: 120px">
      <line x1="0" y1="30" x2="280" y2="30" stroke="var(--xh-border-subtle)" stroke-dasharray="4 4" />
      <line x1="0" y1="110" x2="280" y2="110" stroke="var(--xh-border-subtle)" />
      <path :d="path" fill="none" stroke="var(--xh-fg-brand)" stroke-width="2" />
    </svg>

    <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
      <XhButton variant="outline" @click="play">播一次</XhButton>
      <div
        style="
          position: relative;
          flex: 1;
          height: calc(var(--xh-space-8) + 2 * var(--xh-space-1));
          border: var(--xh-stroke-thin) dashed var(--xh-border-default);
          border-radius: var(--xh-shape-surface);
        "
      >
        <div
          ref="box"
          style="
            position: absolute;
            top: var(--xh-space-1);
            left: var(--xh-space-1);
            width: var(--xh-space-8);
            height: var(--xh-space-8);
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-brand);
          "
        />
      </div>
    </div>
  </div>

  <p data-demo-output>
    阻尼比 {{ solver.dampingRatio.toFixed(3) }} · 沉降 {{ Math.round(solver.durationMs) }}ms · 过冲
    {{ (solver.overshoot * 100).toFixed(1) }}%
  </p>
</template>
`;export{e as default};