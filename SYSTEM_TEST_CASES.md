# Swift Response - System Test Cases

System-level testing evaluates the complete Swift Response application as a full user-facing system. These test cases simulate real user workflows across authentication, emergency reporting, volunteer response, panic SOS, live incidents, safety check-in, and information features.

## ST-01: Citizen Registration and First Login Flow

| Field | Description |
| --- | --- |
| Test ID | ST-01 |
| Test Scenario | New citizen creates an account and logs in for the first time |
| User Story / Req ID | Citizen can register and access the application dashboard |
| Preconditions | No existing account with the test email |
| Test Steps | 1. Open signup page. 2. Enter full name, email, password. 3. Select citizen role. 4. Submit form. 5. Log in with same credentials. |
| Test Data | Name: Test Citizen, Email: citizen@test.com, Password: Test@12345 |
| Expected Result | User account is created, login succeeds, and user reaches dashboard |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | High |

## ST-02: Citizen Reports Emergency and Views Dashboard

| Field | Description |
| --- | --- |
| Test ID | ST-02 |
| Test Scenario | Citizen submits an emergency request and verifies it appears on dashboard |
| User Story / Req ID | Citizen can report emergency and track submitted requests |
| Preconditions | Citizen is logged in |
| Test Steps | 1. Open report emergency page. 2. Select emergency type. 3. Enter description. 4. Select map location. 5. Submit request. 6. Open dashboard. |
| Test Data | Type: Medical, Urgency: High, Location: Lahore |
| Expected Result | Emergency request is created and displayed on dashboard with correct details |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | Critical |

## ST-03: Citizen Edits and Deletes Emergency Request

| Field | Description |
| --- | --- |
| Test ID | ST-03 |
| Test Scenario | Citizen modifies and removes an existing emergency request |
| User Story / Req ID | Citizen can manage their own emergency requests |
| Preconditions | Citizen is logged in and has at least one emergency request |
| Test Steps | 1. Open dashboard. 2. Click edit on request. 3. Update description/location. 4. Save changes. 5. Return to dashboard. 6. Delete the request. |
| Test Data | Updated Description: Updated emergency details |
| Expected Result | Request updates successfully and is removed after delete confirmation |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | High |

## ST-04: Volunteer Views and Filters Emergency Feed

| Field | Description |
| --- | --- |
| Test ID | ST-04 |
| Test Scenario | Volunteer logs in and filters active emergency requests |
| User Story / Req ID | Volunteer can browse and filter emergency feed |
| Preconditions | Volunteer account exists and active emergency requests exist |
| Test Steps | 1. Log in as volunteer. 2. Open volunteer page. 3. View emergency feed. 4. Apply emergency type filter. 5. Apply location filter. |
| Test Data | Type Filter: Medical, Location Filter: Lahore |
| Expected Result | Only matching active emergency requests are displayed |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | Medium |

## ST-05: Volunteer Registers to Help and Citizen Sees Response

| Field | Description |
| --- | --- |
| Test ID | ST-05 |
| Test Scenario | Volunteer offers help for a citizen request and citizen sees volunteer response |
| User Story / Req ID | Volunteer can respond to emergencies and requester can view responses |
| Preconditions | Citizen request exists and volunteer is logged in |
| Test Steps | 1. Volunteer opens emergency feed. 2. Selects request. 3. Enters message/contact info. 4. Registers to help. 5. Citizen opens dashboard. |
| Test Data | Message: I can help nearby, Contact: 03001234567 |
| Expected Result | Volunteer registration is saved and appears in citizen dashboard |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | High |

## ST-06: Panic SOS Online Flow

| Field | Description |
| --- | --- |
| Test ID | ST-06 |
| Test Scenario | User presses panic button while internet is available |
| User Story / Req ID | User can send immediate SOS incident with location |
| Preconditions | Browser has internet access and location permission is allowed |
| Test Steps | 1. Open emergency page. 2. Press panic button. 3. Allow location. 4. Wait for success state. 5. Open live incidents dashboard. |
| Test Data | GPS Location: Lahore coordinates |
| Expected Result | Incident is created through data channel and appears in live incidents |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | Critical |

## ST-07: Panic SOS Offline Fallback Flow

| Field | Description |
| --- | --- |
| Test ID | ST-07 |
| Test Scenario | User presses panic button while internet is unavailable |
| User Story / Req ID | App should fallback to call/SMS when data channel fails |
| Preconditions | Browser network is disabled or data API is unavailable |
| Test Steps | 1. Disable network. 2. Open emergency page. 3. Press panic button. 4. Observe fallback behavior. |
| Test Data | GPS Location: Available or unavailable |
| Expected Result | Pending incident is saved locally and app attempts call/SMS fallback |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | Critical |

## ST-08: Responder Acknowledges and Resolves Live Incident

| Field | Description |
| --- | --- |
| Test ID | ST-08 |
| Test Scenario | Responder handles a live panic incident from dashboard |
| User Story / Req ID | Volunteer/admin can update incident status |
| Preconditions | At least one pending live incident exists |
| Test Steps | 1. Open dashboard. 2. Locate live incident. 3. Click acknowledge. 4. Verify status update. 5. Click resolve. |
| Test Data | Incident Status: pending to acknowledged to resolved |
| Expected Result | Incident status updates and resolved incident disappears from active list |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | High |

## ST-09: Nearby Safety Check-In Flow

| Field | Description |
| --- | --- |
| Test ID | ST-09 |
| Test Scenario | User near an emergency receives safety check-in popup |
| User Story / Req ID | App checks whether nearby users are safe during emergencies |
| Preconditions | User is logged in and an active emergency exists within 10 km |
| Test Steps | 1. Log in as nearby user. 2. Allow location access. 3. Wait for safety popup. 4. Select Need Help. |
| Test Data | Emergency Location: within 10 km of user |
| Expected Result | Safety popup appears and Need Help redirects user to report emergency page |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | Medium |

## ST-10: News, Safety Videos, and AI Assistant Information Flow

| Field | Description |
| --- | --- |
| Test ID | ST-10 |
| Test Scenario | User accesses emergency information and AI guidance features |
| User Story / Req ID | User can view emergency updates, safety videos, and AI advice |
| Preconditions | API keys are configured or mocked responses are available |
| Test Steps | 1. Open news page. 2. Verify articles load. 3. Open safety videos section. 4. Verify videos load. 5. Open AI assistant and request suggestion. |
| Test Data | Emergency Type: Fire, Description: Smoke in building |
| Expected Result | News, videos, and AI suggestion are displayed successfully |
| Actual Result | To be filled after execution |
| Environment | Chrome/Safari, local Next.js dev server |
| Pass/Fail | To be filled after execution |
| Severity if Fail | Medium |

