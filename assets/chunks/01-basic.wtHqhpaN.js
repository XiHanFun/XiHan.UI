const a=`<!-- 基础用法 | root 管段间距与最大行宽，标题与段落各自拿字号、字重、行高 -->
<xh-typography>
  <div data-xh-part="root">
    <!-- 标签由作者写，要进文档大纲就写 h1-h6 -->
    <h3 data-xh-part="heading" level="3">版式约定</h3>
    <p data-xh-part="paragraph">
      字号、字重与行高都收进令牌，不再逐处手写。段与段之间的间距由 root 统一给。
    </p>
    <p data-xh-part="paragraph">
      最大行宽也由 root 管，整块正文不会拉成一行行难读的长句。
    </p>
  </div>
</xh-typography>
`;export{a as default};
