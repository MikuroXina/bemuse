import { expect, test } from '@playwright/test'

test('Project page', async ({ page }) => {
  await page.goto('/project/')
  await expect(page.getByText('Play now').first()).toBeVisible()
})

test('Colors page', async ({ page }) => {
  await page.goto('/project/docs/colors')
  await expect(page.getByText('Cardinal400').first()).toBeVisible()
})

test('Music page', async ({ page }) => {
  await page.goto('/project/music')
  await expect(page.getByText('Artists Showcase').first()).toBeVisible()
  await expect(page.getByText('Everyday evermore').first()).toBeVisible()
})

test('Loading with service worker', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const registration =
      await window.navigator.serviceWorker.getRegistration('/')
    if (registration.active?.state === 'activated') {
      return
    }
    return window.navigator.serviceWorker.ready
  })

  await page.goto('/project/docs/workflows/')
  await expect(page.getByText('Publishing npm packages').first()).toBeVisible()
})
