const e=`<!-- 自定义换算 | parse 把显示串读成数、format 把数写回显示串；两个方向必须互逆，否则按一下加号值就会漂 -->
<xh-number-field id="number-field-amount" value="1,234" min="0" max="99999" step="100">
  <div data-xh-part="root">
    <label data-xh-part="label">金额（千位分隔）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger">−</button>
      <input data-xh-part="input" style="inline-size: 96px" />
      <button data-xh-part="increment-trigger">+</button>
    </div>
  </div>
</xh-number-field>

<xh-number-field id="number-field-weight" value="60 kg" min="0" max="200" step="5">
  <div data-xh-part="root">
    <label data-xh-part="label">体重（带单位）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger">−</button>
      <input data-xh-part="input" style="inline-size: 88px" />
      <button data-xh-part="increment-trigger">+</button>
    </div>
  </div>
</xh-number-field>

<!-- 输入途中一律不补格式，否则光标会被打断；手打 1500 要等失焦才变成 1,500 -->
<span style="font-size: 13px">
  金额：<span id="number-field-amount-value">1,234</span> ·
  体重：<span id="number-field-weight-value">60 kg</span>
</span>

<script type="module">
  // 两个换算方向是函数，交不成属性，只走 property
  const amount = document.getElementById("number-field-amount");
  const amountText = document.getElementById("number-field-amount-value");
  const weight = document.getElementById("number-field-weight");
  const weightText = document.getElementById("number-field-weight-value");

  // 千位分隔符：读的时候把逗号去掉，写的时候再加回来
  amount.parse = (text) => Number(text.replace(/,/g, ""));
  amount.format = (value) => value.toLocaleString("en-US");

  // 单位后缀同理：认得出后缀就读得出数
  weight.parse = (text) => Number(text.replace(/\\s*kg$/i, ""));
  weight.format = (value) => \`\${value} kg\`;

  amount.addEventListener("value-change", (event) => {
    amount.value = event.detail.value;
    amountText.textContent = event.detail.value;
  });

  weight.addEventListener("value-change", (event) => {
    weight.value = event.detail.value;
    weightText.textContent = event.detail.value;
  });
<\/script>
`;export{e as default};
