# Swift Response - System Test Types Required

This document maps the required system test types from the SQE project document to the Swift Response web application.

## Tool Mapping

| System Test Type | Required Tool Examples | Tool / Method Used for This Project | Status |
| --- | --- | --- | --- |
| Functional Testing | Selenium, Cypress, Appium | Selenium WebDriver | Done |
| Performance Testing | JMeter, k6, Locust | k6 script provided | Ready to run |
| Security Testing | OWASP ZAP, Burp Suite | OWASP ZAP / manual security checklist | Test cases provided |
| Usability Testing | Manual + heuristic evaluation | Manual heuristic evaluation | Test cases provided |
| Compatibility Testing | BrowserStack, LambdaTest | Manual multi-browser/device testing | Test cases provided |
| ML Model Validation | Deepchecks, Evidently AI | Not applicable | N/A |

---

## Functional Testing Test Cases

| Test ID | Test Scenario | Tool | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| FT-01 | Verify home page loads | Selenium | Open `/` | Swift Response brand should be visible | To be filled |
| FT-02 | Verify login page loads | Selenium | Open `/login` | Email and password fields should be visible | To be filled |
| FT-03 | Verify signup page loads | Selenium | Open `/signup` | Signup form and role dropdown should be visible | To be filled |
| FT-04 | Verify contact page loads | Selenium | Open `/contact` | Contact form should be visible | To be filled |
| FT-05 | Verify panic page loads | Selenium | Open `/emergency` | Panic/SOS interface should be visible | To be filled |
| FT-06 | Verify volunteer page loads | Selenium | Open `/volunteer` | Volunteer content should be visible | To be filled |
| FT-07 | Verify news page loads | Selenium | Open `/news` | Emergency News heading should be visible | To be filled |
| FT-08 | Verify about page loads | Selenium | Open `/about` | About page content should be visible | To be filled |
| FT-09 | Verify privacy page loads | Selenium | Open `/privacy` | Privacy page content should be visible | To be filled |
| FT-10 | Verify terms page loads | Selenium | Open `/terms` | Terms page content should be visible | To be filled |

Runnable file:

```text
tests/system.selenium.test.js
```

Run:

```bash
npm run dev
APP_URL=http://localhost:3000 npm run test:system:selenium
```

---

## Performance Testing Test Cases

| Test ID | Test Scenario | Tool | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| PT-01 | Home page response time | k6 | Send repeated GET requests to `/` | 95% requests should complete under 2 seconds | To be filled |
| PT-02 | Login page response time | k6 | Send repeated GET requests to `/login` | Page should respond successfully under load | To be filled |
| PT-03 | Signup page response time | k6 | Send repeated GET requests to `/signup` | Page should respond successfully under load | To be filled |
| PT-04 | Emergency page response time | k6 | Send repeated GET requests to `/emergency` | Panic page should load under 2 seconds for 95% requests | To be filled |
| PT-05 | News page response time | k6 | Send repeated GET requests to `/news` | Page should not crash under repeated requests | To be filled |

Runnable file:

```text
tests/performance.k6.js
```

Run:

```bash
npm run dev
k6 run tests/performance.k6.js
```

---

## Security Testing Test Cases

| Test ID | Test Scenario | Tool | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | SQL injection check on login input | OWASP ZAP / manual | Enter `' OR '1'='1` in email/password fields | Login should fail and no unauthorized access should occur | To be filled |
| SEC-02 | XSS check on contact form | OWASP ZAP / manual | Submit `<script>alert(1)</script>` in message field | Script should not execute in the browser | To be filled |
| SEC-03 | Protected dashboard route check | Manual / browser | Open `/dashboard` while logged out | User should be redirected to `/login` | To be filled |
| SEC-04 | API invalid payload check | Supertest / manual | Send missing fields to `/api/contact` | API should return 400 error | To be filled |
| SEC-05 | Incident status invalid value check | Supertest / manual | Send invalid status to `/api/incident/update-status` | API should reject invalid status | To be filled |

Recommended tool:

```text
OWASP ZAP Baseline Scan
```

Example command if ZAP is installed:

```bash
zap-baseline.py -t http://localhost:3000
```

---

## Usability Testing Test Cases

| Test ID | Test Scenario | Method | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| UTY-01 | Home page clarity | Manual heuristic evaluation | Ask user to identify main purpose of app from home page | User should understand app is for emergency response | To be filled |
| UTY-02 | Emergency reporting ease | Manual heuristic evaluation | Ask user to locate emergency reporting option | User should find Report Emergency quickly | To be filled |
| UTY-03 | Panic button visibility | Manual heuristic evaluation | Ask user to find urgent SOS/panic option | Panic button should be easy to locate | To be filled |
| UTY-04 | Form readability | Manual heuristic evaluation | Review login/signup/contact forms | Labels and inputs should be clear | To be filled |
| UTY-05 | Mobile navigation usability | Manual heuristic evaluation | Test navigation on small screen size | Navigation should remain usable | To be filled |

---

## Compatibility Testing Test Cases

| Test ID | Test Scenario | Tool / Method | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| CT-01 | Chrome desktop compatibility | Manual / BrowserStack | Open main pages in Chrome | Pages should render correctly | To be filled |
| CT-02 | Safari desktop compatibility | Manual / BrowserStack | Open main pages in Safari | Pages should render correctly | To be filled |
| CT-03 | Firefox desktop compatibility | Manual / BrowserStack | Open main pages in Firefox | Pages should render correctly | To be filled |
| CT-04 | Mobile viewport compatibility | Browser dev tools / BrowserStack | Test at 390x844 viewport | Layout should be responsive | To be filled |
| CT-05 | Tablet viewport compatibility | Browser dev tools / BrowserStack | Test at 768x1024 viewport | Layout should be responsive | To be filled |

---

## ML Model Validation

This project is a **web application**, not an ML project. Therefore, ML model validation using Deepchecks or Evidently AI is **not applicable**.

