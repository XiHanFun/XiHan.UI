var e=`<!-- 只读 | 格子带上原生 readonly，值受控且宿主不回写：可聚焦、可选中复制，不可修改 -->
<!-- 传了 value 就由宿主说了算，不回写值就恒定不变 -->
<xh-pin-input length="4" value="8192" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">上一次的验证码</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
<span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
`;export{e as default};