const t=`<!-- 自定义准入字符 | pattern 是一段正则源码，逐个字符整格匹配；写坏了退回 type 的准入表 -->
<!-- 十六进制：准入放宽到 A-F，type 也一并改成 alphanumeric，
     否则移动端弹的还是数字键盘、那几个字母敲不进来 -->
<xh-pin-input length="6" type="alphanumeric" pattern="[0-9A-Fa-f]" placeholder="·">
  <div data-xh-part="root">
    <label data-xh-part="label">颜色值（十六进制）</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>

<!-- 只收这四个字，粘贴整串时同样按它过滤 -->
<xh-pin-input length="4" type="alphanumeric" pattern="[上下左右]" placeholder="·">
  <div data-xh-part="root">
    <label data-xh-part="label">方向口令</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
`;export{t as default};
