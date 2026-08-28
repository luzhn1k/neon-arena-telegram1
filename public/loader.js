(function(){
  'use strict';
  function supportsModernSyntax(){
    try{
      /* Parsed only by Function, so this loader itself stays ES5-compatible. */
      new Function('var a={x:1}; async function f(){await Promise.resolve(); return a?.x;} class C{}; return f;');
      return typeof Promise!=='undefined' && typeof Map!=='undefined' && typeof Set!=='undefined';
    }catch(e){return false;}
  }
  function load(src,done,fail){
    var s=document.createElement('script');s.src=src;s.async=false;
    s.onload=function(){if(done)done();};s.onerror=function(){if(fail)fail();};document.head.appendChild(s);
  }
  function legacy(){load('legacy.js');}
  if(supportsModernSyntax())load('telegram.js',function(){load('game.js',null,legacy);},legacy);else legacy();
})();
