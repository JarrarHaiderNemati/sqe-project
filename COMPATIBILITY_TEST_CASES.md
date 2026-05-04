# Swift Response - Compatibility Test Cases

Compatibility testing checks whether the app works across browsers, devices, screen sizes, and operating systems.

Recommended tools from SQE document:

```text
BrowserStack or LambdaTest
```

Supplementary automated file in this repo:

```text
tests/compatibility.selenium.test.js
```

Run:

```bash
npm run dev
APP_URL=http://localhost:3000 npm run test:compatibility
```

## Compatibility Test Cases

| Test ID | Test Scenario | Tool / Method | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| CT-01 | Chrome desktop compatibility | Selenium / manual | Open main pages in Chrome desktop | Pages should render correctly | To be filled |
| CT-02 | Safari desktop compatibility | Manual / BrowserStack | Open main pages in Safari | Pages should render correctly | To be filled |
| CT-03 | Firefox desktop compatibility | Manual / BrowserStack | Open main pages in Firefox | Pages should render correctly | To be filled |
| CT-04 | Mobile viewport compatibility | Selenium viewport | Test at 390x844 screen size | Layout should fit mobile screen | To be filled |
| CT-05 | Tablet viewport compatibility | Selenium viewport | Test at 768x1024 screen size | Layout should fit tablet screen | To be filled |
| CT-06 | Desktop viewport compatibility | Selenium viewport | Test at 1440x900 screen size | Layout should fit desktop screen | To be filled |
| CT-07 | Login page responsive compatibility | Selenium viewport | Open login page at mobile/tablet/desktop sizes | Login form should remain usable | To be filled |
| CT-08 | Signup page responsive compatibility | Selenium viewport | Open signup page at mobile/tablet/desktop sizes | Signup form should remain usable | To be filled |
| CT-09 | Contact page responsive compatibility | Selenium viewport | Open contact page at mobile/tablet/desktop sizes | Contact form should remain usable | To be filled |
| CT-10 | Emergency page responsive compatibility | Selenium viewport | Open emergency page at mobile/tablet/desktop sizes | Panic interface should remain visible | To be filled |

## Evidence To Attach

- BrowserStack/LambdaTest screenshots if available
- Selenium terminal output
- Manual screenshots from Chrome/Safari/Firefox

