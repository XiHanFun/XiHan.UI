var e=`<!-- 命令式滚动与到底通知 | scrollTo 滚动视口，reach-end 在滚到底那一下通知一次，常用来提示或续载 -->
<div style="display: grid; gap: 12px; justify-items: start; inline-size: min(360px, 100%)">
  <xh-scroll-area id="scroll-area-scroll-to" type="always" aria-label="记录列表" style="display: contents">
    <div data-xh-part="root" style="block-size: 180px; inline-size: 100%; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
      <div data-xh-part="viewport">
        <div data-xh-part="content" style="padding: 8px 16px"></div>
      </div>
      <div data-xh-part="scrollbar" orientation="vertical"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
      <div style="position: absolute; inset-block-end: 8px; inset-inline-end: 20px">
        <xh-button id="scroll-area-scroll-to-top" size="sm" variant="outline">
          <button data-xh-part="root">回到顶部</button>
        </xh-button>
      </div>
    </div>
  </xh-scroll-area>
  <span id="scroll-area-scroll-to-status" aria-live="polite">往下滚到底看看</span>
</div>

<script type="module">
  const area = document.getElementById("scroll-area-scroll-to");
  const status = document.getElementById("scroll-area-scroll-to-status");
  const content = area.querySelector('[data-xh-part="content"]');

  for (let i = 1; i <= 20; i++) {
    const row = document.createElement("p");
    row.style.margin = "8px 0";
    row.textContent = \`第 \${i} 条记录\`;
    content.append(row);
  }

  // 元素的 scrollTo 滚的是 viewport，参数与原生同形
  document.getElementById("scroll-area-scroll-to-top").addEventListener("click", () => {
    area.scrollTo({ top: 0, behavior: "smooth" });
    status.textContent = "往下滚到底看看";
  });

  area.addEventListener("reach-end", (event) => {
    if (event.detail.orientation === "vertical")
      status.textContent = "已经到底了";
  });
<\/script>
`;export{e as default};