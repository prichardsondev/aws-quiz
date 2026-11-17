const { test, expect } = require('@playwright/test');
const bank = require('../backend/services.json').catagory;

for (const mode of ['normal', 'blocked', 'quota', 'corrupt']) {
  test(`${mode}: complete, review, retry, save and filter`, async ({ page }) => {
    const errors = [];
    const requests = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('request', (req) => requests.push(req.url()));
    await page.addInitScript((mode) => {
      if (mode === 'blocked') {
        for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
      } else if (mode === 'quota') {
        Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
      } else if (mode === 'corrupt') {
        localStorage.setItem('awsQuiz:highScores', '{}');
        localStorage.setItem('awsQuiz:savedResults', '[null, {}]');
        sessionStorage.setItem('awsQuiz:retryQuestions', '{broken');
      }
    }, mode);
    await page.goto('/');
    await expect(page.locator('#playBtn')).toBeEnabled();
    if (mode === 'normal') await page.screenshot({ path: 'test-results/desktop-home.png', fullPage: true });
    await page.selectOption('#catagories', 'analytics');
    await page.selectOption('#quizLength', '5');
    await page.click('#playBtn');
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('#questionCounter')).toHaveText(`${i + 1}/5`);
      const question = await page.locator('#question').innerText();
      const raw = bank.analytics.find((q) => q.question === question);
      const choices = await page.locator('.choice-text').allTextContents();
      const correct = choices.indexOf(raw.answer);
      await page.locator('.choice-container').nth(i === 0 ? (correct + 1) % 4 : correct).click();
      await expect(page.locator('#feedback')).toContainText(i === 0 ? 'Not quite' : 'Correct!');
      await page.click('#nextBtn');
    }
    await expect(page.locator('#finalScore')).toHaveText('4 / 5 (80%)');
    await page.click('#reviewBtn');
    await expect(page.locator('.review-item')).toHaveCount(5);
    if (mode === 'normal') await page.screenshot({ path: 'test-results/desktop-review.png', fullPage: true });
    await page.check('#wrongOnly');
    await expect(page.locator('.review-item')).toHaveCount(1);
    await page.click('#backBtn');
    await page.click('#retryMissedBtn');
    await expect(page.locator('#questionCounter')).toHaveText('1/1');
    const question = await page.locator('#question').innerText();
    const raw = bank.analytics.find((q) => q.question === question);
    const choices = await page.locator('.choice-text').allTextContents();
    await page.keyboard.press(String(choices.indexOf(raw.answer) + 1));
    // Correct answers also advance automatically.
    await expect(page.locator('#finalScore')).toHaveText('1 / 1 (100%)');
    await page.fill('#username', 'Student');
    await page.click('#saveScoreBtn');
    await expect(page.locator('#highScoresList')).toContainText('Student');
    await page.selectOption('#scoreFilter', 'analytics');
    await expect(page.locator('.high-score')).toHaveCount(1);
    if (mode === 'blocked' || mode === 'quota') await expect(page.locator('#storageNotice')).toBeVisible();
    expect(errors).toEqual([]);
    expect(requests.every((url) => url.startsWith('http://127.0.0.1:4173/'))).toBeTruthy();
  });
}

test('mobile, short categories, back navigation, direct entries and network retry', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/game.html');
  await expect(page.locator('#playBtn')).toBeEnabled();
  await page.selectOption('#catagories', 'satellite');
  await page.selectOption('#quizLength', 'all');
  await page.click('#playBtn');
  await expect(page.locator('#questionCounter')).toHaveText(`1/${bank.satellite.length}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'test-results/mobile-game.png', fullPage: true });
  await page.goBack();
  await expect(page.locator('#playBtn')).toBeEnabled();
  await page.goto('/end.html');
  await expect(page.locator('#finalScore')).toHaveText('No game played yet');
  await page.route('**/questions.json', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('#loadError')).toBeVisible();
  await page.unroute('**/questions.json');
  await page.click('#retryCategories');
  await expect(page.locator('#playBtn')).toBeEnabled();
});

test('subdirectory hosting, invalid category and corrupt retry recovery', async ({ page }) => {
  await page.route('**/aws-quiz/**', (route) => {
    const pathname = new URL(route.request().url()).pathname.replace('/aws-quiz/', '/');
    return route.continue({ url: `http://127.0.0.1:4173${pathname}` });
  });
  await page.goto('/aws-quiz/index.html');
  await expect(page.locator('#playBtn')).toBeEnabled();
  await page.evaluate(() => {
    localStorage.setItem('awsQuiz:currentCatagory', 'unknown_category');
    sessionStorage.setItem('awsQuiz:retryQuestions', '[{}]');
  });
  await page.goto('/aws-quiz/game.html');
  await expect(page.locator('#loadErrorText')).toContainText('no questions');
  await page.getByRole('link', {name: 'Go Home'}).click();
  await expect(page).toHaveURL(/aws-quiz\/index.html$/);
  await page.click('#playBtn');
  await expect(page.locator('#question')).toBeVisible();
  expect(page.url()).toContain('/aws-quiz/game.html');
});
