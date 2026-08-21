const a=`<!-- 提示、警告与错误 | 三档语气各归各的部件：提示与警告都写在描述里，控件的 aria-invalid 保持 false；只有真出错才翻 invalid、错误文案才接进描述链 -->
<div style="display: grid; gap: 16px; inline-size: 280px">
  <xh-field>
    <div data-xh-part="root">
      <label data-xh-part="label">项目名</label>
      <input data-xh-part="control" value="xihan-ui" />
      <p data-xh-part="description">创建之后还能改</p>
    </div>
  </xh-field>

  <!-- 警告：值可疑但不算错，invalid 不翻，读屏经描述链念出这一句 -->
  <!-- 警告档只换配色：边框取语气层的强调色，描述取语气层的文字色 -->
  <xh-field>
    <div
      data-xh-part="root"
      data-tone="warning"
      style="
        --xh-field-control-border: var(--xh-_tone-soft);
        --xh-field-description-fg: var(--xh-_tone-fg);
      "
    >
      <label data-xh-part="label">实例规格</label>
      <input data-xh-part="control" value="1 核 1G" />
      <p data-xh-part="description">这个规格跑构建会偏紧，仍然可以保存</p>
    </div>
  </xh-field>

  <xh-field invalid>
    <div data-xh-part="root">
      <label data-xh-part="label">端口</label>
      <input data-xh-part="control" value="70000" />
      <p data-xh-part="description">可用范围 1 到 65535</p>
      <p data-xh-part="error-text">端口超出可用范围</p>
    </div>
  </xh-field>
</div>
`;export{a as default};
