const n=`<!-- 弹簧 | 感知参数调出物理参数，曲线是解析解直接采样的，右边的方块按同一条曲线走 -->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef } from "vue";
import { animate, createSpring, springToLinearEasing } from "@xihan-ui/motion";

const duration = ref(0.5);
const bounce = ref(0.3);

const solver = computed(() => createSpring({ duration: duration.value, bounce: bounce.value }));

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
  if (!el) return;
  handle?.cancel();
  const spring = solver.value;
  handle = animate(
    el,
    [{ translate: "0 0" }, { translate: "180px 0" }],
    { duration: spring.durationMs, easing: springToLinearEasing(spring, 48), fill: "forwards" },
  );
}

onBeforeUnmount(() => handle?.cancel());
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
      <label style="display: flex; align-items: center; gap: 8px">
        时长 {{ duration.toFixed(2) }}s
        <input v-model.number="duration" type="range" min="0.15" max="1.2" step="0.05" />
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        弹性 {{ bounce.toFixed(2) }}
        <input v-model.number="bounce" type="range" min="-0.8" max="0.8" step="0.05" />
      </label>
    </div>

    <p style="margin: 0; font-size: 13px; opacity: 0.7">
      阻尼比 {{ solver.dampingRatio.toFixed(3) }} · 沉降 {{ Math.round(solver.durationMs) }}ms · 过冲
      {{ (solver.overshoot * 100).toFixed(1) }}%
    </p>

    <svg viewBox="0 0 280 120" style="width: 100%; height: 120px">
      <line x1="0" y1="30" x2="280" y2="30" stroke="var(--vp-c-divider)" stroke-dasharray="4 4" />
      <line x1="0" y1="110" x2="280" y2="110" stroke="var(--vp-c-divider)" />
      <path :d="path" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    </svg>

    <div style="display: flex; align-items: center; gap: 12px">
      <button
        type="button"
        style="
          padding: 6px 14px;
          border: 1px solid var(--vp-c-divider);
          border-radius: 8px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        "
        @click="play"
      >
        播一次
      </button>
      <div
        style="
          position: relative;
          flex: 1;
          height: 40px;
          border: 1px dashed var(--vp-c-divider);
          border-radius: 8px;
        "
      >
        <div
          ref="box"
          style="
            position: absolute;
            top: 4px;
            left: 4px;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--vp-c-brand-1);
          "
        />
      </div>
    </div>
  </div>
</template>
`;export{n as default};
