var e=`<!-- 提前量 | distance 把可视区沿块轴向外扩展，哨兵尚未出现就先取下一页 -->
<style>
  #infinite-scroll-distance [data-row] {
    padding: 8px 12px;
  }
</style>

<div id="infinite-scroll-distance" style="display: grid; gap: 12px; inline-size: 100%">
  <xh-slider data-range default-value="200" min="0" max="400" step="50">
    <div data-xh-part="root">
      <label data-xh-part="label">提前量</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-slider>

  <div
    data-shell
    data-xh-scroll
    style="
      block-size: 220px;
      overflow: auto;
      border: var(--xh-stroke-thin) solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
    "
  >
    <!-- 宿主设 display: contents，列表外壳落在 root 上 -->
    <xh-infinite-scroll data-host distance="200" style="display: contents">
      <div data-xh-part="root">
        <div data-list>
          <div data-row>第 1 条</div>
          <div data-row>第 2 条</div>
          <div data-row>第 3 条</div>
          <div data-row>第 4 条</div>
          <div data-row>第 5 条</div>
          <div data-row>第 6 条</div>
          <div data-row>第 7 条</div>
          <div data-row>第 8 条</div>
          <div data-row>第 9 条</div>
          <div data-row>第 10 条</div>
          <div data-row>第 11 条</div>
          <div data-row>第 12 条</div>
        </div>
        <!-- 哨兵摆在列表最后一条之后 -->
        <div data-xh-part="sentinel"></div>
      </div>
    </xh-infinite-scroll>
  </div>
</div>

<span id="infinite-scroll-distance-readout" data-demo-output>200px 触发 · 已取 0 页</span>

<script type="module">
  const scope = document.getElementById("infinite-scroll-distance");
  const host = scope.querySelector("[data-host]");
  const shell = scope.querySelector("[data-shell]");
  const list = scope.querySelector("[data-list]");
  const range = scope.querySelector("[data-range]");
  const readout = document.getElementById("infinite-scroll-distance-readout");

  let rounds = 0;

  // 提前量扩的是 target 那块可视区，容器滚动必须把容器交出来。
  // 它是 DOM 句柄，只走属性
  host.target = shell;

  function render() {
    readout.textContent = \`\${host.distance}px 触发 · 已取 \${rounds} 页\`;
  }

  // 滑块的值恒为数组，单滑块取第一项
  range.addEventListener("value-change", (event) => {
    host.distance = event.detail.value[0];
    render();
  });

  host.addEventListener("load", () => {
    host.loading = true;
    setTimeout(() => {
      const base = list.childElementCount;
      for (let i = 1; i <= 8; i += 1) {
        const row = document.createElement("div");
        row.setAttribute("data-row", "");
        row.textContent = \`第 \${base + i} 条\`;
        list.append(row);
      }
      rounds += 1;
      host.loading = false;
      render();
    }, 400);
  });
<\/script>
`;export{e as default};