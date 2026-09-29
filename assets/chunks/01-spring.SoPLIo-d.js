const n=`<!-- 弹簧 | 感知参数换算为物理参数，曲线是解析解直接采样的，右侧的方块按同一条曲线运动 -->
<div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
    <label style="display: flex; align-items: center; gap: 8px">
      <span id="motion-spring-duration-text">时长 0.50s</span>
      <input id="motion-spring-duration" type="range" min="0.15" max="1.2" step="0.05" value="0.5" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      <span id="motion-spring-bounce-text">弹性 0.30</span>
      <input id="motion-spring-bounce" type="range" min="-0.8" max="0.8" step="0.05" value="0.3" />
    </label>
  </div>

  <p id="motion-spring-stats" style="margin: 0; font-size: 13px; opacity: 0.7"></p>

  <svg viewBox="0 0 280 120" style="width: 100%; height: 120px">
    <line x1="0" y1="30" x2="280" y2="30" stroke="var(--vp-c-divider)" stroke-dasharray="4 4" />
    <line x1="0" y1="110" x2="280" y2="110" stroke="var(--vp-c-divider)" />
    <path id="motion-spring-curve" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
  </svg>

  <div style="display: flex; align-items: center; gap: 12px">
    <button
      id="motion-spring-play"
      type="button"
      style="
        padding: 6px 14px;
        border: 1px solid var(--vp-c-divider);
        border-radius: 8px;
        background: transparent;
        color: inherit;
        cursor: pointer;
      "
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
        id="motion-spring-box"
        style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--vp-c-brand-1);
        "
      ></div>
    </div>
  </div>
</div>

<script type="module">
  import { animate, createSpring, springToLinearEasing } from "@xihan-ui/motion";

  const duration = document.getElementById("motion-spring-duration");
  const bounce = document.getElementById("motion-spring-bounce");
  const box = document.getElementById("motion-spring-box");

  let solver;
  let handle = null;

  // 滑块一动就按新参数重解：读数、曲线与下一次播放用的是同一个解
  function solve() {
    solver = createSpring({ duration: Number(duration.value), bounce: Number(bounce.value) });
    document.getElementById("motion-spring-duration-text").textContent = \`时长 \${Number(duration.value).toFixed(2)}s\`;
    document.getElementById("motion-spring-bounce-text").textContent = \`弹性 \${Number(bounce.value).toFixed(2)}\`;
    document.getElementById("motion-spring-stats").textContent
      = \`阻尼比 \${solver.dampingRatio.toFixed(3)} · 沉降 \${Math.round(solver.durationMs)}ms · 过冲 \${(solver.overshoot * 100).toFixed(1)}%\`;

    // 曲线画在 0..1 的归一化坐标里，y 轴翻过来让 1 在上方
    const seconds = solver.durationMs / 1000;
    const points = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const value = solver(t * seconds);
      points.push(\`\${(t * 280).toFixed(1)},\${(110 - value * 80).toFixed(1)}\`);
    }
    document.getElementById("motion-spring-curve").setAttribute("d", \`M \${points.join(" L ")}\`);
  }

  duration.addEventListener("input", solve);
  bounce.addEventListener("input", solve);
  solve();

  document.getElementById("motion-spring-play").addEventListener("click", () => {
    handle?.cancel();
    handle = animate(
      box,
      [{ translate: "0 0" }, { translate: "180px 0" }],
      { duration: solver.durationMs, easing: springToLinearEasing(solver, 48), fill: "forwards" },
    );
  });
<\/script>
`;export{n as default};
