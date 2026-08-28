(() => {
  'use strict';
  const SCALE=1000;
  class TelegramBridge {
    constructor(){
      this.tg=window.Telegram?.WebApp||null;this.authorized=false;this.platformAvailable=!!this.tg;this.supportsRewarded=false;
      this.language=(navigator.language||'ru').toLowerCase().startsWith('ru')?'ru':'en';this.callbacks={pause:()=>{},resume:()=>{}};this.initialized=false;
      this.initData='';this.devMode=false;this.user=null;this.platformApi=null;
    }
    async api(path,options={}){
      const headers={'Content-Type':'application/json',...(options.headers||{})};
      if(this.initData)headers['X-Telegram-Init-Data']=this.initData;
      if(!this.initData && this.devMode)headers['X-Dev-User-Id']='999001';
      const response=await fetch(path,{...options,headers});
      const data=await response.json().catch(()=>({ok:false,error:`HTTP ${response.status}`}));
      if(!response.ok){const e=new Error(data.error||data.reason||`HTTP ${response.status}`);e.status=response.status;e.data=data;throw e}
      return data;
    }
    async init(){
      if(this.initialized)return this;this.initialized=true;document.documentElement.classList.add('telegram-platform');
      if(this.tg){
        try{this.tg.ready();this.tg.expand();this.tg.setHeaderColor?.('#070b16');this.tg.setBackgroundColor?.('#070b16')}catch(_){ }
        this.initData=String(this.tg.initData||'');this.user=this.tg.initDataUnsafe?.user||null;
        const lc=String(this.user?.language_code||'').toLowerCase();if(lc)this.language=lc.startsWith('ru')?'ru':'en';
        this.authorized=!!this.initData;this.platformAvailable=true;this.platformApi={telegram:true};
        this.tg.onEvent?.('deactivated',()=>this.callbacks.pause());this.tg.onEvent?.('activated',()=>this.callbacks.resume());
      }else{
        try{const health=await fetch('/api/health').then(r=>r.json());this.devMode=!!health.devMode;this.authorized=this.devMode;this.platformAvailable=this.devMode;this.platformApi=this.devMode?{dev:true}:null}catch(_){ }
      }
      return this;
    }
    setCallbacks(callbacks={}){this.callbacks={pause:typeof callbacks.pause==='function'?callbacks.pause:()=>{},resume:typeof callbacks.resume==='function'?callbacks.resume:()=>{}}}
    ready(){try{this.tg?.ready?.();this.tg?.expand?.()}catch(_){ }return true}
    gameplayStart(){try{this.tg?.expand?.();this.tg?.requestFullscreen?.()}catch(_){ }}
    gameplayStop(){ }
    async login(){return{ok:this.authorized,player:this.user}}
    async loadCloudProgress(){if(!this.authorized)return null;try{return(await this.api('/api/me')).progress}catch(e){console.warn('[Telegram] cloud load',e);return null}}
    async saveCloudProgress(progress){if(!this.authorized)return false;try{await this.api('/api/progress',{method:'PUT',body:JSON.stringify({progress})});return true}catch(e){console.warn('[Telegram] cloud save',e);return false}}
    async submitScore(score,meta={}){if(!this.authorized)return false;try{await this.api('/api/score',{method:'POST',body:JSON.stringify({score:Math.max(0,Math.floor(Number(score)||0)),meta})});return true}catch(e){console.warn('[Telegram] score',e);return false}}
    async getLeaderboard(){if(!this.authorized)return null;try{const d=await this.api('/api/leaderboard');return{entries:d.entries||[],userRank:d.userRank||0}}catch(e){console.warn('[Telegram] leaderboard',e);return null}}
    async getPlayerEntry(){if(!this.authorized)return null;try{return(await this.api('/api/player-entry')).entry||null}catch(_){return null}}
    async getPaymentsCatalog(){try{return(await this.api('/api/store')).products||[]}catch(_){return[]}}
    async purchaseProduct(productId){
      if(!this.authorized||!this.tg?.openInvoice)return null;
      try{
        const invoice=await this.api('/api/invoice',{method:'POST',body:JSON.stringify({productId})});
        const status=await new Promise(resolve=>{let done=false;const finish=s=>{if(done)return;done=true;resolve(s)};try{this.tg.openInvoice(invoice.invoiceLink,finish)}catch(_){finish('failed')}});
        if(status!=='paid')return{paid:false,status};
        for(let i=0;i<14;i++){
          await new Promise(r=>setTimeout(r,450));
          try{const check=await this.api(`/api/purchase-status?id=${encodeURIComponent(invoice.purchaseId)}`);if(check.status==='paid')return{paid:true,status:'paid',progress:check.progress}}catch(_){ }
        }
        return{paid:true,status:'paid',progress:await this.loadCloudProgress()};
      }catch(e){console.warn('[Telegram] purchase',e);return null}
    }
    async buyPremiumCosmetic(kind,id){
      try{return await this.api('/api/shop/buy',{method:'POST',body:JSON.stringify({kind,id})})}
      catch(e){return{ok:false,reason:e.data?.reason||'error'}}
    }
    async claimTop10Reward(){
      try{return await this.api('/api/rewards/top10',{method:'POST',body:'{}'})}
      catch(e){return{ok:false,reason:e.data?.reason||'error',rank:e.data?.rank||0}}
    }
    async getPurchases(){return[]}
    async consumePurchase(){return true}
    showInterstitial(){return Promise.resolve(false)}
    showRewarded(){return Promise.resolve(false)}
  }
  window.PlatformBridge=new TelegramBridge();window.NEON_LEADERBOARD_NAME='telegram_global';
})();
