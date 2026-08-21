const t=`<!-- 基础用法 | 命中关键词的片段渲染成 \`<mark>\`，其余是纯文本；整段文本原样拼得回来 -->
<!-- root 写成空容器：片段由元素按 text 与 keyword 算出来后铺进去 -->
<xh-highlight
  text="曦寒 UI 是一套框架无关的设计系统运行时，组件的行为与皮肤各走各的。"
  keyword="组件"
>
  <span data-xh-part="root"></span>
</xh-highlight>
`;export{t as default};
