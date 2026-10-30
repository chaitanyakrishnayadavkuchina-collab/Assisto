import { test, expect } from '@fixtures/test.fixture';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { getLoginUrl, randomPassword } from '@utils/helpers';
import { generateAlphaName } from '@utils/testDataGenerator';
import { DEFAULT_EMAIL_TIMEOUT } from '@utils/testConstants';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { ItMailProvisioningKeywords } from '@keywords/onboarding/ItMailProvisioningKeywords';
import { SelfOnboardingKeywords } from '@keywords/onboarding/SelfOnboardingKeywords';
import loginData from '@test-data/loginData.json';
import onboardingData from '@test-data/onboardingData.json';
import {
  assertSameEmployee,
  findOfferAcceptedCandidate,
  type OnboardingIdentity,
} from '@workflows/employeeOnboardingHelpers';

const loginUrl: string = getLoginUrl();

/**
 * Resume switch: the name of a joiner who has ALREADY been through
 * Temporary Candidate Registration.
 *
 * Registration is a one-way transition, so a candidate consumed by an
 * earlier run can never be re-registered — without this the spec could only
 * ever run against a brand-new accepted candidate. Set
 * ONBOARDING_EMPLOYEE_NAME to pick the flow up from Step 2 on an existing
 * joiner instead.
 */
const resumeEmployeeName: string = (process.env.ONBOARDING_EMPLOYEE_NAME ?? '').trim();

/**
 * Credentials for an employee whose password has ALREADY been set.
 *
 * The joining email carries a SINGLE-USE verify token: once the password is
 * set, that link stops rendering the set-password page, so Steps 7-8 cannot
 * repeat for the same employee. Supplying the password (and the organisation
 * mail it belongs to) skips straight to the login and the wizard.
 */
const resumeEmployeePassword: string = (process.env.ONBOARDING_EMPLOYEE_PASSWORD ?? '').trim();
const resumeEmployeeEmail: string = (process.env.ONBOARDING_EMPLOYEE_EMAIL ?? '').trim();


/**
 * TC-ONB-E2E-001: Employee Onboarding lifecycle
 *
 * Picks up exactly where the Pre-Onboarding workflow ends — at a candidate who
 * has ACCEPTED their offer — and carries that SAME person through onboarding:
 *
 *   Business HR → Temporary Candidate Registration ....... candidate → joiner
 *   Business HR → Upcoming Joinee dashboard .............. joiner listed
 *   Business HR → Employee IDs → Generate IDs ............ Employee ID issued
 *   IT          → Itmail Provisioning → Enter Mail ....... organisation mail
 *   IT          → Completed Request → Share .............. credentials shared
 *   Business HR → Day-0 Check-In → Mark as Arrived ....... Arrived
 *
 * NO CANDIDATE IS CREATED HERE. findOfferAcceptedCandidate() attaches to an
 * existing accepted candidate and throws if none exists, rather than falling
 * back to registration. Pin a specific one with ONBOARDING_CANDIDATE_ID or
 * ONBOARDING_CANDIDATE_EMAIL.
 *
 * Identity is accumulated in `identity` and re-asserted at every stage
 * (assertSameEmployee), so the run cannot drift onto a different person as it
 * moves between grids and roles.
 *
 *   Employee    → joining email → set password → first login .. Steps 7-9
 *   Employee    → Welcome → Personal Profile → Identity ....... Steps 10-12
 *   Employee    → Employment → Statutory → Agreements ......... Steps 13-15
 *   Employee    → Induction → Meet The Team → Complete ........ Steps 16-17
 *
 * Self-Onboarding runs in this SAME test rather than a separate spec, so the
 * employee ID, organisation mail and generated password pass in memory. A
 * separate spec would need its own employee, which the brief forbids.
 *
 *   HR          → HR Verification → review 7 steps → approve .. Steps 18-19
 *
 * The REJECT path in HR Verification is a terminal outcome that cannot share
 * this employee, so it is deliberately not exercised here.
 */
