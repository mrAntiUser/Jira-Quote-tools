// ==UserScript==
// @name         Quote tools
// @license      MIT
// @namespace    argustelecom.ru
// @version      1.0
// @description  Quote tools
// @author       Andy BitOff
// @include      *support.argustelecom.ru*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @run-at       document-start
// ==/UserScript==

/* RELEASE NOTES
  1.0
    Release
*/

(function (MutationObserver) {
  'use strict';

  let $obsrvContainer, $users, $commBlock, $textArea, $popupQuote, quoteData;
  const observer = new MutationObserver(mutationCallback);

  const timId = setInterval(function() {
    if ($('body').length === 0){ return };
    clearInterval(timId);
    new MutationObserver(function(){
      $obsrvContainer = $('div#activitymodule div.mod-content div#issue_actions_container');
      if ($obsrvContainer.length === 0){ return };
      this.disconnect();
      addNewCss();
      observerStart();
    }).observe($('body').get(0), {childList: true});
  }, 100);

  function mutationCallback() {
    observer.disconnect();
    observerStart();
  }

  function observerStart() {
    $users = $('div.issuePanelContainer a.user-hover');
    makeUsers();
    $commBlock = $('div#activitymodule div[id^="comment-"] div.action-body');
    $commBlock.mouseup(function(event){
      const selected = getSelectedText();
      const selText = selected.toString();
      if (selText !== ''){
        const quoteUser = $(this).parent().find('div.action-head div.action-details > a').attr('rel');
        quoteData = '\n{quote}\n_[~' + quoteUser + ']_\n\n' + selText + '\n{quote}\n';
        event.stopPropagation();
        makePopupQuote($(this).parent());
        const x = $(selected.focusNode.parentNode).offset().left - $(this).parent().offset().left;
        const y = $(selected.focusNode.parentNode).offset().top - $(this).offset().top;
        $popupQuote.css({'top': event.offsetY + y + 'px', 'left': event.offsetX + x + 'px'});
      } else {
        $popupQuote.remove();
      }
    });
    observer.observe($obsrvContainer.get(0), {childList: true})
  }

  function makeUsers() {
    $textArea = $('div#comment-wiki-edit.wiki-edit-content textarea#comment.textarea')
    $users.each(function(){
      if ($(this).next().is('men')){return}
      const $userName = $(this).attr('rel');
      const $mention = $('<men class="qt-mention" title="Упомянуть пользователя"></men>');
      $mention.insertAfter(this);
      $mention.click(function(event){
        event.stopPropagation();
        sendToTextArea('[~' + $userName + '], ');
      });
    });
  }

  function sendToTextArea(text){
    $('div#addcomment.module').addClass('active');
    const caretPos = $textArea[0].selectionStart;
    const textAreaTxt = $textArea.val();
    $textArea.val(textAreaTxt.substring(0, caretPos) + text + textAreaTxt.substring(caretPos));
    $textArea[0].selectionStart = caretPos + text.length;
    $textArea[0].selectionEnd = $textArea[0].selectionStart;
    $textArea[0].focus();
  }

  function getSelectedText(){
    if (window.getSelection) {
      return window.getSelection();
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (document.selection) {
      return document.selection.createRange().text;
    }
  }

  function makePopupQuote($par){
    if ($popupQuote){$popupQuote.remove()}
    $popupQuote = $('<div id="qt-popup" class="aui-button" title="Процитировать выделенный текст"></div>').click(function(){
      sendToTextArea(quoteData);
      $popupQuote.remove();
    });
    $par.append($popupQuote);
  }

  function newCssClass(cssClass){
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssClass));
    head.appendChild(style);
  }

  function addNewCss(){
    newCssClass(`
      .qt-mention:before {
        cursor: pointer;
        font-size: 9px;
        position: relative;
        top: -6px;
        content: "@";
      }
      .qt-mention:hover {
        color: blue;
      }
      #qt-popup {
        position: absolute;
        top: -1000px;
        left: -1000px;
        height: 26px;
        width: 30px;
        z-index: 1;
        -webkit-box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
        -moz-box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
        box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
        border: 1px solid lightgray;
        background: #3cff00 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACISURBVEhL7ZVLDoAgDES5ndH7b/ydRdvEMaQFBUpgw0veYgp2dugGqSzkQV6PpeB73sU7X04ShzUK2J0HwLpYovY1L0DOFcgcvZArkFkPjPQvQE4xhDqTA+QUQ6izr8sl9C9AzhXIHL2QK5BZD4y0L/D/BZYif8fKAzCT/H7XKtjIiQeDH5y7Abh/oWWhH+N/AAAAAElFTkSuQmCC") no-repeat scroll 2px 0px;
        animation: simple-translate-showButton 200ms;
        opacity: 0.3;
      }
      #qt-popup:hover {
        opacity: 1;
        background-color: #fff;
        transition: .2s;
      }
    `)
  }

})(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver);