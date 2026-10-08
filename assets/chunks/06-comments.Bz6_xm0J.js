async function e(){let e=document.getElementById(`diff-view-comments`);e.model={hunks:[{header:`@@ -1,3 +1,4 @@`,oldStart:1,oldLines:3,newStart:1,newLines:4,lines:[{change:`removed`,oldNumber:1,text:`export function createClient(base: string) {`},{change:`removed`,oldNumber:2,text:`  return fetchJson(base, { timeout: 5000 })`},{change:`added`,newNumber:1,text:`export function createClient(base: string, token?: string) {`,segments:[{text:`export function createClient(base: string`,changed:!1},{text:`, token?: string`,changed:!0},{text:`) {`,changed:!1}]},{change:`added`,newNumber:2,text:`  const headers = token ? { authorization: token } : {}`},{change:`added`,newNumber:3,text:`  return fetchJson(base, { timeout: 30000, headers })`},{change:`context`,oldNumber:3,newNumber:4,text:`}`}]}]};let t=e=>`${e.side}:${e.line}`,n=new Map([[`new:3`,`超时从 5 秒放到 30 秒，网关那边的超时也要一起改。`]]),r=null;function i(){let i=[...n.keys()].map(e=>{let[t,n]=e.split(`:`);return{side:t,line:Number(n)}});r&&!n.has(t(r))&&i.push(r),e.commentLines=i}function a(e,i){if(!r||t(r)!==t(i)){e.textContent=n.get(t(i))??``;return}e.innerHTML=`
      <div style="display: grid; gap: 8px">
        <xh-text-field>
          <div data-xh-part="root">
            <label data-xh-part="label">${i.side===`old`?`旧`:`新`}第 ${i.line} 行的评论</label>
            <div data-xh-part="control"><input data-xh-part="input" /></div>
          </div>
        </xh-text-field>
        <div style="display: flex; gap: 8px">
          <xh-button size="sm"><button data-xh-part="root" data-action="save">保存</button></xh-button>
          <xh-button size="sm" variant="ghost"><button data-xh-part="root" data-action="cancel">取消</button></xh-button>
        </div>
      </div>`;let a=e.querySelector(`input`);a.value=n.get(t(i))??``,e.querySelector(`[data-action="save"]`).addEventListener(`click`,()=>{a.value.trim()!==``&&n.set(t(i),a.value.trim()),r=null,o()}),e.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>{r=null,o()})}function o(){i();for(let t of e.querySelectorAll(`[data-part="comment-thread"]`)){let[e,n]=t.dataset.value.split(`:`);a(t,{side:e,line:Number(n)})}}e.addEventListener(`comment-mount`,e=>a(e.detail.element,e.detail)),e.addEventListener(`comment-request`,e=>{r={side:e.detail.side,line:e.detail.line},o()}),i()}export{e as default};