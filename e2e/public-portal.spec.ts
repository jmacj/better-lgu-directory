import { expect, test } from '@playwright/test'

test('core public routes are navigable and do not overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Malaybalay public information/i })).toBeVisible()
  await expect(page.locator('.independence-bar .city-clock')).toBeVisible()
  await expect(page.locator('.site-footer .city-clock')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: /Where the money came from/i })).toBeVisible()
  await page.getByRole('link', { name: /Explore transparency/i }).click()
  await expect(page.getByRole('heading', { name: /Public records/i })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('city hall background and detailed finance remain usable', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Next image' })).toHaveCount(0)
  await expect(page.locator('.hero')).toHaveCSS('background-image', /malaybalay-city-hall/)
  await expect(page.getByText('₱1,188,506,575.00')).toBeVisible()
  await page.getByRole('button', { name: /Current operating income/i }).click()
  await expect(page.getByRole('heading', { name: 'Current operating income', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Internal Revenue Allotment/i }).click()
  await expect(page.getByText('86.13%')).toBeVisible()
})

test('leader profiles expose verified contacts and record scope', async ({ page }) => {
  await page.goto('/government')
  const firstDetailsButton = page.getByRole('button', { name: /View verified details/i }).first()
  await firstDetailsButton.click()
  await expect(page.getByText('City Mayor’s Office')).toBeVisible()
  await expect(page.getByRole('link', { name: /0953-459-1777/ })).toHaveAttribute('href', 'tel:09534591777')
  await expect(page.getByText(/mayoral office issuances indexed/i)).toBeVisible()
})

test('procurement sources preserve record scope', async ({ page }) => {
  await page.goto('/transparency')
  await expect(page.getByRole('heading', { name: /Award notices and bidding opportunities/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Infrastructure/i })).toHaveAttribute('href', /infrastructure/)
  await expect(page.getByText(/does not relabel them as awarded projects/i)).toBeVisible()
})

test('directory filters reach emergency contacts', async ({ page }) => {
  await page.goto('/government?tab=hotlines')
  await expect(page.getByText('Bureau of Fire Protection — Malaybalay')).toBeVisible()
  await expect(page.getByRole('link', { name: /0917-677-7700/ })).toHaveAttribute('href', /^tel:/)
})
