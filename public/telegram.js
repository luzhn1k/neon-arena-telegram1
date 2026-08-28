(() => {
  'use strict';
  const SCALE=1000;
  class TelegramBridge {
    constructor(){
      this.tg=window.Telegram?.WebApp||null;this.authorized=false;this.platformAvailable=!!this.tg;this.supportsRewarded=false;
      this.language=(navigator.language||'ru').toLowerCase().startsWith('ru')?'ru':'en';this.callbacks={pause:()=>{},resume:()=>{}};this.initialized=false;
      this.initData='';this.devMode=false;this.user=null;this.platformApi=null;this.startParam='';
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
        this.initData=String(this.tg.initData||'');this.user=this.tg.initDataUnsafe?.user||null;this.startParam=String(this.tg.initDataUnsafe?.start_param||new URLSearchParams(location.search).get('tgWebAppStartParam')||'');
        const lc=String(this.user?.language_code||'').toLowerCase();if(lc)this.language=lc.startsWith('ru')?'ru':'en';
        this.authorized=!!this.initData;this.platformAvailable=true;this.platformApi={telegram:true};
        const viewportSignal=()=>{try{window.dispatchEvent(new CustomEvent('neon:telegramviewport'))}catch(_){window.dispatchEvent(new Event('resize'))}};
        this.tg.onEvent?.('deactivated',()=>this.callbacks.pause());this.tg.onEvent?.('activated',()=>this.callbacks.resume());
        this.tg.onEvent?.('viewportChanged',viewportSignal);this.tg.onEvent?.('safeAreaChanged',viewportSignal);this.tg.onEvent?.('contentSafeAreaChanged',viewportSignal);
      }else{
        try{const health=await fetch('/api/health').then(r=>r.json());this.devMode=!!health.devMode;this.authorized=this.devMode;this.platformAvailable=this.devMode;this.platformApi=this.devMode?{dev:true}:null}catch(_){ }
      }
      return this;
    }
    setCallbacks(callbacks={}){this.callbacks={pause:typeof callbacks.pause==='function'?callbacks.pause:()=>{},resume:typeof callbacks.resume==='function'?callbacks.resume:()=>{}}}
    ready(){try{this.tg?.ready?.();this.tg?.expand?.()}catch(_){ }return true}
    prepareGameplay(){
      try{this.tg?.expand?.();this.tg?.requestFullscreen?.();this.tg?.disableVerticalSwipes?.()}catch(_){ }
    }
    gameplayStart(){
      try{
        this.tg?.expand?.();this.tg?.requestFullscreen?.();this.tg?.disableVerticalSwipes?.();
        if(window.innerWidth>window.innerHeight)this.tg?.lockOrientation?.();
      }catch(_){ }
    }
    gameplayStop(){ }
    gameplayExit(){
      try{this.tg?.enableVerticalSwipes?.();this.tg?.unlockOrientation?.()}catch(_){ }
    }
    async login(){return{ok:this.authorized,player:this.user}}
    async loadCloudProgress(){if(!this.authorized)return null;try{return(await this.api('/api/me')).progress}catch(e){console.warn('[Telegram] cloud load',e);return null}}
    async saveCloudProgress(progress){if(!this.authorized)return false;try{await this.api('/api/progress',{method:'PUT',body:JSON.stringify({progress})});return true}catch(e){console.warn('[Telegram] cloud save',e);return false}}
    async submitScore(score,meta={}){if(!this.authorized)return false;try{return await this.api('/api/score',{method:'POST',body:JSON.stringify({score:Math.max(0,Math.floor(Number(score)||0)),meta})})}catch(e){console.warn('[Telegram] score',e);return false}}
    async getLeaderboard(){if(!this.authorized)return null;try{const d=await this.api('/api/leaderboard');return{entries:d.entries||[],userRank:d.userRank||0,season:d.season||null,reward:d.reward||null}}catch(e){console.warn('[Telegram] leaderboard',e);return null}}
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
          try{const check=await this.api(`/api/purchase-status?id=${encodeURIComponent(invoice.purchaseId)}`);if(check.status==='paid')return{paid:true,status:'paid',progress:check.progress,reward:check.reward}}catch(_){ }
        }
        return{paid:true,status:'paid',progress:await this.loadCloudProgress()};
      }catch(e){console.warn('[Telegram] purchase',e);return null}
    }
    async buyPremiumCosmetic(kind,id){
      try{return await this.api('/api/shop/buy',{method:'POST',body:JSON.stringify({kind,id})})}
      catch(e){return{ok:false,reason:e.data?.reason||'error'}}
    }
    async claimWeeklyLeaderboardReward(){
      try{return await this.api('/api/rewards/weekly',{method:'POST',body:'{}'})}
      catch(e){return{ok:false,reason:e.data?.reason||'error',rank:e.data?.rank||0,weekId:e.data?.weekId||''}}
    }
    async claimTop10Reward(){return this.claimWeeklyLeaderboardReward()}
    async getReferral(){if(!this.authorized)return null;try{return(await this.api('/api/referral')).referral||null}catch(e){console.warn('[Telegram] referral',e);return null}}
    async bindReferral(startParam){if(!this.authorized||!startParam)return null;try{return await this.api('/api/referral/bind',{method:'POST',body:JSON.stringify({startParam})})}catch(e){return{ok:false,reason:e.data?.reason||'error'}}}
    async claimReferralMilestone(count){if(!this.authorized)return{ok:false,reason:'auth'};try{return await this.api('/api/referral/claim',{method:'POST',body:JSON.stringify({count})})}catch(e){return{ok:false,reason:e.data?.reason||'error'}}}
    shareReferral(url,text=''){
      const share=`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      try{if(this.tg?.openTelegramLink){this.tg.openTelegramLink(share);return true}}catch(_){ }
      try{window.open(share,'_blank','noopener,noreferrer');return true}catch(_){return false}
    }
    async getPurchases(){return[]}
    async consumePurchase(){return true}
    showInterstitial(){return Promise.resolve(false)}
    showRewarded(){return Promise.resolve(false)}
  }
  window.PlatformBridge=new TelegramBridge();window.NEON_LEADERBOARD_NAME='telegram_global';
})();
