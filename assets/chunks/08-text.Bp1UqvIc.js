var e=`<!-- 原文视图 | view="text" 直接输出缩进后的 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减 -->
<div style="display: flex; flex-direction: column; gap: 8px; inline-size: 100%; max-inline-size: 420px">
  <xh-switch id="json-text-toggle" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
      <span data-xh-part="text">原文视图</span>
    </label>
  </xh-switch>
  <xh-json-viewer id="json-text" view="text" default-expanded-depth="2">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
</div>

<script type="module">
  const viewer = document.getElementById("json-text");
  // 开着看原文，关掉回到树
  document.getElementById("json-text-toggle").addEventListener("checked-change", (event) => {
    viewer.view = event.detail.checked ? "text" : "tree";
  });

  viewer.value = {
    orderNo: "SO-2026-0825-0417",
    amount: 12.5,
    items: [
      { sku: "A-1001", qty: 2 },
      { sku: "B-2003", qty: 1 },
    ],
    remark: "跨境订单，需人工复核收件地址与税号",
  };
<\/script>
`;export{e as default};