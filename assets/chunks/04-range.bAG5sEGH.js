const n=`<!-- 区间输入 | 组里放两个输入框，中间夹一个前后缀块当连接词：三段共用两条中缝，圆角只留在最外两端；两头各自带 aria-label，读屏分得清哪个是起点 -->
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-input-group>
    <div data-xh-part="root">
      <span data-xh-part="item">￥</span>
      <xh-text-field id="input-group-range-min" default-value="100" placeholder="最低价">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" aria-label="最低价" />
          </div>
        </div>
      </xh-text-field>
      <!-- 连接词也是一段：与两侧同高、同一条描边，它是这个盒的一部分 -->
      <span data-xh-part="item">至</span>
      <xh-text-field id="input-group-range-max" default-value="800" placeholder="最高价">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" aria-label="最高价" />
          </div>
        </div>
      </xh-text-field>
    </div>
  </xh-input-group>

  <p id="input-group-range-summary" style="font-size: 13px; opacity: 0.75">
    价格区间：100 — 800 元
  </p>
</div>

<script type="module">
  const min = document.getElementById("input-group-range-min");
  const max = document.getElementById("input-group-range-max");
  const summary = document.getElementById("input-group-range-summary");

  // 两头都是非受控，读数只跟着元素发来的意图走
  let lo = "100";
  let hi = "800";

  function render() {
    let text = "不限";
    if (lo && hi) {
      text = \`\${lo} — \${hi} 元\`;
    } else if (lo) {
      text = \`\${lo} 元以上\`;
    } else if (hi) {
      text = \`\${hi} 元以下\`;
    }
    summary.textContent = \`价格区间：\${text}\`;
  }

  min.addEventListener("value-change", (event) => {
    lo = event.detail.value;
    render();
  });
  max.addEventListener("value-change", (event) => {
    hi = event.detail.value;
    render();
  });
<\/script>
`;export{n as default};
