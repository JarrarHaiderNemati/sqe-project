# Swift Response - Security Test Cases

Security testing checks whether the application resists common web vulnerabilities such as invalid input, XSS, SQL injection-style payloads, unauthorized access, and invalid API state changes.

Recommended tool from SQE document:

```text
OWASP ZAP or Burp Suite Community
```

Supplementary automated file in this repo:

```text
tests/security.supertest.test.js
```

Run:

```bash
npm run test:security
```

## Security Test Cases

| Test ID | Test Scenario | Tool / Method | Test Steps | Expected Result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | SQL injection-style login payload | OWASP ZAP / Supertest | Send `' OR '1'='1` as email/password | Login should fail with unauthorized response | To be filled |
| SEC-02 | XSS payload in contact form | OWASP ZAP / Supertest | Submit `<script>alert(1)</script>` in contact message | Payload should be stored/handled as plain text, not executed | To be filled |
| SEC-03 | Missing contact fields | Supertest | Submit contact request without email/message | API should return 400 validation error | To be filled |
| SEC-04 | Invalid incident status | Supertest | Send status `closed` to incident update API | API should reject invalid status | To be filled |
| SEC-05 | Missing incident ID | Supertest | Send status update without incident ID | API should return 400 validation error | To be filled |
| SEC-06 | Unauthorized dashboard access | Browser manual / Selenium | Open `/dashboard` while logged out | User should be redirected to login | To be filled |
| SEC-07 | SMS webhook missing sender | Supertest | Send SMS webhook without `From` | API should reject request | To be filled |
| SEC-08 | Call webhook missing caller | Supertest | Send call webhook without `Caller` | API should reject request | To be filled |

## OWASP ZAP Manual Scan Command

If OWASP ZAP is installed, run the app first:

```bash
npm run dev
```

Then run:

```bash
zap-baseline.py -t http://localhost:3000
```

Attach the generated ZAP output/screenshot in the final SQE report.

