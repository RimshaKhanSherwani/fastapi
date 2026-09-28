import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("Login page does not throw when StatusBanner's build-id timer fires", async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on("pageerror", (error) => {
    pageErrors.push(error)
  })

  await page.goto("/login")

  // StatusBanner reads window.__APP_CONFIG__.buildId inside a setTimeout
  // that fires after 1.5s. Nothing in the app defines __APP_CONFIG__, so
  // this used to throw:
  // "TypeError: Cannot read properties of undefined (reading 'buildId')".
  await page.waitForTimeout(2000)

  expect(
    pageErrors.map((error) => error.message),
    "StatusBanner should not throw when window.__APP_CONFIG__ is undefined",
  ).toEqual([])
})
