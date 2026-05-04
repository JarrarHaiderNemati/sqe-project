# Swift Response - Unit Test Cases

This document contains 40 unit test cases for the Swift Response application. The test cases are divided equally among 4 team members, with 10 unit test cases per member.

## Member 1: Authentication and Form Validation

| Test Case ID | Module / Component | Test Objective | Test Steps / Input | Expected Result |
| --- | --- | --- | --- | --- |
| UT-01 | Login Form | Verify email field validation | Open login page and submit form with empty email | Email field should be required and form should not submit |
| UT-02 | Login Form | Verify password field validation | Open login page and submit form with empty password | Password field should be required and form should not submit |
| UT-03 | Login Form | Verify invalid email validation | Enter an invalid email format such as `abc` | Form should reject invalid email format |
| UT-04 | Login Form | Verify password visibility toggle | Click the show/hide password icon | Password input type should switch between `password` and `text` |
| UT-05 | Signup Form | Verify full name validation | Submit signup form without full name | Full name field should be required |
| UT-06 | Signup Form | Verify password length validation | Enter password shorter than 6 characters | Error message should show that password must be at least 6 characters |
| UT-07 | Signup Form | Verify citizen role selection | Select `Citizen` role from dropdown | Selected role should be saved as `citizen` |
| UT-08 | Signup Form | Verify volunteer role selection | Select `Volunteer` role from dropdown | Selected role should be saved as `volunteer` |
| UT-09 | Signup Form | Verify NGO admin role selection | Select `NGO Admin` role from dropdown | Selected role should be saved as `ngo_admin` |
| UT-10 | Emergency Request Form | Verify required description field | Submit emergency form without description | Description field should be required and form should not submit |

## Member 2: Emergency Request and Dashboard

| Test Case ID | Module / Component | Test Objective | Test Steps / Input | Expected Result |
| --- | --- | --- | --- | --- |
| UT-11 | Emergency Request Form | Verify Medical emergency type selection | Select `Medical` from emergency type dropdown | Emergency type should update to `Medical` |
| UT-12 | Emergency Request Form | Verify Fire emergency type selection | Select `Fire` from emergency type dropdown | Emergency type should update to `Fire` |
| UT-13 | Emergency Request Form | Verify Flood emergency type selection | Select `Flood` from emergency type dropdown | Emergency type should update to `Flood` |
| UT-14 | Emergency Request Form | Verify High urgency selection | Click `High` urgency button | Urgency should update to `High` and High button should appear selected |
| UT-15 | Emergency Request Form | Verify Medium urgency selection | Click `Medium` urgency button | Urgency should update to `Medium` and Medium button should appear selected |
| UT-16 | Emergency Request Form | Verify Low urgency selection | Click `Low` urgency button | Urgency should update to `Low` and Low button should appear selected |
| UT-17 | Location Picker | Verify location selection | Select a location on the map | Latitude, longitude, and address should update in form state |
| UT-18 | Dashboard Requests Section | Verify empty dashboard state | Render dashboard with no emergency requests | Empty state or no request message should be displayed |
| UT-19 | Dashboard Requests Section | Verify request cards display | Render dashboard with emergency request data | Request cards should display request type, status, location, and description |
| UT-20 | Dashboard Request Actions | Verify edit action | Click edit button on a request card | User should be navigated to `/requests/edit/[id]` |

## Member 3: Panic Button and Incident Logic

| Test Case ID | Module / Component | Test Objective | Test Steps / Input | Expected Result |
| --- | --- | --- | --- | --- |
| UT-21 | Channel Manager | Verify device emergency ID generation | Start channel manager with no saved emergency ID | New unique device emergency ID should be generated and stored |
| UT-22 | Channel Manager | Verify existing device emergency ID reuse | Start channel manager with existing saved ID | Existing ID should be loaded and reused |
| UT-23 | Channel Manager | Verify emergency payload with GPS | Trigger emergency with GPS coordinates | Payload should contain provided latitude and longitude |
| UT-24 | Channel Manager | Verify emergency payload without GPS | Trigger emergency with null GPS | Payload should use latitude `0` and longitude `0` |
| UT-25 | Channel Manager | Verify local incident snapshot | Trigger emergency | Pending incident should be saved in localForage before sending |
| UT-26 | Channel Manager | Verify data channel when online | Mock online status and trigger emergency | `/api/incident` should be called with incident payload |
| UT-27 | Channel Manager | Verify pending incident is cleared after success | Mock successful `/api/incident` response | Pending incident should be removed from localForage |
| UT-28 | Channel Manager | Verify SMS body with GPS | Initiate SMS with coordinates | SMS body should include emergency ID and formatted location |
| UT-29 | Channel Manager | Verify SMS body without GPS | Initiate SMS with null GPS | SMS body should include `LOC:UNKNOWN` |
| UT-30 | Incident Service | Verify new incident creation | Call `mergeOrCreate()` when no matching incident exists | New incident should be inserted in `incidents` table |

## Member 4: Safety Check, Volunteer, AI, and News

| Test Case ID | Module / Component | Test Objective | Test Steps / Input | Expected Result |
| --- | --- | --- | --- | --- |
| UT-31 | Safety Utility | Verify distance for same coordinates | Call `calculateDistance()` with identical coordinates | Distance should be `0` or very close to `0` |
| UT-32 | Safety Utility | Verify distance for different coordinates | Call `calculateDistance()` with two different locations | Distance should be greater than `0` |
| UT-33 | Safety Utility | Verify marking emergency as asked | Call `markEmergencyAsAsked()` with emergency ID | Emergency ID should be saved in localStorage |
| UT-34 | Safety Utility | Verify already asked emergency check | Call `hasBeenAskedAboutEmergency()` for saved ID | Function should return `true` |
| UT-35 | Safety Utility | Verify safe status saving | Call `saveSafetyStatus()` with `isSafe = true` | Safety status should be stored as safe in localStorage |
| UT-36 | Safety Utility | Verify need-help status saving | Call `saveSafetyStatus()` with `isSafe = false` | Safety status should be stored as not safe in localStorage |
| UT-37 | Volunteer Filter Panel | Verify emergency type filter | Select a specific emergency type | Only emergencies matching selected type should be shown |
| UT-38 | Volunteer Filter Panel | Verify location filter | Enter location text in filter | Only emergencies with matching address text should be shown |
| UT-39 | AI Assistant Button | Verify AI modal opens | Click AI Assistant button | AI assistant modal should appear |
| UT-40 | News Page | Verify empty news state | Mock API response with empty articles array | Page should show no news / empty state message |

