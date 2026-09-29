const n=`<!-- 展开全文 | 真被裁了才在文字之后露出一颗展开按钮；文字本身照常可选中，展开与收起只归按钮管 -->
<div style="inline-size: 360px; max-inline-size: 100%">
  <xh-truncate id="truncate-expandable" lines="2" expandable>
    <div data-xh-part="root">
      本次更新改进了组件主题、键盘交互与响应式布局。按下文字下方的按钮可查看完整内容，再按一次即可收起。
    </div>
    <!-- 按钮留空时元素按展开态写入文案 -->
    <button data-xh-part="trigger"></button>
  </xh-truncate>
</div>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("truncate-expandable").translations = { expand: "展开", collapse: "收起" };
<\/script>
`;export{n as default};
