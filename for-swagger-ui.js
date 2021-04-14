// ==UserScript==
// @name         for-swagger-ui
// @namespace    https://github.com/Harry-qi/my-tampermonkey
// @version      0.1
// @description  for happy copy
// @author       harry-qi
// @match        https://*/swagger-ui.html
// @match        http://*/swagger-ui.html
// @match        https://*.utools.club/swagger-ui.html
// @grant        none
// @run-at document-end
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
// 样式
function cssStyle(){
  $('head').append(`
  <style>
      #copy-tips{
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          top: 10px;
          background-color: #f0f9eb;
          color: #67c23a;
          padding: 8px 16px;
          box-sizing: border-box;
          border-radius: 4px;
          display:flex;
          align-items: center;
          opacity: 0;
          transition: opacity .3s,transform .4s,top .4s,-webkit-transform .4s;
      }
  </style>
  `)
}
// 复制内容到剪贴板
function copy(val) {
  var oInput = document.createElement('input');
  oInput.value = val;
  document.body.appendChild(oInput);
  oInput.select();
  document.execCommand("Copy");
  oInput.className = 'oInput';
  oInput.style.display='none';
}
// 创建提示语的DOM
function createTips(){
  var spanDOM = $("<span id='copy-tips'>复制成功</span>")
  $('body').append(spanDOM)
}
function showTips(){
  var tipsDOM = document.querySelector('#copy-tips')
  tipsDOM.style.top = '25px'
  tipsDOM.style.opacity = '1'
  setTimeout(()=>{
      tipsDOM.style.top = '10px'
      tipsDOM.style.opacity = '0'
  },1000)
}
function clickFn(selector){
  document.querySelectorAll(selector).forEach(sItem=>{
    sItem.addEventListener('click',(e)=>{
        copy(e.target.innerText)
        showTips()
        e.stopPropagation()
      })
  })
}
function init(){
  cssStyle()
  createTips()
  // 适配不同的swagger-ui
  if(localStorage.getItem('mode')==='2'){
    document.querySelectorAll('.opblock-tag').forEach(item=>{
      item.click()
      clickFn('.opblock-summary-path')
    })
  }else{
    clickFn('.path')
  }
}
function loadJs(url,callback,s,f,flag){
  var script=document.createElement('script');
  script.type="text/javascript";
  if(typeof(callback)!="undefined"){
    if(script.readyState){
      script.onreadystatechange=function(){
      if(script.readyState == "loaded" || script.readyState == "complete"){
        script.onreadystatechange=null;
        setTimeout(()=>{
          callback(s,f,flag);
        })
      }
      }
    }else{
      script.onload=function(){
        setTimeout(()=>{
          callback(s,f,flag);
        })
      }
    }
  }
  script.src=url;
  document.body.appendChild(script);
}
(function() {
'use strict';
// 适配不同的swagger-ui
if(document.querySelector('#swagger-ui-container')){
  localStorage.setItem('mode','1')
  waitForKeyElements('#swagger-ui-container #resources_container',init,true)
}
if(document.querySelector('#swagger-ui')){
  localStorage.setItem('mode','2')
  loadJs(' https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js', waitForKeyElements,'.swagger-container',init,true)
}
})();
