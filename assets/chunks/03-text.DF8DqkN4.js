const a=`<!-- 行内文字 | variant 换形态：muted 弱化、strong 加重、code 等宽 -->
<xh-typography>
  <div data-xh-part="root">
    <p data-xh-part="paragraph">
      不写 variant 就是一段普通正文，<span data-xh-part="text" variant="muted">这一段弱化</span>，
      <span data-xh-part="text" variant="strong">这一段加重</span>，
      档位写在 <code data-xh-part="text" variant="code">data-level</code> 上。
    </p>
    <p data-xh-part="paragraph">
      链接自带下划线，<a data-xh-part="link" href="#">不只靠颜色区分</a>。
    </p>
  </div>
</xh-typography>
`;export{a as default};
