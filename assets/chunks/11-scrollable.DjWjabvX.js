const t=`<!-- 可滚动的标签栏 | 标签多到一行放不下时，把 list 装进作者自建的横滚容器，两端各摆一个滚动按钮 -->
<xh-tabs default-value="module-1">
  <div data-xh-part="root" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <xh-button id="tabs-scroll-prev" size="sm" variant="outline">
        <button data-xh-part="root" aria-label="向前滚动">‹</button>
      </xh-button>

      <!-- 滚动视口是 list 外面的一层普通容器：条目查询只以 list 为界，键盘与切换都不受它影响 -->
      <div
        id="tabs-scroll-viewport"
        style="flex: 1; min-inline-size: 0; overflow-x: auto"
      >
        <!-- 让 list 撑到内容宽度，基线才跟着标签一起滚 -->
        <div data-xh-part="list" style="inline-size: max-content">
          <button data-xh-part="trigger" value="module-1">模块 1</button>
          <button data-xh-part="trigger" value="module-2">模块 2</button>
          <button data-xh-part="trigger" value="module-3">模块 3</button>
          <button data-xh-part="trigger" value="module-4">模块 4</button>
          <button data-xh-part="trigger" value="module-5">模块 5</button>
          <button data-xh-part="trigger" value="module-6">模块 6</button>
          <button data-xh-part="trigger" value="module-7">模块 7</button>
          <button data-xh-part="trigger" value="module-8">模块 8</button>
          <button data-xh-part="trigger" value="module-9">模块 9</button>
          <button data-xh-part="trigger" value="module-10">模块 10</button>
          <button data-xh-part="trigger" value="module-11">模块 11</button>
          <button data-xh-part="trigger" value="module-12">模块 12</button>
        </div>
      </div>

      <xh-button id="tabs-scroll-next" size="sm" variant="outline">
        <button data-xh-part="root" aria-label="向后滚动">›</button>
      </xh-button>
    </div>

    <div data-xh-part="content" value="module-1">模块 1 的面板</div>
    <div data-xh-part="content" value="module-2">模块 2 的面板</div>
    <div data-xh-part="content" value="module-3">模块 3 的面板</div>
    <div data-xh-part="content" value="module-4">模块 4 的面板</div>
    <div data-xh-part="content" value="module-5">模块 5 的面板</div>
    <div data-xh-part="content" value="module-6">模块 6 的面板</div>
    <div data-xh-part="content" value="module-7">模块 7 的面板</div>
    <div data-xh-part="content" value="module-8">模块 8 的面板</div>
    <div data-xh-part="content" value="module-9">模块 9 的面板</div>
    <div data-xh-part="content" value="module-10">模块 10 的面板</div>
    <div data-xh-part="content" value="module-11">模块 11 的面板</div>
    <div data-xh-part="content" value="module-12">模块 12 的面板</div>
  </div>
</xh-tabs>

<script type="module">
  // 两端的按钮横向推动视口
  const viewport = document.getElementById("tabs-scroll-viewport");
  const prev = document.getElementById("tabs-scroll-prev");
  const next = document.getElementById("tabs-scroll-next");

  prev.addEventListener("click", () => {
    viewport.scrollBy({ left: -200, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    viewport.scrollBy({ left: 200, behavior: "smooth" });
  });
<\/script>
`;export{t as default};
