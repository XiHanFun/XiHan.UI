var e=`<!-- 弹簧 | 感知参数换算为物理参数，曲线是解析解直接采样的，右侧的方块按同一条曲线运动 -->
<div style="display: flex; flex-direction: column; gap: var(--xh-space-4); width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-5)">
    <xh-slider id="motion-spring-duration" default-value="0.5" min="0.15" max="1.2" step="0.05">
      <div data-xh-part="root" style="inline-size: var(--xh-control-w)">
        <label data-xh-part="label">时长 <span id="motion-spring-duration-text">0.50</span>s</label>
        <div data-xh-part="control">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
    <xh-slider id="motion-spring-bounce" default-value="0.3" min="-0.8" max="0.8" step="0.05">
      <div data-xh-part="root" style="inline-size: var(--xh-control-w)">
        <label data-xh-part="label">弹性 <span id="motion-spring-bounce-text">0.30</span></label>
        <div data-xh-part="control">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
  </div>

  <svg viewBox="0 0 280 120" style="width: 100%; height: 120px">
    <line x1="0" y1="30" x2="280" y2="30" stroke="var(--xh-border-subtle)" stroke-dasharray="4 4" />
    <line x1="0" y1="110" x2="280" y2="110" stroke="var(--xh-border-subtle)" />
    <path id="motion-spring-curve" fill="none" stroke="var(--xh-fg-brand)" stroke-width="2" />
  </svg>

  <div style="display: flex; align-items: center; gap: var(--xh-space-3)">
    <xh-button id="motion-spring-play" variant="outline">
      <button data-xh-part="root">播一次</button>
    </xh-button>
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
        id="motion-spring-box"
        style="
          position: absolute;
          top: var(--xh-space-1);
          left: var(--xh-space-1);
          width: var(--xh-space-8);
          height: var(--xh-space-8);
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-brand);
        "
      ></div>
    </div>
  </div>
</div>

<p id="motion-spring-stats" data-demo-output></p>

<script type="module">
  import { animate, createSpring, springToLinearEasing } from "@xihan-ui/motion";

  const box = document.getElementById("motion-spring-box");

  // 滑块的值恒为数组，单滑块只有一项；非受控，报上来的新值记在这里
  let duration = 0.5;
  let bounce = 0.3;
  let solver;
  let handle = null;

  // 滑块一动就按新参数重解：读数、曲线与下一次播放用的是同一个解
  function solve() {
    solver = createSpring({ duration, bounce });
    document.getElementById("motion-spring-duration-text").textContent = duration.toFixed(2);
    document.getElementById("motion-spring-bounce-text").textContent = bounce.toFixed(2);
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

  document.getElementById("motion-spring-duration").addEventListener("value-change", (event) => {
    duration = event.detail.value[0];
    solve();
  });
  document.getElementById("motion-spring-bounce").addEventListener("value-change", (event) => {
    bounce = event.detail.value[0];
    solve();
  });
  solve();

  document.getElementById("motion-spring-play").addEventListener("click", () => {
    handle?.cancel();
    // 走到轨道另一头：轨道宽减去方块宽与两侧内距
    const distance = box.parentElement.clientWidth - box.offsetWidth - 2 * box.offsetLeft;
    handle = animate(
      box,
      [{ translate: "0 0" }, { translate: \`\${distance}px 0\` }],
      { duration: solver.durationMs, easing: springToLinearEasing(solver, 48), fill: "forwards" },
    );
  });
<\/script>
`;export{e as default};