const { chromium } = require('playwright');
const N = Number(process.argv[2] || 3), NAT = process.argv[3] || '';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); const errs = []; p.setDefaultTimeout(6000);
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + __dirname + '/page.html'); await p.waitForTimeout(400);
  const runs = []; const shots = {};
  const snap = async (name) => { if (!shots[name]) { shots[name] = 1; await p.screenshot({ path: __dirname + '/shots/' + name + '.png' }); } };
  for (let r = 0; r < N; r++) {
    if (await p.isVisible('#intro')) { await snap('intro'); await p.click('#startBtn'); }
    else if (await p.$('#newRunBtn')) await p.click('#newRunBtn');
    await p.waitForSelector('#pick:not([hidden])'); await snap('pick');
    const tiles = await p.$$('.ncard');
    const which = NAT ? await p.$(`.ncard[data-c="${NAT}"]`) : tiles[r % tiles.length]; await which.click();
    let guard = 0, pens = 0;
    while (guard++ < 20000) {
      if (process.env.DBG) console.log("step", guard);
      if (guard % 150 === 0) console.log("g", guard, await p.evaluate(() => JSON.stringify({ st: __mn.R && __mn.R.stage, ph: __mn.S && __mn.S.phase, busy: __mn.S && __mn.S.busy, over: __mn.S && __mn.S.over })), await p.evaluate(() => [...document.querySelectorAll("main")].map(m => m.id + ":" + m.hidden).join(" ") + " modal:" + !!document.querySelector(".modal") + " " + (document.querySelector(".modal") ? document.querySelector(".modal").textContent.slice(0, 80) : "")));
      if (await p.isVisible('#road')) {
        await snap('road' + (await p.evaluate(() => __mn.R.over ? 'end' : __mn.R.stage)));
        if (await p.$('#newRunBtn')) break;
        await p.click('#goBtn'); continue;
      }
      if (await p.$('#soBtns button')) { pens++; const bs = await p.$$('#soBtns button'); await snap('shootout'); await bs[Math.floor(Math.random() * 3)].click(); await p.waitForTimeout(20); continue; }
      if (await p.$('.picks .pk')) { await snap('reward'); const cs = await p.$$('.picks .pk'); await cs[Math.floor(Math.random() * cs.length)].click(); await p.waitForTimeout(500); continue; }
      if (await p.$('.pcards .pcd')) { await snap('player'); const cs = await p.$$('.pcards .pcd'); await cs[0].click(); await p.waitForTimeout(100); continue; }
      if (await p.$('.modal .endrow button.go')) { const t = await p.textContent('.modal'); if (/You win|A draw|You lose|Champions/.test(t)) await snap('result'); await p.click('.modal .endrow button.go'); await p.waitForTimeout(20); continue; }
      if (await p.$('.modal')) { await p.waitForTimeout(40); continue; }
      if (!(await p.isVisible('#stage'))) { await p.waitForTimeout(40); continue; }
      const st = await p.evaluate(() => ({ over: __mn.S.over, busy: __mn.S.busy, poss: __mn.S.poss }));
      if (st.busy || st.over) { await p.waitForTimeout(30); continue; }
      await snap(st.poss === 'them' ? 'defend' : 'attack');
      const ok = await p.$$('.hand .card.ok');
      if (ok.length) {
        const c = ok[Math.floor(Math.random() * ok.length)]; await c.click(); await snap('select');
        if (await p.$('#playBtn:not([hidden])')) await p.click('#playBtn'); else await c.click();
      } else await p.click('#endBtn');
      await p.waitForTimeout(20);
    }
    const R = await p.evaluate(() => ({ nat: __mn.R.nat, res: __mn.R.res, champ: __mn.R.champ, outAt: __mn.R.outAt, deck: __mn.R.deck.length, squad: __mn.R.squad, album: __mn.ALBUM.cards.length }));
    R.pens = pens; runs.push(R);
    console.log(R.nat, R.champ ? 'CHAMP' : 'out@' + R.outAt, R.res.filter(Boolean).map(x => x.gf + '-' + x.ga + (x.pens ? `(${x.pens.join('-')})` : '')).join(' '), 'deck', R.deck, 'album', R.album, Object.values(R.squad).map(s => s.pass).join(','));
  }
  console.log('errors', errs.slice(0, 10));
  await b.close();
})();
