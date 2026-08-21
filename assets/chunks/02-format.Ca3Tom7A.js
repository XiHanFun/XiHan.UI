const n=`<!-- 模板与精度 | format 里 H 时 m 分 s 秒 S 毫秒，重复字母的个数即最少位数；precision 决定读到的数有多细 -->
<!-- 模板里非记号的字符原样留下，所以中文单位直接写在里面就行 -->
<p>
  中文单位：
  <xh-countdown value="3723456" format="H 时 m 分 s 秒">
    <span data-xh-part="root"></span>
  </xh-countdown>
</p>

<p>
  只看分秒：
  <xh-countdown value="3723456" format="mm:ss">
    <span data-xh-part="root"></span>
  </xh-countdown>
</p>

<!-- 精度缺省是整秒，所以这一行的毫秒段一直是 000 -->
<p>
  写了 SSS 但精度是秒：
  <xh-countdown value="3723456" format="ss.SSS">
    <span data-xh-part="root"></span>
  </xh-countdown>
</p>

<!-- 想显示毫秒得把精度提上去，模板与精度是两件事 -->
<p>
  精度提到毫秒：
  <xh-countdown value="3723456" format="ss.SSS" precision="3">
    <span data-xh-part="root"></span>
  </xh-countdown>
</p>
`;export{n as default};
