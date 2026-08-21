const a=`<!-- 只读 | 格子带上原生 readonly，值走受控且宿主不回写：能聚焦、能选中复制，改不动 -->
<!-- 传了 value 就由宿主说了算，不回写值就恒定不变 -->
<xh-pin-input length="4" value="8192">
  <div data-xh-part="root">
    <label data-xh-part="label">上一次的验证码</label>
    <!-- 皮肤没有只读档，底色由作者压下去表示改不动 -->
    <div style="display: flex">
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
      <input data-xh-part="input" readonly style="background: var(--xh-bg-subtle)" />
    </div>
  </div>
</xh-pin-input>
<span>点进任意一格可以选中复制，敲键盘与粘贴都改不动它。</span>
`;export{a as default};
