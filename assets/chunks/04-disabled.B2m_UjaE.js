const t=`<!-- 禁用与空值 | disabled 罩住整框并走原生 disabled；输入为空或只有空白时发送按钮转灰，但位置留着不收起 -->
<div style="width: 100%; display: grid; gap: 12px">
  <!-- 整框禁用 -->
  <xh-composer disabled default-value="这一台是禁用的">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>

  <!-- 空值：按钮转灰，敲进第一个非空白字符就亮 -->
  <xh-composer>
    <div data-xh-part="root">
      <textarea
        data-xh-part="input"
        placeholder="空着时发送按钮是灰的"
        rows="1"
      ></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-composer>
</div>
`;export{t as default};
