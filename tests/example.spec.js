import { test, expect } from '@playwright/test';

test.describe('Тестовое задание', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://polis812.github.io/vacuu/');
  });


test('Проверка кликабельности логотипа в хедере', async ({ page }) => {
    await page.locator('.main__header__logo').click();
    await expect(page).toHaveURL('https://polis812.github.io/vacuu/');
  }); //Тест будет провален, так как логотип не ведёт куда нужно

  test('Кнопки навигации работают (Блог не реагирует)', async ({ page }) => {
    const buttons = [
      { name: 'Blog' },
      { name: 'Insurance' },
      { name: 'About us' },
      { name: 'Review' },
      { name: 'Contact' },
      { name: 'My account' }
    ];

    for (const button of buttons) {
      console.log(`Проверяем кнопку: ${button.name}`);
      const locator = page.locator(`div.main a:has-text("${button.name}")`);
      await locator.click();
      await page.waitForLoadState('domcontentloaded'); // Ожидаем загрузку контента
      await expect(page).not.toHaveURL(/https:\/\/polis812\.github\.io\/vacuu\/#?/); // Ожидаем переход
      await page.goBack();
    }
  });


    test('Кнопка Get Started ведёт на целевую страницу', async ({ page }) => {
      await page.locator('button:has-text("Get started")').click();
      await expect(page).not.toHaveURL('https://polis812.github.io/vacuu/');
    }); //Тест будет провален, так как кнопка не рабочая

    test('Переключение языка на финский', async ({ page }) => {
      // Ждём появления селектора выбора языка
      await page.waitForSelector('select.header__lang');

      // Выбираем "FIN" в выпадающем списке
      await page.selectOption('select.header__lang', 'FIN');

      // Проверяем смену языка
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('FIN'); // Тест провалится, так как язык не меняется
    });

    test('Кнопки Calculate the price ведут на правильные страницы', async ({ page }) => {
      const buttons = [
        { index: 0, expectedUrl: 'https://polis812.github.io/car' },    // Ведёт на home (баг)
        { index: 1, expectedUrl: 'https://polis812.github.io/home' },
        { index: 2, expectedUrl: 'https://polis812.github.io/travel' },
        { index: 3, expectedUrl: 'https://polis812.github.io/pet' }
      ];

      for (const button of buttons) {
        console.log(`Проверяем кнопку #${button.index + 1}`);
        const locator = page.locator('div.insurance a:has-text("Calculate the price")').nth(button.index);
        await locator.click();
        await expect(page).toHaveURL(button.expectedUrl);
        await page.goBack();
      }
    });


    test('Карусель отзывов листается вправо', async ({ page }) => {
      const nextButton = page.locator('.arrow-right'); // Кнопка прокрутки вперёд
      const firstReview = await page.locator('.review-item').first().textContent();

      await nextButton.click();

      // Ждём, пока первый отзыв изменится
      await expect(page.locator('.review-item').first()).not.toHaveText(firstReview);
    }); //Тест провалится, так как карусель не крутится

    test('Email-форма не пропускает неверные адреса', async ({ page }) => {
      const emailField = page.locator('input[placeholder="Email address"]');
      const submitButton = page.locator('.submit-btn');

      await page.waitForSelector('input[placeholder="Email address"]', { timeout: 5000 });

      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'user name@mail.com',
        'user@domain,com',
        'username@.com'
      ];

      for (const email of invalidEmails) {
        console.log(`Проверяем email: ${email}`);
        await emailField.fill(email);
        await submitButton.click();

        // Ждём появление всплывающего окна с ошибкой
        await expect(page.locator('.swal2-popup')).toBeVisible({ timeout: 5000 });

        // Проверяем, что заголовок ошибки содержит "Error"
        await expect(page.locator('.swal2-title')).toHaveText('Error');

        // Проверяем, что текст ошибки содержит "Wrog email" (как на сайте)
        await expect(page.locator('#swal2-content')).toHaveText('Wrog email');

        // Закрываем модальное окно (кнопка "OK")
        await page.locator('.swal2-confirm').click();
      }
    });

    test('Футер: вкладки Terms, Privacy и Cookies работают', async ({ page }) => {
      const links = [
        { name: 'Terms', expectedUrl: 'https://polis812.github.io/vacuu/terms' },
        { name: 'Privacy', expectedUrl: 'https://polis812.github.io/vacuu/privacy' },
        { name: 'Cookies', expectedUrl: 'https://polis812.github.io/vacuu/cookies' }
      ];

      for (const link of links) {
        console.log(`Проверяем вкладку: ${link.name}`);
        const locator = page.locator(`a:has-text("${link.name}")`);
        await locator.click();
        await expect(page).toHaveURL(link.expectedUrl);
        await page.goBack();
      }
    });

      test('Проверка кликабельности логотипа в футере', async ({ page }) => {
        await page.locator('.footer__bottom .logo').click();
        await expect(page).toHaveURL('https://polis812.github.io/vacuu/');
      }); //Тест будет провален, так как логотип не ведёт куда нужно

    test.fail('Футер: первая иконка соцсетей ведёт на заглушку', async ({ page }) => {
      const firstSocialLink = page.locator('.social a').first();

      // Проверяем, что иконка соцсетей существует
      await expect(firstSocialLink).toBeVisible();

      // Получаем её ссылку (href)
      const href = await firstSocialLink.getAttribute('href');
      console.log(`Первая ссылка: ${href}`);

      // Ожидаем, что ссылка не будет "#"
      expect(href).not.toBe('#');
    }); //Используем test.fail, так как тест провалится из-за заглушек

    test('Футер: ссылки из раздела Product ведут на правильные страницы', async ({ page }) => {
      const links = [
        { name: 'Car insurance', expectedUrl: 'https://polis812.github.io/car' },
        { name: 'Home insurance', expectedUrl: 'https://polis812.github.io/home' },
        { name: 'Travel insurance', expectedUrl: 'https://polis812.github.io/travel' }, // Здесь может быть баг!
        { name: 'Pet insurance', expectedUrl: 'https://polis812.github.io/pet' }
      ];

      for (const link of links) {
        const locator = page.locator(`.footer__col__item:has-text("${link.name}")`);
        await locator.click();
        await expect(page).toHaveURL(link.expectedUrl);
        await page.goBack();
      }
    });

    test('Футер: ссылка Blog ведёт на правильную страницу', async ({ page }) => {
      await page.locator('.footer__col__item:has-text("Blog")').click();
      await expect(page).toHaveURL('https://polis812.github.io/blog');
      await page.goBack();
    });

    test('Футер: ссылки в разделе Company ведут на правильные страницы', async ({ page }) => {
      const links = [
        { name: 'About us', expectedUrl: 'https://polis812.github.io/about' },
        { name: 'Partners', expectedUrl: 'https://polis812.github.io/partners' },
        { name: 'Review', expectedUrl: 'https://polis812.github.io/review' },
        { name: 'Contact us', expectedUrl: 'https://polis812.github.io/contacts' }
      ];

      for (const link of links) {
        console.log(`Проверяем ссылку: ${link.name}`);
        const locator = page.locator(`.footer__col__item:has-text("${link.name}")`);
        await locator.click();
        await expect(page).toHaveURL(link.expectedUrl);
        await page.goBack();
      }
    });


})
