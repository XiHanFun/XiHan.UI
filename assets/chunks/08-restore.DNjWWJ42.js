var e=`<!-- 回显已存的签名 | 存下 value-change 给出的数据，编辑页把它交回 defaultValue 即原样回显，之后照常续写与撤销 -->
<xh-signature-pad id="xh-signature-restore">
  <div data-xh-part="root" style="max-inline-size: 22rem">
    <svg data-xh-part="control">
      <line data-xh-part="guide"></line>
      <path data-xh-part="path"></path>
    </svg>
    <div style="display: flex; gap: var(--xh-space-2); align-items: center">
      <button data-xh-part="undo-trigger">撤销</button>
      <span id="xh-signature-restore-count">共 2 笔</span>
    </div>
  </div>
</xh-signature-pad>

<script type="module">
  const host = document.getElementById("xh-signature-restore");
  const count = document.getElementById("xh-signature-restore-count");
  function line(points) {
    return { points: points.map(([x, y]) => ({ x, y, pressure: 0.5 })) };
  }

  // 上一次存下的签名：逐笔的点加上当时的坐标系，画布宽窄不同也按比例铺开；对象只走 property
  host.defaultValue = {
    surface: { width: 352, height: 141 },
    strokes: [
      line([[40, 90], [60, 60], [80, 50], [95, 70], [100, 95], [115, 70], [140, 55], [160, 80], [175, 95], [200, 70]]),
      line([[215, 95], [240, 60], [260, 55], [270, 80], [290, 90], [312, 70]]),
    ],
  };

  // 定稿的数据原样存下即可，下次回显时交回 defaultValue
  host.addEventListener("value-change", (event) => {
    count.textContent = \`共 \${event.detail.value.strokes.length} 笔\`;
  });
<\/script>
`;export{e as default};