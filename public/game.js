(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const app = document.getElementById('app');
  const hud = document.getElementById('hud');
  const hpBar = document.getElementById('hpBar');
  const hudScore = document.getElementById('hudScore');
  const hudWave = document.getElementById('hudWave');
  const hudCombo = document.getElementById('hudCombo');
  const toast = document.getElementById('toast');

  const panels = {
    menu: document.getElementById('mainMenu'),
    upgrade: document.getElementById('upgradePanel'),
    gameover: document.getElementById('gameOverPanel'),
    leaderboard: document.getElementById('leaderboardPanel'),
    shop: document.getElementById('shopPanel'),
    rewards: document.getElementById('rewardsPanel'),
    help: document.getElementById('helpPanel'),
    pause: document.getElementById('pausePanel'),
  };

  const ui = {
    menuBest: document.getElementById('menuBest'),
    menuCoins: document.getElementById('menuCoins'),
    menuCrystals: document.getElementById('menuCrystals'),
    shopCoins: document.getElementById('shopCoins'),
    shopCrystals: document.getElementById('shopCrystals'),
    adCrystalsText: document.getElementById('adCrystalsText'),
    claimAdCrystalsBtn: document.getElementById('claimAdCrystalsBtn'),
    crystalPackShop: document.getElementById('crystalPackShop'),
    crystalPacksWrap: document.getElementById('crystalPacksWrap'),
    bootOverlay: document.getElementById('bootOverlay'),
    bootText: document.getElementById('bootText'),
    rewardStatus: document.getElementById('rewardStatus'),
    skinShop: document.getElementById('skinShop'),
    bulletShop: document.getElementById('bulletShop'),
    trailShop: document.getElementById('trailShop'),
    shopPreviewStage: document.getElementById('shopPreviewStage'),
    shopPreviewName: document.getElementById('shopPreviewName'),
    shopPreviewRarity: document.getElementById('shopPreviewRarity'),
    shopPreviewKind: document.getElementById('shopPreviewKind'),
    shopPreviewPrev: document.getElementById('shopPreviewPrev'),
    shopPreviewNext: document.getElementById('shopPreviewNext'),
    loginBtn: document.getElementById('loginBtn'),
    authHint: document.getElementById('authHint'),
    upgradeChoices: document.getElementById('upgradeChoices'),
    finalScore: document.getElementById('finalScore'),
    finalWave: document.getElementById('finalWave'),
    finalKills: document.getElementById('finalKills'),
    finalCombo: document.getElementById('finalCombo'),
    newRecord: document.getElementById('newRecord'),
    rankLine: document.getElementById('rankLine'),
    leaderboardStatus: document.getElementById('leaderboardStatus'),
    leaderboardList: document.getElementById('leaderboardList'),
    leaderboardPodium: document.getElementById('leaderboardPodium'),
    leaderboardTableHead: document.getElementById('leaderboardTableHead'),
    leaderboardPlayerCard: document.getElementById('leaderboardPlayerCard'),
    leaderboardPlayerRank: document.getElementById('leaderboardPlayerRank'),
    leaderboardPlayerScore: document.getElementById('leaderboardPlayerScore'),
    collectionCount: document.getElementById('collectionCount'),
    weeklyProgress: document.getElementById('weeklyProgress'),
    dailyRewardText: document.getElementById('dailyRewardText'),
    weeklyRewardText: document.getElementById('weeklyRewardText'),
    adCreditsText: document.getElementById('adCreditsText'),
    adCapsuleText: document.getElementById('adCapsuleText'),
    claimDailyBtn: document.getElementById('claimDailyBtn'),
    claimWeeklyBtn: document.getElementById('claimWeeklyBtn'),
    claimAdCreditsBtn: document.getElementById('claimAdCreditsBtn'),
    claimAdCapsuleBtn: document.getElementById('claimAdCapsuleBtn'),
    chestShop: document.getElementById('chestShop'),
    leaderboardRewardBox: document.getElementById('leaderboardRewardBox'),
    leaderboardRewardText: document.getElementById('leaderboardRewardText'),
    claimLeaderboardRewardBtn: document.getElementById('claimLeaderboardRewardBtn'),
    leaderboardCrystalRewardText: document.getElementById('leaderboardCrystalRewardText'),
    claimLeaderboardCrystalBtn: document.getElementById('claimLeaderboardCrystalBtn'),
    capsuleOverlay: document.getElementById('capsuleOverlay'),
    capsuleReel: document.getElementById('capsuleReel'),
    capsuleResult: document.getElementById('capsuleResult'),
    capsuleResultPreview: document.getElementById('capsuleResultPreview'),
    capsuleResultRarity: document.getElementById('capsuleResultRarity'),
    capsuleResultName: document.getElementById('capsuleResultName'),
    capsuleResultNote: document.getElementById('capsuleResultNote'),
    capsuleAgainBtn: document.getElementById('capsuleAgainBtn'),
    capsuleCloseBtn: document.getElementById('capsuleCloseBtn'),
    dailyQuestList: document.getElementById('dailyQuestList'),
    questResetText: document.getElementById('questResetText'),
    dailyQuestBonus: document.getElementById('dailyQuestBonus'),
    dailyQuestBonusText: document.getElementById('dailyQuestBonusText'),
    claimQuestBonusBtn: document.getElementById('claimQuestBonusBtn'),
  };

  const I18N = {
    ru: {
      score:'Счёт', wave:'Волна', combo:'Комбо', tagline:'Выживай. Собирай комбо. Поднимайся в рейтинге.', best:'Рекорд', play:'Играть',
      leaderboard:'Рейтинг', howToPlay:'Как играть', upgradeEyebrow:'УСИЛЕНИЕ', chooseUpgrade:'Выбери улучшение', runComplete:'ЗАБЕГ ЗАВЕРШЁН',
      gameOver:'Арена окончена', kills:'Побеждено', bestCombo:'Лучшее комбо', newRecord:'Новый рекорд!', again:'Ещё раз', menu:'Меню',
      leaderboardNote:'Глобальный результат привязан к вашему Telegram-аккаунту.', training:'ТРЕНИРОВКА', moveTitle:'Двигайся',
      moveText:'WASD/стрелки на ПК. На телефоне веди пальцем по арене.', attackTitle:'Атакуй', attackText:'Оружие автоматически стреляет в ближайшего врага.',
      comboTitle:'Держи комбо', comboText:'Быстрые победы увеличивают множитель очков. Получение урона сбрасывает комбо.', upgradeTitle:'Усиливайся',
      upgradeText:'После каждой волны выбирай усиление. Редкость определяет его силу.', enterArena:'На арену', paused:'Пауза', continue:'Продолжить',
      login:'Telegram подключён', loginBenefit:'Откройте Mini App из Telegram, чтобы синхронизировать прогресс и участвовать в рейтинге.',
      authorized:'Telegram подключён · облачное сохранение и глобальный рейтинг активны', localMode:'Локальный режим: откройте Mini App из Telegram для облачного прогресса.',
      leaderboardLoading:'Загружаем рейтинг…', leaderboardUnavailable:'Глобальный рейтинг сейчас недоступен.', globalBoard:'ГЛОБАЛЬНЫЙ РЕЙТИНГ', globalBoardHint:'Лучшие результаты игроков Neon Arena', yourPosition:'ВАША ПОЗИЦИЯ', place:'Место', leaderboardPlayer:'Игрок', result:'Результат', topPlayer:'ЛИДЕР', points:'очков',
      authSuccess:'Telegram-профиль подключён. Облачный прогресс и рейтинг активированы.', authCancelled:'Откройте игру из Telegram, чтобы включить облачный прогресс.', rank:'Ваше место: #{rank}',
      noRank:'Откройте игру через Telegram, чтобы получить место в глобальном рейтинге.', waveIncoming:'ВОЛНА {wave}', bossIncoming:'БОСС · ВОЛНА {wave}', shieldSaved:'Щит поглотил удар!', evaded:'Фазовый сдвиг!', powerupSpeed:'УСКОРЕНИЕ', powerupDamage:'УСИЛЕННЫЙ УРОН', powerupShield:'ЭНЕРГОЩИТ', powerupPicked:'{name} · 10 сек.',
      localBest:'Локальный рекорд', player:'Игрок', leaderboardEmpty:'Пока нет результатов.', currency:'Неон-кредиты', crystals:'Нео-кристаллы', shop:'Магазин', rewards:'Награды',
      cosmetics:'КОСМЕТИКА', balance:'Баланс', characterSkins:'Скины персонажа', bulletStyles:'Виды пуль', characterTrails:'Следы персонажа', livePreview:'ЖИВОЙ ПРЕДПРОСМОТР', previewHint:'Наведи на предмет или листай стрелками', previewSkin:'Скин', previewBullet:'Пули', previewTrail:'След', cosmeticOnly:'Только внешний вид', rarityHint:'Редкость определяет силу эффекта усиления.',
      buy:'Купить', equip:'Надеть', equipped:'Выбрано', owned:'Получено', notEnough:'Недостаточно неон-кредитов.', purchaseDone:'Покупка совершена!', equippedDone:'Косметика выбрана.',
      rarityCommon:'Обычная', rarityRare:'Редкая', rarityEpic:'Эпическая', rarityLegendary:'Легендарная', rarityMythic:'Мифическая', rarityPower:'Сила ×{power}',
      rewardCenter:'ЦЕНТР НАГРАД', collection:'Коллекция', weeklyProgress:'Недельный прогресс', dailyReward:'ЕЖЕДНЕВНО', dailyTitle:'Ежедневный вход',
      weeklyReward:'ЕЖЕНЕДЕЛЬНО', weeklyTitle:'Недельная капсула', adReward:'ЗА РЕКЛАМУ', adTitle:'Косметическая капсула', dropChances:'Шансы косметики',
      legendaryEffectNote:'Эпическая и легендарная косметика добавляет визуальные эффекты на арену, но не усиливает персонажа.', claim:'Забрать', claimed:'Получено',
      dailyReady:'Сегодня: +{coins} ◆ и 1 случайная косметика. Серия: {streak} дн.', dailyDone:'Сегодняшняя награда уже получена.', weeklyReady:'Готово! 3 косметические капсулы + 500 ◆.',
      weeklyNeed:'Получай ежедневную награду: {days}/7. После 7 дней — 3 косметические капсулы.', adReady:'Посмотреть рекламу и получить 1 случайную косметику. Доступно раз в 6 часов.',
      adCooldown:'Следующая косметика за рекламу через {time}.', adLocal:'Рекламные награды отключены в Telegram-версии.', adWatch:'Смотреть рекламу → косметика',
      rewardReceived:'Получено: {item}', duplicateReward:'Повтор {item}: компенсация +{coins} ◆', dailyReceived:'Ежедневная награда получена!', weeklyReceived:'Недельная награда получена!',
      adReceived:'Косметика за рекламу получена!', adFailed:'Реклама не была просмотрена до награды.', rewardReadyShort:'Есть награды для получения', rewardWaitShort:'Новые награды появятся позже',
      chestsTitle:'Сундуки', chestsHint:'Чем выше редкость сундука, тем выше шанс редкой косметики', chestBuy:'Открыть за {coins} ◆', chestStandard:'Стандартный сундук', chestRare:'Редкий сундук', chestEpic:'Эпический сундук', chestLegendary:'Легендарный сундук', chestOdds:'Шансы: {odds}', chestOpened:'Сундук открыт!',
      adCreditsTitle:'100 неон-кредитов', adCapsuleTitle:'Косметическая капсула', adCreditsReady:'Посмотреть рекламу и получить 100 ◆. Доступно раз в 15 минут.', adCreditsCooldown:'Следующие 100 ◆ через {time}.', adCapsuleReady:'Посмотреть рекламу и получить косметическую капсулу. Доступно раз в 30 минут.', adCapsuleCooldown:'Следующая капсула через {time}.', adCreditsReceived:'Получено 100 неон-кредитов!', adCapsuleReceived:'Капсула за рекламу получена!', adCreditsWatch:'Смотреть рекламу → 100 ◆', adCapsuleWatch:'Смотреть рекламу → капсула',
      leaderboardRewardsTag:'НАГРАДЫ РЕЙТИНГА', leaderboardRewardsTitle:'За попадание и удержание', leaderboardRewardsAuth:'Откройте игру через Telegram, чтобы получать награды за рейтинг.', leaderboardRewardsNoEntry:'Сначала установите результат в глобальном рейтинге.', leaderboardRewardsChecking:'Проверяем вашу позицию…', leaderboardRewardsNone:'Сегодня награда недоступна. Возвращайтесь завтра и удерживайте место.', leaderboardMilestoneReady:'Новый диапазон: топ-{tier}. Награда +{coins} ◆.', leaderboardHoldReady:'Удержание топ-{tier}: +{coins} ◆. Серия: {streak} дн.', leaderboardBothReady:'Новый диапазон + удержание: +{coins} ◆.', leaderboardRewardClaim:'Забрать +{coins} ◆', leaderboardRewardClaimed:'Рейтинговая награда получена!', leaderboardFirstDay:'Позиция зафиксирована. Удержите её до завтра для ежедневной награды.',
      dailyQuestsTag:'ЕЖЕДНЕВНЫЕ КВЕСТЫ', dailyQuestsTitle:'Задания дня', questReset:'Сброс в полночь', dailyQuestBonusTag:'БОНУС ЗА ВСЕ КВЕСТЫ', dailyQuestBonusTitle:'Закрой все задания дня',
      dailyQuestBonusReady:'Все задания выполнены: +200 ◆ и 1 косметическая капсула.', dailyQuestBonusNeed:'Выполнено заданий: {done}/{total}.', questClaim:'Забрать', questClaimed:'Получено', questRewardCredits:'+{coins} ◆', questRewardCapsule:'Косметическая капсула',
      questKills:'Победи {target} врагов', questScore:'Набери {target} очков за забег', questCombo:'Собери комбо ×{target}', questWave:'Доберись до волны {target}', questGames:'Заверши {target} забега', questBoss:'Победи босса', duplicateNote:'Повторный предмет из капсулы автоматически превращается в неон-кредиты.',
      commonChance:'65%', rareChance:'26%', epicChance:'8%', legendaryChance:'1%', testCapsuleTitle:'Тестовая капсула', testCapsuleText:'Открывай без ограничений. Лента прокрутит все предметы и остановится на выпавшем.', openTestCapsule:'Открыть тестовую капсулу', capsuleOpening:'ОТКРЫТИЕ КАПСУЛЫ', capsuleTitle:'Косметическая капсула', openAgain:'Открыть ещё', close:'Закрыть', newCosmetic:'Новый предмет добавлен в коллекцию.', testDrop:'Тестовый дроп — прогресс и коллекция не изменяются.',

      crystalShopTag:'НЕО-КРИСТАЛЛЫ', crystalShopTitle:'Мифическая коллекция', crystalShopHint:'Эксклюзивная косметика за нео-кристаллы. Мифическая редкость выше легендарной.', crystalTopRewardTitle:'Нео-кристаллы за топ-10', crystalTopRewardAuth:'Откройте игру через Telegram, чтобы получать ежедневные нео-кристаллы за топ-10.', crystalTopRewardNeed:'Попадите в топ-10 глобального рейтинга, чтобы получить нео-кристаллы.', crystalTopRewardReady:'Место #{rank}: ежедневная награда +{crystals} ◈.', crystalTopRewardClaim:'Забрать +{crystals} ◈', crystalTopRewardClaimed:'Награда топ-10 уже получена сегодня.', crystalTopRewardReceived:'Получено {crystals} нео-кристаллов!', crystalAdTitle:'10 нео-кристаллов', crystalAdReady:'Посмотреть рекламу и получить 10 ◈. Доступно раз в час.', crystalAdCooldown:'Следующие 10 ◈ через {time}.', crystalAdWatch:'Смотреть рекламу → 10 ◈', crystalAdReceived:'Получено 10 нео-кристаллов!', crystalPacksTitle:'Пополнить нео-кристаллы', crystalPacksHint:'Покупки проходят через Telegram Stars.', crystalPackBuy:'Купить', crystalPackUnavailable:'Покупки сейчас недоступны.', crystalLoginRequired:'Для покупки нео-кристаллов откройте игру как Telegram Mini App.', notEnoughCrystals:'Недостаточно нео-кристаллов.', crystalPurchaseFailed:'Покупка не завершена.', crystalPurchaseDone:'Получено {crystals} нео-кристаллов!', crystalPurchasePending:'Платёж подтверждается Telegram…', mythicOnly:'Только за нео-кристаллы',
      skinQuantum:'Квант', skinPhoenix:'Феникс', skinAstral:'Астрал', bulletCelestial:'Небесный импульс', bulletDragon:'Драконий импульс', bulletVoidLance:'Копьё пустоты', trailGalaxy:'Галактический след', trailLightning:'Разлом молнии', trailCosmicRoyal:'Королевский космос',
      skinAqua:'Аква', skinMagenta:'Маджента', skinLime:'Лайм', skinSolar:'Солар', skinVoid:'Войд', skinIce:'Лёд', skinEmber:'Эмбер', skinGhost:'Фантом', skinRoyal:'Роял', skinNova:'Нова', skinPrism:'Призма',
      bulletOrb:'Сфера', bulletBolt:'Импульс', bulletShard:'Осколок', bulletComet:'Комета', bulletPulse:'Кольцо', bulletArc:'Дуга', bulletRocket:'Ракета', bulletStar:'Звезда', bulletWave:'Волна', bulletSingularity:'Сингулярность', bulletRainbow:'Спектр',
      skinCoral:'Коралл', skinCobalt:'Кобальт', skinToxic:'Токсин', skinMoon:'Луна', skinGlitch:'Глитч', skinAurora:'Аврора', skinEclipse:'Эклипс',
      bulletNeedle:'Игла', bulletSpark:'Искра', bulletPlasma:'Плазма', bulletHex:'Гекс', bulletEcho:'Эхо', bulletFlare:'Вспышка', bulletChronos:'Хронос',

      skinBloom:'Блум', skinMatrix:'Матрица', skinTempest:'Темпест', skinNebula:'Небула',
      bulletPetal:'Петаль', bulletHelix:'Хеликс', bulletMeteor:'Метеор', bulletFractal:'Фрактал',
      trailPulseLine:'Пульс', trailAfterglow:'Послесвечение', trailEmber:'Искры', trailFrost:'Иней', trailIon:'Ионная лента', trailGlitch:'Глитч-след', trailAurora:'Аврора', trailStardust:'Звёздная пыль', trailPrism:'Призматический след', trailSolar:'Солнечный след', trailEclipse:'След затмения',
    },
    en: {
      score:'Score', wave:'Wave', combo:'Combo', tagline:'Survive. Build combos. Climb the leaderboard.', best:'Best', play:'Play', leaderboard:'Leaderboard', howToPlay:'How to play',
      upgradeEyebrow:'UPGRADE', chooseUpgrade:'Choose an upgrade', runComplete:'RUN COMPLETE', gameOver:'Arena complete', kills:'Defeated', bestCombo:'Best combo', newRecord:'New record!', again:'Play again', menu:'Menu',
      leaderboardNote:'Global scores are linked to your Telegram account.', training:'TRAINING', moveTitle:'Move', moveText:'Use WASD/arrows on desktop. On mobile, drag your finger on the arena.', attackTitle:'Attack',
      attackText:'Your weapon automatically fires at the nearest enemy.', comboTitle:'Keep the combo', comboText:'Fast defeats increase your score multiplier. Taking damage resets the combo.', upgradeTitle:'Power up',
      upgradeText:'After every wave, choose an upgrade. Rarity determines its strength.', enterArena:'Enter arena', paused:'Paused', continue:'Continue', login:'Telegram connected',
      loginBenefit:'Open this Mini App from Telegram to sync progress and join the global leaderboard.', authorized:'Telegram connected · cloud saves and global leaderboard enabled',
      localMode:'Local mode: open the Mini App from Telegram for cloud progress.', leaderboardLoading:'Loading leaderboard…', leaderboardUnavailable:'The global leaderboard is currently unavailable.', globalBoard:'GLOBAL LEADERBOARD', globalBoardHint:'Top Neon Arena player scores', yourPosition:'YOUR POSITION', place:'Place', leaderboardPlayer:'Player', result:'Score', topPlayer:'LEADER', points:'points',
      authSuccess:'Telegram profile connected. Cloud progress and leaderboard enabled.', authCancelled:'Open the game from Telegram to enable cloud progress.', rank:'Your rank: #{rank}', noRank:'Open the game through Telegram to receive a global rank.',
      waveIncoming:'WAVE {wave}', bossIncoming:'BOSS · WAVE {wave}', shieldSaved:'Shield absorbed the hit!', evaded:'Phase shift!', powerupSpeed:'SPEED BOOST', powerupDamage:'DAMAGE BOOST', powerupShield:'ENERGY SHIELD', powerupPicked:'{name} · 10 sec.', localBest:'Local best', player:'Player', leaderboardEmpty:'No scores yet.', currency:'Neon credits', crystals:'Neo Crystals', shop:'Shop', rewards:'Rewards',
      cosmetics:'COSMETICS', balance:'Balance', characterSkins:'Character skins', bulletStyles:'Bullet styles', characterTrails:'Character trails', livePreview:'LIVE PREVIEW', previewHint:'Hover an item or browse with arrows', previewSkin:'Skin', previewBullet:'Bullets', previewTrail:'Trail', cosmeticOnly:'Visual only', rarityHint:'Rarity determines upgrade strength.', buy:'Buy', equip:'Equip', equipped:'Equipped', owned:'Owned',
      notEnough:'Not enough neon credits.', purchaseDone:'Purchase complete!', equippedDone:'Cosmetic equipped.', rarityCommon:'Common', rarityRare:'Rare', rarityEpic:'Epic', rarityLegendary:'Legendary', rarityMythic:'Mythic', rarityPower:'Power ×{power}',
      rewardCenter:'REWARD CENTER', collection:'Collection', weeklyProgress:'Weekly progress', dailyReward:'DAILY', dailyTitle:'Daily login', weeklyReward:'WEEKLY', weeklyTitle:'Weekly capsule', adReward:'REWARDED AD', adTitle:'Cosmetic capsule',
      dropChances:'Cosmetic drop chances', legendaryEffectNote:'Epic and legendary cosmetics add arena visual effects without increasing combat power.', claim:'Claim', claimed:'Claimed',
      dailyReady:'Today: +{coins} ◆ and 1 random cosmetic. Streak: {streak} days.', dailyDone:'Today’s reward is already claimed.', weeklyReady:'Ready! 3 cosmetic capsules + 500 ◆.', weeklyNeed:'Claim daily rewards: {days}/7. At 7 days: 3 cosmetic capsules.',
      adReady:'Watch a rewarded ad and get 1 random cosmetic. Available once every 6 hours.', adCooldown:'Next ad cosmetic in {time}.', adLocal:'Rewarded ads are disabled in the Telegram build.', adWatch:'Watch ad → cosmetic',
      rewardReceived:'Received: {item}', duplicateReward:'Duplicate {item}: +{coins} ◆ compensation', dailyReceived:'Daily reward claimed!', weeklyReceived:'Weekly reward claimed!', adReceived:'Ad cosmetic received!', adFailed:'The rewarded ad did not reach the reward point.',
      rewardReadyShort:'Rewards are ready to claim', rewardWaitShort:'More rewards will appear later', chestsTitle:'Chests', chestsHint:'Higher-tier chests have better odds for rare cosmetics', chestBuy:'Open for {coins} ◆', chestStandard:'Standard chest', chestRare:'Rare chest', chestEpic:'Epic chest', chestLegendary:'Legendary chest', chestOdds:'Odds: {odds}', chestOpened:'Chest opened!', adCreditsTitle:'100 neon credits', adCapsuleTitle:'Cosmetic capsule', adCreditsReady:'Watch a rewarded ad and get 100 ◆. Available every 15 minutes.', adCreditsCooldown:'Next 100 ◆ in {time}.', adCapsuleReady:'Watch a rewarded ad and get a cosmetic capsule. Available every 30 minutes.', adCapsuleCooldown:'Next capsule in {time}.', adCreditsReceived:'Received 100 neon credits!', adCapsuleReceived:'Ad capsule received!', adCreditsWatch:'Watch ad → 100 ◆', adCapsuleWatch:'Watch ad → capsule', leaderboardRewardsTag:'LEADERBOARD REWARDS', leaderboardRewardsTitle:'Entry and retention rewards', leaderboardRewardsAuth:'Open the game through Telegram to earn leaderboard rewards.', leaderboardRewardsNoEntry:'Set a score on the global leaderboard first.', leaderboardRewardsChecking:'Checking your position…', leaderboardRewardsNone:'No reward is available today. Return tomorrow and hold your position.', leaderboardMilestoneReady:'New tier: top {tier}. Reward +{coins} ◆.', leaderboardHoldReady:'Held top {tier}: +{coins} ◆. Streak: {streak} days.', leaderboardBothReady:'New tier + retention: +{coins} ◆.', leaderboardRewardClaim:'Claim +{coins} ◆', leaderboardRewardClaimed:'Leaderboard reward claimed!', leaderboardFirstDay:'Position recorded. Hold it until tomorrow for a daily reward.', dailyQuestsTag:'DAILY QUESTS', dailyQuestsTitle:'Daily missions', questReset:'Resets at midnight', dailyQuestBonusTag:'ALL-QUEST BONUS', dailyQuestBonusTitle:'Complete every daily quest',
      dailyQuestBonusReady:'All quests complete: +200 ◆ and 1 cosmetic capsule.', dailyQuestBonusNeed:'Quests complete: {done}/{total}.', questClaim:'Claim', questClaimed:'Claimed', questRewardCredits:'+{coins} ◆', questRewardCapsule:'Cosmetic capsule', questKills:'Defeat {target} enemies', questScore:'Score {target} in one run', questCombo:'Build a ×{target} combo', questWave:'Reach wave {target}', questGames:'Finish {target} runs', questBoss:'Defeat a boss', duplicateNote:'Duplicate capsule drops automatically convert into neon credits.', commonChance:'65%', rareChance:'26%', epicChance:'8%', legendaryChance:'1%', testCapsuleTitle:'Test capsule', testCapsuleText:'Open without limits. The reel scrolls through every item and stops on the drop.', openTestCapsule:'Open test capsule', capsuleOpening:'CAPSULE OPENING', capsuleTitle:'Cosmetic capsule', openAgain:'Open again', close:'Close', newCosmetic:'New item added to your collection.', testDrop:'Test drop — progress and collection are not changed.',

      crystalShopTag:'NEO CRYSTALS', crystalShopTitle:'Mythic collection', crystalShopHint:'Exclusive cosmetics for Neo Crystals. Mythic rarity is above Legendary.', crystalTopRewardTitle:'Top-10 Neo Crystal reward', crystalTopRewardAuth:'Open the game through Telegram to earn daily Neo Crystals for a top-10 position.', crystalTopRewardNeed:'Reach the global top 10 to earn Neo Crystals.', crystalTopRewardReady:'Rank #{rank}: daily reward +{crystals} ◈.', crystalTopRewardClaim:'Claim +{crystals} ◈', crystalTopRewardClaimed:'Today’s top-10 reward has already been claimed.', crystalTopRewardReceived:'Received {crystals} Neo Crystals!', crystalAdTitle:'10 Neo Crystals', crystalAdReady:'Watch a rewarded ad and get 10 ◈. Available once per hour.', crystalAdCooldown:'Next 10 ◈ in {time}.', crystalAdWatch:'Watch ad → 10 ◈', crystalAdReceived:'Received 10 Neo Crystals!', crystalPacksTitle:'Get Neo Crystals', crystalPacksHint:'Purchases are processed through Telegram Stars.', crystalPackBuy:'Buy', crystalPackUnavailable:'Purchases are currently unavailable.', crystalLoginRequired:'Open the game as a Telegram Mini App before buying Neo Crystals.', notEnoughCrystals:'Not enough Neo Crystals.', crystalPurchaseFailed:'Purchase was not completed.', crystalPurchaseDone:'Received {crystals} Neo Crystals!', crystalPurchasePending:'Telegram is confirming the payment…', mythicOnly:'Neo Crystals only',
      skinQuantum:'Quantum', skinPhoenix:'Phoenix', skinAstral:'Astral', bulletCelestial:'Celestial pulse', bulletDragon:'Dragon pulse', bulletVoidLance:'Void lance', trailGalaxy:'Galaxy wake', trailLightning:'Lightning rift', trailCosmicRoyal:'Royal cosmos',
      skinAqua:'Aqua', skinMagenta:'Magenta', skinLime:'Lime', skinSolar:'Solar', skinVoid:'Void', skinIce:'Ice', skinEmber:'Ember', skinGhost:'Phantom', skinRoyal:'Royal', skinNova:'Nova', skinPrism:'Prism',
      bulletOrb:'Orb', bulletBolt:'Bolt', bulletShard:'Shard', bulletComet:'Comet', bulletPulse:'Pulse ring', bulletArc:'Arc', bulletRocket:'Rocket', bulletStar:'Star', bulletWave:'Wave', bulletSingularity:'Singularity', bulletRainbow:'Spectrum',
      skinCoral:'Coral', skinCobalt:'Cobalt', skinToxic:'Toxic', skinMoon:'Moon', skinGlitch:'Glitch', skinAurora:'Aurora', skinEclipse:'Eclipse',
      bulletNeedle:'Needle', bulletSpark:'Spark', bulletPlasma:'Plasma', bulletHex:'Hex', bulletEcho:'Echo', bulletFlare:'Flare', bulletChronos:'Chronos',

      skinBloom:'Bloom', skinMatrix:'Matrix', skinTempest:'Tempest', skinNebula:'Nebula',
      bulletPetal:'Petal', bulletHelix:'Helix', bulletMeteor:'Meteor', bulletFractal:'Fractal',
      trailPulseLine:'Pulse trail', trailAfterglow:'Afterglow', trailEmber:'Ember trail', trailFrost:'Frost trail', trailIon:'Ion ribbon', trailGlitch:'Glitch trail', trailAurora:'Aurora trail', trailStardust:'Stardust', trailPrism:'Prism wake', trailSolar:'Solar wake', trailEclipse:'Eclipse wake',
    }
  };

  let lang = 'ru';
  const t = (key, vars={}) => {
    let str = I18N[lang]?.[key] ?? I18N.ru[key] ?? key;
    Object.entries(vars).forEach(([k,v]) => { str = str.replace(`{${k}}`, String(v)); });
    return str;
  };

  const RARITY = {
    common:{ id:'common', key:'rarityCommon', color:'#aab7c4', priceMult:1 },
    rare:{ id:'rare', key:'rarityRare', color:'#63a8ff', priceMult:1.7 },
    epic:{ id:'epic', key:'rarityEpic', color:'#bf75ff', priceMult:3.1 },
    legendary:{ id:'legendary', key:'rarityLegendary', color:'#ffd36a', priceMult:6.2 },
    mythic:{ id:'mythic', key:'rarityMythic', color:'#ff82f8', priceMult:10 },
  };
  const COSMETIC_ODDS = [
    {id:'common', chance:.65}, {id:'rare', chance:.26}, {id:'epic', chance:.08}, {id:'legendary', chance:.01}
  ];
  const CHESTS = [
    {id:'standard',nameKey:'chestStandard',rarity:'common',price:120,odds:[{id:'common',chance:.65},{id:'rare',chance:.26},{id:'epic',chance:.08},{id:'legendary',chance:.01}]},
    {id:'rare',nameKey:'chestRare',rarity:'rare',price:320,odds:[{id:'common',chance:.25},{id:'rare',chance:.55},{id:'epic',chance:.17},{id:'legendary',chance:.03}]},
    {id:'epic',nameKey:'chestEpic',rarity:'epic',price:740,odds:[{id:'common',chance:.08},{id:'rare',chance:.30},{id:'epic',chance:.52},{id:'legendary',chance:.10}]},
    {id:'legendary',nameKey:'chestLegendary',rarity:'legendary',price:1800,odds:[{id:'common',chance:.02},{id:'rare',chance:.13},{id:'epic',chance:.50},{id:'legendary',chance:.35}]},
  ];
  const CRYSTAL_PACKS = [
    {id:'neo_crystals_250',amount:250},
    {id:'neo_crystals_500',amount:500},
    {id:'neo_crystals_1000',amount:1000},
  ];
  const TOP10_CRYSTAL_REWARDS = {1:100,2:80,3:65,4:50,5:40,6:30,7:25,8:20,9:15,10:10};
  const LEADERBOARD_TIERS = [
    {maxRank:1,id:'top1',milestone:5000,hold:700},
    {maxRank:3,id:'top3',milestone:2500,hold:450},
    {maxRank:10,id:'top10',milestone:1500,hold:300},
    {maxRank:50,id:'top50',milestone:800,hold:175},
    {maxRank:100,id:'top100',milestone:500,hold:125},
    {maxRank:500,id:'top500',milestone:250,hold:75},
    {maxRank:1000,id:'top1000',milestone:150,hold:50},
  ];
  const ARENA_THEMES = [
    {id:'blueGrid',inner:'#122a52',mid:'#09162e',outer:'#040711',accent:'91,150,255',pattern:'grid'},
    {id:'violetNebula',inner:'#32194d',mid:'#160c2b',outer:'#06040e',accent:'191,117,255',pattern:'nebula'},
    {id:'emeraldCircuit',inner:'#123b34',mid:'#081f1d',outer:'#030b0b',accent:'83,239,189',pattern:'circuit'},
    {id:'solarRift',inner:'#4a2816',mid:'#251108',outer:'#0c0503',accent:'255,151,91',pattern:'rift'},
    {id:'deepSpace',inner:'#15233e',mid:'#080e1d',outer:'#02040a',accent:'112,178,255',pattern:'space'},
    {id:'crimsonPulse',inner:'#48172f',mid:'#240a18',outer:'#0b0308',accent:'255,91,142',pattern:'rings'},
    {id:'cyanStream',inner:'#123847',mid:'#071c27',outer:'#03090e',accent:'80,228,255',pattern:'stream'},
    {id:'goldHex',inner:'#433819',mid:'#201907',outer:'#090703',accent:'255,211,106',pattern:'hex'},
  ];
  const UPGRADE_RARITIES = [
    {id:'common', weight:.58, power:1}, {id:'rare', weight:.27, power:1.5}, {id:'epic', weight:.11, power:2.2}, {id:'legendary', weight:.04, power:3.1}
  ];

  const SKINS = [
    {id:'aqua',nameKey:'skinAqua',rarity:'common',price:0,primary:'#69f6ff',secondary:'#5c7cff',core:'#081425'},
    {id:'magenta',nameKey:'skinMagenta',rarity:'common',price:170,primary:'#ff5be7',secondary:'#b47cff',core:'#1b0820'},
    {id:'lime',nameKey:'skinLime',rarity:'common',price:190,primary:'#8cffb1',secondary:'#69f6ff',core:'#071a13'},
    {id:'coral',nameKey:'skinCoral',rarity:'common',price:210,primary:'#ff8f8f',secondary:'#ffd0a6',core:'#200b0d'},
    {id:'cobalt',nameKey:'skinCobalt',rarity:'common',price:220,primary:'#6f8cff',secondary:'#69f6ff',core:'#090f28'},
    {id:'solar',nameKey:'skinSolar',rarity:'rare',price:390,primary:'#ffd36a',secondary:'#ff8f62',core:'#201306'},
    {id:'void',nameKey:'skinVoid',rarity:'rare',price:430,primary:'#9b7cff',secondary:'#4e54c8',core:'#090717'},
    {id:'ice',nameKey:'skinIce',rarity:'rare',price:460,primary:'#d8f7ff',secondary:'#63a8ff',core:'#07121c'},
    {id:'ember',nameKey:'skinEmber',rarity:'rare',price:480,primary:'#ff8f62',secondary:'#ff647c',core:'#230d08'},
    {id:'toxic',nameKey:'skinToxic',rarity:'rare',price:510,primary:'#b9ff65',secondary:'#55ff9c',core:'#0a1d0b'},
    {id:'moon',nameKey:'skinMoon',rarity:'rare',price:540,primary:'#d6dbff',secondary:'#8897ff',core:'#0c1025'},
    {id:'ghost',nameKey:'skinGhost',rarity:'epic',price:850,primary:'#d5e8ff',secondary:'#9b7cff',core:'#0d1122',effect:'ghost'},
    {id:'royal',nameKey:'skinRoyal',rarity:'epic',price:920,primary:'#d9b6ff',secondary:'#ffd36a',core:'#160d25',effect:'royal'},
    {id:'glitch',nameKey:'skinGlitch',rarity:'epic',price:980,primary:'#ff68d9',secondary:'#65efff',core:'#14081c',effect:'glitch'},
    {id:'aurora',nameKey:'skinAurora',rarity:'epic',price:1040,primary:'#8dffd0',secondary:'#bc7cff',core:'#081b1a',effect:'aurora'},
    {id:'bloom',nameKey:'skinBloom',rarity:'epic',price:1090,primary:'#ffb3d8',secondary:'#ffd36a',core:'#190b16',effect:'bloom'},
    {id:'matrix',nameKey:'skinMatrix',rarity:'epic',price:1140,primary:'#8cffb1',secondary:'#63a8ff',core:'#08150f',effect:'matrix'},
    {id:'nova',nameKey:'skinNova',rarity:'legendary',price:2100,primary:'#fff2a8',secondary:'#ff8f62',core:'#1b0c06',effect:'nova'},
    {id:'prism',nameKey:'skinPrism',rarity:'legendary',price:2300,primary:'#ffffff',secondary:'#ff5be7',core:'#07131d',effect:'prism'},
    {id:'eclipse',nameKey:'skinEclipse',rarity:'legendary',price:2450,primary:'#d9c5ff',secondary:'#5b47ff',core:'#03020a',effect:'eclipse'},
    {id:'tempest',nameKey:'skinTempest',rarity:'legendary',price:2580,primary:'#c6fff7',secondary:'#63a8ff',core:'#07131b',effect:'tempest'},
    {id:'nebula',nameKey:'skinNebula',rarity:'legendary',price:2680,primary:'#ffb6ff',secondary:'#7a63ff',core:'#0b0716',effect:'nebula'},
    {id:'quantum',nameKey:'skinQuantum',rarity:'mythic',crystalPrice:500,primary:'#a7ffff',secondary:'#ff82f8',core:'#020a12',effect:'quantum'},
    {id:'phoenix',nameKey:'skinPhoenix',rarity:'mythic',crystalPrice:650,primary:'#fff0a8',secondary:'#ff5f77',core:'#1c0705',effect:'phoenix'},
    {id:'astral',nameKey:'skinAstral',rarity:'mythic',crystalPrice:800,primary:'#ffffff',secondary:'#8d63ff',core:'#03020b',effect:'astral'},
  ];
  const BULLET_STYLES = [
    {id:'orb',nameKey:'bulletOrb',rarity:'common',price:0,shape:'orb',primary:'#b9fbff',glow:'#69f6ff'},
    {id:'bolt',nameKey:'bulletBolt',rarity:'common',price:150,shape:'bolt',primary:'#ffd36a',glow:'#ff9a6a'},
    {id:'shard',nameKey:'bulletShard',rarity:'common',price:180,shape:'diamond',primary:'#e3f1ff',glow:'#63a8ff'},
    {id:'needle',nameKey:'bulletNeedle',rarity:'common',price:200,shape:'needle',primary:'#e7fff9',glow:'#8cffb1'},
    {id:'spark',nameKey:'bulletSpark',rarity:'common',price:220,shape:'spark',primary:'#fff5a8',glow:'#ffd36a'},
    {id:'comet',nameKey:'bulletComet',rarity:'rare',price:360,shape:'comet',primary:'#8cffb1',glow:'#69f6ff'},
    {id:'pulse',nameKey:'bulletPulse',rarity:'rare',price:420,shape:'pulse',primary:'#ff8bf0',glow:'#ff5be7'},
    {id:'arc',nameKey:'bulletArc',rarity:'rare',price:450,shape:'bolt',primary:'#83e7ff',glow:'#5c7cff'},
    {id:'rocket',nameKey:'bulletRocket',rarity:'rare',price:490,shape:'comet',primary:'#ffac7a',glow:'#ff647c'},
    {id:'plasma',nameKey:'bulletPlasma',rarity:'rare',price:520,shape:'plasma',primary:'#72ffe1',glow:'#35bfff'},
    {id:'hex',nameKey:'bulletHex',rarity:'rare',price:550,shape:'hex',primary:'#b7a2ff',glow:'#7d63ff'},
    {id:'star',nameKey:'bulletStar',rarity:'epic',price:820,shape:'star',primary:'#ffd36a',glow:'#bf75ff',effect:'stars'},
    {id:'wave',nameKey:'bulletWave',rarity:'epic',price:900,shape:'wave',primary:'#b7faff',glow:'#63a8ff',effect:'wave'},
    {id:'echo',nameKey:'bulletEcho',rarity:'epic',price:980,shape:'echo',primary:'#d8c8ff',glow:'#bf75ff',effect:'echo'},
    {id:'flare',nameKey:'bulletFlare',rarity:'epic',price:1050,shape:'flare',primary:'#fff0a0',glow:'#ff7ea8',effect:'flare'},
    {id:'petal',nameKey:'bulletPetal',rarity:'epic',price:1120,shape:'star',primary:'#ffc4dc',glow:'#ff8ad0',effect:'petals'},
    {id:'fractal',nameKey:'bulletFractal',rarity:'epic',price:1180,shape:'hex',primary:'#a9f6ff',glow:'#63a8ff',effect:'fractal'},
    {id:'singularity',nameKey:'bulletSingularity',rarity:'legendary',price:2050,shape:'singularity',primary:'#cda5ff',glow:'#7c5cff',effect:'gravity'},
    {id:'rainbow',nameKey:'bulletRainbow',rarity:'legendary',price:2250,shape:'rainbow',primary:'#ffffff',glow:'#ff5be7',effect:'rainbow'},
    {id:'chronos',nameKey:'bulletChronos',rarity:'legendary',price:2500,shape:'chronos',primary:'#b9fff6',glow:'#63a8ff',effect:'chronos'},
    {id:'helix',nameKey:'bulletHelix',rarity:'legendary',price:2600,shape:'comet',primary:'#c2fff7',glow:'#64d0ff',effect:'helix'},
    {id:'meteor',nameKey:'bulletMeteor',rarity:'legendary',price:2720,shape:'flare',primary:'#ffd6a1',glow:'#ff786a',effect:'meteor'},
    {id:'celestial',nameKey:'bulletCelestial',rarity:'mythic',crystalPrice:500,shape:'star',primary:'#ffffff',glow:'#6ff8ff',effect:'celestial'},
    {id:'dragonPulse',nameKey:'bulletDragon',rarity:'mythic',crystalPrice:650,shape:'flare',primary:'#ffd36a',glow:'#ff5f77',effect:'dragon'},
    {id:'voidLance',nameKey:'bulletVoidLance',rarity:'mythic',crystalPrice:800,shape:'needle',primary:'#e8d7ff',glow:'#a257ff',effect:'voidlance'},
  ];
  const TRAIL_STYLES = [
    {id:'pulseLine',nameKey:'trailPulseLine',rarity:'common',price:0,primary:'#69f6ff',secondary:'#5c7cff',effect:'pulse'},
    {id:'afterglow',nameKey:'trailAfterglow',rarity:'common',price:150,primary:'#ff8bf0',secondary:'#ff5be7',effect:'afterglow'},
    {id:'emberTrail',nameKey:'trailEmber',rarity:'rare',price:360,primary:'#ffb27d',secondary:'#ff647c',effect:'embers'},
    {id:'frostTrail',nameKey:'trailFrost',rarity:'rare',price:410,primary:'#d6f6ff',secondary:'#63a8ff',effect:'frost'},
    {id:'ionRibbon',nameKey:'trailIon',rarity:'rare',price:470,primary:'#8cffb1',secondary:'#63a8ff',effect:'ribbon'},
    {id:'glitchTrail',nameKey:'trailGlitch',rarity:'epic',price:860,primary:'#ff6dde',secondary:'#69f6ff',effect:'glitchtrail'},
    {id:'auroraTrail',nameKey:'trailAurora',rarity:'epic',price:930,primary:'#8dffd0',secondary:'#bc7cff',effect:'auroratrail'},
    {id:'stardustTrail',nameKey:'trailStardust',rarity:'epic',price:1010,primary:'#ffd36a',secondary:'#ffffff',effect:'stardust'},
    {id:'prismTrail',nameKey:'trailPrism',rarity:'legendary',price:2080,primary:'#ffffff',secondary:'#ff5be7',effect:'prismtrail'},
    {id:'solarTrail',nameKey:'trailSolar',rarity:'legendary',price:2260,primary:'#fff2a8',secondary:'#ff8f62',effect:'solartrail'},
    {id:'eclipseTrail',nameKey:'trailEclipse',rarity:'legendary',price:2440,primary:'#cbb8ff',secondary:'#5b47ff',effect:'eclipsetrail'},
    {id:'galaxyTrail',nameKey:'trailGalaxy',rarity:'mythic',crystalPrice:500,primary:'#ffffff',secondary:'#8d63ff',effect:'galaxytrail'},
    {id:'lightningTrail',nameKey:'trailLightning',rarity:'mythic',crystalPrice:650,primary:'#bffcff',secondary:'#4b9fff',effect:'lightningtrail'},
    {id:'cosmicRoyalTrail',nameKey:'trailCosmicRoyal',rarity:'mythic',crystalPrice:800,primary:'#ffd36a',secondary:'#ff82f8',effect:'cosmicroyal'},
  ];
  const ALL_COSMETICS = [
    ...SKINS.map(x=>({...x,kind:'skin'})), ...BULLET_STYLES.map(x=>({...x,kind:'bullet'})), ...TRAIL_STYLES.map(x=>({...x,kind:'trail'}))
  ];
  const DROPPABLE_COSMETICS = ALL_COSMETICS.filter(x=>x.rarity!=='mythic');

  const STORAGE_KEY = 'neon_arena_progress_v7';
  const OLD_STORAGE_KEY = 'neon_arena_progress_v6';
  const LEADERBOARD_SCORE_SCALE = 5;
  const defaultQuestStats = () => ({kills:0,score:0,combo:0,wave:1,games:0,bosses:0});
  const defaultProgress = () => ({
    schemaVersion:7, updatedAt:0, syncRevision:0, bestScore:0, gamesPlayed:0, coins:0, crystals:0, ownedSkins:['aqua'], ownedBullets:['orb'], ownedTrails:['pulseLine'], selectedSkin:'aqua', selectedBullet:'orb', selectedTrail:'pulseLine',
    lastDailyDate:'', dailyStreak:0, weeklyProgress:0, lastAdCreditsAt:0, lastAdCapsuleAt:0, lastAdCrystalsAt:0,
    dailyQuestDate:'', dailyQuestStats:defaultQuestStats(), dailyQuestClaims:[], dailyQuestBonusClaimed:false,
    leaderboardMilestones:[], leaderboardSeenDate:'', leaderboardSeenRank:0, leaderboardHoldClaimDate:'', leaderboardHoldStreak:0, lastTopCrystalRewardDate:'', lastTopCrystalRewardRank:0, handledPurchaseTokens:[]
  });

  function uniqueStrings(v, fallback) {
    return Array.isArray(v) ? [...new Set(v.filter(x=>typeof x==='string'))] : [...fallback];
  }
  function normalizeProgress(raw={}) {
    const p = defaultProgress();
    const incomingSchema=Math.max(0,Math.floor(Number(raw.schemaVersion)||0));
    p.schemaVersion = 7;
    p.updatedAt = Math.max(0, Number(raw.updatedAt)||0);
    p.syncRevision = Math.max(0, Math.floor(Number(raw.syncRevision)||0));
    p.bestScore = Math.max(0, Math.floor(Number(raw.bestScore)||0));
    if(incomingSchema===3)p.bestScore=Math.round(p.bestScore/LEADERBOARD_SCORE_SCALE);
    p.gamesPlayed = Math.max(0, Math.floor(Number(raw.gamesPlayed)||0));
    p.coins = Math.max(0, Math.floor(Number(raw.coins)||0));
    p.crystals = Math.max(0, Math.floor(Number(raw.crystals)||0));
    p.ownedSkins = uniqueStrings(raw.ownedSkins, ['aqua']).filter(id=>SKINS.some(x=>x.id===id));
    p.ownedBullets = uniqueStrings(raw.ownedBullets, ['orb']).filter(id=>BULLET_STYLES.some(x=>x.id===id));
    p.ownedTrails = uniqueStrings(raw.ownedTrails, ['pulseLine']).filter(id=>TRAIL_STYLES.some(x=>x.id===id));
    if (!p.ownedSkins.includes('aqua')) p.ownedSkins.unshift('aqua');
    if (!p.ownedBullets.includes('orb')) p.ownedBullets.unshift('orb');
    if (!p.ownedTrails.includes('pulseLine')) p.ownedTrails.unshift('pulseLine');
    p.selectedSkin = p.ownedSkins.includes(raw.selectedSkin) ? raw.selectedSkin : 'aqua';
    p.selectedBullet = p.ownedBullets.includes(raw.selectedBullet) ? raw.selectedBullet : 'orb';
    p.selectedTrail = p.ownedTrails.includes(raw.selectedTrail) ? raw.selectedTrail : 'pulseLine';
    p.lastDailyDate = typeof raw.lastDailyDate==='string' ? raw.lastDailyDate : '';
    p.dailyStreak = Math.max(0, Math.floor(Number(raw.dailyStreak)||0));
    p.weeklyProgress = Math.max(0, Math.min(7, Math.floor(Number(raw.weeklyProgress)||0)));
    p.lastAdCreditsAt = Math.max(0, Number(raw.lastAdCreditsAt)||0);
    p.lastAdCapsuleAt = Math.max(0, Number(raw.lastAdCapsuleAt ?? raw.lastAdRewardAt)||0);
    p.lastAdCrystalsAt = Math.max(0, Number(raw.lastAdCrystalsAt)||0);
    p.dailyQuestDate = typeof raw.dailyQuestDate==='string' ? raw.dailyQuestDate : '';
    const qs = raw.dailyQuestStats && typeof raw.dailyQuestStats==='object' ? raw.dailyQuestStats : {};
    p.dailyQuestStats = {
      kills:Math.max(0,Math.floor(Number(qs.kills)||0)), score:Math.max(0,Math.floor(Number(qs.score)||0)), combo:Math.max(0,Math.floor(Number(qs.combo)||0)),
      wave:Math.max(1,Math.floor(Number(qs.wave)||1)), games:Math.max(0,Math.floor(Number(qs.games)||0)), bosses:Math.max(0,Math.floor(Number(qs.bosses)||0))
    };
    if(incomingSchema===3)p.dailyQuestStats.score=Math.round(p.dailyQuestStats.score/LEADERBOARD_SCORE_SCALE);
    p.dailyQuestClaims = uniqueStrings(raw.dailyQuestClaims, []).map(id=>incomingSchema===3&&id==='score6000'?'score1800':id);
    p.dailyQuestBonusClaimed = !!raw.dailyQuestBonusClaimed;
    p.leaderboardMilestones = uniqueStrings(raw.leaderboardMilestones, []).filter(id=>LEADERBOARD_TIERS.some(x=>x.id===id));
    p.leaderboardSeenDate = typeof raw.leaderboardSeenDate==='string' ? raw.leaderboardSeenDate : '';
    p.leaderboardSeenRank = Math.max(0,Math.floor(Number(raw.leaderboardSeenRank)||0));
    p.leaderboardHoldClaimDate = typeof raw.leaderboardHoldClaimDate==='string' ? raw.leaderboardHoldClaimDate : '';
    p.leaderboardHoldStreak = Math.max(0,Math.floor(Number(raw.leaderboardHoldStreak)||0));
    p.lastTopCrystalRewardDate = typeof raw.lastTopCrystalRewardDate==='string' ? raw.lastTopCrystalRewardDate : '';
    p.lastTopCrystalRewardRank = Math.max(0,Math.floor(Number(raw.lastTopCrystalRewardRank)||0));
    p.handledPurchaseTokens = uniqueStrings(raw.handledPurchaseTokens, []).slice(-50);
    return p;
  }
  function loadProgress() {
    try {
      const current=localStorage.getItem(STORAGE_KEY);
      if(current)return normalizeProgress(JSON.parse(current));
      const oldRaw=localStorage.getItem(OLD_STORAGE_KEY);
      if(oldRaw)return normalizeProgress(JSON.parse(oldRaw)||{});
      return defaultProgress();
    } catch (_) { return defaultProgress(); }
  }
  const progress = loadProgress();

  function copyCloudState(c){
    Object.keys(c).forEach(key=>{progress[key]=c[key]});
    progress.updatedAt=Math.max(0,c.updatedAt||0);
    progress.syncRevision=Math.max(0,c.syncRevision||0);
  }
  function mergeLegacyCloud(c){
    progress.bestScore=Math.max(progress.bestScore,c.bestScore);progress.gamesPlayed=Math.max(progress.gamesPlayed,c.gamesPlayed);
    progress.coins=Math.max(progress.coins,c.coins);progress.crystals=Math.max(progress.crystals,c.crystals);
    progress.ownedSkins=[...new Set([...progress.ownedSkins,...c.ownedSkins])];progress.ownedBullets=[...new Set([...progress.ownedBullets,...c.ownedBullets])];progress.ownedTrails=[...new Set([...progress.ownedTrails,...c.ownedTrails])];
    if(c.lastDailyDate>progress.lastDailyDate){progress.lastDailyDate=c.lastDailyDate;progress.dailyStreak=c.dailyStreak;progress.weeklyProgress=c.weeklyProgress}else if(c.lastDailyDate===progress.lastDailyDate){progress.dailyStreak=Math.max(progress.dailyStreak,c.dailyStreak);progress.weeklyProgress=Math.max(progress.weeklyProgress,c.weeklyProgress)}
    progress.lastAdCreditsAt=Math.max(progress.lastAdCreditsAt,c.lastAdCreditsAt);progress.lastAdCapsuleAt=Math.max(progress.lastAdCapsuleAt,c.lastAdCapsuleAt);progress.lastAdCrystalsAt=Math.max(progress.lastAdCrystalsAt,c.lastAdCrystalsAt);
    if(c.dailyQuestDate>progress.dailyQuestDate){progress.dailyQuestDate=c.dailyQuestDate;progress.dailyQuestStats={...c.dailyQuestStats};progress.dailyQuestClaims=[...c.dailyQuestClaims];progress.dailyQuestBonusClaimed=c.dailyQuestBonusClaimed}else if(c.dailyQuestDate===progress.dailyQuestDate){for(const key of Object.keys(defaultQuestStats()))progress.dailyQuestStats[key]=Math.max(progress.dailyQuestStats[key]||0,c.dailyQuestStats[key]||0);progress.dailyQuestClaims=[...new Set([...progress.dailyQuestClaims,...c.dailyQuestClaims])];progress.dailyQuestBonusClaimed=progress.dailyQuestBonusClaimed||c.dailyQuestBonusClaimed}
    progress.leaderboardMilestones=[...new Set([...progress.leaderboardMilestones,...c.leaderboardMilestones])];
    if(c.leaderboardSeenDate>progress.leaderboardSeenDate){progress.leaderboardSeenDate=c.leaderboardSeenDate;progress.leaderboardSeenRank=c.leaderboardSeenRank;progress.leaderboardHoldStreak=c.leaderboardHoldStreak}else if(c.leaderboardSeenDate===progress.leaderboardSeenDate){progress.leaderboardSeenRank=progress.leaderboardSeenRank&&c.leaderboardSeenRank?Math.min(progress.leaderboardSeenRank,c.leaderboardSeenRank):Math.max(progress.leaderboardSeenRank,c.leaderboardSeenRank);progress.leaderboardHoldStreak=Math.max(progress.leaderboardHoldStreak,c.leaderboardHoldStreak)}
    if(c.leaderboardHoldClaimDate>progress.leaderboardHoldClaimDate)progress.leaderboardHoldClaimDate=c.leaderboardHoldClaimDate;if(c.lastTopCrystalRewardDate>progress.lastTopCrystalRewardDate){progress.lastTopCrystalRewardDate=c.lastTopCrystalRewardDate;progress.lastTopCrystalRewardRank=c.lastTopCrystalRewardRank}
    progress.handledPurchaseTokens=[...new Set([...(progress.handledPurchaseTokens||[]),...(c.handledPurchaseTokens||[])])].slice(-100);
    if(progress.ownedSkins.includes(c.selectedSkin))progress.selectedSkin=c.selectedSkin;if(progress.ownedBullets.includes(c.selectedBullet))progress.selectedBullet=c.selectedBullet;if(progress.ownedTrails.includes(c.selectedTrail))progress.selectedTrail=c.selectedTrail;
  }
  function mergeCloud(cloud) {
    if(!cloud)return;
    const cloudSchema=Math.max(0,Math.floor(Number(cloud.schemaVersion)||0));
    if(cloudSchema<3){progress.bestScore=Math.max(progress.bestScore,Math.round(Math.max(0,Math.floor(Number(cloud.bestScore)||0))/LEADERBOARD_SCORE_SCALE));progress.gamesPlayed=Math.max(progress.gamesPlayed,Math.max(0,Math.floor(Number(cloud.gamesPlayed)||0)));return}
    const c=normalizeProgress(cloud);
    if(cloudSchema<7){mergeLegacyCloud(c);progress.updatedAt=Date.now();progress.syncRevision=Math.max(progress.syncRevision,1);return}
    const cloudNewer=(c.syncRevision>progress.syncRevision)||(c.syncRevision===progress.syncRevision&&c.updatedAt>progress.updatedAt);
    if(cloudNewer)copyCloudState(c);
    else if(c.syncRevision===progress.syncRevision&&c.updatedAt===progress.updatedAt){progress.bestScore=Math.max(progress.bestScore,c.bestScore);progress.gamesPlayed=Math.max(progress.gamesPlayed,c.gamesPlayed)}
  }
  function applyAuthoritativeCloud(cloud){
    if(!cloud)return false;
    const c=normalizeProgress(cloud);copyCloudState(c);persistLocalProgress();refreshProgressUI();renderShop();return true
  }
  function touchProgress(){progress.updatedAt=Date.now();progress.syncRevision=Math.max(0,progress.syncRevision||0)+1}
  function persistLocalProgress(){localStorage.setItem(STORAGE_KEY,JSON.stringify(progress))}
  function saveProgress() {
    touchProgress();
    persistLocalProgress();
    refreshProgressUI();
    window.PlatformBridge?.saveCloudProgress?.(progress);
  }


  const state = {
    mode:'menu', prevMode:'menu', w:1280,h:720,dpr:1,lastTime:performance.now(), gameTime:0,wave:1,waveClock:0,waveLength:22.5,
    spawnClock:0,shootClock:0,score:0,kills:0,combo:0,comboClock:99,bestCombo:0,comboGrace:3,cameraShake:0,flash:0,bannerText:'',bannerClock:0,
    projectiles:[],enemies:[],particles:[],stars:[],powerupDrop:null,powerupSpawnClock:9,activePowerups:{speed:0,damage:0,shield:0},joystick:{active:false,pointerId:null,startX:0,startY:0,x:0,y:0},keys:new Set(),suspendedByPlatform:false,manualPause:false
  };
  const player = {x:0,y:0,r:15,speed:235,hp:5,maxHp:5,damage:1,fireRate:.42,projectileSpeed:590,projectileScale:1,multishot:1,spread:.14,crit:.08,critMult:2,shield:0,pierce:0,evasion:0,waveGuard:999,repairEvery:999,killsSinceRepair:0,invuln:0,trail:[]};
  const enemyTypes = {
    chaser:{r:14,hp:1,speed:80,score:22},dasher:{r:12,hp:1,speed:58,score:28},tank:{r:22,hp:5,speed:42,score:42},
    shooter:{r:15,hp:2,speed:53,score:34},splitter:{r:17,hp:3,speed:63,score:36},orbiter:{r:14,hp:2,speed:58,score:34},
    sniper:{r:13,hp:2,speed:48,score:38},spinner:{r:18,hp:3,speed:50,score:44},minion:{r:8,hp:1,speed:108,score:12},boss:{r:42,hp:29,speed:35,score:300}
  };
  const BOSS_KINDS=[
    {id:'pulse',ru:'ПУЛЬСАР',en:'PULSAR'},
    {id:'spiral',ru:'СПИРАЛЬ',en:'SPIRAL'},
    {id:'charger',ru:'ТАРАН',en:'CHARGER'},
    {id:'summoner',ru:'ПРИЗЫВАТЕЛЬ',en:'SUMMONER'},
  ];
  const TEMP_POWERUPS = [
    {id:'speed',nameKey:'powerupSpeed',icon:'➤',color:'#69f6ff'},
    {id:'damage',nameKey:'powerupDamage',icon:'✹',color:'#ffd36a'},
    {id:'shield',nameKey:'powerupShield',icon:'⬡',color:'#8cffb1'},
  ];
  const POWERUP_DURATION = 10;

  const upgrades = [
    {id:'rapid',icon:'⚡',ru:['Разгон','Скорострельность'],en:['Overclock','Fire rate'],apply:p=>player.fireRate=Math.max(.13,player.fireRate*(1-.105*p))},
    {id:'damage',icon:'◆',ru:['Перегрузка','Урон снарядов'],en:['Overload','Projectile damage'],apply:p=>player.damage+=Math.max(1,Math.round(p*.9))},
    {id:'speed',icon:'➤',ru:['Фазовый привод','Скорость движения'],en:['Phase drive','Move speed'],apply:p=>player.speed*=1+.07*p},
    {id:'multi',icon:'✦',ru:['Расщепитель','Дополнительные снаряды'],en:['Splitter','Extra projectiles'],apply:p=>player.multishot=Math.min(6,player.multishot+(p>=2.2?2:1))},
    {id:'health',icon:'♥',ru:['Ремонт','Макс. здоровье и лечение'],en:['Repair','Max health and healing'],apply:p=>{const n=p>=2.2?2:1;player.maxHp=Math.min(10,player.maxHp+n);player.hp=Math.min(player.maxHp,player.hp+n)}},
    {id:'shield',icon:'⬡',ru:['Энергощит','Заряды щита'],en:['Energy shield','Shield charges'],apply:p=>player.shield=Math.min(4,player.shield+(p>=2.2?2:1))},
    {id:'crit',icon:'◎',ru:['Точный контур','Шанс критического урона'],en:['Precision circuit','Critical chance'],apply:p=>player.crit=Math.min(.55,player.crit+.06*p)},
    {id:'pierce',icon:'↟',ru:['Пробой','Пробивание целей'],en:['Piercing','Target piercing'],apply:p=>player.pierce=Math.min(4,player.pierce+(p>=2.2?2:1))},
    {id:'velocity',icon:'»',ru:['Ускоритель','Скорость снарядов'],en:['Accelerator','Projectile speed'],apply:p=>player.projectileSpeed*=1+.11*p},
    {id:'focus',icon:'×',ru:['Фокус','Время удержания комбо'],en:['Focus','Combo grace time'],apply:p=>state.comboGrace=Math.min(6,state.comboGrace+.55*p)},
    {id:'regen',icon:'+',ru:['Восстановление','Мгновенное лечение'],en:['Recovery','Instant healing'],apply:p=>player.hp=Math.min(player.maxHp,player.hp+Math.max(1,Math.round(p*1.25)))},
    {id:'stability',icon:'◇',ru:['Стабилизатор','Меньше размер — легче уклоняться'],en:['Stabilizer','Smaller size — easier dodging'],apply:p=>player.r=Math.max(10,player.r*(1-.035*p))},
    {id:'critpower',icon:'✹',ru:['Крит-усилитель','Сильнее критические попадания'],en:['Crit amplifier','Stronger critical hits'],apply:p=>player.critMult=Math.min(3.25,player.critMult+.14*p)},
    {id:'caliber',icon:'●',ru:['Тяжёлый калибр','Крупнее снаряды'],en:['Heavy caliber','Larger projectiles'],apply:p=>player.projectileScale=Math.min(1.7,player.projectileScale*(1+.07*p))},
    {id:'evasion',icon:'◌',ru:['Фазовый сдвиг','Шанс избежать урона'],en:['Phase shift','Chance to evade damage'],apply:p=>player.evasion=Math.min(.24,player.evasion+.025*p)},
    {id:'waveguard',icon:'⬢',ru:['Волновой щит','Щит через несколько волн'],en:['Wave guard','Gain a shield every few waves'],apply:p=>player.waveGuard=Math.min(player.waveGuard,p>=2.2?3:p>=1.5?4:5)},
    {id:'repairpulse',icon:'✚',ru:['Наноремонт','Лечение после серии убийств'],en:['Nanorepair','Heal after a kill streak'],apply:p=>player.repairEvery=Math.min(player.repairEvery,Math.max(24,38-Math.round(4*p)))},
  ];

  class SoundEngine {
    constructor(){this.ctx=null;this.enabled=true}
    ensure(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})}
    tone(freq,dur=.06,type='sine',gain=.025){if(!this.enabled)return;try{this.ensure();const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+dur);o.connect(g).connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+dur)}catch(_){}}
    pause(){this.ctx?.suspend?.().catch(()=>{})} resume(){if(this.ctx&&this.enabled)this.ctx.resume?.().catch(()=>{})}
  }
  const sound = new SoundEngine();

  const formatScore=n=>Math.floor(n).toLocaleString(lang==='ru'?'ru-RU':'en-US');
  const leaderboardVisibleScore=n=>Math.max(0,Math.round((Number(n)||0)/LEADERBOARD_SCORE_SCALE));
  const rand=(a,b)=>a+Math.random()*(b-a); const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist2=(ax,ay,bx,by)=>{const x=ax-bx,y=ay-by;return x*x+y*y};
  const selectedSkin=()=>SKINS.find(x=>x.id===progress.selectedSkin)||SKINS[0];
  const selectedBullet=()=>BULLET_STYLES.find(x=>x.id===progress.selectedBullet)||BULLET_STYLES[0];
  const selectedTrail=()=>TRAIL_STYLES.find(x=>x.id===progress.selectedTrail)||TRAIL_STYLES[0];
  let shopPreviewIndex=0;
  function previewKindLabel(kind){return kind==='skin'?t('previewSkin'):kind==='bullet'?t('previewBullet'):t('previewTrail')}
  function setShopPreview(item){
    if(!item||!ui.shopPreviewStage)return;
    const idx=ALL_COSMETICS.findIndex(x=>x.kind===item.kind&&x.id===item.id);if(idx>=0)shopPreviewIndex=idx;
    const rar=RARITY[item.rarity];
    ui.shopPreviewName.textContent=t(item.nameKey);
    ui.shopPreviewKind.textContent=previewKindLabel(item.kind);
    ui.shopPreviewRarity.className=`rarity-badge rarity-${item.rarity}`;
    ui.shopPreviewRarity.textContent=t(rar.key);
    if(item.kind==='skin'){
      ui.shopPreviewStage.innerHTML=`<div class="live-preview skin-live rarity-${item.rarity} effect-${item.effect||'base'}" style="--p1:${item.primary};--p2:${item.secondary};--core:${item.core}"><span class="live-orbit a"></span><span class="live-orbit b"></span><span class="live-player"></span><span class="live-spark s1"></span><span class="live-spark s2"></span><span class="live-spark s3"></span></div>`;
    }else if(item.kind==='bullet'){
      ui.shopPreviewStage.innerHTML=`<div class="live-preview bullet-live rarity-${item.rarity}" style="--p1:${item.primary};--p2:${item.glow}"><span class="live-shot shot1"></span><span class="live-shot shot2"></span><span class="live-shot shot3"></span><span class="live-target"></span></div>`;
    }else{
      ui.shopPreviewStage.innerHTML=`<div class="live-preview trail-live rarity-${item.rarity} trail-${item.effect}" style="--p1:${item.primary};--p2:${item.secondary}"><span class="trail-dot d1"></span><span class="trail-dot d2"></span><span class="trail-dot d3"></span><span class="trail-dot d4"></span><span class="trail-runner"></span></div>`;
    }
  }
  function stepShopPreview(dir){if(!ALL_COSMETICS.length)return;shopPreviewIndex=(shopPreviewIndex+dir+ALL_COSMETICS.length)%ALL_COSMETICS.length;setShopPreview(ALL_COSMETICS[shopPreviewIndex])}

  function showPanel(name){Object.entries(panels).forEach(([k,el])=>el.classList.toggle('hidden',k!==name));hud.classList.toggle('hidden',name!=='game'&&name!=='pause'&&state.mode!=='game')}
  function hideAllPanels(){Object.values(panels).forEach(el=>el.classList.add('hidden'))}
  let toastTimer=0;
  function showToast(message,ms=2400){toast.textContent=message;toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),ms)}

  function applyLanguage(){
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I18N[lang][k])el.textContent=I18N[lang][k]});
    updateAuthUI(); refreshProgressUI(); renderShop();
  }
  function updateAuthUI(){
    const b=window.PlatformBridge;ui.loginBtn.classList.add('hidden');
    ui.authHint.textContent=b?.authorized?t('authorized'):t('localMode');
  }

  function localDateKey(date=new Date()){
    const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;
  }
  function dateKeyToDay(k){if(!/^\d{4}-\d{2}-\d{2}$/.test(k))return null;const [y,m,d]=k.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000)}
  function canClaimDaily(){return progress.lastDailyDate!==localDateKey()}
  function nextDailyInfo(){
    const today=localDateKey(),todayDay=dateKeyToDay(today),lastDay=dateKeyToDay(progress.lastDailyDate);let streak=1;
    if(lastDay!==null&&todayDay-lastDay===1)streak=progress.dailyStreak+1;
    const rewards=[100,125,150,175,200,225,250];return{streak,coins:rewards[(streak-1)%rewards.length]};
  }
  const DAILY_QUESTS = [
    {id:'kills70',stat:'kills',target:70,titleKey:'questKills',reward:{type:'credits',amount:80}},
    {id:'score1800',stat:'score',target:1800,titleKey:'questScore',reward:{type:'credits',amount:100}},
    {id:'combo12',stat:'combo',target:12,titleKey:'questCombo',reward:{type:'credits',amount:90}},
    {id:'wave6',stat:'wave',target:6,titleKey:'questWave',reward:{type:'credits',amount:110}},
    {id:'games2',stat:'games',target:2,titleKey:'questGames',reward:{type:'credits',amount:80}},
    {id:'boss1',stat:'bosses',target:1,titleKey:'questBoss',reward:{type:'capsule',amount:1}},
  ];
  function ensureDailyQuestDate(){
    const today=localDateKey();if(progress.dailyQuestDate===today)return;
    progress.dailyQuestDate=today;progress.dailyQuestStats=defaultQuestStats();progress.dailyQuestClaims=[];progress.dailyQuestBonusClaimed=false;persistLocalProgress();
  }
  function questValue(q){return Math.max(0,Number(progress.dailyQuestStats[q.stat])||0)}
  function questComplete(q){return questValue(q)>=q.target}
  function questRewardLabel(q){return q.reward.type==='capsule'?t('questRewardCapsule'):t('questRewardCredits',{coins:q.reward.amount})}
  function questTitle(q){const target=q.stat==='score'?formatScore(q.target):q.target;return t(q.titleKey,{target})}
  function renderDailyQuests(){
    if(!ui.dailyQuestList)return;ensureDailyQuestDate();ui.questResetText.textContent=t('questReset');ui.dailyQuestList.innerHTML='';
    for(const q of DAILY_QUESTS){
      const value=questValue(q),done=questComplete(q),claimed=progress.dailyQuestClaims.includes(q.id),pct=clamp(value/q.target,0,1);
      const row=document.createElement('article');row.className=`quest-row${done?' complete':''}${claimed?' claimed':''}`;
      const shown=Math.min(value,q.target);row.innerHTML=`<div class="quest-main"><strong>${questTitle(q)}</strong><span>${questRewardLabel(q)}</span><div class="quest-progress"><i style="width:${pct*100}%"></i></div><small>${q.stat==='score'?formatScore(shown):shown} / ${q.stat==='score'?formatScore(q.target):q.target}</small></div>`;
      const btn=document.createElement('button');btn.className='btn quest-claim';btn.disabled=!done||claimed;btn.textContent=claimed?t('questClaimed'):t('questClaim');btn.addEventListener('click',()=>claimDailyQuest(q.id));row.appendChild(btn);ui.dailyQuestList.appendChild(row);
    }
    const doneCount=DAILY_QUESTS.filter(q=>progress.dailyQuestClaims.includes(q.id)).length,ready=doneCount===DAILY_QUESTS.length&&!progress.dailyQuestBonusClaimed;
    ui.dailyQuestBonusText.textContent=progress.dailyQuestBonusClaimed?t('questClaimed'):(ready?t('dailyQuestBonusReady'):t('dailyQuestBonusNeed',{done:doneCount,total:DAILY_QUESTS.length}));
    ui.claimQuestBonusBtn.disabled=!ready;ui.claimQuestBonusBtn.textContent=progress.dailyQuestBonusClaimed?t('questClaimed'):t('questClaim');
  }
  function updateQuestStat(key,value,{mode='max'}={}){
    ensureDailyQuestDate();const stats=progress.dailyQuestStats;if(!(key in stats))return;
    const next=mode==='add'?(Number(stats[key])||0)+value:Math.max(Number(stats[key])||0,value);
    if(next!==stats[key]){stats[key]=next;persistLocalProgress()}
  }
  async function claimDailyQuest(id){
    ensureDailyQuestDate();const q=DAILY_QUESTS.find(x=>x.id===id);if(!q||!questComplete(q)||progress.dailyQuestClaims.includes(id))return;
    progress.dailyQuestClaims.push(id);let drop=null;
    if(q.reward.type==='credits')progress.coins+=q.reward.amount;else drop=grantCosmeticRoll();
    saveProgress();renderShop();if(drop)await openCapsuleAnimation(drop,{test:false,allowAgain:false});else showToast(`${questTitle(q)} · ${questRewardLabel(q)}`);
  }
  async function claimQuestBonus(){
    ensureDailyQuestDate();if(progress.dailyQuestBonusClaimed||DAILY_QUESTS.some(q=>!progress.dailyQuestClaims.includes(q.id)))return;
    progress.dailyQuestBonusClaimed=true;progress.coins+=200;const drop=grantCosmeticRoll();saveProgress();renderShop();await openCapsuleAnimation(drop,{test:false,allowAgain:false});
  }
  function anyQuestRewardReady(){ensureDailyQuestDate();return DAILY_QUESTS.some(q=>questComplete(q)&&!progress.dailyQuestClaims.includes(q.id))||(!progress.dailyQuestBonusClaimed&&DAILY_QUESTS.every(q=>progress.dailyQuestClaims.includes(q.id)))}

  const AD_CREDITS_COOLDOWN=15*60*1000,AD_CAPSULE_COOLDOWN=30*60*1000,AD_CRYSTALS_COOLDOWN=60*60*1000;
  function adCreditsRemaining(){return Math.max(0,AD_CREDITS_COOLDOWN-(Date.now()-progress.lastAdCreditsAt))}
  function adCapsuleRemaining(){return Math.max(0,AD_CAPSULE_COOLDOWN-(Date.now()-progress.lastAdCapsuleAt))}
  function adCrystalsRemaining(){return Math.max(0,AD_CRYSTALS_COOLDOWN-(Date.now()-progress.lastAdCrystalsAt))}
  function formatDuration(ms){const total=Math.ceil(ms/60000),h=Math.floor(total/60),m=total%60;return h>0?`${h}:${String(m).padStart(2,'0')}`:`${m} ${lang==='ru'?'мин':'min'}`}
  function anyRewardReady(){const sdk=!!window.PlatformBridge?.supportsRewarded;return canClaimDaily()||progress.weeklyProgress>=7||anyQuestRewardReady()||(sdk&&(adCreditsRemaining()<=0||adCapsuleRemaining()<=0))}

  function refreshProgressUI(){
    ui.menuBest.textContent=formatScore(progress.bestScore);ui.menuCoins.textContent=formatScore(progress.coins);ui.menuCrystals.textContent=formatScore(progress.crystals);ui.shopCoins.textContent=formatScore(progress.coins);ui.shopCrystals.textContent=formatScore(progress.crystals);
    const total=ALL_COSMETICS.length,owned=progress.ownedSkins.length+progress.ownedBullets.length+progress.ownedTrails.length;ui.collectionCount.textContent=`${owned}/${total}`;ui.weeklyProgress.textContent=`${progress.weeklyProgress}/7`;
    const d=nextDailyInfo();
    if(canClaimDaily()){ui.dailyRewardText.textContent=t('dailyReady',{coins:d.coins,streak:d.streak});ui.claimDailyBtn.disabled=false;ui.claimDailyBtn.textContent=t('claim')}
    else{ui.dailyRewardText.textContent=t('dailyDone');ui.claimDailyBtn.disabled=true;ui.claimDailyBtn.textContent=t('claimed')}
    if(progress.weeklyProgress>=7){ui.weeklyRewardText.textContent=t('weeklyReady');ui.claimWeeklyBtn.disabled=false;ui.claimWeeklyBtn.textContent=t('claim')}
    else{ui.weeklyRewardText.textContent=t('weeklyNeed',{days:progress.weeklyProgress});ui.claimWeeklyBtn.disabled=true;ui.claimWeeklyBtn.textContent=`${progress.weeklyProgress}/7`}
    const sdk=!!window.PlatformBridge?.supportsRewarded,creditRem=adCreditsRemaining(),capsuleRem=adCapsuleRemaining(),crystalRem=adCrystalsRemaining();
    if(!sdk){ui.adCreditsText.textContent=t('adLocal');ui.claimAdCreditsBtn.disabled=true;ui.claimAdCreditsBtn.textContent=t('adCreditsWatch');ui.adCapsuleText.textContent=t('adLocal');ui.claimAdCapsuleBtn.disabled=true;ui.claimAdCapsuleBtn.textContent=t('adCapsuleWatch')}
    else{
      ui.adCreditsText.textContent=creditRem<=0?t('adCreditsReady'):t('adCreditsCooldown',{time:formatDuration(creditRem)});ui.claimAdCreditsBtn.disabled=creditRem>0;ui.claimAdCreditsBtn.textContent=creditRem<=0?t('adCreditsWatch'):formatDuration(creditRem);
      ui.adCapsuleText.textContent=capsuleRem<=0?t('adCapsuleReady'):t('adCapsuleCooldown',{time:formatDuration(capsuleRem)});ui.claimAdCapsuleBtn.disabled=capsuleRem>0;ui.claimAdCapsuleBtn.textContent=capsuleRem<=0?t('adCapsuleWatch'):formatDuration(capsuleRem);
    }
    if(ui.adCrystalsText&&ui.claimAdCrystalsBtn){
      if(!sdk){ui.adCrystalsText.textContent=t('crystalPackUnavailable');ui.claimAdCrystalsBtn.disabled=true;ui.claimAdCrystalsBtn.textContent=t('crystalAdWatch')}
      else if(crystalRem<=0){ui.adCrystalsText.textContent=t('crystalAdReady');ui.claimAdCrystalsBtn.disabled=false;ui.claimAdCrystalsBtn.textContent=t('crystalAdWatch')}
      else{ui.adCrystalsText.textContent=t('crystalAdCooldown',{time:formatDuration(crystalRem)});ui.claimAdCrystalsBtn.disabled=true;ui.claimAdCrystalsBtn.textContent=formatDuration(crystalRem)}
    }
    renderDailyQuests();
    ui.rewardStatus.textContent=anyRewardReady()?t('rewardReadyShort'):t('rewardWaitShort');
    const rewardsBtn=document.getElementById('rewardsBtn');rewardsBtn.classList.toggle('ready',anyRewardReady());
  }

  function rollRarity(odds=COSMETIC_ODDS){const r=Math.random();let acc=0;for(const x of odds){acc+=x.chance;if(r<acc)return x.id}return odds[odds.length-1]?.id||'common'}
  function duplicateComp(rarity){return{common:35,rare:90,epic:260,legendary:900}[rarity]||35}
  function grantCosmeticRoll(odds=COSMETIC_ODDS){
    const rarity=rollRarity(odds);
    const pool=DROPPABLE_COSMETICS.filter(x=>x.rarity===rarity);
    const item=pool[Math.floor(Math.random()*pool.length)];
    const owned=item.kind==='skin'?progress.ownedSkins:item.kind==='bullet'?progress.ownedBullets:progress.ownedTrails;
    if(owned.includes(item.id)){const coins=duplicateComp(rarity);progress.coins+=coins;return{item,duplicate:true,coins}}
    owned.push(item.id);return{item,duplicate:false,coins:0};
  }
  function rewardResultText(result){const name=t(result.item.nameKey),rar=t(RARITY[result.item.rarity].key);return result.duplicate?t('duplicateReward',{item:`${name} · ${rar}`,coins:result.coins}):t('rewardReceived',{item:`${name} · ${rar}`})}
  function cosmeticPreviewMarkup(item){
    return item.kind==='skin'
      ? `<span class="skin-shape ${item.effect?`skin-${item.effect}`:''}" style="--preview-primary:${item.primary};--preview-glow:${item.secondary}"></span>`
      : item.kind==='bullet'
      ? `<span class="bullet-preview-shape ${item.shape}" style="--preview-primary:${item.primary};--preview-glow:${item.glow}"></span>`
      : `<span class="trail-preview-shape ${item.effect}" style="--preview-primary:${item.primary};--preview-glow:${item.secondary}"></span>`;
  }
  function reelCardMarkup(item, target=false){
    return `<div class="capsule-reel-item rarity-${item.rarity}${target?' target':''}" data-item="${item.kind}:${item.id}"><div class="capsule-reel-preview">${cosmeticPreviewMarkup(item)}</div><span class="rarity-badge rarity-${item.rarity}">${t(RARITY[item.rarity].key)}</span><b>${t(item.nameKey)}</b></div>`;
  }
  let capsuleAnimating=false;
  function closeCapsule(){if(capsuleAnimating)return;ui.capsuleOverlay.classList.add('hidden');ui.capsuleAgainBtn.classList.add('hidden')}
  function easeOutQuint(x){return 1-Math.pow(1-x,5)}
  async function openCapsuleAnimation(result,{test=false,allowAgain=false}={}){
    if(capsuleAnimating)return;
    capsuleAnimating=true;
    sound.ensure();
    ui.capsuleOverlay.classList.remove('hidden');
    ui.capsuleResult.classList.add('hidden');
    ui.capsuleAgainBtn.classList.add('hidden');
    ui.capsuleCloseBtn.disabled=true;
    ui.capsuleReel.innerHTML='';

    // Every full cycle contains every cosmetic item. The final target is injected near the end.
    const base=[...DROPPABLE_COSMETICS];
    const sequence=[];
    for(let cycle=0;cycle<5;cycle++) sequence.push(...base);
    const targetIndex=sequence.length-6;
    sequence[targetIndex]=result.item;
    ui.capsuleReel.innerHTML=sequence.map((item,i)=>reelCardMarkup(item,i===targetIndex)).join('');
    ui.capsuleReel.style.transform='translate3d(0,0,0)';

    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const items=[...ui.capsuleReel.children];
    const target=items[targetIndex];
    const frame=ui.capsuleReel.parentElement;
    const targetCenter=target.offsetLeft+target.offsetWidth/2;
    const frameCenter=frame.clientWidth/2;
    const finalX=frameCenter-targetCenter;
    const start=performance.now(),duration=3600;
    await new Promise(resolve=>{
      const step=now=>{
        const p=Math.min(1,(now-start)/duration),e=easeOutQuint(p);
        const wobble=(1-p)*Math.sin(p*55)*7;
        ui.capsuleReel.style.transform=`translate3d(${finalX*e+wobble}px,0,0)`;
        if(p<1)requestAnimationFrame(step);else resolve();
      };
      requestAnimationFrame(step);
    });
    target.classList.add('won');
    const rar=RARITY[result.item.rarity];
    ui.capsuleResultPreview.innerHTML=cosmeticPreviewMarkup(result.item);
    ui.capsuleResultRarity.className=`rarity-badge rarity-${result.item.rarity}`;
    ui.capsuleResultRarity.textContent=t(rar.key);
    ui.capsuleResultName.textContent=t(result.item.nameKey);
    ui.capsuleResultNote.textContent=result.duplicate?t('duplicateReward',{item:t(result.item.nameKey),coins:result.coins}):(test?t('testDrop'):t('newCosmetic'));
    ui.capsuleResult.className=`capsule-result rarity-${result.item.rarity}`;
    ui.capsuleResult.classList.remove('hidden');
    ui.capsuleCloseBtn.disabled=false;
    if(allowAgain)ui.capsuleAgainBtn.classList.remove('hidden');
    sound.tone(result.item.rarity==='legendary'?1100:result.item.rarity==='epic'?900:result.item.rarity==='rare'?760:620,.24,'triangle',.045);
    capsuleAnimating=false;
  }
  function claimDaily(){
    if(!canClaimDaily())return;const info=nextDailyInfo();progress.lastDailyDate=localDateKey();progress.dailyStreak=info.streak;progress.weeklyProgress=Math.min(7,progress.weeklyProgress+1);progress.coins+=info.coins;
    const drop=grantCosmeticRoll();saveProgress();renderShop();showToast(`${t('dailyReceived')} ${rewardResultText(drop)}`,3800);sound.tone(720,.16,'sine',.035)
  }
  function claimWeekly(){
    if(progress.weeklyProgress<7)return;progress.weeklyProgress=0;progress.coins+=500;const results=[grantCosmeticRoll(),grantCosmeticRoll(),grantCosmeticRoll()];saveProgress();renderShop();
    showToast(`${t('weeklyReceived')} ${results.map(rewardResultText).join(' · ')}`,6000);sound.tone(880,.23,'triangle',.04)
  }
  async function claimAdCredits(){
    if(adCreditsRemaining()>0||!window.PlatformBridge?.supportsRewarded)return;ui.claimAdCreditsBtn.disabled=true;const rewarded=await window.PlatformBridge.showRewarded();
    if(!rewarded){showToast(t('adFailed'));refreshProgressUI();return}
    progress.lastAdCreditsAt=Date.now();progress.coins+=100;saveProgress();renderShop();showToast(t('adCreditsReceived'));sound.tone(820,.16,'sine',.035)
  }
  async function claimAdCapsule(){
    if(adCapsuleRemaining()>0||!window.PlatformBridge?.supportsRewarded)return;ui.claimAdCapsuleBtn.disabled=true;const rewarded=await window.PlatformBridge.showRewarded();
    if(!rewarded){showToast(t('adFailed'));refreshProgressUI();return}
    progress.lastAdCapsuleAt=Date.now();const drop=grantCosmeticRoll();saveProgress();renderShop();showToast(`${t('adCapsuleReceived')} ${rewardResultText(drop)}`,2600);await openCapsuleAnimation(drop,{test:false,allowAgain:false})
  }

  let crystalCatalog=new Map();
  function productCurrencyIcon(product){try{return typeof product?.getPriceCurrencyImage==='function'?product.getPriceCurrencyImage('small'):''}catch(_){return''}}
  function renderCrystalPacks(){
    if(!ui.crystalPackShop)return;ui.crystalPackShop.innerHTML='';let visible=0;
    CRYSTAL_PACKS.forEach(pack=>{const product=crystalCatalog.get(pack.id);if(!product)return;visible++;const card=document.createElement('article');card.className='crystal-pack-card';const icon=productCurrencyIcon(product);const title=String(product.title||`${formatScore(pack.amount)} ◈`),desc=String(product.description||`${formatScore(pack.amount)} ◈`),price=String(product.price||'');card.innerHTML=`<span class="crystal-pack-icon">◈</span><strong class="crystal-product-title"></strong><small class="crystal-product-amount">+${formatScore(pack.amount)} ◈</small><span class="crystal-product-desc"></span><em class="crystal-product-price"></em><button class="btn btn-primary" type="button">${t('crystalPackBuy')}</button>`;if(product.imageURI){const productImg=document.createElement('img');productImg.src=product.imageURI;productImg.alt='';productImg.className='crystal-product-image';card.querySelector('.crystal-pack-icon').replaceWith(productImg)}card.querySelector('.crystal-product-title').textContent=title;card.querySelector('.crystal-product-desc').textContent=desc;const priceEl=card.querySelector('.crystal-product-price');if(icon){const img=document.createElement('img');img.src=icon;img.alt='';img.className='portal-currency-icon';priceEl.appendChild(img)}const priceText=document.createElement('span');priceText.textContent=price;priceEl.appendChild(priceText);const btn=card.querySelector('button');btn.addEventListener('click',()=>purchaseCrystalPack(pack));ui.crystalPackShop.appendChild(card)});
    ui.crystalPacksWrap?.classList.toggle('hidden',visible===0);
  }
  async function loadCrystalCatalog(){const products=await window.PlatformBridge?.getPaymentsCatalog?.();const supported=new Set(CRYSTAL_PACKS.map(x=>x.id));crystalCatalog=new Map((Array.isArray(products)?products:[]).filter(p=>p&&supported.has(p.id)).map(p=>[p.id,p]));renderCrystalPacks()}
  async function applyCrystalPurchase(){return false}
  async function purchaseCrystalPack(pack){
    if(!window.PlatformBridge?.platformAvailable||!crystalCatalog.has(pack.id)){showToast(t('crystalPackUnavailable'));return}
    if(!window.PlatformBridge?.authorized){showToast(t('crystalLoginRequired'));return}
    const purchase=await window.PlatformBridge.purchaseProduct(pack.id);
    if(!purchase?.paid){if(purchase?.status!=='cancelled')showToast(t('crystalPurchaseFailed'));return}
    const cloud=purchase.progress||await window.PlatformBridge.loadCloudProgress();applyAuthoritativeCloud(cloud);
    showToast(t('crystalPurchaseDone',{crystals:pack.amount}));sound.tone(920,.18,'triangle',.04)
  }
  async function recoverCrystalPurchases(){
    if(!window.PlatformBridge?.authorized)return;const cloud=await window.PlatformBridge.loadCloudProgress();if(cloud)applyAuthoritativeCloud(cloud)
  }
  async function claimAdCrystals(){
    if(adCrystalsRemaining()>0||!window.PlatformBridge?.supportsRewarded)return;ui.claimAdCrystalsBtn.disabled=true;const rewarded=await window.PlatformBridge.showRewarded();
    if(!rewarded){showToast(t('adFailed'));refreshProgressUI();return}progress.lastAdCrystalsAt=Date.now();progress.crystals+=10;saveProgress();renderShop();showToast(t('crystalAdReceived'))
  }

  function renderShop(){
    if(!ui.skinShop||!ui.bulletShop||!ui.trailShop)return;ui.skinShop.innerHTML='';ui.bulletShop.innerHTML='';ui.trailShop.innerHTML='';if(ui.chestShop){ui.chestShop.innerHTML='';CHESTS.forEach(chest=>ui.chestShop.appendChild(chestCard(chest)))}
    SKINS.forEach(item=>ui.skinShop.appendChild(shopCard(item,'skin')));BULLET_STYLES.forEach(item=>ui.bulletShop.appendChild(shopCard(item,'bullet')));TRAIL_STYLES.forEach(item=>ui.trailShop.appendChild(shopCard(item,'trail')));
    renderCrystalPacks();if(!ui.shopPreviewStage?.firstChild)setShopPreview({...selectedTrail(),kind:'trail'});
  }
  function chestOddsText(chest){return chest.odds.map(x=>`${Math.round(x.chance*100)}% ${t(RARITY[x.id].key)}`).join(' · ')}
  function chestCard(chest){
    const btn=document.createElement('button');btn.className=`chest-card rarity-${chest.rarity}`;btn.disabled=capsuleAnimating;
    btn.innerHTML=`<div class="chest-icon">▣</div><div class="chest-copy"><span class="rarity-badge rarity-${chest.rarity}">${t(RARITY[chest.rarity].key)}</span><h4>${t(chest.nameKey)}</h4><p>${t('chestOdds',{odds:chestOddsText(chest)})}</p><strong>${t('chestBuy',{coins:formatScore(chest.price)})}</strong></div>`;
    btn.addEventListener('click',()=>buyChest(chest));return btn;
  }
  async function buyChest(chest){
    if(capsuleAnimating)return;if(progress.coins<chest.price){showToast(t('notEnough'));return}
    progress.coins-=chest.price;const drop=grantCosmeticRoll(chest.odds);saveProgress();renderShop();showToast(`${t('chestOpened')} ${rewardResultText(drop)}`,1800);await openCapsuleAnimation(drop,{test:false,allowAgain:false});renderShop();
  }
  function shopCard(item,kind){
    const owned=(kind==='skin'?progress.ownedSkins:kind==='bullet'?progress.ownedBullets:progress.ownedTrails).includes(item.id);const equipped=(kind==='skin'?progress.selectedSkin:kind==='bullet'?progress.selectedBullet:progress.selectedTrail)===item.id;const rar=RARITY[item.rarity];
    const btn=document.createElement('button');btn.className=`shop-item rarity-${item.rarity}${equipped?' equipped':''}${owned?'':' locked'}`;
    const preview=cosmeticPreviewMarkup({...item,kind});
    const premium=Number(item.crystalPrice)>0;const status=equipped?t('equipped'):owned?t('equip'):premium?`${formatScore(item.crystalPrice)} ◈`:`${formatScore(item.price)} ◆`;
    btn.innerHTML=`<div class="shop-preview">${preview}</div><div><span class="rarity-badge rarity-${item.rarity}">${t(rar.key)}</span><h4>${t(item.nameKey)}</h4></div><div class="shop-meta"><span>${item.rarity==='legendary'?'✦ FX':item.rarity==='epic'?'◆ FX':'COSMETIC'}</span><span class="${owned?'shop-state':'shop-price'}">${status}</span></div>`;
    const previewItem={...item,kind};
    btn.addEventListener('pointerenter',()=>setShopPreview(previewItem));
    btn.addEventListener('focus',()=>setShopPreview(previewItem));
    btn.addEventListener('click',()=>{setShopPreview(previewItem);handleShopItem(item,kind)});return btn;
  }
  async function handleShopItem(item,kind){
    const list=kind==='skin'?progress.ownedSkins:kind==='bullet'?progress.ownedBullets:progress.ownedTrails;const owned=list.includes(item.id);const selectedKey=kind==='skin'?'selectedSkin':kind==='bullet'?'selectedBullet':'selectedTrail';
    if(!owned){
      const premium=Number(item.crystalPrice)>0;
      if(premium){
        if(progress.crystals<item.crystalPrice){showToast(t('notEnoughCrystals'));return}
        const result=await window.PlatformBridge?.buyPremiumCosmetic?.(kind,item.id);
        if(!result?.ok){showToast(result?.reason==='funds'?t('notEnoughCrystals'):t('crystalPurchaseFailed'));return}
        applyAuthoritativeCloud(result.progress);showToast(t('purchaseDone'));return
      }
      if(progress.coins<item.price){showToast(t('notEnough'));return}progress.coins-=item.price;list.push(item.id);progress[selectedKey]=item.id;saveProgress();showToast(t('purchaseDone'))
    }
    else if(progress[selectedKey]!==item.id){progress[selectedKey]=item.id;saveProgress();showToast(t('equippedDone'))}
    renderShop();
  }

  function weightedPick(arr,weightKey='weight'){let total=arr.reduce((s,x)=>s+x[weightKey],0),r=Math.random()*total;for(const x of arr){r-=x[weightKey];if(r<=0)return x}return arr[arr.length-1]}

  function resize(){const rect=app.getBoundingClientRect();state.w=Math.max(320,rect.width);state.h=Math.max(320,rect.height);state.dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.floor(state.w*state.dpr);canvas.height=Math.floor(state.h*state.dpr);ctx.setTransform(state.dpr,0,0,state.dpr,0,0);if(state.mode==='game'){player.x=clamp(player.x,30,state.w-30);player.y=clamp(player.y,30,state.h-30)}makeStars()}
  function makeStars(){const target=Math.round((state.w*state.h)/14000);state.stars=Array.from({length:clamp(target,28,100)},()=>({x:Math.random()*state.w,y:Math.random()*state.h,r:rand(.4,1.5),a:rand(.12,.55),p:rand(0,Math.PI*2)}))}
  function resetPlayer(){Object.assign(player,{x:state.w/2,y:state.h/2,r:15,speed:235,hp:5,maxHp:5,damage:1,fireRate:.42,projectileSpeed:590,projectileScale:1,multishot:1,spread:.14,crit:.08,critMult:2,shield:0,pierce:0,evasion:0,waveGuard:999,repairEvery:999,killsSinceRepair:0,invuln:0,trail:[]})}
  function resetGame(){ensureDailyQuestDate();state.gameTime=0;state.wave=1;state.waveClock=0;state.spawnClock=.3;state.shootClock=0;state.score=0;state.kills=0;state.combo=0;state.comboClock=99;state.bestCombo=0;state.comboGrace=3;state.cameraShake=0;state.flash=0;state.bannerClock=2;state.bannerText=t('waveIncoming',{wave:1});state.projectiles=[];state.enemies=[];state.particles=[];state.powerupDrop=null;state.powerupSpawnClock=rand(7,14);state.activePowerups={speed:0,damage:0,shield:0};resetPlayer();updateHUD()}
  function startGame(){hideAllPanels();hud.classList.remove('hidden');state.mode='game';state.manualPause=false;resetGame();sound.ensure();window.PlatformBridge?.gameplayStart?.()}
  function goMenu(){if(['game','pause','upgrade'].includes(state.mode))window.PlatformBridge?.gameplayStop?.();state.mode='menu';state.manualPause=false;state.joystick.active=false;hud.classList.add('hidden');showPanel('menu');refreshProgressUI();updateAuthUI()}
  function pauseGame(manual=true){if(state.mode!=='game')return;state.prevMode='game';state.mode='pause';state.manualPause=manual;window.PlatformBridge?.gameplayStop?.();sound.pause();if(manual){panels.pause.classList.remove('hidden');hud.classList.remove('hidden')}}
  function resumeGame(manual=true){if(state.mode!=='pause')return;if(manual&&!state.manualPause)return;panels.pause.classList.add('hidden');state.mode='game';state.manualPause=false;sound.resume();window.PlatformBridge?.gameplayStart?.()}
  function platformPause(){state.suspendedByPlatform=true;sound.pause();if(state.mode==='game'){state.prevMode='game';state.mode='pause';state.manualPause=false;window.PlatformBridge?.gameplayStop?.()}}
  function platformResume(){state.suspendedByPlatform=false;if(state.mode==='pause'&&!state.manualPause){state.mode='game';sound.resume();window.PlatformBridge?.gameplayStart?.();return}sound.resume();if(state.mode==='game')window.PlatformBridge?.gameplayStart?.()}
  async function retryWithAd(){const shouldShow=progress.gamesPlayed>0&&progress.gamesPlayed%3===0;if(shouldShow)await window.PlatformBridge?.showInterstitial?.();startGame()}

  function enemySpawnPoint(padding=60){const side=Math.floor(Math.random()*4);if(side===0)return{x:rand(-padding,state.w+padding),y:-padding};if(side===1)return{x:state.w+padding,y:rand(-padding,state.h+padding)};if(side===2)return{x:rand(-padding,state.w+padding),y:state.h+padding};return{x:-padding,y:rand(-padding,state.h+padding)}}
  function chooseEnemyType(){const w=state.wave,roll=Math.random();if(w>=10&&roll<.08)return'spinner';if(w>=8&&roll<.17)return'splitter';if(w>=7&&roll<.27)return'sniper';if(w>=5&&roll<.39)return'orbiter';if(w>=6&&roll<.51)return'shooter';if(w>=4&&roll<.63)return'tank';if(w>=2&&roll<.78)return'dasher';return'chaser'}
  function spawnEnemy(type=chooseEnemyType(),at=null){const base=enemyTypes[type],pos=at||enemySpawnPoint(type==='boss'?90:50);const waveHp=type==='boss'?1+Math.max(0,state.wave-5)*.135:1+Math.max(0,state.wave-1)*.054;const hp=Math.max(.45,base.hp*waveHp*.9);const e={type,x:pos.x,y:pos.y,r:base.r,hp,maxHp:hp,speed:base.speed*(1+Math.min(.66,state.wave*.0245)),score:base.score,age:0,dashClock:rand(.4,1.6),dashTime:0,vx:0,vy:0,shootClock:rand(.4,1.4),summonClock:rand(2.8,4.2),hitFlash:0,orbit:Math.random()<.5?-1:1,bossKind:null};state.enemies.push(e);return e}
  function spawnBoss(){const index=(Math.max(1,Math.floor(state.wave/5))-1)%BOSS_KINDS.length,kind=BOSS_KINDS[index],e=spawnEnemy('boss');e.bossKind=kind.id;e.shootClock=.65;e.dashClock=1.25;e.summonClock=3.1;if(kind.id==='spiral'){e.speed*=.86;e.hp=Math.ceil(e.hp*.94);e.maxHp=e.hp}else if(kind.id==='charger'){e.speed*=1.18;e.hp=Math.ceil(e.hp*.9);e.maxHp=e.hp}else if(kind.id==='summoner'){e.speed*=.88;e.hp=Math.ceil(e.hp*1.08);e.maxHp=e.hp}state.bannerText=`${t('bossIncoming',{wave:state.wave})} · ${kind[lang]||kind.ru}`;state.bannerClock=2.4;sound.tone(110,.3,'sawtooth',.05)}
  function playerDirection(){let x=0,y=0;if(state.keys.has('KeyA')||state.keys.has('ArrowLeft'))x--;if(state.keys.has('KeyD')||state.keys.has('ArrowRight'))x++;if(state.keys.has('KeyW')||state.keys.has('ArrowUp'))y--;if(state.keys.has('KeyS')||state.keys.has('ArrowDown'))y++;if(state.joystick.active){const dx=state.joystick.x-state.joystick.startX,dy=state.joystick.y-state.joystick.startY,len=Math.hypot(dx,dy);if(len>5){x+=dx/Math.max(55,len);y+=dy/Math.max(55,len)}}const len=Math.hypot(x,y);return len>0?{x:x/Math.max(1,len),y:y/Math.max(1,len)}:{x:0,y:0}}
  function nearestEnemy(){let best=null,bestD=Infinity;for(const e of state.enemies){const d=dist2(player.x,player.y,e.x,e.y);if(d<bestD){bestD=d;best=e}}return best}
  function shoot(){const target=nearestEnemy();if(!target)return;const baseAngle=Math.atan2(target.y-player.y,target.x-player.x),count=player.multishot,style=selectedBullet();for(let i=0;i<count;i++){const offset=(i-(count-1)/2)*player.spread,a=baseAngle+offset,crit=Math.random()<player.crit,baseR=crit?5:4;state.projectiles.push({x:player.x,y:player.y,vx:Math.cos(a)*player.projectileSpeed,vy:Math.sin(a)*player.projectileSpeed,r:baseR*player.projectileScale,damage:player.damage*(state.activePowerups.damage>0?1.65:1)*(crit?player.critMult:1),life:1.5,pierce:player.pierce,hit:new Set(),crit,styleId:style.id})}sound.tone(510+Math.random()*45,.045,'triangle',.012)}
  function addEnemyProjectile(e,a,speed=185,r=5,color='#ff78ec',damage=1,life=4){state.projectiles.push({enemy:true,x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,life,color,damage})}
  function enemyShoot(e,count=1,speed=185,spread=.22,color='#ff78ec'){const baseAngle=Math.atan2(player.y-e.y,player.x-e.x);for(let i=0;i<count;i++){const a=baseAngle+(i-(count-1)/2)*spread;addEnemyProjectile(e,a,speed,5,color)}}
  function radialEnemyShoot(e,count=8,speed=145,offset=0,color='#c87cff'){for(let i=0;i<count;i++)addEnemyProjectile(e,offset+i*Math.PI*2/count,speed,4.5,color)}
  function damagePlayer(amount=1){if(player.invuln>0||state.mode!=='game')return;if(state.activePowerups.shield>0){player.invuln=.18;return;}if(player.evasion>0&&Math.random()<player.evasion){player.invuln=.28;showToast(t('evaded'),700);sound.tone(930,.07,'sine',.02);burst(player.x,player.y,8,'shield');return}if(player.shield>0){player.shield--;player.invuln=.65;showToast(t('shieldSaved'),900);sound.tone(840,.12,'sine',.035);burst(player.x,player.y,14,'shield');updateHUD();return}player.hp-=amount;player.invuln=1.1;state.combo=0;state.comboClock=99;state.cameraShake=11;state.flash=.25;sound.tone(105,.18,'sawtooth',.05);burst(player.x,player.y,18,'damage');updateHUD();if(player.hp<=0)finishGame()}
  function killEnemy(e){state.kills++;state.combo=state.comboClock<=state.comboGrace?state.combo+1:1;state.comboClock=0;state.bestCombo=Math.max(state.bestCombo,state.combo);const mult=Math.min(6,1+Math.floor(state.combo/4)),waveBonus=1+(state.wave-1)*.025;state.score+=Math.round(e.score*mult*waveBonus);if(e.type==='boss')state.score+=90*state.wave;updateQuestStat('kills',1,{mode:'add'});updateQuestStat('combo',state.combo);updateQuestStat('score',Math.floor(state.score));if(e.type==='boss')updateQuestStat('bosses',1,{mode:'add'});player.killsSinceRepair++;if(player.repairEvery<900&&player.killsSinceRepair>=player.repairEvery){player.killsSinceRepair=0;player.hp=Math.min(player.maxHp,player.hp+1)}burst(e.x,e.y,e.type==='boss'?42:12,e.type==='boss'?'boss':'enemy');sound.tone(e.type==='boss'?190:260+Math.min(420,state.combo*10),e.type==='boss'?.28:.07,'square',e.type==='boss'?.045:.018);if(e.type==='splitter')for(let i=0;i<2;i++)spawnEnemy('minion',{x:e.x+rand(-8,8),y:e.y+rand(-8,8)});if(e.type==='boss')player.hp=Math.min(player.maxHp,player.hp+1);updateHUD()}
  function burst(x,y,count,kind){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=rand(30,kind==='boss'?230:150);state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.25,.7),max:.7,r:rand(1.5,4),kind})}}

  function scheduleNextPowerup(){state.powerupSpawnClock=rand(11,24)}
  function spawnTempPowerup(){
    const type=TEMP_POWERUPS[Math.floor(Math.random()*TEMP_POWERUPS.length)];
    const pad=Math.max(42,player.r+26),x=rand(pad,Math.max(pad+1,state.w-pad)),y=rand(Math.max(76,pad),Math.max(Math.max(76,pad)+1,state.h-pad));
    state.powerupDrop={type,x,y,r:16,life:9,age:0};
  }
  function collectTempPowerup(drop){
    state.activePowerups[drop.type.id]=POWERUP_DURATION;state.powerupDrop=null;scheduleNextPowerup();
    showToast(t('powerupPicked',{name:t(drop.type.nameKey)}),1600);sound.tone(drop.type.id==='shield'?920:drop.type.id==='damage'?760:1040,.13,'sine',.04);burst(player.x,player.y,16,'shield');
  }
  function updateTempPowerups(dt){
    for(const id of ['speed','damage','shield'])state.activePowerups[id]=Math.max(0,state.activePowerups[id]-dt);
    if(state.powerupDrop){const d=state.powerupDrop;d.age+=dt;d.life-=dt;if(dist2(player.x,player.y,d.x,d.y)<(player.r+d.r+5)**2){collectTempPowerup(d);return}if(d.life<=0){state.powerupDrop=null;scheduleNextPowerup()}}
    else{state.powerupSpawnClock-=dt;if(state.powerupSpawnClock<=0)spawnTempPowerup()}
  }
  function drawTempPowerups(now){
    const d=state.powerupDrop;if(d){const pulse=1+Math.sin(now*.009)*.09;ctx.save();ctx.translate(d.x,d.y);ctx.globalCompositeOperation='screen';ctx.strokeStyle=hexAlpha(d.type.color,.65);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,d.r*1.6*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle=hexAlpha(d.type.color,.18);ctx.beginPath();ctx.arc(0,0,d.r*1.25,0,Math.PI*2);ctx.fill();ctx.shadowBlur=20;ctx.shadowColor=d.type.color;ctx.fillStyle=d.type.color;ctx.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,r=i%2?d.r*.62:d.r,x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#06101a';ctx.font='900 15px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.type.icon,0,1);ctx.restore()}
    const active=TEMP_POWERUPS.filter(p=>state.activePowerups[p.id]>0);if(active.length){ctx.save();ctx.font='800 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const gap=10,width=118,total=active.length*width+(active.length-1)*gap,start=state.w/2-total/2;active.forEach((p,i)=>{const x=start+i*(width+gap),y=state.h-37,sec=Math.ceil(state.activePowerups[p.id]);ctx.fillStyle='rgba(4,10,22,.72)';ctx.strokeStyle=hexAlpha(p.color,.42);ctx.lineWidth=1;roundRectPath(x,y,width,26,9);ctx.fill();ctx.stroke();ctx.fillStyle=p.color;ctx.fillText(`${p.icon} ${t(p.nameKey)} ${sec}s`,x+width/2,y+13)});ctx.restore()}
  }
  function roundRectPath(x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}

  function nextWave(){state.wave++;state.waveClock=0;state.score+=state.wave*35;updateQuestStat('wave',state.wave);updateQuestStat('score',Math.floor(state.score));if(player.waveGuard<900&&state.wave%player.waveGuard===0)player.shield=Math.min(4,player.shield+1);state.bannerText=state.wave%5===0?t('bossIncoming',{wave:state.wave}):t('waveIncoming',{wave:state.wave});state.bannerClock=2;if(state.wave%5===0)spawnBoss();showUpgrades();updateHUD()}
  function showUpgrades(){if(state.mode!=='game')return;state.mode='upgrade';window.PlatformBridge?.gameplayStop?.();ui.upgradeChoices.innerHTML='';const pool=[...upgrades].sort(()=>Math.random()-.5).slice(0,3);pool.forEach(up=>{const rarity=weightedPick(UPGRADE_RARITIES),copy=up[lang]||up.ru,btn=document.createElement('button');btn.className=`upgrade-card rarity-${rarity.id}`;const powerLabel=rarity.power.toFixed(rarity.power%1?1:0);btn.innerHTML=`<span class="upgrade-icon">${up.icon}</span><h3>${copy[0]}</h3><p>${copy[1]}</p><span class="rarity-label">${t(RARITY[rarity.id].key)} · ${t('rarityPower',{power:powerLabel})}</span>`;btn.addEventListener('click',()=>{up.apply(rarity.power);panels.upgrade.classList.add('hidden');state.mode='game';updateHUD();sound.tone(rarity.id==='legendary'?980:720,.14,'sine',.038);window.PlatformBridge?.gameplayStart?.()},{once:true});ui.upgradeChoices.appendChild(btn)});panels.upgrade.classList.remove('hidden')}

  async function finishGame(){if(state.mode==='game')window.PlatformBridge?.gameplayStop?.();updateQuestStat('games',1,{mode:'add'});updateQuestStat('score',Math.floor(state.score));updateQuestStat('wave',state.wave);state.mode='gameover';hud.classList.add('hidden');const final=Math.max(0,Math.floor(state.score)),isRecord=final>progress.bestScore;if(isRecord)progress.bestScore=final;progress.gamesPlayed++;progress.coins+=Math.min(120,20+Math.floor(state.wave*4));saveProgress();ui.finalScore.textContent=formatScore(final);ui.finalWave.textContent=state.wave;ui.finalKills.textContent=state.kills;ui.finalCombo.textContent=`×${Math.max(1,state.bestCombo)}`;ui.newRecord.classList.toggle('hidden',!isRecord);ui.rankLine.textContent=window.PlatformBridge?.authorized?'…':t('noRank');showPanel('gameover');if(window.PlatformBridge?.authorized){if(isRecord)await window.PlatformBridge.submitScore(final*LEADERBOARD_SCORE_SCALE,{wave:state.wave,kills:state.kills,durationMs:Math.round(state.gameTime*1000)});const entry=await window.PlatformBridge.getPlayerEntry();ui.rankLine.textContent=entry?.rank?t('rank',{rank:entry.rank}):''}}
  function updateHUD(){hudScore.textContent=formatScore(state.score);hudWave.textContent=state.wave;hudCombo.textContent=`×${Math.min(10,1+Math.floor(state.combo/3))}`;hpBar.innerHTML='';for(let i=0;i<player.maxHp;i++){const pip=document.createElement('span');pip.className=`hp-pip${i>=player.hp?' empty':''}`;hpBar.appendChild(pip)}if(player.shield>0)hpBar.title=`Shield: ${player.shield}`}

  function update(dt){if(state.mode!=='game')return;state.gameTime+=dt;state.waveClock+=dt;state.spawnClock-=dt;state.shootClock-=dt;state.comboClock+=dt;state.bannerClock=Math.max(0,state.bannerClock-dt);state.flash=Math.max(0,state.flash-dt);state.cameraShake*=Math.pow(.04,dt);player.invuln=Math.max(0,player.invuln-dt);updateTempPowerups(dt);if(state.waveClock>=state.waveLength){nextWave();return}const dir=playerDirection();const tempSpeed=state.activePowerups.speed>0?1.38:1;player.x=clamp(player.x+dir.x*player.speed*tempSpeed*dt,player.r+8,state.w-player.r-8);player.y=clamp(player.y+dir.y*player.speed*tempSpeed*dt,player.r+8,state.h-player.r-8);if(Math.abs(dir.x)+Math.abs(dir.y)>.05&&Math.random()<.8)player.trail.push({x:player.x,y:player.y,life:.28});player.trail.forEach(p=>p.life-=dt);player.trail=player.trail.filter(p=>p.life>0);const maxEnemies=Math.min(74,12+Math.floor(state.wave*3.15));if(state.spawnClock<=0&&state.enemies.length<maxEnemies){spawnEnemy();state.spawnClock=Math.max(.16,.76-state.wave*.032)*rand(.72,1.22)}if(state.shootClock<=0&&state.enemies.length){shoot();state.shootClock=player.fireRate}for(const e of state.enemies)updateEnemy(e,dt);updateProjectiles(dt);updateParticles(dt);if(state.combo>0&&state.comboClock>state.comboGrace){state.combo=0;updateHUD()}}
  function updateEnemy(e,dt){
    e.age+=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.dashClock-=dt;e.shootClock-=dt;e.summonClock-=dt;
    let dx=player.x-e.x,dy=player.y-e.y,len=Math.max(1,Math.hypot(dx,dy));dx/=len;dy/=len;
    if(e.type==='dasher'){
      if(e.dashTime>0){e.dashTime-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt}else{e.x+=dx*e.speed*dt;e.y+=dy*e.speed*dt;if(e.dashClock<=0){e.vx=dx*350;e.vy=dy*350;e.dashTime=.29;e.dashClock=rand(1.35,2.15)}}
    }else if(e.type==='shooter'){
      const targetRange=260,move=len>targetRange+30?1:len<targetRange-50?-1:0,px=-dy*e.orbit,py=dx*e.orbit;e.x+=(dx*move*e.speed+px*28)*dt;e.y+=(dy*move*e.speed+py*28)*dt;if(e.shootClock<=0&&len<430){enemyShoot(e);e.shootClock=Math.max(.86,1.82-state.wave*.03)}
    }else if(e.type==='orbiter'){
      const targetRange=190,move=len>targetRange+28?1:len<targetRange-35?-1:0,px=-dy*e.orbit,py=dx*e.orbit;e.x+=(dx*move*e.speed+px*55)*dt;e.y+=(dy*move*e.speed+py*55)*dt;if(e.shootClock<=0&&len<390){enemyShoot(e,2,175,.16,'#ffb45b');e.shootClock=1.75}
    }else if(e.type==='sniper'){
      const targetRange=350,move=len>targetRange+45?1:len<targetRange-65?-1:0,px=-dy*e.orbit,py=dx*e.orbit;e.x+=(dx*move*e.speed+px*14)*dt;e.y+=(dy*move*e.speed+py*14)*dt;if(e.shootClock<=0&&len<540){enemyShoot(e,1,285,.1,'#ff91d7');e.shootClock=2.35}
    }else if(e.type==='spinner'){
      const targetRange=235,move=len>targetRange+35?1:len<targetRange-45?-1:0,px=-dy*e.orbit,py=dx*e.orbit;e.x+=(dx*move*e.speed+px*38)*dt;e.y+=(dy*move*e.speed+py*38)*dt;if(e.shootClock<=0&&len<410){radialEnemyShoot(e,6,132,e.age*.72,'#d487ff');e.shootClock=2.65}
    }else if(e.type==='boss'){
      const px=-dy*e.orbit,py=dx*e.orbit;
      if(e.bossKind==='spiral'){
        e.x+=(dx*e.speed*.58+px*38)*dt;e.y+=(dy*e.speed*.58+py*38)*dt;if(e.shootClock<=0){radialEnemyShoot(e,10,138,e.age*.85,'#c476ff');e.shootClock=1.62}
      }else if(e.bossKind==='charger'){
        if(e.dashTime>0){e.dashTime-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt}else{e.x+=(dx*e.speed+px*8)*dt;e.y+=(dy*e.speed+py*8)*dt;if(e.dashClock<=0){e.vx=dx*430;e.vy=dy*430;e.dashTime=.42;e.dashClock=2.25}}if(e.shootClock<=0){enemyShoot(e,3,205,.2,'#ff9b58');e.shootClock=2.05}
      }else if(e.bossKind==='summoner'){
        const targetRange=260,move=len>targetRange+35?1:len<targetRange-45?-1:0;e.x+=(dx*move*e.speed+px*31)*dt;e.y+=(dy*move*e.speed+py*31)*dt;if(e.shootClock<=0){enemyShoot(e,3,178,.24,'#ff5bcf');e.shootClock=1.9}if(e.summonClock<=0&&state.enemies.length<68){for(let i=0;i<3;i++)spawnEnemy('minion',{x:e.x+Math.cos(i*Math.PI*2/3)*55,y:e.y+Math.sin(i*Math.PI*2/3)*55});e.summonClock=4.25}
      }else{
        e.x+=(dx*e.speed+px*24)*dt;e.y+=(dy*e.speed+py*24)*dt;if(e.shootClock<=0){enemyShoot(e,5,188,.22,'#ff5be7');e.shootClock=1.42}
      }
    }else{e.x+=dx*e.speed*dt;e.y+=dy*e.speed*dt}
    if(dist2(e.x,e.y,player.x,player.y)<(e.r+player.r)**2)damagePlayer(e.type==='boss'?2:1)
  }
  function updateProjectiles(dt){for(let i=state.projectiles.length-1;i>=0;i--){const p=state.projectiles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0||p.x<-80||p.x>state.w+80||p.y<-80||p.y>state.h+80){state.projectiles.splice(i,1);continue}if(p.enemy){if(dist2(p.x,p.y,player.x,player.y)<(p.r+player.r)**2){damagePlayer(p.damage||1);state.projectiles.splice(i,1)}continue}for(let j=state.enemies.length-1;j>=0;j--){const e=state.enemies[j];if(p.hit.has(e)||dist2(p.x,p.y,e.x,e.y)>=(p.r+e.r)**2)continue;p.hit.add(e);e.hp-=p.damage;e.hitFlash=.1;if(e.hp<=0){state.enemies.splice(j,1);killEnemy(e)}if(p.pierce>0)p.pierce--;else{state.projectiles.splice(i,1);break}}}}
  function updateParticles(dt){for(const p of state.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.05,dt);p.vy*=Math.pow(.05,dt)}state.particles=state.particles.filter(p=>p.life>0)}

  function draw(now){const w=state.w,h=state.h,shakeX=state.cameraShake>.2?rand(-state.cameraShake,state.cameraShake):0,shakeY=state.cameraShake>.2?rand(-state.cameraShake,state.cameraShake):0;ctx.save();ctx.translate(shakeX,shakeY);if(['game','upgrade','pause','gameover'].includes(state.mode))drawWaveBackground(now);else drawMenuBackground(now);drawCosmeticArenaEffect(now);if(['game','upgrade','pause','gameover'].includes(state.mode)){drawArenaBorder();drawParticles();drawTempPowerups(now);drawPlayerTrail();drawProjectiles(now);drawEnemies(now);drawPlayer(now);if(state.joystick.active&&state.mode==='game')drawJoystick();drawWaveProgress();if(state.bannerClock>0&&state.mode==='game')drawBanner()}else drawMenuAmbient(now);if(state.flash>0){ctx.fillStyle=`rgba(255,80,110,${state.flash*.45})`;ctx.fillRect(0,0,w,h)}ctx.restore()}
  function drawMenuBackground(now){const w=state.w,h=state.h;const cycle=ARENA_THEMES.length,phase=(now*.000045)%cycle,idx=Math.floor(phase),next=(idx+1)%cycle,mix=phase-idx,a=ARENA_THEMES[idx],b=ARENA_THEMES[next];const bg1=ctx.createRadialGradient(w*.35,h*.32,30,w*.35,h*.32,Math.max(w,h)*.72);bg1.addColorStop(0,a.inner);bg1.addColorStop(.45,a.mid);bg1.addColorStop(1,a.outer);ctx.fillStyle=bg1;ctx.fillRect(-30,-30,w+60,h+60);ctx.save();ctx.globalAlpha=.58*mix;const bg2=ctx.createRadialGradient(w*.68,h*.42,30,w*.68,h*.42,Math.max(w,h)*.82);bg2.addColorStop(0,b.inner);bg2.addColorStop(.45,b.mid);bg2.addColorStop(1,b.outer);ctx.fillStyle=bg2;ctx.fillRect(-30,-30,w+60,h+60);ctx.restore();drawStars(now);ctx.strokeStyle=hexAlpha(a.inner,.07);ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(w*.5,h*.5,120+i*90+Math.sin(now*.0012+i)*8,0,Math.PI*2);ctx.stroke()}ctx.strokeStyle=hexAlpha(b.inner,.05+.03*mix);ctx.lineWidth=1.25;for(let i=0;i<6;i++){const y=h*(i+1)/7;ctx.beginPath();for(let x=0;x<=w;x+=26){const yy=y+Math.sin(x*.012+now*.0016+i)*((i%2?18:12)+mix*6);x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke()}ctx.save();ctx.globalAlpha=.42;drawGrid(now);ctx.restore()}
  function drawWaveBackground(now){
    const current=(Math.max(1,state.wave)-1)%ARENA_THEMES.length;
    const prev=(current-1+ARENA_THEMES.length)%ARENA_THEMES.length;
    const mix=state.wave<=1?1:clamp(state.waveClock/1.25,0,1);
    if(mix<1)drawArenaTheme(ARENA_THEMES[prev],now,1);
    drawArenaTheme(ARENA_THEMES[current],now,mix);
    if(state.wave%5===0){
      const pulse=.045+.025*(.5+.5*Math.sin(now*.004));ctx.fillStyle=`rgba(255,55,135,${pulse})`;ctx.fillRect(0,0,state.w,state.h);
      ctx.strokeStyle=`rgba(255,91,231,${.10+.05*Math.sin(now*.006)})`;ctx.lineWidth=2;const r=70+((now*.045)%180);ctx.beginPath();ctx.arc(state.w/2,state.h/2,r,0,Math.PI*2);ctx.stroke();
    }
  }
  function drawArenaTheme(theme,now,alpha=1){
    if(alpha<=0)return;const w=state.w,h=state.h;ctx.save();ctx.globalAlpha=alpha;
    const bg=ctx.createRadialGradient(w*.5,h*.43,18,w*.5,h*.48,Math.max(w,h)*.82);bg.addColorStop(0,theme.inner);bg.addColorStop(.48,theme.mid);bg.addColorStop(1,theme.outer);ctx.fillStyle=bg;ctx.fillRect(-30,-30,w+60,h+60);
    const accent=theme.accent;
    if(theme.pattern==='grid'){
      const size=46,drift=(now*.009)%size;ctx.strokeStyle=`rgba(${accent},.075)`;ctx.lineWidth=1;ctx.beginPath();for(let x=-size+drift;x<w+size;x+=size){ctx.moveTo(x,0);ctx.lineTo(x,h)}for(let y=-size+drift*.55;y<h+size;y+=size){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke();
    }else if(theme.pattern==='nebula'){
      for(let i=0;i<4;i++){const x=w*(.18+i*.23)+Math.sin(now*.00035+i)*45,y=h*(.30+(i%2)*.32)+Math.cos(now*.00028+i)*35,g=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.28);g.addColorStop(0,`rgba(${accent},${.075-i*.008})`);g.addColorStop(1,`rgba(${accent},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}drawStars(now);
    }else if(theme.pattern==='circuit'){
      ctx.strokeStyle=`rgba(${accent},.085)`;ctx.lineWidth=1;const step=64,shift=(now*.012)%step;ctx.beginPath();for(let y=28;y<h;y+=step){ctx.moveTo(-step+shift,y);for(let x=-step+shift;x<w+step;x+=step){ctx.lineTo(x+step*.55,y);ctx.lineTo(x+step*.55,y+((Math.floor(y/step)%2)?12:-12));ctx.lineTo(x+step,y+((Math.floor(y/step)%2)?12:-12))}}ctx.stroke();
    }else if(theme.pattern==='rift'){
      ctx.lineWidth=2;for(let i=-3;i<11;i++){const x=(i*150+(now*.025)%150)-180;ctx.strokeStyle=`rgba(${accent},${.035+(i%3)*.012})`;ctx.beginPath();ctx.moveTo(x,h+40);ctx.lineTo(x+220,-40);ctx.stroke()}
    }else if(theme.pattern==='space'){
      drawStars(now);ctx.strokeStyle=`rgba(${accent},.06)`;ctx.lineWidth=1;for(let i=0;i<5;i++){const y=(h*(i+1)/6)+Math.sin(now*.0008+i)*18;ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(w*.5,y+35*Math.sin(now*.001+i),w,y);ctx.stroke()}
    }else if(theme.pattern==='rings'){
      ctx.strokeStyle=`rgba(${accent},.075)`;ctx.lineWidth=1.2;const pulse=(now*.035)%92;for(let r=40-pulse;r<Math.max(w,h);r+=92){if(r>0){ctx.beginPath();ctx.arc(w*.5,h*.5,r,0,Math.PI*2);ctx.stroke()}}
    }else if(theme.pattern==='stream'){
      ctx.strokeStyle=`rgba(${accent},.07)`;ctx.lineWidth=1.2;for(let i=0;i<9;i++){const y=h*(i+1)/10,amp=14+i%3*5;ctx.beginPath();for(let x=0;x<=w;x+=32){const yy=y+Math.sin(x*.012+now*.0018+i)*amp;x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke()}
    }else if(theme.pattern==='hex'){
      ctx.strokeStyle=`rgba(${accent},.065)`;ctx.lineWidth=1;const r=28,rowH=Math.sqrt(3)*r;for(let row=-1;row<h/rowH+2;row++){for(let col=-1;col<w/(r*3)+2;col++){const cx=col*r*3+(row%2?1.5*r:0)+((now*.006)%(r*3)),cy=row*rowH;ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke()}}}
    ctx.restore();
  }
  function drawCosmeticArenaEffect(now){
    const skin=selectedSkin(),bullet=selectedBullet(),trail=selectedTrail();if(!skin.effect&&!bullet.effect&&!trail.effect)return;ctx.save();ctx.globalCompositeOperation='screen';
    if(skin.effect==='aurora'){const g=ctx.createLinearGradient(0,0,state.w,state.h);g.addColorStop(0,`hsla(${(now*.018)%360},80%,55%,.018)`);g.addColorStop(.5,`hsla(${(now*.018+90)%360},85%,60%,.045)`);g.addColorStop(1,`hsla(${(now*.018+180)%360},80%,55%,.018)`);ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h)}
    if(skin.effect==='glitch'){ctx.fillStyle='rgba(255,91,231,.025)';for(let i=0;i<5;i++){const y=(now*.08+i*137)%state.h;ctx.fillRect(0,y,state.w,1+(i%2))}}
    if(skin.effect==='prism'||bullet.effect==='rainbow'){const g=ctx.createLinearGradient(0,0,state.w,state.h);g.addColorStop(0,`hsla(${(now*.03)%360},90%,60%,.035)`);g.addColorStop(.5,`hsla(${(now*.03+120)%360},90%,60%,.05)`);g.addColorStop(1,`hsla(${(now*.03+240)%360},90%,60%,.035)`);ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h)}
    if(skin.effect==='nova'||bullet.effect==='gravity'){ctx.strokeStyle='rgba(255,211,106,.06)';ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(state.w/2,state.h/2,120+i*85+Math.sin(now*.001+i)*10,0,Math.PI*2);ctx.stroke()}}
    if(skin.effect==='eclipse'){const g=ctx.createRadialGradient(state.w/2,state.h/2,80,state.w/2,state.h/2,Math.max(state.w,state.h)*.7);g.addColorStop(0,'rgba(105,246,255,.025)');g.addColorStop(.55,'rgba(91,71,255,.025)');g.addColorStop(1,'rgba(0,0,0,.18)');ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h)}
    if(bullet.effect==='echo'){ctx.strokeStyle='rgba(191,117,255,.045)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(player.x,player.y,55+i*25+Math.sin(now*.004+i)*5,0,Math.PI*2);ctx.stroke()}}
    if(bullet.effect==='chronos'){ctx.strokeStyle='rgba(185,255,246,.055)';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(state.w/2,state.h/2,95+i*120,(now*.0004)+i,(now*.0004)+i+Math.PI*1.35);ctx.stroke()}}
    if(skin.effect==='nebula' || trail.effect==='stardust'){for(let i=0;i<22;i++){const x=(i*157+now*.02)%state.w,y=(i*79+now*.015)%state.h;ctx.fillStyle='rgba(255,255,255,.045)';ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill()}}
    if(skin.effect==='tempest' || bullet.effect==='helix'){ctx.strokeStyle='rgba(99,168,255,.06)';ctx.lineWidth=1.2;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(player.x,player.y,38+i*16+Math.sin(now*.006+i)*3,0,Math.PI*2);ctx.stroke()}}
    if(trail.effect==='prismtrail'){const g=ctx.createLinearGradient(0,state.h, state.w,0);g.addColorStop(0,'rgba(255,91,231,.03)');g.addColorStop(.5,'rgba(105,246,255,.025)');g.addColorStop(1,'rgba(255,211,106,.03)');ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h)}
    if(skin.effect==='quantum'||skin.effect==='astral'||trail.effect==='galaxytrail'||trail.effect==='cosmicroyal'){const g=ctx.createRadialGradient(player.x,player.y,20,player.x,player.y,220);g.addColorStop(0,'rgba(105,246,255,.035)');g.addColorStop(.45,'rgba(255,130,248,.025)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,state.w,state.h)}
    if(skin.effect==='phoenix'||trail.effect==='solartrail'){ctx.fillStyle='rgba(255,105,90,.035)';for(let i=0;i<5;i++){const a=now*.001+i*1.2,x=player.x+Math.cos(a)*(70+i*12),y=player.y+Math.sin(a)*(35+i*8);ctx.beginPath();ctx.arc(x,y,2+i*.4,0,Math.PI*2);ctx.fill()}}
    ctx.restore();
  }
  function drawGrid(now){const size=48,drift=(now*.008)%size;ctx.strokeStyle='rgba(91,150,255,.055)';ctx.lineWidth=1;ctx.beginPath();for(let x=-size+drift;x<state.w+size;x+=size){ctx.moveTo(x,0);ctx.lineTo(x,state.h)}for(let y=-size+drift*.55;y<state.h+size;y+=size){ctx.moveTo(0,y);ctx.lineTo(state.w,y)}ctx.stroke()}
  function drawStars(now){for(const s of state.stars){const a=s.a*(.7+.3*Math.sin(now*.002+s.p));ctx.fillStyle=`rgba(170,225,255,${a})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}}
  function drawArenaBorder(){ctx.strokeStyle='rgba(105,246,255,.14)';ctx.lineWidth=2;ctx.strokeRect(7,7,state.w-14,state.h-14)}
  function drawMenuAmbient(now){const cx=state.w*.5,cy=state.h*.46;for(let i=0;i<7;i++){const a=now*.00022*(i%2?1:-1)+i*.88,r=92+i*34,x=cx+Math.cos(a)*r,y=cy+Math.sin(a*.92)*r*.5;ctx.strokeStyle=`rgba(${i%2?'255,91,231':'105,246,255'},${.045+i*.007})`;ctx.lineWidth=1+i*.08;ctx.beginPath();ctx.arc(x,y,16+i*3,0,Math.PI*2);ctx.stroke()}for(let i=0;i<10;i++){const x=(state.w*.18)+(i*state.w*.07)+(Math.sin(now*.00075+i)*18),y=state.h*.22+Math.cos(now*.0009+i*1.7)*26;ctx.fillStyle=i%2?'rgba(255,211,106,.18)':'rgba(105,246,255,.16)';ctx.beginPath();ctx.arc(x,y,1.8+(i%3)*.5,0,Math.PI*2);ctx.fill()}}
  function drawPlayerTrail(){const skin=selectedSkin(),trail=selectedTrail(),boost=trail.rarity==='legendary'?1.72:trail.rarity==='epic'?1.38:trail.rarity==='rare'?1.14:1;for(const p of player.trail){let alpha=p.life*.38*boost;if(skin.effect==='ghost')alpha*=1.55;if(skin.effect==='glitch')alpha*=.95;const t=trail.effect;if(t==='ribbon'){ctx.strokeStyle=hexAlpha(trail.primary,alpha*.95);ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(p.x-10,p.y+4);ctx.quadraticCurveTo(p.x,p.y-5,p.x+9,p.y+3);ctx.stroke()}else if(t==='embers'){ctx.fillStyle=hexAlpha(trail.primary,alpha*.95);ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.34),0,Math.PI*2);ctx.fill();ctx.fillStyle=hexAlpha(trail.secondary,alpha*.65);ctx.beginPath();ctx.arc(p.x+rand(-4,4),p.y+rand(-4,4),Math.max(1,player.r*.18),0,Math.PI*2);ctx.fill()}else if(t==='frost'){ctx.strokeStyle=hexAlpha(trail.primary,alpha*.9);ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.27),0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x-5,p.y);ctx.lineTo(p.x+5,p.y);ctx.moveTo(p.x,p.y-5);ctx.lineTo(p.x,p.y+5);ctx.stroke()}else if(t==='glitchtrail'){ctx.fillStyle=hexAlpha(trail.primary,alpha*.6);ctx.fillRect(p.x-9,p.y-2,18,4);ctx.fillStyle=hexAlpha(trail.secondary,alpha*.5);ctx.fillRect(p.x-5,p.y+4,12,3)}else if(t==='auroratrail'){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,player.r*1.2);g.addColorStop(0,hexAlpha(trail.primary,alpha*.9));g.addColorStop(1,hexAlpha(trail.secondary,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.24),0,Math.PI*2);ctx.fill()}else if(t==='stardust'){ctx.fillStyle=hexAlpha(trail.primary,alpha*.9);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(p.x+Math.cos(i*2.1)*6,p.y+Math.sin(i*2.1)*6,1.6,0,Math.PI*2);ctx.fill()}}else if(t==='prismtrail'){ctx.strokeStyle=`hsla(${(performance.now()*.12+p.x)%360},90%,70%,${clamp(alpha*.9,0,1)})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.26),0,Math.PI*2);ctx.stroke()}else if(t==='solartrail'){ctx.fillStyle=hexAlpha(trail.primary,alpha*.95);ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.28),0,Math.PI*2);ctx.fill();ctx.strokeStyle=hexAlpha(trail.secondary,alpha*.7);ctx.beginPath();ctx.moveTo(p.x-6,p.y);ctx.lineTo(p.x+6,p.y);ctx.moveTo(p.x,p.y-6);ctx.lineTo(p.x,p.y+6);ctx.stroke()}else if(t==='eclipsetrail'){ctx.strokeStyle=hexAlpha(trail.secondary,alpha*.75);ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.23),Math.PI*.2,Math.PI*1.6);ctx.stroke();ctx.fillStyle=hexAlpha('#111318',alpha*.38);ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.34),0,Math.PI*2);ctx.fill()}else if(t==='galaxytrail'){ctx.fillStyle=hexAlpha(trail.primary,alpha);for(let i=0;i<5;i++){const a=i*1.256+p.x*.01,rr=3+i*1.2;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr,1.2+(i%2)*.7,0,Math.PI*2);ctx.fill()}ctx.strokeStyle=hexAlpha(trail.secondary,alpha*.65);ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.25),0,Math.PI*2);ctx.stroke()}else if(t==='lightningtrail'){ctx.strokeStyle=hexAlpha(trail.primary,alpha);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-14,p.y);ctx.lineTo(p.x-8,p.y-5);ctx.lineTo(p.x-3,p.y+4);ctx.lineTo(p.x+4,p.y-3);ctx.lineTo(p.x+10,p.y+1);ctx.stroke()}else if(t==='cosmicroyal'){ctx.strokeStyle=`hsla(${(performance.now()*.08+p.x)%360},95%,75%,${clamp(alpha,0,1)})`;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.22),0,Math.PI*2);ctx.stroke();ctx.fillStyle=hexAlpha('#ffd36a',alpha*.8);ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fill()}else{ctx.fillStyle=hexAlpha(trail.primary||skin.primary,alpha);ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.28),0,Math.PI*2);ctx.fill();if(t==='afterglow' || t==='pulse'){ctx.strokeStyle=hexAlpha(trail.secondary||skin.secondary,alpha*.6);ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.23),0,Math.PI*2);ctx.stroke()}}if(trail.rarity==='epic'){ctx.fillStyle=hexAlpha(trail.secondary,alpha*.28);ctx.beginPath();ctx.arc(p.x+Math.sin(p.x*.08)*4,p.y+Math.cos(p.y*.07)*4,2.1,0,Math.PI*2);ctx.fill()}if(trail.rarity==='legendary'){ctx.strokeStyle=hexAlpha(trail.secondary,alpha*.48);ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(p.x,p.y,player.r*(p.life/.20)+4,0,Math.PI*2);ctx.stroke();ctx.fillStyle=hexAlpha(trail.primary,alpha*.34);for(let k=0;k<2;k++){const a=(p.x+p.y)*.02+k*Math.PI;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*9,p.y+Math.sin(a)*9,1.8,0,Math.PI*2);ctx.fill()}}if(skin.effect==='ghost'){ctx.strokeStyle=hexAlpha(skin.secondary,alpha*.5);ctx.beginPath();ctx.arc(p.x-5,p.y+3,player.r*(p.life/.25),0,Math.PI*2);ctx.stroke()}}}
  function hexAlpha(hex,a){const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${clamp(a,0,1)})`}

  function drawSkinBodyPath(skin, now, radius=player.r){
    const effect=skin.effect||'';
    ctx.beginPath();
    if(effect==='quantum'){
      for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,r=i%2?radius*.82:radius,x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    }else if(effect==='phoenix'){
      const pts=[[0,-radius*1.18],[radius*.48,-radius*.38],[radius*.98,-radius*.12],[radius*.56,radius*.28],[radius*.74,radius*.96],[0,radius*.58],[-radius*.74,radius*.96],[-radius*.56,radius*.28],[-radius*.98,-radius*.12],[-radius*.48,-radius*.38]];
      pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    }else if(effect==='astral'){
      const pts=[[0,-radius*1.22],[radius*.34,-radius*.34],[radius*1.16,0],[radius*.34,radius*.34],[0,radius*1.22],[-radius*.34,radius*.34],[-radius*1.16,0],[-radius*.34,-radius*.34]];
      pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    }else{
      for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,r=i%2?radius*.8:radius,x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    }
    ctx.closePath();
  }
  function drawSkinCorePath(skin, radius=player.r){
    const effect=skin.effect||'';
    ctx.beginPath();
    if(effect==='quantum'){
      for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a)*radius*.38,y=Math.sin(a)*radius*.38;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    }else if(effect==='phoenix'){
      ctx.moveTo(0,-radius*.34);ctx.lineTo(radius*.22,0);ctx.lineTo(0,radius*.38);ctx.lineTo(-radius*.22,0);
    }else if(effect==='astral'){
      for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,r=i%2?radius*.16:radius*.32,x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    }else{ctx.arc(0,0,radius*.36,0,Math.PI*2);return;}
    ctx.closePath();
  }

  function drawPlayer(now){if(player.invuln>0&&Math.floor(now/70)%2===0)return;const skin=selectedSkin();ctx.save();ctx.translate(player.x,player.y);if(skin.effect==='ghost'){ctx.globalAlpha=.18;ctx.fillStyle=skin.secondary;for(const off of [-9,9]){ctx.beginPath();ctx.arc(off,3,player.r*.72,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}if(skin.effect==='royal'){ctx.strokeStyle='rgba(255,211,106,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,player.r+8,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){const a=now*.0025+i*Math.PI/2;ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.arc(Math.cos(a)*(player.r+11),Math.sin(a)*(player.r+11),1.8,0,Math.PI*2);ctx.fill()}}if(skin.effect==='glitch'){ctx.strokeStyle=`hsla(${(now*.11)%360},90%,70%,.75)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-player.r-5,-5);ctx.lineTo(player.r+6,-5);ctx.stroke();ctx.strokeStyle='rgba(105,246,255,.65)';ctx.beginPath();ctx.moveTo(-player.r-2,6);ctx.lineTo(player.r+4,6);ctx.stroke()}if(skin.effect==='aurora'){ctx.strokeStyle=`hsla(${(now*.05)%360},80%,72%,.75)`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,player.r+8+Math.sin(now*.006)*2,0,Math.PI*2);ctx.stroke()}if(skin.effect==='nova'){for(let i=0;i<3;i++){const a=now*.003+i*Math.PI*2/3;ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.arc(Math.cos(a)*(player.r+10),Math.sin(a)*(player.r+10),2.2,0,Math.PI*2);ctx.fill()}}if(skin.effect==='prism'){ctx.strokeStyle=`hsl(${(now*.09)%360},90%,70%)`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,player.r+7,0,Math.PI*2);ctx.stroke()}if(skin.effect==='eclipse'){ctx.strokeStyle='rgba(130,110,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,player.r+10,now*.002,now*.002+Math.PI*1.45);ctx.stroke();ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.arc(0,0,player.r+4,0,Math.PI*2);ctx.fill()}if(skin.effect==='bloom'){for(let i=0;i<6;i++){const a=now*.0018+i*Math.PI/3;ctx.strokeStyle='rgba(255,179,216,.65)';ctx.beginPath();ctx.arc(Math.cos(a)*(player.r+4),Math.sin(a)*(player.r+4),3.1,0,Math.PI*2);ctx.stroke()}}if(skin.effect==='matrix'){ctx.strokeStyle='rgba(140,255,177,.7)';ctx.lineWidth=1.5;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*6,-player.r-8);ctx.lineTo(i*6,player.r+8);ctx.stroke()}}if(skin.effect==='tempest'){ctx.strokeStyle='rgba(99,168,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,player.r+9+Math.sin(now*.01)*1.5,0,Math.PI*2);ctx.stroke();for(let i=0;i<2;i++){const a=now*.004+i*Math.PI;ctx.fillStyle='#b9fff6';ctx.beginPath();ctx.arc(Math.cos(a)*(player.r+11),Math.sin(a)*(player.r+11),2,0,Math.PI*2);ctx.fill()}}if(skin.effect==='nebula'){ctx.strokeStyle='rgba(255,182,255,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,player.r+7,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(122,99,255,.28)';ctx.beginPath();ctx.arc(-5,-3,player.r*.72,0,Math.PI*2);ctx.fill()}if(skin.effect==='quantum'){for(let i=0;i<4;i++){const a=now*.003+i*Math.PI/2;ctx.strokeStyle=i%2?'rgba(255,130,248,.8)':'rgba(167,255,255,.8)';ctx.beginPath();ctx.rect(Math.cos(a)*(player.r+9)-2,Math.sin(a)*(player.r+9)-2,4,4);ctx.stroke()}}if(skin.effect==='phoenix'){for(let i=0;i<5;i++){const a=now*.004+i*1.256;ctx.fillStyle=i%2?'#ff5f77':'#fff0a8';ctx.beginPath();ctx.arc(Math.cos(a)*(player.r+10),Math.sin(a)*(player.r+10),2.2,0,Math.PI*2);ctx.fill()}}if(skin.effect==='astral'){ctx.strokeStyle=`hsla(${(now*.06)%360},90%,78%,.9)`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,player.r+10,now*.002,now*.002+Math.PI*1.7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<3;i++){const a=now*.0025+i*2.1;ctx.beginPath();ctx.arc(Math.cos(a)*(player.r+13),Math.sin(a)*(player.r+13),1.8,0,Math.PI*2);ctx.fill()}}ctx.shadowBlur=22;ctx.shadowColor=skin.secondary;ctx.fillStyle=skin.primary;drawSkinBodyPath(skin,now,player.r);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=skin.core;drawSkinCorePath(skin,player.r);ctx.fill();if(player.shield>0){ctx.strokeStyle=`rgba(140,255,177,${.55+.25*Math.sin(now*.006)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,player.r+8,0,Math.PI*2);ctx.stroke()}if(state.activePowerups.shield>0){ctx.strokeStyle=`rgba(140,255,177,${.72+.22*Math.sin(now*.012)})`;ctx.lineWidth=3;ctx.shadowBlur=16;ctx.shadowColor='#8cffb1';ctx.beginPath();ctx.arc(0,0,player.r+12+Math.sin(now*.008)*2,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0}ctx.restore()}
  function bossColor(kind){return kind==='spiral'?'#b875ff':kind==='charger'?'#ff9a62':kind==='summoner'?'#ff5b9e':'#ff5be7'}
  function drawEnemies(){for(const e of state.enemies){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.age*.45*e.orbit);const boss=e.type==='boss',color=boss?bossColor(e.bossKind):e.type==='shooter'?'#b47cff':e.type==='tank'?'#ff9a6a':e.type==='splitter'?'#ffd36a':e.type==='orbiter'?'#ffb45b':e.type==='sniper'?'#ff91d7':e.type==='spinner'?'#d487ff':'#ff647c';ctx.shadowBlur=boss?28:15;ctx.shadowColor=color;ctx.fillStyle=e.hitFlash>0?'#fff':color;if(boss)bossShapePath(e.bossKind,e.r);else shapePath(e.type,e.r);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#101326';ctx.beginPath();ctx.arc(0,0,Math.max(3,e.r*.28),0,Math.PI*2);ctx.fill();if(e.hp<e.maxHp||boss){const bw=e.r*2.1,pct=clamp(e.hp/e.maxHp,0,1);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-bw/2,e.r+7,bw,3);ctx.fillStyle=boss?color:'#69f6ff';ctx.fillRect(-bw/2,e.r+7,bw*pct,3)}ctx.restore()}}
  function bossShapePath(kind,r){ctx.beginPath();if(kind==='charger'){ctx.moveTo(r,0);ctx.lineTo(-r*.78,r*.76);ctx.lineTo(-r*.48,0);ctx.lineTo(-r*.78,-r*.76);ctx.closePath()}else if(kind==='summoner'){for(let i=0;i<12;i++){const a=-Math.PI/2+i*Math.PI/6,rr=i%2?r*.58:r,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()}else if(kind==='spiral'){polygon(10,r);return}else{polygon(8,r);return}}
  function shapePath(type,r){ctx.beginPath();if(type==='chaser'){ctx.moveTo(0,-r);ctx.lineTo(r,0);ctx.lineTo(0,r);ctx.lineTo(-r,0)}else if(type==='dasher'){ctx.moveTo(r,0);ctx.lineTo(-r*.75,r*.72);ctx.lineTo(-r*.75,-r*.72)}else if(type==='tank'){polygon(6,r);return}else if(type==='shooter')ctx.rect(-r*.8,-r*.8,r*1.6,r*1.6);else if(type==='splitter'){polygon(5,r);return}else if(type==='orbiter'){polygon(4,r);return}else if(type==='sniper'){ctx.moveTo(r,0);ctx.lineTo(-r*.85,r*.55);ctx.lineTo(-r*.35,0);ctx.lineTo(-r*.85,-r*.55)}else if(type==='spinner'){polygon(7,r);return}else ctx.arc(0,0,r,0,Math.PI*2);ctx.closePath()}
  function polygon(n,r){ctx.beginPath();for(let i=0;i<n;i++){const a=-Math.PI/2+i*Math.PI*2/n,x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()}
  function drawProjectiles(now){for(const p of state.projectiles){if(p.enemy){ctx.save();const c=p.color||'#ff78ec';ctx.shadowBlur=12;ctx.shadowColor=c;ctx.fillStyle=c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();continue}const s=BULLET_STYLES.find(x=>x.id===p.styleId)||selectedBullet();ctx.save();ctx.translate(p.x,p.y);const angle=Math.atan2(p.vy,p.vx);ctx.rotate(angle);if(s.effect==='stars'){ctx.strokeStyle='rgba(255,211,106,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-12,-4);ctx.lineTo(-7,1);ctx.moveTo(-12,4);ctx.lineTo(-7,-1);ctx.stroke()}if(s.effect==='wave'){ctx.strokeStyle='rgba(99,168,255,.48)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(-7,0,p.r+4+Math.sin(now*.012)*2,-1.1,1.1);ctx.stroke()}if(s.effect==='echo'){ctx.strokeStyle='rgba(191,117,255,.5)';ctx.lineWidth=1.2;for(let i=1;i<=2;i++){ctx.beginPath();ctx.arc(-i*7,0,Math.max(2,p.r-i),0,Math.PI*2);ctx.stroke()}}if(s.effect==='flare'){ctx.strokeStyle='rgba(255,240,160,.7)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-p.r*2.5,0);ctx.lineTo(p.r*2.5,0);ctx.moveTo(0,-p.r*2);ctx.lineTo(0,p.r*2);ctx.stroke()}if(s.effect==='rainbow'){ctx.strokeStyle=`hsl(${(now*.12+p.x)%360},95%,70%)`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(0,0);ctx.stroke()}if(s.effect==='gravity'){ctx.strokeStyle='rgba(205,165,255,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,p.r+5+Math.sin(now*.01)*2,0,Math.PI*2);ctx.stroke()}if(s.effect==='chronos'){ctx.strokeStyle='rgba(185,255,246,.68)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,p.r+5,now*.006,now*.006+Math.PI*1.35);ctx.stroke()}if(s.effect==='petals'){ctx.strokeStyle='rgba(255,196,220,.65)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-10,-4);ctx.quadraticCurveTo(-5,-9,0,-3);ctx.moveTo(-10,4);ctx.quadraticCurveTo(-5,9,0,3);ctx.stroke()}if(s.effect==='fractal'){ctx.strokeStyle='rgba(169,246,255,.6)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-4,-5);ctx.lineTo(0,0);ctx.lineTo(-4,5);ctx.stroke()}if(s.effect==='helix'){ctx.strokeStyle='rgba(194,255,247,.65)';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(-6,-2,p.r+2,0,Math.PI*2);ctx.arc(-11,2,p.r+2,0,Math.PI*2);ctx.stroke()}if(s.effect==='meteor'){ctx.strokeStyle='rgba(255,214,161,.72)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-4,0);ctx.stroke()}if(s.effect==='celestial'){ctx.strokeStyle='rgba(111,248,255,.85)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(-4,0);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-12,0,1.5,0,Math.PI*2);ctx.fill()}if(s.effect==='dragon'){ctx.strokeStyle='rgba(255,95,119,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(-21,-4);ctx.lineTo(-14,4);ctx.lineTo(-7,-2);ctx.lineTo(0,0);ctx.stroke()}if(s.effect==='voidlance'){ctx.strokeStyle='rgba(162,87,255,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(1,0);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(4,0);ctx.stroke()}ctx.shadowBlur=14;ctx.shadowColor=p.crit?'#8cffb1':s.glow;ctx.fillStyle=p.crit?'#8cffb1':s.primary;drawBulletShape(s.shape,p.r,now);ctx.restore()}}
  function drawBulletShape(shape,r,now){ctx.beginPath();if(shape==='bolt'){ctx.rect(-r*2,-r*.65,r*3.3,r*1.3);ctx.fill()}else if(shape==='diamond'){ctx.rotate(Math.PI/4);ctx.rect(-r,-r,r*2,r*2);ctx.fill()}else if(shape==='needle'){ctx.moveTo(r*2.4,0);ctx.lineTo(-r*1.8,r*.55);ctx.lineTo(-r*1.8,-r*.55);ctx.closePath();ctx.fill()}else if(shape==='spark'){for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.6:r*1.55,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill()}else if(shape==='plasma'){ctx.arc(0,0,r*1.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(-r*1.2,0,r*.65,0,Math.PI*2);ctx.fill()}else if(shape==='hex'){polygon(6,r*1.3);ctx.fill()}else if(shape==='echo'){ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(-r*1.7,0,r*.7,0,Math.PI*2);ctx.fill()}else if(shape==='flare'){for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.55:r*1.8,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill()}else if(shape==='chronos'){ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,r*1.8,0,Math.PI*1.45);ctx.stroke()}else if(shape==='comet'){ctx.arc(0,0,r*1.15,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.35;ctx.fillRect(-r*4,-1.5,r*4,3)}else if(shape==='pulse'){ctx.lineWidth=2.5;ctx.strokeStyle=ctx.fillStyle;ctx.arc(0,0,r*1.55,0,Math.PI*2);ctx.stroke()}else if(shape==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.55:r*1.5,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill()}else if(shape==='wave'){ctx.lineWidth=3;ctx.strokeStyle=ctx.fillStyle;ctx.moveTo(-r*2,0);ctx.quadraticCurveTo(-r, -r*1.2,0,0);ctx.quadraticCurveTo(r,r*1.2,r*2,0);ctx.stroke()}else if(shape==='singularity'){ctx.arc(0,0,r*1.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.globalAlpha=.65;ctx.arc(0,0,r*2,0,Math.PI*1.4);ctx.stroke()}else if(shape==='rainbow'){ctx.arc(0,0,r*1.1,0,Math.PI*2);ctx.fill()}else{ctx.arc(0,0,r,0,Math.PI*2);ctx.fill()}}
  function drawParticles(){for(const p of state.particles){const alpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.kind==='shield'?`rgba(140,255,177,${alpha})`:p.kind==='boss'?`rgba(255,91,231,${alpha})`:p.kind==='damage'?`rgba(255,100,124,${alpha})`:`rgba(105,246,255,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*alpha,0,Math.PI*2);ctx.fill()}}
  function drawWaveProgress(){if(state.mode!=='game')return;const width=Math.min(260,state.w*.42),x=(state.w-width)/2,y=18,pct=clamp(state.waveClock/state.waveLength,0,1);ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(x,y,width,3);ctx.fillStyle='#69f6ff';ctx.fillRect(x,y,width*pct,3)}
  function drawBanner(){const a=clamp(Math.min(state.bannerClock,2-state.bannerClock)*2,0,1);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='800 13px system-ui';ctx.fillStyle='#eefdff';ctx.fillText(state.bannerText,state.w/2,68);ctx.restore()}
  function drawJoystick(){const j=state.joystick,dx=j.x-j.startX,dy=j.y-j.startY,len=Math.hypot(dx,dy),max=48,scale=len>max?max/len:1;ctx.strokeStyle='rgba(105,246,255,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(j.startX,j.startY,50,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(105,246,255,.20)';ctx.beginPath();ctx.arc(j.startX+dx*scale,j.startY+dy*scale,20,0,Math.PI*2);ctx.fill()}
  function loop(now){const dt=Math.min(.033,Math.max(0,(now-state.lastTime)/1000));state.lastTime=now;update(dt);draw(now);requestAnimationFrame(loop)}

  let leaderboardPendingCrystalReward=null;
  function top10CrystalAmount(rank){return TOP10_CRYSTAL_REWARDS[Math.floor(Number(rank)||0)]||0}
  function prepareLeaderboardCrystalReward(rank){
    leaderboardPendingCrystalReward=null;if(!ui.claimLeaderboardCrystalBtn||!ui.leaderboardCrystalRewardText)return;ui.claimLeaderboardCrystalBtn.disabled=true;ui.claimLeaderboardCrystalBtn.textContent=t('claim');
    if(!window.PlatformBridge?.authorized){ui.leaderboardCrystalRewardText.textContent=t('crystalTopRewardAuth');return}
    const amount=top10CrystalAmount(rank),today=localDateKey();if(!amount){ui.leaderboardCrystalRewardText.textContent=t('crystalTopRewardNeed');return}
    if(progress.lastTopCrystalRewardDate===today){ui.leaderboardCrystalRewardText.textContent=t('crystalTopRewardClaimed');ui.claimLeaderboardCrystalBtn.textContent=t('claimed');return}
    leaderboardPendingCrystalReward={rank,amount};ui.leaderboardCrystalRewardText.textContent=t('crystalTopRewardReady',{rank,crystals:amount});ui.claimLeaderboardCrystalBtn.disabled=false;ui.claimLeaderboardCrystalBtn.textContent=t('crystalTopRewardClaim',{crystals:amount})
  }
  async function claimLeaderboardCrystalReward(){
    const pending=leaderboardPendingCrystalReward;if(!pending)return;ui.claimLeaderboardCrystalBtn.disabled=true;
    const result=await window.PlatformBridge?.claimTop10Reward?.();
    if(!result?.ok){showToast(result?.reason==='claimed'?t('crystalTopRewardClaimed'):t('crystalPurchaseFailed'));prepareLeaderboardCrystalReward(pending.rank);return}
    applyAuthoritativeCloud(result.progress);leaderboardPendingCrystalReward=null;ui.claimLeaderboardCrystalBtn.disabled=true;ui.claimLeaderboardCrystalBtn.textContent=t('claimed');ui.leaderboardCrystalRewardText.textContent=t('crystalTopRewardClaimed');showToast(t('crystalTopRewardReceived',{crystals:result.amount||pending.amount}))
  }
  let leaderboardPendingReward=null;
  function leaderboardTier(rank){return LEADERBOARD_TIERS.find(x=>rank>0&&rank<=x.maxRank)||null}
  function isYesterday(previous,today=localDateKey()){const a=dateKeyToDay(previous),b=dateKeyToDay(today);return a!==null&&b!==null&&b-a===1}
  function recordLeaderboardPresence(rank){const today=localDateKey();if(progress.leaderboardSeenDate===today)return;const tier=leaderboardTier(rank);progress.leaderboardHoldStreak=tier?(isYesterday(progress.leaderboardSeenDate,today)?Math.max(1,progress.leaderboardHoldStreak):1):0;progress.leaderboardSeenDate=today;progress.leaderboardSeenRank=Math.max(0,Math.floor(rank||0));saveProgress()}
  function prepareLeaderboardReward(rank){
    leaderboardPendingReward=null;ui.claimLeaderboardRewardBtn.disabled=true;ui.claimLeaderboardRewardBtn.textContent=t('claim');
    if(!window.PlatformBridge?.authorized){ui.leaderboardRewardText.textContent=t('leaderboardRewardsAuth');return}
    const tier=leaderboardTier(rank);if(!tier){ui.leaderboardRewardText.textContent=t('leaderboardRewardsNoEntry');recordLeaderboardPresence(rank||0);return}
    const today=localDateKey(),milestone=!progress.leaderboardMilestones.includes(tier.id)?tier:null;
    const holdEligible=isYesterday(progress.leaderboardSeenDate,today)&&progress.leaderboardSeenRank>0&&progress.leaderboardSeenRank<=1000&&progress.leaderboardHoldClaimDate!==today;
    const holdAmount=holdEligible?tier.hold:0,streak=holdEligible?Math.max(2,progress.leaderboardHoldStreak+1):Math.max(1,progress.leaderboardHoldStreak);
    const total=(milestone?.milestone||0)+holdAmount;
    if(total>0){leaderboardPendingReward={rank,tier,milestone,holdAmount,streak,total};ui.claimLeaderboardRewardBtn.disabled=false;ui.claimLeaderboardRewardBtn.textContent=t('leaderboardRewardClaim',{coins:formatScore(total)});if(milestone&&holdAmount)ui.leaderboardRewardText.textContent=t('leaderboardBothReady',{coins:formatScore(total)});else if(milestone)ui.leaderboardRewardText.textContent=t('leaderboardMilestoneReady',{tier:tier.maxRank,coins:formatScore(milestone.milestone)});else ui.leaderboardRewardText.textContent=t('leaderboardHoldReady',{tier:tier.maxRank,coins:formatScore(holdAmount),streak});return}
    if(progress.leaderboardSeenDate!==today){ui.leaderboardRewardText.textContent=t('leaderboardFirstDay');recordLeaderboardPresence(rank)}else ui.leaderboardRewardText.textContent=t('leaderboardRewardsNone');
  }
  function claimLeaderboardReward(){
    const pending=leaderboardPendingReward;if(!pending)return;const today=localDateKey();progress.coins+=pending.total;
    if(pending.milestone){for(const tier of LEADERBOARD_TIERS)if(tier.maxRank>=pending.milestone.maxRank&&!progress.leaderboardMilestones.includes(tier.id))progress.leaderboardMilestones.push(tier.id)}
    if(pending.holdAmount>0){progress.leaderboardHoldClaimDate=today;progress.leaderboardHoldStreak=pending.streak}else if(!isYesterday(progress.leaderboardSeenDate,today))progress.leaderboardHoldStreak=1;
    progress.leaderboardSeenDate=today;progress.leaderboardSeenRank=pending.rank;leaderboardPendingReward=null;saveProgress();renderShop();ui.claimLeaderboardRewardBtn.disabled=true;ui.claimLeaderboardRewardBtn.textContent=t('claimed');ui.leaderboardRewardText.textContent=t('leaderboardRewardClaimed');showToast(t('leaderboardRewardClaimed'));
  }
  function leaderboardInitial(name){const clean=String(name||t('player')).trim();return (clean[0]||'N').toUpperCase()}
  function podiumPlaceClass(rank){return rank===1?'first':rank===2?'second':'third'}
  function podiumMedal(rank){return rank===1?'♛':rank===2?'◆':'◇'}
  function renderLeaderboardPodium(entries,userRank){
    const top=[1,2,3].map(rank=>entries.find(e=>Number(e.rank)===rank)).filter(Boolean);
    ui.leaderboardPodium.innerHTML='';
    if(!top.length){ui.leaderboardPodium.classList.add('hidden');return}
    const order=[2,1,3];
    order.forEach(rank=>{const entry=top.find(e=>Number(e.rank)===rank);if(!entry)return;const name=entry.player?.publicName||t('player'),card=document.createElement('article');card.className=`podium-card ${podiumPlaceClass(rank)}${Number(userRank)===rank?' me':''}`;card.innerHTML=`<span class="podium-medal">${podiumMedal(rank)}</span><div class="podium-avatar"></div><span class="podium-rank">#${rank}</span><strong class="podium-name"></strong><em>${formatScore(leaderboardVisibleScore(entry.score))} <small>${t('points')}</small></em>${rank===1?`<b>${t('topPlayer')}</b>`:''}`;card.querySelector('.podium-avatar').textContent=leaderboardInitial(name);card.querySelector('.podium-name').textContent=name;ui.leaderboardPodium.appendChild(card)});
    ui.leaderboardPodium.classList.remove('hidden');
  }
  function renderLeaderboardRows(entries,userRank){
    ui.leaderboardList.innerHTML='';
    const seen=new Set();
    entries.filter(e=>Number(e.rank)>3).sort((a,b)=>Number(a.rank)-Number(b.rank)).forEach(entry=>{const rank=Number(entry.rank);if(seen.has(rank))return;seen.add(rank);const row=document.createElement('div');row.className='lb-row'+(rank===Number(userRank)?' me':'');const name=entry.player?.publicName||t('player');row.innerHTML=`<span class="lb-rank"><i>${rank<=10?'◆':'#'}</i>${rank}</span><span class="lb-name-wrap"><span class="lb-avatar"></span><span class="lb-name"></span></span><span class="lb-score">${formatScore(leaderboardVisibleScore(entry.score))}</span>`;row.querySelector('.lb-avatar').textContent=leaderboardInitial(name);row.querySelector('.lb-name').textContent=name;ui.leaderboardList.appendChild(row)});
    ui.leaderboardTableHead.classList.toggle('hidden',!ui.leaderboardList.children.length);
  }
  function renderLeaderboardPlayer(entry){
    if(!entry||!Number(entry.rank)){ui.leaderboardPlayerCard.classList.add('hidden');return}
    ui.leaderboardPlayerRank.textContent=`#${Number(entry.rank)}`;ui.leaderboardPlayerScore.textContent=`${formatScore(Number(entry.score)?leaderboardVisibleScore(entry.score):progress.bestScore)} ${t('points')}`;ui.leaderboardPlayerCard.classList.remove('hidden');
  }
  async function showLeaderboard(){
    state.prevMode=state.mode;if(state.mode==='game')pauseGame(false);state.mode='leaderboard';hud.classList.add('hidden');hideAllPanels();panels.leaderboard.classList.remove('hidden');ui.leaderboardStatus.textContent=t('leaderboardLoading');ui.leaderboardList.innerHTML='';ui.leaderboardPodium.innerHTML='';ui.leaderboardPodium.classList.add('hidden');ui.leaderboardTableHead.classList.add('hidden');ui.leaderboardPlayerCard.classList.add('hidden');ui.leaderboardRewardText.textContent=t('leaderboardRewardsChecking');ui.claimLeaderboardRewardBtn.disabled=true;if(ui.leaderboardCrystalRewardText)ui.leaderboardCrystalRewardText.textContent=t('leaderboardRewardsChecking');if(ui.claimLeaderboardCrystalBtn)ui.claimLeaderboardCrystalBtn.disabled=true;
    const data=await window.PlatformBridge?.getLeaderboard?.();if(!data?.entries){ui.leaderboardStatus.textContent=`${t('leaderboardUnavailable')} ${t('localBest')}: ${formatScore(progress.bestScore)}.`;prepareLeaderboardReward(0);prepareLeaderboardCrystalReward(0);return}
    ui.leaderboardStatus.textContent='';if(!data.entries.length)ui.leaderboardStatus.textContent=t('leaderboardEmpty');renderLeaderboardPodium(data.entries,data.userRank);renderLeaderboardRows(data.entries,data.userRank);
    if(window.PlatformBridge?.authorized){const entry=await window.PlatformBridge.getPlayerEntry();renderLeaderboardPlayer(entry);const rank=Number(entry?.rank)||0;prepareLeaderboardReward(rank);prepareLeaderboardCrystalReward(rank)}else{prepareLeaderboardReward(0);prepareLeaderboardCrystalReward(0)};
  }
  function closeOverlay(panelName){if(panelName)panels[panelName].classList.add('hidden');state.mode='menu';showPanel('menu');refreshProgressUI()}
  async function login(){const result=await window.PlatformBridge.login();if(result.ok){mergeCloud(await window.PlatformBridge.loadCloudProgress());saveProgress();updateAuthUI();showToast(t('authSuccess'));if(progress.bestScore>0)await window.PlatformBridge.submitScore(progress.bestScore*LEADERBOARD_SCORE_SCALE);await loadCrystalCatalog();await recoverCrystalPurchases()}else showToast(t('authCancelled'))}

  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();state.keys.add(e.code);if(e.code==='Escape'&&state.mode==='game')pauseGame(true);else if(e.code==='Escape'&&state.mode==='pause'&&state.manualPause)resumeGame(true)},{passive:false});
  window.addEventListener('keyup',e=>state.keys.delete(e.code));
  canvas.addEventListener('pointerdown',e=>{if(state.mode!=='game')return;state.joystick.active=true;state.joystick.pointerId=e.pointerId;state.joystick.startX=e.clientX;state.joystick.startY=e.clientY;state.joystick.x=e.clientX;state.joystick.y=e.clientY;canvas.setPointerCapture?.(e.pointerId);sound.ensure();e.preventDefault()},{passive:false});
  canvas.addEventListener('pointermove',e=>{if(state.joystick.active&&e.pointerId===state.joystick.pointerId){state.joystick.x=e.clientX;state.joystick.y=e.clientY;e.preventDefault()}},{passive:false});
  const endPointer=e=>{if(e.pointerId===state.joystick.pointerId){state.joystick.active=false;state.joystick.pointerId=null}};canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);
  if(!('PointerEvent' in window)){
    canvas.addEventListener('touchstart',e=>{if(state.mode!=='game'||!e.touches?.length)return;const p=e.touches[0];state.joystick.active=true;state.joystick.pointerId='touch';state.joystick.startX=p.clientX;state.joystick.startY=p.clientY;state.joystick.x=p.clientX;state.joystick.y=p.clientY;sound.ensure();e.preventDefault()},{passive:false});
    canvas.addEventListener('touchmove',e=>{if(!state.joystick.active||!e.touches?.length)return;const p=e.touches[0];state.joystick.x=p.clientX;state.joystick.y=p.clientY;e.preventDefault()},{passive:false});
    const endTouch=e=>{state.joystick.active=false;state.joystick.pointerId=null;e.preventDefault()};canvas.addEventListener('touchend',endTouch,{passive:false});canvas.addEventListener('touchcancel',endTouch,{passive:false});
  }
  document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('selectstart',e=>e.preventDefault());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)platformPause();else if(state.suspendedByPlatform)platformResume();else sound.resume()});window.addEventListener('blur',()=>{if(state.mode==='game')platformPause()});window.addEventListener('focus',()=>{if(state.suspendedByPlatform)platformResume()});window.addEventListener('resize',resize);

  document.getElementById('playBtn').addEventListener('click',startGame);document.getElementById('helpPlayBtn').addEventListener('click',startGame);document.getElementById('leaderboardBtn').addEventListener('click',showLeaderboard);document.getElementById('resultLeaderboardBtn').addEventListener('click',showLeaderboard);document.getElementById('closeLeaderboardBtn').addEventListener('click',()=>closeOverlay('leaderboard'));
  document.getElementById('shopBtn').addEventListener('click',()=>{state.mode='shop';showPanel('shop');renderShop();refreshProgressUI()});document.getElementById('closeShopBtn').addEventListener('click',()=>closeOverlay('shop'));ui.shopPreviewPrev?.addEventListener('click',()=>stepShopPreview(-1));ui.shopPreviewNext?.addEventListener('click',()=>stepShopPreview(1));
  document.getElementById('rewardsBtn').addEventListener('click',()=>{state.mode='rewards';showPanel('rewards');refreshProgressUI()});document.getElementById('closeRewardsBtn').addEventListener('click',()=>closeOverlay('rewards'));
  document.getElementById('helpBtn').addEventListener('click',()=>{state.mode='help';showPanel('help')});document.getElementById('closeHelpBtn').addEventListener('click',()=>closeOverlay('help'));
  document.getElementById('pauseBtn').addEventListener('click',()=>pauseGame(true));document.getElementById('resumeBtn').addEventListener('click',()=>resumeGame(true));document.getElementById('pauseMenuBtn').addEventListener('click',goMenu);document.getElementById('menuBtn').addEventListener('click',goMenu);document.getElementById('retryBtn').addEventListener('click',retryWithAd);ui.loginBtn.addEventListener('click',login);
  ui.claimDailyBtn.addEventListener('click',claimDaily);ui.claimWeeklyBtn.addEventListener('click',claimWeekly);ui.claimAdCreditsBtn.addEventListener('click',claimAdCredits);ui.claimAdCapsuleBtn.addEventListener('click',claimAdCapsule);ui.claimQuestBonusBtn?.addEventListener('click',claimQuestBonus);ui.claimLeaderboardRewardBtn?.addEventListener('click',claimLeaderboardReward);ui.claimLeaderboardCrystalBtn?.addEventListener('click',claimLeaderboardCrystalReward);ui.claimAdCrystalsBtn?.addEventListener('click',claimAdCrystals);
  ui.capsuleCloseBtn?.addEventListener('click',closeCapsule);

  const withTimeout=(promise,ms,fallback)=>Promise.race([Promise.resolve(promise).catch(()=>fallback),new Promise(resolve=>setTimeout(()=>resolve(fallback),ms))]);
  function finishBoot(){state.mode='menu';showPanel('menu');ui.bootOverlay?.classList.add('hidden');window.PlatformBridge?.ready?.();refreshProgressUI()}
  async function bootstrap(){
    resize();requestAnimationFrame(loop);window.PlatformBridge?.setCallbacks?.({pause:platformPause,resume:platformResume});
    await withTimeout(window.PlatformBridge?.init?.(),10000,null);lang=window.PlatformBridge?.language||lang;applyLanguage();
    if(ui.bootText)ui.bootText.textContent=lang==='ru'?'Синхронизация прогресса…':'Syncing progress…';
    if(window.PlatformBridge?.authorized){const cloud=await withTimeout(window.PlatformBridge.loadCloudProgress(),8000,null);mergeCloud(cloud)}
    persistLocalProgress();
    if(window.PlatformBridge?.authorized)await withTimeout(window.PlatformBridge.saveCloudProgress(progress),5000,false);
    if(ui.bootText)ui.bootText.textContent=lang==='ru'?'Подготовка магазина…':'Preparing shop…';
    await withTimeout(loadCrystalCatalog(),7000,null);await withTimeout(recoverCrystalPurchases(),8000,null);renderShop();updateAuthUI();finishBoot();setInterval(refreshProgressUI,15000)
  }
  bootstrap().catch(error=>{console.error('[Neon Arena] Bootstrap error:',error);applyLanguage();renderShop();finishBoot()});
})();
