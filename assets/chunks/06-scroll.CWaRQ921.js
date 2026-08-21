const a=`<!-- 定高滚动 | 用 --xh-listbox-content-max-h 压住列表高度，条目多了就在容器里滚；方向键走到哪条，视图跟到哪条 -->
<xh-listbox id="listbox-scroll" value="track-1">
  <div
    data-xh-part="root"
    style="max-inline-size: 320px; --xh-listbox-content-max-h: 180px"
  >
    <span data-xh-part="label">曲目</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="track-1">
        <span data-xh-part="item-text">第 1 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-2">
        <span data-xh-part="item-text">第 2 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-3">
        <span data-xh-part="item-text">第 3 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-4">
        <span data-xh-part="item-text">第 4 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-5">
        <span data-xh-part="item-text">第 5 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-6">
        <span data-xh-part="item-text">第 6 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-7">
        <span data-xh-part="item-text">第 7 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-8">
        <span data-xh-part="item-text">第 8 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-9">
        <span data-xh-part="item-text">第 9 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-10">
        <span data-xh-part="item-text">第 10 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-11">
        <span data-xh-part="item-text">第 11 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-12">
        <span data-xh-part="item-text">第 12 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-13">
        <span data-xh-part="item-text">第 13 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-14">
        <span data-xh-part="item-text">第 14 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-15">
        <span data-xh-part="item-text">第 15 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-16">
        <span data-xh-part="item-text">第 16 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-17">
        <span data-xh-part="item-text">第 17 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-18">
        <span data-xh-part="item-text">第 18 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-19">
        <span data-xh-part="item-text">第 19 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-20">
        <span data-xh-part="item-text">第 20 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-21">
        <span data-xh-part="item-text">第 21 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-22">
        <span data-xh-part="item-text">第 22 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-23">
        <span data-xh-part="item-text">第 23 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-24">
        <span data-xh-part="item-text">第 24 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-25">
        <span data-xh-part="item-text">第 25 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-26">
        <span data-xh-part="item-text">第 26 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-27">
        <span data-xh-part="item-text">第 27 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-28">
        <span data-xh-part="item-text">第 28 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-29">
        <span data-xh-part="item-text">第 29 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-30">
        <span data-xh-part="item-text">第 30 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-31">
        <span data-xh-part="item-text">第 31 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-32">
        <span data-xh-part="item-text">第 32 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-33">
        <span data-xh-part="item-text">第 33 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-34">
        <span data-xh-part="item-text">第 34 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-35">
        <span data-xh-part="item-text">第 35 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-36">
        <span data-xh-part="item-text">第 36 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-37">
        <span data-xh-part="item-text">第 37 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-38">
        <span data-xh-part="item-text">第 38 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-39">
        <span data-xh-part="item-text">第 39 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-40">
        <span data-xh-part="item-text">第 40 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
<p>已选：<span id="listbox-scroll-value">track-1</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const listbox = document.getElementById("listbox-scroll");
  const readout = document.getElementById("listbox-scroll-value");
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};
