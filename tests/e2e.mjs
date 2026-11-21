// End-to-end smoke test for every key BITE flow + a responsive pass.
// Usage:
//   npm run build && npm run preview -- --port 5199
//   npm run test:e2e            (in a second terminal)
// Uses an installed Chrome/Edge/Chromium via playwright-core (no browser download).
// Override with BROWSER_PATH=/path/to/chrome and APP_URL=http://host:port/.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const URL = process.env.APP_URL || 'http://localhost:5199/';
const DEFAULT_BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const executablePath = process.env.BROWSER_PATH || DEFAULT_BROWSERS.find((p) => fs.existsSync(p));
const SHOTS = fileURLToPath(new globalThis.URL('./shots/', import.meta.url));
fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
const log = (...a) => console.log(...a);
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
const shot = (n) => page.screenshot({ path: `${SHOTS}${n}.png` });
const wait = (ms) => page.waitForTimeout(ms);
const step = async (name, fn) => {
  try {
    await fn();
    log('OK  ', name);
  } catch (e) {
    log('FAIL', name, '-', e.message.split('\n')[0]);
    errors.push(`[step ${name}] ${e.message.split('\n')[0]}`);
  }
};

async function audit(label) {
  const r = await page.evaluate(() => {
    const dev = document.getElementById('device').getBoundingClientRect();
    const out = { overflow: [], small: [] };
    const scrollers = (el) => el.closest('.h-scroll, .menu-tabs-scroll, .chips, .overlay');
    document.querySelectorAll('#device *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || el.closest('.sr-only')) return;
      if (!scrollers(el) && r.right > dev.right + 1 && r.left < dev.right)
        out.overflow.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} +${Math.round(r.right - dev.right)}`);
      if (
        el.matches('a, button, input, textarea, [role=switch]') &&
        el.className !== 'skip-link' &&
        !el.matches('.opt input, .co-opt input, .co-pay-opt input')
      ) {
        if (r.height < 36 || r.width < 36)
          out.small.push(
            `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
      }
    });
    const body = document.querySelector('.screen-body');
    if (body && body.scrollWidth > body.clientWidth + 1) out.overflow.push(`screen-body scrollWidth ${body.scrollWidth} > ${body.clientWidth}`);
    out.overflow = [...new Set(out.overflow)].slice(0, 8);
    out.small = [...new Set(out.small)].slice(0, 12);
    return out;
  });
  if (r.overflow.length) log(`  overflow @${label}:`, r.overflow);
  if (r.small.length) log(`  small targets @${label}:`, r.small);
}
const search = () => page.getByLabel('Search restaurants, dishes or categories');
const body = (y) => page.evaluate((y) => document.querySelector('.screen-body').scrollTo(0, y), y);

await page.goto(URL);
await page.evaluate(() => localStorage.clear());
await page.goto(URL);
await wait(800);

