var e=`<!-- 只读与禁用 | 只读时已绘制的笔迹可见但不可修改，禁用时连清空按钮都不可按下；两者都使用原生 disabled，不只是视觉置灰 -->
<div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
  <xh-signature-pad id="xh-signature-readonly" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">只读</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </xh-signature-pad>
  <xh-signature-pad id="xh-signature-disabled" disabled>
    <div data-xh-part="root">
      <span data-xh-part="label">禁用</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </xh-signature-pad>
</div>

<script type="module">
  // 钮上的字要包含在读屏名里：名字取 translations，给一句以可见字开头的中文；对象只走 property
  const translations = { clearTrigger: "清空签名" };
  document.getElementById("xh-signature-readonly").translations = translations;
  document.getElementById("xh-signature-disabled").translations = translations;
<\/script>
`;export{e as default};