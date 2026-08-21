const n=`<!-- 加载结束 | loading 期间容器报 aria-busy，翻成 false 后整块收起，位置让给真内容 -->
<div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
  <button id="skeleton-loading-toggle" type="button">数据回来了</button>

  <xh-skeleton id="skeleton-loading">
    <div data-xh-part="root" style="inline-size: 260px">
      <div data-xh-part="bone"></div>
      <div data-xh-part="bone"></div>
    </div>
  </xh-skeleton>

  <p id="skeleton-loading-text" hidden style="margin: 0">
    这两行是接口回来之后的真内容。
  </p>
</div>

<script type="module">
  // 按钮翻转加载态，真内容跟着显隐
  const skeleton = document.getElementById("skeleton-loading");
  const toggle = document.getElementById("skeleton-loading-toggle");
  const text = document.getElementById("skeleton-loading-text");
  toggle.addEventListener("click", () => {
    const next = skeleton.loading === false;
    skeleton.loading = next;
    toggle.textContent = next ? "数据回来了" : "重新加载";
    text.hidden = next;
  });
<\/script>
`;export{n as default};