await step('onboarding renders', async () => {
  await page.getByRole('heading', { name: 'Discover food near you' }).waitFor();
  await wait(500);
  await shot('01-onboarding-1');
  await audit('onboarding');
});
await step('onboarding next', async () => {
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'Order in a few taps' }).waitFor();
  await wait(500);
  await shot('02-onboarding-2');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'Track your order live' }).waitFor();
  await wait(500);
  await shot('03-onboarding-3');
});
await step('get started', async () => {
  await page.getByRole('button', { name: 'Get started' }).click();
  await page.getByRole('heading', { name: 'What are you craving?' }).waitFor();
  await wait(900);
  await shot('04-home');
  await audit('home');
});
await step('onboarding persisted', async () => {
  const v = await page.evaluate(() => localStorage.getItem('bite.onboarded'));
  if (v !== 'true') throw new Error('not persisted: ' + v);
});
await step('home full scroll', async () => {
  await body(760);
  await wait(500);
  await shot('05-home-scrolled');
  await body(1500);
  await wait(500);
  await shot('05b-home-scrolled');
  await body(0);
});
await step('address sheet', async () => {
  await page.getByRole('button', { name: /Delivery address/ }).click();
  await page.getByRole('dialog', { name: 'Delivery address' }).waitFor();
  await wait(400);
  await shot('06-address-sheet');
  await page.getByRole('button', { name: /^Work/ }).click();
  await wait(400);
  const t = await page.locator('.loc-label').textContent();
  if (!t.includes('Work')) throw new Error(t);
});
await step('notifications', async () => {
  await page.getByRole('link', { name: /Notifications/ }).click();
  await page.getByRole('heading', { name: 'Notifications' }).waitFor();
  await wait(300);
  await shot('07-notifications');
  await audit('notifications');
  await page.getByRole('button', { name: /^Offers/ }).click();
  await wait(200);
  await page.getByRole('button', { name: /Mark all as read/ }).click();
  const u = await page.locator('.ntf.is-unread').count();
  if (u) throw new Error('unread remain ' + u);
  await page.getByRole('button', { name: 'Go back' }).click();
  await page.getByRole('heading', { name: 'What are you craving?' }).waitFor();
});
await step('search', async () => {
  await page.getByRole('link', { name: 'Search', exact: true }).click();
  await page.getByRole('heading', { name: 'Recent searches' }).waitFor();
  await wait(400);
  await shot('08-search-browse');
  await audit('search');
  await search().fill('ramen');
  await wait(300);
  const n = await page.locator('.dish-row').count();
  if (n < 2) throw new Error('ramen dishes ' + n);
  await shot('09-search-ramen');
});
await step('search by restaurant name', async () => {
  await search().fill('taqueria');
  await wait(200);
  if (!(await page.locator('.rrow', { hasText: 'Taquería Sol' }).count())) throw new Error('no taqueria');
});
await step('search by category', async () => {
  await search().fill('desserts');
  await wait(200);
  const n = await page.locator('.dish-row').count();
  if (n < 3) throw new Error('desserts ' + n);
});
await step('search empty state', async () => {
  await search().fill('zzzqx');
  await wait(200);
  await page.getByRole('heading', { name: /No results/ }).waitFor();
  await shot('10-search-empty');
});
await step('filters', async () => {
  await page.getByRole('button', { name: 'Clear search' }).first().click();
  await page.getByRole('button', { name: /^Filters/ }).click();
  const dlg = page.getByRole('dialog', { name: 'Filters' });
  await dlg.waitFor();
  await wait(400);
  await shot('11-filters');
  await dlg.getByRole('button', { name: 'Pizza' }).click();
  await dlg.getByRole('button', { name: '★ 4.5+' }).click();
  await dlg.getByRole('button', { name: 'Under 45 min' }).click();
  await dlg.getByRole('button', { name: 'Moderate' }).click();
  await page.getByRole('button', { name: 'Show results' }).click();
  await wait(400);
  const n = await page.locator('.rrow').count();
  if (n !== 1) throw new Error('expected 1 pizza restaurant, got ' + n);
  await shot('12-filtered');
  await audit('filtered');
  await page.getByRole('button', { name: 'Clear all' }).click();
});
await step('restaurant screen', async () => {
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.locator('.r-card-name a', { hasText: 'Ember & Bun' }).first().click();
  await page.getByRole('heading', { name: 'Ember & Bun', level: 1 }).waitFor();
  await wait(800);
  await shot('13-restaurant');
  await audit('restaurant');
});
await step('menu tabs', async () => {
  await page.getByRole('button', { name: 'Sides', exact: true }).click();
  await wait(900);
  await shot('14-restaurant-sides');
  const active = await page.locator('.menu-tab.is-active').textContent();
  if (active !== 'Sides') throw new Error('active tab ' + active);
});
await step('dish sheet + options', async () => {
  await page.locator('.dish-row-name button', { hasText: 'Classic Ember Burger' }).first().click();
  await page.getByRole('dialog', { name: 'Classic Ember Burger' }).waitFor();
  await wait(500);
  await shot('15-dish-sheet');
  await audit('dish-sheet');
  await page.getByText('Double patty').click();
  await page.getByText('Smoked bacon').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByLabel(/Special instructions/).fill('No pickles please');
  const price = await page.locator('.dish-footer .btn-price').textContent();
  if (price !== '$32.00') throw new Error('price ' + price);
  await page.evaluate(() => document.querySelector('.sheet-body').scrollTo(0, 9999));
  await wait(300);
  await shot('16-dish-sheet-options');
  await page.getByRole('button', { name: /Add to cart/ }).click();
  await wait(500);
});
await step('quick add + cart bar', async () => {
  await page
    .getByRole('button', { name: /Add Shoestring Fries to cart/ })
    .first()
    .click();
  await wait(500);
  await shot('17-restaurant-cartbar');
  const t = await page.locator('.cartbar-count').textContent();
  if (t !== '3') throw new Error('count ' + t);
});
await step('favorite restaurant', async () => {
  await page.getByRole('button', { name: 'Save Ember & Bun to favorites' }).click();
  await wait(200);
});
await step('conflict confirm', async () => {
  await page.goto(URL + '#/restaurant/forno-nove');
  await page.getByRole('heading', { name: 'Forno Nove', level: 1 }).waitFor();
  await wait(400);
  await page
    .getByRole('button', { name: /Add Margherita to cart/ })
    .first()
    .click();
  await page.getByRole('alertdialog').waitFor();
  await wait(300);
  await shot('18-conflict');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await wait(300);
  const c = await page.evaluate(() => JSON.parse(localStorage.getItem('bite.cart')).restaurantId);
  if (c !== 'ember-bun') throw new Error('cart changed ' + c);
});
await step('cart', async () => {
  await page.goto(URL + '#/cart');
  await page.getByRole('heading', { name: 'Your cart' }).waitFor();
  await wait(600);
  await shot('19-cart');
  await audit('cart');
  await page.getByRole('button', { name: 'Increase quantity' }).last().click();
  await page.getByLabel('Promo code').fill('nope');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByText(/isn’t valid/).waitFor();
  await page.getByLabel('Promo code').fill('bite20');
  await page.getByRole('button', { name: 'Apply' }).click();
  await wait(300);
  await body(9999);
  await wait(300);
  await shot('20-cart-promo');
  const d = await page.locator('.summary-row.is-discount dd').textContent();
  if (!d.startsWith('−$')) throw new Error('discount ' + d);
});
await step('cart persisted', async () => {
  await page.reload();
  await page.getByRole('heading', { name: 'Your cart' }).waitFor();
  const n = await page.locator('.cart-item').count();
  if (n !== 2) throw new Error('items ' + n);
});
await step('edit cart item', async () => {
  await page.getByRole('button', { name: 'Edit Classic Ember Burger' }).click();
  await page.getByRole('dialog').waitFor();
  await wait(400);
  const b = await page.locator('.dish-footer .btn-primary span').first().textContent();
  if (b !== 'Update item') throw new Error(b);
  await page.getByRole('button', { name: /Update item/ }).click();
  await wait(500);
});
await step('checkout validation', async () => {
  await page.getByRole('button', { name: /Go to checkout/ }).click();
  await page.getByRole('heading', { name: 'Checkout' }).waitFor();
  await wait(500);
  await shot('21-checkout');
  await audit('checkout');
  await page.getByLabel('Phone number').fill('12');
  await page.getByRole('button', { name: /Place order/ }).click();
  await page.getByText(/valid phone/).waitFor();
  await page.getByLabel('Phone number').fill('+1 555 0134');
});
await step('checkout options', async () => {
  await page.getByText('Schedule', { exact: true }).click();
  await wait(200);
  await page.locator('.co-slots .chip').nth(1).click();
  await page.getByText('Cash', { exact: true }).click();
  await body(700);
  await wait(300);
  await shot('22-checkout-pay');
});
await step('place order', async () => {
  await page.getByRole('button', { name: /Place order/ }).click();
  await page.getByRole('heading', { name: 'Order placed!' }).waitFor({ timeout: 5000 });
  await wait(1300);
  await shot('23-confirmation');
  await audit('confirmation');
});
await step('tracking', async () => {
  await page.getByRole('button', { name: /Track order/ }).click();
  await page.getByRole('heading', { name: /Arriving in|Scheduled for/ }).waitFor();
  await wait(900);
  await shot('24-tracking');
  await audit('tracking');
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Skip to next status' }).click();
    await wait(1800);
  }
  await wait(1500);
  await shot('25-tracking-onway');
  await body(560);
  await wait(300);
  await shot('26-tracking-timeline');
});
await step('tracking contact demo', async () => {
  await page
    .getByRole('button', { name: /^Call / })
    .first()
    .click();
  await wait(300);
});
await step('orders active', async () => {
  await page.goto(URL + '#/orders');
  await page.getByRole('heading', { name: 'Orders' }).waitFor();
  await wait(500);
  await shot('27-orders-active');
  await audit('orders');
});
await step('deliver', async () => {
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem('bite.orders'))[0].id);
  await page.goto(URL + '#/tracking/' + id);
  await page.getByRole('button', { name: 'Skip to next status' }).click();
  await page.getByRole('heading', { name: 'Enjoy your meal!' }).waitFor({ timeout: 6000 });
  await wait(700);
  await shot('28-delivered');
});
await step('orders past + reorder', async () => {
  await page.goto(URL + '#/orders');
  await page.getByRole('tab', { name: /Past orders/ }).click();
  await wait(400);
  await shot('29-orders-past');
  await page.getByRole('button', { name: 'Reorder from Kumo Sushi Bar' }).click();
  await page
    .getByRole('alertdialog')
    .waitFor()
    .catch(() => {});
  if (await page.getByRole('alertdialog').count()) await page.getByRole('button', { name: 'Replace cart' }).click();
  await page.getByRole('heading', { name: 'Your cart' }).waitFor();
  const n = await page.locator('.cart-item').count();
  if (n !== 3) throw new Error('reorder items ' + n);
});
await step('favorites', async () => {
  await page.goto(URL + '#/favorites');
  await page.getByRole('heading', { name: 'Favorites' }).waitFor();
  await wait(600);
  await shot('30-favorites');
  await audit('favorites');
  await page.getByRole('tab', { name: /Dishes/ }).click();
  await wait(500);
  await shot('31-favorites-dishes');
  await page.getByRole('button', { name: 'Add Tiramisù to cart' }).click();
  await page.getByRole('alertdialog').waitFor();
  await page.getByRole('button', { name: 'Start new cart' }).click();
  await wait(300);
  const c = await page.evaluate(() => JSON.parse(localStorage.getItem('bite.cart')).restaurantId);
  if (c !== 'forno-nove') throw new Error('cart ' + c);
  await page.getByRole('button', { name: 'Remove Tiramisù from favorites' }).click();
  await wait(300);
});
await step('favorites empty state', async () => {
  for (const n of ['Spicy Miso Ramen', 'Salmon Power Bowl']) await page.getByRole('button', { name: `Remove ${n} from favorites` }).click();
  await page.getByRole('heading', { name: 'No favorite dishes yet' }).waitFor();
  await shot('32-favorites-empty');
});
await step('profile', async () => {
  await page.goto(URL + '#/profile');
  await page.getByRole('heading', { name: 'Profile' }).waitFor();
  await wait(500);
  await shot('33-profile');
  await audit('profile');
  await page.getByRole('button', { name: /Notification settings/ }).click();
  await page.getByRole('dialog').waitFor();
  await wait(400);
  await page.getByRole('switch', { name: 'Offers & promotions' }).click();
  await shot('34-profile-notif');
  await page.keyboard.press('Escape');
  await wait(350);
  await page.getByRole('button', { name: /Language/ }).click();
  await wait(400);
  await page.getByText('Español').click();
  await page.keyboard.press('Escape');
  await wait(350);
  await page.getByRole('button', { name: /Help & FAQ/ }).click();
  await wait(400);
  await page.getByText('Where is my order?').click();
  await shot('35-help');
  await page.keyboard.press('Escape');
  await wait(350);
});
await step('logout demo', async () => {
  await page.getByRole('button', { name: /Log out/ }).click();
  await page.getByRole('alertdialog').waitFor();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Log out' }).click();
  await page.getByRole('heading', { name: 'Discover food near you' }).waitFor({ timeout: 5000 });
});

log('\nCONSOLE/PAGE ERRORS:', errors.length ? errors : 'none');

// Responsive pass
for (const [w, h] of [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 1366],
  [1440, 900],
]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(URL);
  await p.evaluate(() => localStorage.setItem('bite.onboarded', 'true'));
  await p.reload();
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${SHOTS}w${w}-home.png` });
  const m = await p.evaluate(() => {
    const r = document.getElementById('device').getBoundingClientRect();
    return {
      docOverflow: document.documentElement.scrollWidth > window.innerWidth,
      device: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
    };
  });
  await p.goto(URL + '#/restaurant/kumo');
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${SHOTS}w${w}-restaurant.png` });
  log(`width ${w}: device=${m.device} docOverflow=${m.docOverflow} errors=${errs.length ? errs : 0}`);
  await p.close();
}
await browser.close();
console.log(errors.length ? '\nFAILED' : '\nALL FLOWS PASSED');
process.exit(errors.length ? 1 : 0);
