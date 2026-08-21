const a=`<!-- 受控 | 传了 value 就由宿主说了算：组件只发 value-change，宿主写回它才变，这里把樱桃挡在门外 -->
<xh-select id="select-controlled" value="banana" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃（选不中）</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>宿主持有的值：<span id="select-controlled-value">banana</span></p>

<script type="module">
  // 只有通过校验的值才写回，未写回则界面停在原值
  const select = document.getElementById("select-controlled");
  const readout = document.getElementById("select-controlled-value");
  let value = ["banana"];

  select.addEventListener("value-change", (event) => {
    const rejected = event.detail.value.includes("cherry");
    if (!rejected) {
      value = event.detail.value;
      select.value = value;
    }
    readout.textContent = value.join("、") + (rejected ? " · 上一次选择被拒绝" : "");
  });
<\/script>
`;export{a as default};
