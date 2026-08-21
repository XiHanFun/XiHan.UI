const n=`<!-- 基础用法 | 条子贴在视口顶边（往页面最上方看）；不给 value 就是不确定进度，宽度自行往前爬，loading 翻 false 才冲到头并淡出 -->
<xh-loading-bar id="loading-bar-basic">
  <div data-xh-part="root">
    <div data-xh-part="track">
      <div data-xh-part="range"></div>
    </div>
  </div>
</xh-loading-bar>

<div
  id="loading-bar-basic-actions"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid" data-loading="on">
    <button data-xh-part="root">开始加载</button>
  </xh-button>
  <xh-button variant="outline" data-loading="off">
    <button data-xh-part="root">结束加载</button>
  </xh-button>
  <span>假进度：<span id="loading-bar-basic-value">0</span>%</span>
</div>

<script type="module">
  const bar = document.getElementById("loading-bar-basic");
  const actions = document.getElementById("loading-bar-basic-actions");
  const readout = document.getElementById("loading-bar-basic-value");

  for (const button of actions.querySelectorAll("[data-loading]")) {
    button.addEventListener("click", () => {
      bar.loading = button.dataset.loading === "on";
    });
  }

  // 只读进度用 value-change 接；写进 value 会把它变成确定进度，爬升就停了
  bar.addEventListener("value-change", (event) => {
    readout.textContent = String(Math.round(event.detail.value));
  });
<\/script>
`;export{n as default};
