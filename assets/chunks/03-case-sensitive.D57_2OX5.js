const n=`<!-- 区分大小写 | 缺省不区分，开了 case-sensitive 就按写法比 -->
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-highlight text="XiHan UI 与 xihan ui 是同一个名字的两种写法。" keyword="ui">
    <span data-xh-part="root"></span>
  </xh-highlight>

  <xh-highlight
    text="XiHan UI 与 xihan ui 是同一个名字的两种写法。"
    keyword="ui"
    case-sensitive
  >
    <span data-xh-part="root"></span>
  </xh-highlight>
</div>
`;export{n as default};
