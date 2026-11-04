import { expect, test } from '@playwright/test'

test('core public routes are navigable and do not overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Malaybalay public information/i })).toBeVisible()
  await expect(page.getByText(/Malaybalay time/i).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /A real place behind every public record/i })).toBeVisible()
  await page.getByRole('link', { name: /Explore transparency/i }).click()
  await expect(page.getByRole('heading', { name: /Public records/i })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('gallery controls and detailed finance remain usable', async ({ page }) => {
  await page.goto('/')
  const next = page.getByRole('button', { name: 'Next image' })
  await next.click()
  await expect(page.getByRole('heading', { name: 'Agri-ecotourism' })).toBeVisible()
  await expect(page.getByText('₱1,188,506,575.00')).toBeVisible()
})

test('directory filters reach emergency contacts', async ({ page }) => {
  await page.goto('/government?tab=hotlines')
  await expect(page.getByText('Bureau of Fire Protection — Malaybalay')).toBeVisible()
  await expect(page.getByRole('link', { name: /0917-677-7700/ })).toHaveAttribute('href', /^tel:/)
})