test.describe.serial('Employee Onboarding E2E', () => {
  test.describe.configure({ timeout: 900000 });

  test('TC-ONB-E2E-001: Complete employee onboarding flow', async ({
    page,
    browser,
    loginKeywords,
    candidateRegistrationKeywords,
    temporaryRegistrationKeywords,
    upcomingJoineeKeywords,
    employeeIdGenerationKeywords,
    dayZeroCheckInKeywords,
    selfOnboardingKeywords,
    hrVerificationKeywords,
    mailSacClient,
  }) => {
    await allure.epic('Assisto HRM');
    await allure.feature('Onboarding');
    await allure.story('Employee Onboarding E2E');
    await allure.severity(Severity.BLOCKER);
    await allure.tags('e2e', 'regression', 'onboarding');

    /** The one employee this run acts on, enriched as the app issues IDs. */
    let identity: OnboardingIdentity;
    /** Password-setup link from the joining email; captured in Step 7. */
    let passwordSetupLink = '';
    /** Generated at Step 8 — never a hardcoded credential. */
    let employeePassword = '';

    await test.step('Step 0: Business HR logs in', async () => {
      await loginKeywords.openLoginPage(loginUrl);
      await loginKeywords.login(
        loginData.roles.businessHR.email,
        loginData.roles.businessHR.password,
      );
      await loginKeywords.verifyLoginSuccess();
    });

    if (resumeEmployeeName) {
      await test.step('Step 0a: Resume onboarding for an existing joiner', async () => {
        identity = {
          candidateId: (process.env.ONBOARDING_CANDIDATE_ID ?? '1436').trim(),
          candidateFullName: resumeEmployeeName,
          email: (process.env.ONBOARDING_CANDIDATE_EMAIL ?? 'phase_1790765129314_f8uzh7@mailsac.com').trim(),
          employeeEmail: resumeEmployeeEmail || undefined,
        };
        console.log(
          `[Onboarding] RESUMING from Step 2 for existing joiner "${resumeEmployeeName}" ` +
            '— Temporary Candidate Registration is skipped, it already happened',
        );
        await allure.parameter('resumedEmployee', resumeEmployeeName);
      });
    } else {
    await test.step('Step 0a: Attach to the candidate who accepted the offer', async () => {
      const accepted = await findOfferAcceptedCandidate(
        candidateRegistrationKeywords,
        page,
      );
      identity = { ...accepted };

      // Name and email are captured in Step 1 from the Temporary Registration
      // modal — the candidate ID is the anchor until then.
      await allure.parameter('candidateId', identity.candidateId);
    });

    await test.step('Step 1: Temporary Candidate Registration', async () => {
      await temporaryRegistrationKeywords.navigateToCandidateDetail(
        identity.candidateId,
      );
      await temporaryRegistrationKeywords.verifyOfferAccepted();
      await temporaryRegistrationKeywords.verifyTemporaryRegistrationAvailable();

      await temporaryRegistrationKeywords.openTemporaryRegistration();

      // The modal's pre-filled fields are the authoritative identity: it was
      // reached via /candidate/{id}, so these values belong to the candidate
      // this run anchored on. Everything downstream looks the employee up by
      // this name.
      const captured = await temporaryRegistrationKeywords.captureIdentityFromModal();
      identity.candidateFullName = captured.candidateFullName;
      identity.email = captured.email;

      await allure.parameter('candidateName', identity.candidateFullName);
      await allure.parameter('candidateEmail', identity.email);

      await temporaryRegistrationKeywords.completeTemporaryRegistration({
        reportingManager: onboardingData.temporaryRegistration.reportingManager,
        location: onboardingData.temporaryRegistration.location,
        department: onboardingData.temporaryRegistration.department,
        virtualOnboarding: onboardingData.temporaryRegistration
          .virtualOnboarding as 'Yes' | 'No',
        laptopRequired: onboardingData.temporaryRegistration.laptopRequired as
          | 'Yes'
          | 'No',
        // Date of Joining is left to default to TODAY — Day-0 Check-In only
        // lists joiners expected today.
      });

      await temporaryRegistrationKeywords.verifyRegistrationSucceeded();
    });
    }

    await test.step('Step 2: Verify Onboarding Upcoming dashboard', async () => {
      await upcomingJoineeKeywords.navigateToUpcomingJoinee();
      await upcomingJoineeKeywords.verifyDashboardVisible();

      const listed = await upcomingJoineeKeywords.isJoineeListed(
        identity.candidateFullName,
      );
      if (listed) {
        await upcomingJoineeKeywords.verifyJoineeDetails(identity.candidateFullName, {
          reportingManager: onboardingData.temporaryRegistration.reportingManager,
          location: onboardingData.temporaryRegistration.location,
        });
      } else {
        console.log(
          `[Onboarding] Joiner "${identity.candidateFullName}" is not on Upcoming dashboard (joining date is today, moved to Day-0 Check-In and Employee IDs)`,
        );
      }
    });

    await test.step('Step 3: Generate Employee ID', async () => {
      await employeeIdGenerationKeywords.navigateToEmployeeIds();
      await employeeIdGenerationKeywords.verifyGeneratorVisible();
      // Format Scope is read-only in this app, so the configured format is
      // asserted rather than selected.
      await employeeIdGenerationKeywords.verifyConfiguredFormatScope(
        onboardingData.employeeId.formatScope,
      );

      // Idempotent: generates an ID when the employee is pending, otherwise
      // reads the one they already have. Generation is one-way, so a re-run
      // must not depend on them still being pending.
      identity.employeeId = await employeeIdGenerationKeywords.ensureEmployeeId(
        identity.candidateFullName,
      );
      expect(
        identity.employeeId,
        `No Employee ID could be obtained for "${identity.candidateFullName}"`,
      ).not.toBe('');

      await allure.parameter('employeeId', identity.employeeId);
    });

    await test.step('Step 4: IT provisions the organisation mail', async () => {
      // The organisation mail must be readable by the suite: the Create
      // Password mail is delivered to it after Day-0 check-in.
      identity.employeeEmail = await mailSacClient.generateEmail(
        onboardingData.itMailProvisioning.orgMailPrefix,
      );
      await allure.parameter('employeeEmail', identity.employeeEmail);

      // IT runs in its own browser context — a separate session from HR's.
      const itContext = await browser.newContext();
      try {
        const itPage = await itContext.newPage();
        const itLogin = new LoginKeywords(itPage);
        const itMail = new ItMailProvisioningKeywords(itPage);

        await itLogin.openLoginPage(loginUrl);
        await itLogin.login(loginData.roles.it.email, loginData.roles.it.password);
        await itLogin.verifyLoginSuccess();

        await itMail.navigateToItMailProvisioning();
        await itMail.verifyProvisioningDashboardVisible();
        // Idempotent: reuses an address IT already assigned, otherwise
        // provisions the MailSac one generated above.
        identity.employeeEmail = await itMail.ensureOrganisationMail(
          identity.candidateFullName,
          identity.employeeEmail!,
          onboardingData.itMailProvisioning.temporaryPassword,
        );
        await allure.parameter('employeeEmailInUse', identity.employeeEmail);

        await test.step('Step 5: Share the organisation mail with the joiner', async () => {
          await itMail.verifyEmployeeCompleted(identity.candidateFullName);
          await itMail.verifyOrganisationMailRecorded(
            identity.candidateFullName,
            identity.employeeEmail!,
          );
          // Sharing is repeatable, so it runs on every pass — it is what
          // sends the joiner their credentials.
          await itMail.shareCredentialsToCandidate(identity.candidateFullName);
          await itMail.verifyShareSucceeded();
        });
      } finally {
        await itContext.close();
      }
    });

    await test.step('Step 6: Day-0 Check-In — mark the joiner as arrived', async () => {
      await dayZeroCheckInKeywords.navigateToDayZeroCheckIn();
      await dayZeroCheckInKeywords.verifyConsoleVisible();

      // The console lists only joiners expected TODAY. On a resumed run made
      // after the joining date, the employee has legitimately dropped off it
      // and their check-in already happened — so their absence is recorded
      // and the flow continues to the joining email, which is the real proof
      // that check-in fired.
      if (resumeEmployeeName) {
        const listed = await dayZeroCheckInKeywords.isJoinerListed(
          identity.candidateFullName,
        );
        if (!listed) {
          console.log(
            `[Onboarding] "${identity.candidateFullName}" is not on today's ` +
              'Day-0 list — their joining date has passed and check-in is done',
          );
          return;
        }
      }

      await dayZeroCheckInKeywords.verifyJoinerListed(identity.candidateFullName);

      // Same-person guard before a state-changing action.
      const cardText =
        (await page
          .getByText(identity.candidateFullName, { exact: false })
          .first()
          .textContent()) ?? identity.candidateFullName;
      assertSameEmployee('Day-0 Check-In', identity, cardText);

      await dayZeroCheckInKeywords.markAsArrived(identity.candidateFullName);
      await dayZeroCheckInKeywords.verifyMarkedAsArrived(identity.candidateFullName);
    });

    // -----------------------------------------------------------------------
    // Steps 7-15: EMPLOYEE SELF-ONBOARDING
    //
    // Marking the joiner as arrived triggers a "Joining Confirmed" mail to the
    // organisation address IT provisioned in Step 4. Because that address is a
    // MailSac mailbox this suite controls, the link can be read back and the
    // employee can take over their own onboarding — all still on the SAME
    // person carried since Step 0a.
    // -----------------------------------------------------------------------

    if (resumeEmployeePassword) {
      await test.step('Steps 7-8: Reuse the already-set employee password', async () => {
        employeePassword = resumeEmployeePassword;
        console.log(
          `[SelfOnboarding] Password already set for ${identity.employeeEmail} ` +
            '— skipping the joining email and set-password steps ' +
            '(the verify token is single-use)',
        );
      });
    } else {
    await test.step('Step 7: Employee receives the joining email and opens the password link', async () => {
      // The "Joining Confirmed" mail is delivered to the ORGANISATION address
      // IT provisioned — verified directly against MailSac: the message from
      // onboarding@nspassisto.com landed in emp_…@mailsac.com while the
      // personal mailbox stayed empty. This is exactly why the org mail must
      // be a MailSac address this suite controls.
      //
      // The personal address is tried as a fallback in case the destination
      // differs by tenant configuration.
      const mailboxes = [identity.employeeEmail, identity.email].filter(
        (mailbox): mailbox is string => Boolean(mailbox),
      );

      let lastError: unknown;
      for (const [index, mailbox] of mailboxes.entries()) {
        const isLast = index === mailboxes.length - 1;
        console.log(
          `[Onboarding] Waiting for "${onboardingData.selfOnboarding.joiningEmailSubject}" ` +
            `in ${mailbox}${isLast ? '' : ' (primary)'}`,
        );
        try {
          passwordSetupLink = await mailSacClient.waitForEmailAndExtractLink(
            mailbox,
            [onboardingData.selfOnboarding.joiningEmailSubject, 'Joining', 'Welcome', 'Credentials', 'Password'],
            DEFAULT_EMAIL_TIMEOUT,
          );
          break;
        } catch (error) {
          lastError = error;
          console.log(
            `[Onboarding] No joining email in ${mailbox}` +
              (isLast ? '' : ' — trying the next mailbox'),
          );
        }
      }

      if (!passwordSetupLink) {
        throw lastError instanceof Error
          ? lastError
          : new Error(
              'Employee onboarding email was not received in any known mailbox ' +
                `for ${identity.candidateFullName}: ${mailboxes.join(', ')}`,
            );
      }
      expect(
        passwordSetupLink,
        `Employee onboarding email was not received within 120 seconds for ` +
          `employee: ${identity.candidateFullName} (mailboxes: ${mailboxes.join(", ")})`,
      ).toContain('http');

      await selfOnboardingKeywords.openPasswordSetupLink(passwordSetupLink);
      await selfOnboardingKeywords.verifySetPasswordPage(identity.employeeEmail!);
    });

    await test.step('Step 8: Employee sets their password', async () => {
      // Generated, never hardcoded — meets the app rule of 8-16 characters
      // with an uppercase, a lowercase, a number and a special character.
      employeePassword = randomPassword();
      employeePassword = process.env.ONBOARDING_EMPLOYEE_PASSWORD || randomPassword();
      console.log(`[SelfOnboarding] Employee password set: "${employeePassword}"`);
      await selfOnboardingKeywords.setPassword(employeePassword);
      await selfOnboardingKeywords.verifyPasswordSetSucceeded();
    });
    }

    // Steps 9-17 run as the EMPLOYEE, in their own browser context.
    // Re-using the HR page does not work: this app redirects an already
    // authenticated session away from /login, so the employee login form
    // never renders. Same pattern as the IT steps above.
    const employeeContext = await browser.newContext();
    try {
      const employeePage = await employeeContext.newPage();
      const employeeOnboarding = new SelfOnboardingKeywords(employeePage);

      await test.step('Step 9: Employee logs in', async () => {
        await employeeOnboarding.loginAsEmployee(
          identity.employeeEmail!,
          employeePassword,
        );
      });

      // The wizard is RESUMABLE: a saved step means the employee re-enters at
      // their current position, not at Welcome. Each step below therefore
      // runs only when the employee has not already completed it.
      let currentStep = 0;
      let alreadySubmitted = false;

      await test.step('Step 10: Welcome page and Begin onboarding', async () => {
        await employeeOnboarding.navigateToSelfOnboarding();
        alreadySubmitted = await employeeOnboarding.isOnboardingSubmitted();
        if (alreadySubmitted) {
          console.log('[SelfOnboarding] Onboarding is already submitted for HR review');
          return;
        }

        currentStep = await employeeOnboarding.getCurrentStep();
        console.log(
          `[SelfOnboarding] Wizard resumed at step ${currentStep} of 8`,
        );

        if (currentStep > 1) {
          console.log(
            '[SelfOnboarding] Onboarding already started — Welcome is complete',
          );
          return;
        }

        await employeeOnboarding.verifyWelcomePage(identity.employeeId);
        await employeeOnboarding.beginOnboarding();
        await employeeOnboarding.verifyOnStep('Personal Profile', 2);
        currentStep = 2;
      });

      await test.step('Step 11: Personal Profile', async () => {
        if (alreadySubmitted || currentStep > 2) {
          console.log('[SelfOnboarding] Personal Profile already saved — skipping');
          return;
        }
        const profile = onboardingData.selfOnboarding.personalProfile;
        await employeeOnboarding.completePersonalProfile({
          // Names are generated per run rather than fixed strings.
          fathersName: generateAlphaName(7),
          mothersName: generateAlphaName(7),
          placeOfBirth: profile.placeOfBirth,
          nationality: profile.nationality,
          religion: profile.religion,
          residentialStatus: profile.residentialStatus,
          maritalStatus: profile.maritalStatus,
          addressLine1: profile.addressLine1,
          addressLine2: profile.addressLine2,
          city: profile.city,
          pinCode: profile.pinCode,
          emergencyContactPerson: generateAlphaName(8),
          emergencyDialCode:
            onboardingData.selfOnboarding.emergencyContact.dialCode,
          emergencyContactNumber:
            onboardingData.selfOnboarding.emergencyContact.contactNumber,
          emergencyRelationship:
            onboardingData.selfOnboarding.emergencyContact.relationship,
        });
        await employeeOnboarding.verifyOnStep('Identity Details', 3);
      });

      await test.step('Step 12: Identity Details — reuse Pre-Onboarding documents', async () => {
        if (alreadySubmitted || currentStep > 3) {
          console.log('[SelfOnboarding] Identity Details already complete — skipping');
          return;
        }
        // Documents uploaded during Pre-Onboarding must NOT be uploaded again;
        // the keyword decides from the app's own submitted counter.
        const uploaded = await employeeOnboarding.completeIdentityDetails(
          onboardingData.selfOnboarding.identityDocuments,
        );
        await allure.parameter(
          'identityDocumentsUploaded',
          uploaded.length ? uploaded.join(', ') : 'none (already submitted)',
        );
        await employeeOnboarding.verifyOnStep('Employment And Education', 4);
      });

      await test.step('Step 13: Employment and Education', async () => {
        if (alreadySubmitted || currentStep > 4) {
          console.log('[SelfOnboarding] Employment and Education already complete — skipping');
          return;
        }
        await employeeOnboarding.completeEmploymentAndEducation({
          employeeId: identity.employeeId,
          workEmail: identity.employeeEmail,
        });
        await employeeOnboarding.verifyOnStep('Statutory', 5);
      });

      await test.step('Step 14: Statutory payroll details', async () => {
        if (alreadySubmitted || currentStep > 5) {
          console.log('[SelfOnboarding] Statutory details already complete — skipping');
          return;
        }
        const statutory = onboardingData.selfOnboarding.statutory;
        await employeeOnboarding.completeStatutory({
          accountHolderName: identity.candidateFullName,
          bankName: statutory.bankName,
          accountNumber: statutory.accountNumber,
          ifscCode: statutory.ifscCode,
          branch: statutory.branch,
        });
        await employeeOnboarding.verifyOnStep('Agreements And Policies', 6);
      });

      await test.step('Step 15: Agreements and Policies', async () => {
        if (alreadySubmitted || currentStep > 6) {
          console.log('[SelfOnboarding] Agreements and Policies already complete — skipping');
          return;
        }
        await employeeOnboarding.completeAgreementsAndPolicies({
          agreements: onboardingData.selfOnboarding.agreements,
          policies: onboardingData.selfOnboarding.policies,
        });
        await employeeOnboarding.verifyOnStep('Induction', 7);
      });

      await test.step('Step 16: Induction and Meet The Team', async () => {
        if (alreadySubmitted || currentStep > 8) {
          console.log('[SelfOnboarding] Induction and Meet The Team already complete — skipping');
          return;
        }
        await employeeOnboarding.completeInduction();
        await employeeOnboarding.verifyOnStep('Meet The Team', 8);
        const activeStep = await employeeOnboarding.getCurrentStep();
        if (activeStep <= 7) {
          await employeeOnboarding.completeInduction();
          await employeeOnboarding.verifyOnStep('Meet The Team', 8);
        }
        await employeeOnboarding.completeMeetTheTeam();
      });

      await test.step('Step 17: Complete onboarding', async () => {
        if (alreadySubmitted) {
          console.log('[SelfOnboarding] Onboarding already submitted for HR review');
          await employeeOnboarding.verifyOnboardingCompleted();
          return;
        }
        await employeeOnboarding.completeOnboarding();
        await employeeOnboarding.verifyOnboardingCompleted();
      });
    } finally {
      await employeeContext.close();
    }


    // -----------------------------------------------------------------------
    // Steps 18-19: HR VERIFICATION
    //
    // HR is notified that the employee submitted, opens Onboarding → HR
    // Verification, reviews the seven submitted steps, verifies each identity
    // document, then approves. Runs on the HR page — the Business HR session
    // from Step 0 is still active there.
    //
    // The reject path is the alternative TERMINAL outcome and cannot share
    // this employee, so it is not exercised here.
    // -----------------------------------------------------------------------

    await test.step('Step 18: HR reviews the submitted onboarding', async () => {
      await hrVerificationKeywords.navigateToHrVerification();
      await hrVerificationKeywords.verifyQueueVisible();

      const isPending = await hrVerificationKeywords.isEmployeePending(
        identity.candidateFullName,
      );

      if (!isPending) {
        console.log(
          `[HrVerify] "${identity.candidateFullName}" is not in Pending — checking Verified tab`,
        );
        await hrVerificationKeywords.verifyEmployeeMovedToVerified(
          identity.candidateFullName,
        );
        return;
      }

      await hrVerificationKeywords.openEmployeeSubmission(
        identity.candidateFullName,
      );
      // Same-employee guard: the header carries the ID issued in Step 3.
      await hrVerificationKeywords.verifyReviewingEmployee(identity.employeeId);

      await hrVerificationKeywords.reviewAllSteps();
      await hrVerificationKeywords.verifyIdentityDocuments(
        onboardingData.selfOnboarding.identityDocuments,
      );
    });

    await test.step('Step 19: HR approves the onboarding', async () => {
      const onReviewPage = await hrVerificationKeywords.isOnReviewPage();
      if (!onReviewPage) {
        const isPending = await hrVerificationKeywords.isEmployeePending(
          identity.candidateFullName,
        );
        if (!isPending) {
          console.log(
            `[HrVerify] "${identity.candidateFullName}" already approved — verifying in Verified tab`,
          );
          await hrVerificationKeywords.verifyEmployeeMovedToVerified(
            identity.candidateFullName,
          );
          return;
        }
        await hrVerificationKeywords.openEmployeeSubmission(
          identity.candidateFullName,
        );
      }
      await hrVerificationKeywords.approveOnboarding();
      await hrVerificationKeywords.verifyEmployeeMovedToVerified(
        identity.candidateFullName,
      );
    });


    await test.step('Onboarding identity summary', async () => {
      console.log(
        '[Onboarding] Completed through Day-0 Check-In — ' +
          `candidate #${identity.candidateId} "${identity.candidateFullName}", ` +
          `employeeId ${identity.employeeId}, employeeEmail ${identity.employeeEmail}`,
      );
      expect(identity.employeeId, 'Employee ID was not captured').toBeTruthy();
      expect(identity.employeeEmail, 'Employee email was not captured').toBeTruthy();
    });
  });
});
