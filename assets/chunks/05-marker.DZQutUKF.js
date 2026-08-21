const n=`<!-- 自定义展开标记 | 折叠区域不带指示器部件，标记由作者按 open 自己画，触发器两端对齐排 -->
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-collapsible id="collapsible-marker">
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        <span>高级筛选</span>
        <span id="collapsible-marker-icon" style="font-size: 12px">展开 ▾</span>
      </button>
      <div data-xh-part="content">
        创建时间、负责人、标签这些不常用的条件收在这里。
      </div>
    </div>
  </xh-collapsible>
</div>

<script type="module">
  // 标记跟着 open 换字形，触发器里放什么全归作者
  const collapsible = document.getElementById("collapsible-marker");
  const marker = document.getElementById("collapsible-marker-icon");
  collapsible.addEventListener("open-change", (event) => {
    marker.textContent = event.detail.open ? "收起 ▴" : "展开 ▾";
  });
<\/script>
`;export{n as default};
