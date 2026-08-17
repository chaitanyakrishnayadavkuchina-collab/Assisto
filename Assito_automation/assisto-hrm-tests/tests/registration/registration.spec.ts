import { test, expect } from '@fixtures/test.fixture';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { getRegistrationUrl } from '@utils/helpers';

/**
 * Self-service admin registration ("Start Free Trial").
 *
 * Playwright equivalent of the Selenium suite's
 * `test_cases/test_cases_register_page.py::TestRegisterPage`.
 *
 * The flow spans two mailboxes-worth of latency (registration email delivery
 * plus a second page load on a freshly provisioned tenant sub-domain), so the
 * test gets a generous timeout and runs serially.
 */
test.describe('Registration Page', () => {
  test.describe.configure({ mode: 'serial' });

  test('15712 - Register The company name & email Id through Start free trial', async ({
    registerKeywords,
  }) => {
    // Email delivery alone can take up to 2 minutes; the default 60s
    // test timeout is not enough for the end-to-end flow.
    test.setTimeout(5 * 60 * 1000);

    await allure.epic('Assisto Portal');
    await allure.feature('Registration');
    await allure.story('Registration Page Validation');
    await allure.severity(Severity.CRITICAL);
    await allure.tags('regression', 'registration');

    await test.step('Step 1: Enter user name', async () => {
      await registerKeywords.openRegistrationEntryPoint(getRegistrationUrl());
      const email = await registerKeywords.startFreeTrialWithNewEmail();
      await allure.parameter('email', email);
    });

    await test.step('Step 2: Enter user details', async () => {
      await registerKeywords.fillCompanyDetails();
      await allure.parameter('domain', registerKeywords.data.domain ?? '');
      await allure.parameter(
        'companyName',
        registerKeywords.data.companyName ?? '',
      );
    });

    await test.step('Step 3: Click Register and read the verification email', async () => {
      const link =
        await registerKeywords.submitRegistrationAndCaptureVerificationLink();
      expect(link).toContain('/verify?token=');
      expect(registerKeywords.data.token).toBeTruthy();
      await allure.parameter('verificationLink', link);
    });

    await test.step('Step 4: Open the verification link', async () => {
      await registerKeywords.openVerificationLink();
    });

    await test.step('Step 5: Set the password', async () => {
      await registerKeywords.setNewPassword();
    });

    await test.step('Step 6: Verify registration completed', async () => {
      await registerKeywords.verifyRegistrationCompleted();
    });
  });
});
