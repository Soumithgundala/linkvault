import {test, expect} from '@playwright/test';
test('auth', async({page})=>{
    await page.goto('/');
    const dropDown=page.locator(".dropdown-button")
    await dropDown.click();
    expect(page.locator('.dropdown')).toBeVisible();
    // click on login button
    const loginButton=page.locator(".dropdown-link[href='/login']")
    await loginButton.click();
    // check if url contains login after click
    const currentUrl=page.url();
    expect(currentUrl.includes('/login'));
    // click on email placeholder
    const emailClick= page.locator('.email-input');
    // await emailClick.click();
    // type email
    await emailClick.fill('soumithgundala@gmail.com');
    // click on password placeholder
    const passwordClick= page.locator('.password-input');
    await passwordClick.click();
    // type password    
    await passwordClick.fill('Soumitt@88');
    // click on login button
    const loginButton2=page.locator('.login-button');
    await loginButton2.click();
    // check for url change in page
    expect(currentUrl.includes('/profile'));
    // check if profile contains welcome greeting
    const greetingWelcome= page.locator('[aria-label="welcome-username"]');
    expect(greetingWelcome).toBeTruthy();
    // add profiles in the profile
    const addProfileDropdown=page.locator('.platform-select');
    await addProfileDropdown.click();
    await expect(addProfileDropdown).toContainText('Instagram');
 
});