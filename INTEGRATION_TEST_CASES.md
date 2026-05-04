# Swift Response - Integration Test Cases

Integration testing verifies that different modules of the Swift Response application work correctly together. These test cases cover frontend-to-backend flow, API routes, Supabase database operations, authentication, and external service communication.

## IT-01: User Signup Creates Auth User and Profile

| Field | Description |
| --- | --- |
| Test ID | IT-01 |
| Modules Involved | Signup Page, Supabase Auth, Profiles Table |
| Test Scenario | Verify that a new user can sign up and a profile is created |
| API Endpoint | Supabase Auth signup |
| Request Data | Full name, email, password, role = `citizen` |
| Expected Response | User account should be created successfully |
| Database Validation | New record should exist in `profiles` table with correct role |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-02: User Login Redirects to Dashboard

| Field | Description |
| --- | --- |
| Test ID | IT-02 |
| Modules Involved | Login Page, Supabase Auth, Dashboard Page |
| Test Scenario | Verify that a registered user can log in successfully |
| API Endpoint | Supabase Auth login |
| Request Data | Valid email and password |
| Expected Response | Login should succeed and user should be redirected to `/dashboard` |
| Database Validation | Auth session should be created for the logged-in user |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-03: Unauthenticated User Cannot Access Dashboard

| Field | Description |
| --- | --- |
| Test ID | IT-03 |
| Modules Involved | Auth Guard, Dashboard Page, Login Page |
| Test Scenario | Verify that dashboard access is protected |
| API Endpoint | Supabase Auth user check |
| Request Data | No active login session |
| Expected Response | User should be redirected to `/login` |
| Database Validation | No database change required |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-04: Emergency Request Creation Saves Data

| Field | Description |
| --- | --- |
| Test ID | IT-04 |
| Modules Involved | Emergency Request Form, Supabase Client, Emergency Requests Table |
| Test Scenario | Verify that a logged-in citizen can create an emergency request |
| API Endpoint | Supabase insert into `emergency_requests` |
| Request Data | requester_id, type, description, location, status = `pending` |
| Expected Response | Emergency request should be created successfully |
| Database Validation | New row should exist in `emergency_requests` table |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-05: Created Emergency Request Appears on Dashboard

| Field | Description |
| --- | --- |
| Test ID | IT-05 |
| Modules Involved | Emergency Request Form, Dashboard Page, Supabase Database |
| Test Scenario | Verify that a created request appears on the user's dashboard |
| API Endpoint | Supabase select from `emergency_requests` |
| Request Data | Logged-in user's ID |
| Expected Response | Dashboard should display the newly created request |
| Database Validation | Request should be fetched where `requester_id` matches logged-in user |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-06: Emergency Request Edit Updates Database

| Field | Description |
| --- | --- |
| Test ID | IT-06 |
| Modules Involved | Edit Request Page, Supabase Client, Emergency Requests Table |
| Test Scenario | Verify that a user can edit their own emergency request |
| API Endpoint | Supabase update on `emergency_requests` |
| Request Data | Updated type, description, and location |
| Expected Response | Request should update successfully |
| Database Validation | Existing request row should contain updated values |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-07: Emergency Request Delete Removes Data

| Field | Description |
| --- | --- |
| Test ID | IT-07 |
| Modules Involved | Dashboard Page, Request Card, Supabase Database |
| Test Scenario | Verify that a user can delete their own emergency request |
| API Endpoint | Supabase delete from `emergency_requests` |
| Request Data | Emergency request ID |
| Expected Response | Request should be deleted successfully |
| Database Validation | Deleted request should no longer exist in `emergency_requests` |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-08: Volunteer Feed Loads Active Requests

| Field | Description |
| --- | --- |
| Test ID | IT-08 |
| Modules Involved | Volunteer Page, Supabase Client, Emergency Requests Table |
| Test Scenario | Verify that volunteers can view active emergency requests |
| API Endpoint | Supabase select from `emergency_requests` |
| Request Data | Logged-in volunteer user ID |
| Expected Response | Active requests should be displayed except volunteer's own requests |
| Database Validation | Records should be fetched where status is not `resolved` |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-09: Volunteer Registration Saves Help Offer

| Field | Description |
| --- | --- |
| Test ID | IT-09 |
| Modules Involved | Volunteer Page, VolunteerAction Component, Volunteer Registrations Table |
| Test Scenario | Verify that a volunteer can register to help with an emergency |
| API Endpoint | Supabase insert into `volunteer_registrations` |
| Request Data | request_id, volunteer_id, message, contact_info |
| Expected Response | Volunteer registration should be saved successfully |
| Database Validation | New row should exist in `volunteer_registrations` |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-10: Citizen Dashboard Shows Volunteer Registrations

| Field | Description |
| --- | --- |
| Test ID | IT-10 |
| Modules Involved | Dashboard Page, Volunteer Registrations Table, Profiles Table |
| Test Scenario | Verify that a citizen can see volunteers registered for their request |
| API Endpoint | Supabase select with join on `volunteer_registrations` and `profiles` |
| Request Data | Citizen user ID and emergency request ID |
| Expected Response | Dashboard should display volunteer name, message, and contact info |
| Database Validation | Joined data should match the correct request and volunteer |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-11: Panic Button Creates Incident Through API

| Field | Description |
| --- | --- |
| Test ID | IT-11 |
| Modules Involved | Emergency Page, Channel Manager, Incident API, Incidents Table |
| Test Scenario | Verify that pressing panic button sends incident data to backend |
| API Endpoint | POST `/api/incident` |
| Request Data | deviceEmergencyId, latitude, longitude, timestamp |
| Expected Response | API should return `success: true` and incident result |
| Database Validation | New row should exist in `incidents` table |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-12: Incident Status Updates From Dashboard

| Field | Description |
| --- | --- |
| Test ID | IT-12 |
| Modules Involved | Live Incidents Section, Update Status API, Incidents Table |
| Test Scenario | Verify that responder can acknowledge or resolve an incident |
| API Endpoint | PATCH `/api/incident/update-status` |
| Request Data | incident id, status = `acknowledged` or `resolved` |
| Expected Response | API should return `success: true` and updated incident data |
| Database Validation | Incident status should update in `incidents` table |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-13: Contact Form Saves Message

| Field | Description |
| --- | --- |
| Test ID | IT-13 |
| Modules Involved | Contact Form, Contact API, Contact Table |
| Test Scenario | Verify that contact form submissions are saved |
| API Endpoint | POST `/api/contact` |
| Request Data | name, email, message |
| Expected Response | API should return success message |
| Database Validation | New row should exist in `contact` table |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-14: News Page Loads Articles From API Route

| Field | Description |
| --- | --- |
| Test ID | IT-14 |
| Modules Involved | News Page, News API Route, GNews API |
| Test Scenario | Verify that emergency news is fetched and displayed |
| API Endpoint | GET `/api/news` |
| Request Data | No request body |
| Expected Response | API should return articles array |
| Database Validation | No database change required |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

## IT-15: AI Assistant Gets Emergency Suggestion

| Field | Description |
| --- | --- |
| Test ID | IT-15 |
| Modules Involved | AI Assistant Button, Gemini API Route, Gemini External API |
| Test Scenario | Verify that AI assistant returns emergency guidance |
| API Endpoint | POST `/api/gemini` |
| Request Data | emergencyType, description, mode |
| Expected Response | API should return an AI-generated suggestion |
| Database Validation | No database change required |
| Actual Result | To be filled after execution |
| Pass/Fail | To be filled after execution |
| Defect ID | N/A |

