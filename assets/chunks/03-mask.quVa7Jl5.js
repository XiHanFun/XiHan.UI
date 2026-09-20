const t=`<!-- 遮蔽与字符类别 | mask 把每格转为密码框，type 决定哪类字符可以输入，其余按键既不进入值也不留在框中 -->
<xh-pin-input length="4" mask>
  <div data-xh-part="root">
    <label data-xh-part="label">支付密码（遮蔽）</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>

<xh-pin-input length="4" type="alphanumeric">
  <div data-xh-part="root">
    <label data-xh-part="label">兑换码（数字与字母）</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
`;export{t as default};
