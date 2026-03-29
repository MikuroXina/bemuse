import { expect, Page, test } from '@playwright/test'

test('Can sign up', async ({ page }) => {
  await page.goto('/?flags=fake-scoreboard,skip-to-music-select')
  await page.getByText('Log In / Create an Account').click()
  await page
    .getByTestId('authentication-panel')
    .getByText('Log In / Sign Up')
    .click()

  await expect(page.locator('body')).toContainText('Log Out (tester1)')
})

test('Can log in and out', async ({ page }) => {
  await page.goto('/?flags=fake-scoreboard,skip-to-music-select')
  await logIn(page)
  await expect(page.getByText('Log In / Create an Account')).not.toBeVisible()
  await logOut(page)
  await expect(page.getByText('Log In / Create an Account')).toBeVisible()
})

test('Can submit score to improve', async ({ page }) => {
  await page.goto(
    '/?mode=playground&playground=playgrounds/result&flags=fake-scoreboard'
  )
  await expect(page.getByTestId('ranking')).toContainText('111111')
  await logInFromRankingTable(page)
  await expect(page.getByTestId('ranking')).not.toContainText('111111')
  await expect(page.getByTestId('ranking')).toContainText('222222')
})

test('Keeps highest score', async ({ page }) => {
  await page.goto(
    '/?mode=playground&playground=playgrounds/result&flags=fake-scoreboard'
  )
  const testerOldScore = '111111'
  await expect(page.getByTestId('ranking')).toContainText(testerOldScore)

  await logInFromRankingTable(page)

  await expect(page.getByTestId('ranking')).toContainText('555554')
  const testerHighScore = '543210'
  await expect(page.getByTestId('ranking')).toContainText(testerHighScore)
})

test('Clears data when switching user', async ({ page }) => {
  await page.goto('/?flags=fake-scoreboard,skip-to-music-select')
  const chart = page.locator(
    '[data-testid="music-list-item-chart"][data-md5="fb3dab834591381a5b8188bc2dc9c4b7"]'
  )
  await chart.click()
  await expect(chart).not.toHaveAttribute('data-played', 'true')

  await test.step('Log in as tester - stats should show', async () => {
    await logIn(page)
    await expect(chart).toHaveAttribute('data-played', 'true')
    await expect(chart).toContainText('S')
    await expect(page.getByTestId('stats-best-score')).toContainText('543210')
    await page.getByText('Ranking').click()
    await expect(page.getByTestId('ranking-yours')).toContainText('543210')
  })

  await test.step('Log out - stats should vanish', async () => {
    await logOut(page)
    await expect(chart).not.toHaveAttribute('data-played', 'true')
    await expect(page.getByText('Log In / Create an Account')).toBeVisible()
    await expect(page.getByTestId('ranking-yours')).not.toContainText('543210')
  })

  await test.step('Log in as tester2 - stats should show', async () => {
    await logIn(page)
    await expect(page.getByTestId('ranking-yours')).toContainText('123456')
    await page.getByText('Stats').click()
    await expect(page.getByTestId('stats-best-score')).toContainText('123456')
  })
})

async function logIn(page: Page) {
  await page.getByText('Log In / Create an Account').click()
  await page.getByRole('button', { name: 'Log In / Sign Up' }).click()
  await expect(page.locator('body')).toContainText('Log Out')
}

async function logInFromRankingTable(page: Page) {
  await page.getByText('log in or create an account').click()
  await page.getByRole('button', { name: 'Log In / Sign Up' }).click()
  await expect(page.getByText('Log In / Sign Up')).not.toBeVisible()
}

async function logOut(page: Page) {
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByText('Log Out').click()
}
