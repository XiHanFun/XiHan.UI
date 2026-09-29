const n=`<!-- 语言与数字格式 | locale 决定小数点与分组习惯，formatOptions 交给 Intl.NumberFormat 铺货币、百分比与紧凑记数；小数位仍归 precision -->
<p>
  德语欧元：
  <xh-number-animation id="number-animation-intl-euro" from="0" to="1234567.89" precision="2" locale="de-DE">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  百分比：
  <xh-number-animation id="number-animation-intl-percent" from="0" to="0.873" precision="1" locale="zh-CN">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  紧凑记数：
  <xh-number-animation id="number-animation-intl-compact" from="0" to="12840000" precision="1" locale="en-US">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>

<script type="module">
  // formatOptions 是对象，只能经 property 赋值
  document.getElementById("number-animation-intl-euro").formatOptions = { style: "currency", currency: "EUR", useGrouping: true };
  document.getElementById("number-animation-intl-percent").formatOptions = { style: "percent" };
  document.getElementById("number-animation-intl-compact").formatOptions = { notation: "compact" };
<\/script>
`;export{n as default};
