import { Page, Request } from '@playwright/test';
import { QAIssue } from '../types';

export async function runBasicCheck(page: Page, targetUrl: string, consoleErrors: string[], networkErrors: string[]): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  try {
    const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || response.status() >= 400) {
      issues.push({
        severity: 'CRITICAL',
        category: 'Functional',
        route: '/',
        viewport: '1440x900',
        problem: `Application failed to load: HTTP ${response?.status()}`,
        probableCause: 'Server unavailable or deployment issue'
      });
      return issues;
    }
  } catch (err: any) {
    issues.push({
      severity: 'CRITICAL',
      category: 'Functional',
      route: '/',
      viewport: '1440x900',
      problem: `Failed to open page: ${err.message}`,
      probableCause: 'Network error or host unreachable'
    });
    return issues;
  }

  // 1. Broken images check
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => img.naturalWidth === 0 || !img.complete).map(img => img.src);
  });

  if (brokenImages.length > 0) {
    issues.push({
      severity: 'HIGH',
      category: 'Functional',
      route: '/',
      viewport: '1440x900',
      problem: `Found ${brokenImages.length} broken images on page load`,
      probableCause: `Image URLs unreachable: ${brokenImages.slice(0, 3).join(', ')}`
    });
  }

  // 2. Guest navigation tests: public views remain public.
  const views = [
    { name: 'Members', btnText: /^(Members|Üyeler)$/i },
    { name: 'Explore', btnText: /^(Explore|Keşfet)$/i },
  ];

  for (const view of views) {
    try {
      const btn = page.getByRole('button', { name: view.btnText }).first();
      await btn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
    } catch (err: any) {
      issues.push({
        severity: 'HIGH',
        category: 'Functional',
        route: view.name,
        viewport: '1440x900',
        problem: `Navigation button "${view.name}" failed to respond: ${err.message}`,
        probableCause: 'Broken event handler or obstructed element'
      });
    }
  }

  // 3. Protected guest destinations must open sign-in instead of mock private views.
  for (const protectedView of [
    { name: 'Messages', button: /^(Messages|Mesajlar)$/i },
    { name: 'Profile', button: /^(Profile|Profil)$/i },
  ]) {
    try {
      await page.getByRole('button', { name: protectedView.button }).first().click({ timeout: 5000 });
      await page.getByRole('heading', { name: /^(Member sign in|Üye Girişi)$/i }).waitFor({ state: 'visible', timeout: 3000 });
      await page.keyboard.press('Escape');
    } catch (err: any) {
      issues.push({
        severity: 'HIGH',
        category: 'Functional',
        route: protectedView.name,
        viewport: '1440x900',
        problem: `Guest gate for "${protectedView.name}" failed: ${err.message}`,
        probableCause: 'Protected navigation bypassed auth or opened the wrong modal mode'
      });
    }
  }

  // 4. Registration contract: sign-up CTA opens sign-up and confirmation-required
  // Supabase responses do not attempt an unauthenticated profile write.
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    let profileWriteAttempted = false;
    const profileWriteListener = (request: Request) => {
      if (request.url().includes('/rest/v1/noir_profiles') && ['POST', 'PUT', 'PATCH'].includes(request.method())) {
        profileWriteAttempted = true;
      }
    };
    page.on('request', profileWriteListener);

    let signupCalled = false;
    await page.route('**/auth/v1/signup', async route => {
      signupCalled = true;
      const now = new Date().toISOString();
      const id = '11111111-2222-4333-8444-555555555555';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id,
            aud: 'authenticated',
            role: 'authenticated',
            email: 'qa.registration@example.com',
            phone: '',
            confirmation_sent_at: now,
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            identities: [{ id, user_id: id, provider: 'email', identity_data: { email: 'qa.registration@example.com' }, created_at: now, updated_at: now }],
            created_at: now,
            updated_at: now,
          },
          session: null,
        }),
      });
    });

    await page.getByRole('button', { name: /^(Join for free|Ücretsiz katıl)$/i }).first().click({ timeout: 5000 });
    await page.getByRole('heading', { name: /^(Create your account|Hesap Oluştur)$/i }).waitFor({ state: 'visible' });
    const registrationForm = page.locator('form');
    await registrationForm.locator('input[type="text"]').first().fill('QA Member');
    await registrationForm.locator('input[type="email"]').fill('qa.registration@example.com');
    await registrationForm.locator('input[type="password"]').fill('qa-password-123');
    await registrationForm.getByRole('button', { name: /^(Create account|Ücretsiz Üye Ol)$/i }).click();
    await page.waitForTimeout(750);
    if (!signupCalled) {
      const validation = await page.locator('form input:invalid').evaluateAll(inputs => inputs.map(input => ({
        type: input.getAttribute('type'),
        validationMessage: (input as HTMLInputElement).validationMessage,
      })));
      throw new Error(`Sign-up request was not sent. Invalid fields: ${JSON.stringify(validation)}`);
    }
    const status = page.getByRole('status');
    await status.waitFor({ state: 'visible', timeout: 5000 });
    const statusText = await status.innerText();
    if (!/(Check your inbox|doğrulama bağlantısı gönderdik)/i.test(statusText)) {
      throw new Error(`Unexpected registration feedback: "${statusText}"`);
    }

    if (profileWriteAttempted) {
      throw new Error('Profile write was attempted before email confirmation created a session');
    }

    page.removeListener('request', profileWriteListener);
    await page.unroute('**/auth/v1/signup');
  } catch (err: any) {
    issues.push({
      severity: 'CRITICAL',
      category: 'Functional',
      route: 'Registration',
      viewport: '1440x900',
      problem: `Registration contract failed: ${err.message}`,
      probableCause: 'Sign-up CTA, confirmation handling, or pre-confirmation profile persistence regressed'
    });
  }

  // 5. Registration failures must remain registration-specific and visible in the form.
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const networkErrorStart = networkErrors.length;
    const consoleErrorStart = consoleErrors.length;

    await page.route('**/auth/v1/signup', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'user_already_exists',
          message: 'User already registered',
        }),
      });
    });

    await page.getByRole('button', { name: /^(Join for free|Ücretsiz katıl)$/i }).first().click({ timeout: 5000 });
    const registrationForm = page.locator('form');
    await registrationForm.locator('input[type="text"]').first().fill('Existing QA Member');
    await registrationForm.locator('input[type="email"]').fill('existing.qa@example.com');
    await registrationForm.locator('input[type="password"]').fill('qa-password-123');
    await registrationForm.getByRole('button', { name: /^(Create account|Ücretsiz Üye Ol)$/i }).click();

    const alert = page.getByRole('alert');
    await alert.waitFor({ state: 'visible', timeout: 5000 });
    const alertText = await alert.innerText();
    if (!/(already exists|zaten bir hesap var)/i.test(alertText)) {
      throw new Error(`Registration error was not mapped correctly: "${alertText}"`);
    }
    if (/sign-in failed|giriş yapılamadı/i.test(alertText)) {
      throw new Error(`Registration failure incorrectly displayed a sign-in error: "${alertText}"`);
    }

    await page.unroute('**/auth/v1/signup');
    // The intercepted 422 is intentional and should not count as a product network failure.
    networkErrors.splice(networkErrorStart);
    consoleErrors.splice(consoleErrorStart);
  } catch (err: any) {
    issues.push({
      severity: 'CRITICAL',
      category: 'Functional',
      route: 'Registration error handling',
      viewport: '1440x900',
      problem: `Registration error handling failed: ${err.message}`,
      probableCause: 'The sign-up request fell back to a sign-in message or did not expose actionable feedback'
    });
  }

  // 6. Password visibility and reset-email recovery contract.
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByRole('button', { name: /^(Messages|Mesajlar)$/i }).first().click({ timeout: 5000 });
    const signInForm = page.locator('form');
    const passwordInput = signInForm.locator('input[autocomplete="current-password"]');
    await passwordInput.fill('visible-password-test');
    await signInForm.getByRole('button', { name: /^(Show password|Şifreyi göster)$/i }).click();
    if (await passwordInput.getAttribute('type') !== 'text') {
      throw new Error('Password was not revealed after using the visibility control.');
    }
    await signInForm.getByRole('button', { name: /^(Hide password|Şifreyi gizle)$/i }).click();
    if (await passwordInput.getAttribute('type') !== 'password') {
      throw new Error('Password was not hidden after using the visibility control.');
    }

    let recoveryCalled = false;
    await page.route('**/auth/v1/recover**', async route => {
      recoveryCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await signInForm.getByRole('button', { name: /^(Forgot password\?|Şifremi unuttum)$/i }).click();
    await page.getByRole('heading', { name: /^(Reset your password|Şifreni sıfırla)$/i }).waitFor({ state: 'visible' });
    const resetForm = page.locator('form');
    await resetForm.locator('input[type="email"]').fill('qa.recovery@example.com');
    await resetForm.getByRole('button', { name: /^(Send reset link|Sıfırlama bağlantısı gönder)$/i }).click();
    await page.waitForTimeout(300);
    if (!recoveryCalled) throw new Error('Password recovery request was not sent.');
    await page.unroute('**/auth/v1/recover**');
  } catch (err: any) {
    issues.push({
      severity: 'CRITICAL',
      category: 'Functional',
      route: 'Password recovery',
      viewport: '1440x900',
      problem: `Password recovery contract failed: ${err.message}`,
      probableCause: 'Password visibility control or Supabase recovery request regressed'
    });
  }

  // 7. Report any collected console errors
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => {
      issues.push({
        severity: err.includes('Uncaught') || err.includes('ReferenceError') ? 'CRITICAL' : 'HIGH',
        category: 'Console',
        route: '/',
        viewport: '1440x900',
        problem: err,
        probableCause: 'Unhandled client-side exception'
      });
    });
  }

  // 8. Report any network errors
  if (networkErrors.length > 0) {
    networkErrors.forEach(err => {
      issues.push({
        severity: 'MEDIUM',
        category: 'Network',
        route: '/',
        viewport: '1440x900',
        problem: err,
        probableCause: 'Resource missing or endpoint returned 4xx/5xx'
      });
    });
  }

  return issues;
}
