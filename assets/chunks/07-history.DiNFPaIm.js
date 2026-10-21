var e=`<!-- 撤销与重做 | 一笔或一次清空是一步；没有可撤销、可重做的一步时按钮置灰，焦点仍留在原处 -->
<xh-signature-pad id="xh-signature-history">
  <div data-xh-part="root" style="max-inline-size: 22rem">
    <svg data-xh-part="control">
      <line data-xh-part="guide"></line>
      <path data-xh-part="path"></path>
    </svg>
    <div style="display: flex; gap: var(--xh-space-2)">
      <button data-xh-part="undo-trigger">撤销</button>
      <button data-xh-part="redo-trigger">重做</button>
      <!-- 清空也是一步：误清之后按撤销能把整份签名找回来 -->
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </div>
</xh-signature-pad>

<script type="module">
  // 钮上的字要包含在读屏名里：名字取 translations，给一句以可见字开头的中文；对象只走 property
  document.getElementById("xh-signature-history").translations = {
    undoTrigger: "撤销上一笔",
    redoTrigger: "重做一笔",
    clearTrigger: "清空签名",
  };
<\/script>
`;export{e as default};