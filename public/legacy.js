(function(){
  'use strict';
  function show(){
    var boot=document.getElementById('bootText');
    if(boot) boot.textContent='Эта версия Telegram слишком старая для Neon Arena. Обновите Telegram.';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show);else show();
})();
