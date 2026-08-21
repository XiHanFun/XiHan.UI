const t=`<!-- 禁用与载入 | loading 会挡住点击，并给 indicator 部件挂上旋转动画 -->
<xh-button disabled>
  <button data-xh-part="root">禁用</button>
</xh-button>
<xh-button loading>
  <button data-xh-part="root">
    <span data-xh-part="indicator"></span>
    <span data-xh-part="label">提交中</span>
  </button>
</xh-button>
`;export{t as default};
