// ==UserScript==
// @name         for-swagger-ui
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  for happy copy
// @author       harry-qi
// @match        https://petstore.swagger.io/
// @match        https://*/swagger-ui.html
// @match        https://*.utools.club/swagger-ui.html
// @grant        none
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// ==/UserScript==
function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}
// 复制内容到剪贴板
function copy(val) {
  let transfer = document.createElement('input');
  document.body.appendChild(transfer);
  transfer.value = val; // 这里表示想要复制的内容
  transfer.focus();
  transfer.select();
  if (document.execCommand('copy')) {
      document.execCommand('copy');
  }
  transfer.blur();
  document.body.removeChild(transfer);
}
  // 创建复制按钮
function createBtn(){
  var btn=document.createElement("BUTTON");
  var t=document.createTextNode("copy url");
  btn.appendChild(t);
  btn.style.cssText= `cursor: pointer;
  border: 1px solid #dcdfe6;
  outline: none;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  color: #fff;
  font-weight: 500;
  background-color: #409eff;
  border-color: #409eff;`
  return btn
}
(function() {
  'use strict';
  waitForKeyElements('#swagger-ui .information-container',init,true)
  function init(){
    var con = document.querySelectorAll('.operation-tag-content') // 所有API的DOM
    con.forEach(item=>{
      item.childNodes.forEach(sonItem=>{
        var btn = createBtn()
        btn.addEventListener('click',(e)=>{
            var urlContent = sonItem.childNodes[0].childNodes[0].childNodes[1].innerText
            copy(urlContent)
            e.stopPropagation() // 防止点击复制按钮 展开了详情
        })
        sonItem.childNodes[0].childNodes[0].appendChild(btn)
        // 增大间距 防止误操作
        sonItem.childNodes[0].childNodes[0].childNodes[1].style.marginRight = '30px'
        sonItem.childNodes[0].childNodes[0].childNodes[1].style.marginLeft = '30px'
        // 防止点击api的DOM展开了详情
        sonItem.childNodes[0].childNodes[0].childNodes[1].addEventListener('click',(e)=>{ e.stopPropagation() })
      })
    })
  }
})();