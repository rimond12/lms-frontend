Plan: Professional Activity History System (Full-Stack)
TL;DR: The server already has a complete ActivityHistory module (model, service, controller, routes) — it's just not wired up. The plan activates it by: (1) registering the route, (2) calling logActivity() across every significant controller, (3) building a new RTK Query API + type layer on the client, (4) creating a reusable component library, and (5) building an admin page with both Table and Feed tabs + stats cards. No new server architecture needed — pure integration work.

Steps

PHASE 1 — Server: Register the Route
Edit index.ts — import ActivityHistoryRoutes from ../app/modules/ActivityHistory/activityHistory.routes and add { path: "/activity-history", route: ActivityHistoryRoutes } to the moduleRoutes array. This exposes all 8 existing endpoints.
PHASE 2 — Server: Wire logActivity() Into All Controllers
Call ActivityHistoryService.logActivity(req, actionType, entity, description, entityId?, metadata?) at the end of each mutating operation (after the service call succeeds). Each group:

Core Group:
2. auth controllers — login → CREATE / 'Session', register → CREATE / 'User', changePassword / resetPassword → UPDATE / 'User'
3. User controllers — createUser → CREATE / 'User', updateUser → UPDATE / 'User', deleteUser → DELETE / 'User', role/status changes → UPDATE
4. enrollment.controller.ts — enrollUser → CREATE / 'Enrollment', status-change mutations → UPDATE
5. payment.controller.ts — createSSLSession → CREATE / 'Payment', IPN/success callback → UPDATE / 'Payment'

Content Group:
6. Course/Program controllers (src/app/modules/courses/) — CREATE, UPDATE, DELETE / 'Course'
7. Batch controllers (src/app/modules/batch/) — CREATE, UPDATE, DELETE / 'Batch'
8. Notice controllers (src/app/modules/notice/) — CREATE, UPDATE, DELETE / 'Notice'

Academic Group:
9. Assignment controllers (src/app/modules/assignment/) — CREATE, UPDATE, DELETE / 'Assignment'
10. Assignment Submission controllers (src/app/modules/assignmentSubmission/) — CREATE, UPDATE / 'AssignmentSubmission'
11. Quiz controllers (src/app/modules/quiz/) — CREATE, UPDATE, DELETE / 'Quiz'; Quiz Attempt → CREATE / 'QuizAttempt'
12. Certificate controllers (src/app/modules/certificate/) — CREATE / 'Certificate', revoke → DELETE

Everything Else:
13. Banner, BlogEventNews, category, voucher, EventCalendar, expartPanel — CREATE, UPDATE, DELETE per entity name

Pattern per controller: await ActivityHistoryService.logActivity(req, 'CREATE', 'Course', 'New course created: ${result.title}', result._id?.toString(), { title: result.title }) — always inside catchAsync, after a successful service call. The service internally swallows errors so it never breaks the main response.

PHASE 3 — Client: Types + API Layer
Create LMS-CLIENT-CODE/src/types/activityHistory.ts — define IActivityHistory, IActivityHistoryFilters, IActivityStats, TActionType = 'CREATE' | 'UPDATE' | 'DELETE'

Add 'ActivityHistory' to the tagTypes array in baseApi.ts

Create LMS-CLIENT-CODE/src/app/redux/api/activityHistoryApi.ts using baseApi.injectEndpoints — export:

useGetAllActivitiesQuery(filters) → GET /activity-history
useGetActivityStatsQuery(filters?) → GET /activity-history/stats
useGetMyActivitiesQuery() → GET /activity-history/my-activities
useGetUserActivityHistoryQuery(userId) → GET /activity-history/user/:userId
useGetActivitiesByEntityIdQuery(entityId) → GET /activity-history/entity/:entityId
useDeleteActivityMutation() → DELETE /activity-history/:id
useDeleteActivitiesBulkMutation() → DELETE /activity-history/bulk-delete
PHASE 4 — Client: Reusable Component Library
Create all under LMS-CLIENT-CODE/src/components/admin/ActivityHistory/:

ActivityBadge.tsx — colored Tailwind badge: CREATE = green, UPDATE = blue, DELETE = red. Reusable anywhere.

ActivityEntityBadge.tsx — entity chip (e.g. Course, User, Payment) with distinct soft colors. Reusable anywhere.

ActivityFilters.tsx — filter bar with: text search input, action type select, entity select, date range picker, user email input, and a Reset button. Accepts filters state + onChange callback prop — fully controlled.

ActivityStats.tsx — 4-card row: Total Activities, Created count, Updated count, Deleted count, plus a Top Entities breakdown list. Uses useGetActivityStatsQuery.

ActivityTable.tsx — full paginated <Table> with columns: Timestamp, User (name + role), Action (badge), Entity (badge + EntityId link), Description, IP. Accepts filters prop and handles pagination internally via useGetAllActivitiesQuery. Includes per-row delete button (admin only) and a bulk-delete button when rows are selected.

ActivityFeed.tsx — vertical timeline of activity entries. Each entry: avatar/icon, user name + role tag, action badge, description, relative timestamp (2 mins ago). Accepts limit prop (default 20). Uses useGetAllActivitiesQuery. Reusable as a dashboard widget.

index.ts — barrel export of all above components.

PHASE 5 — Client: Admin Dashboard Page
Create LMS-CLIENT-CODE/src/app/[locale]/(CommonLayout)/(dashboard)/dashboard/manage-activity/page.tsx — admin-protected page with:

Header: "Activity Log" + subtitle
<ActivityStats /> cards row at top
<ActivityFilters /> shared filter state (lifted to page level, passed down to both tab views)
Two tabs (using existing shadcn <Tabs> component): "Table View" renders <ActivityTable filters={filters} /> | "Feed View" renders <ActivityFeed filters={filters} />
Tab state in URL query param (?view=table / ?view=feed) for shareability
Add <ActivityFeed limit={10} /> as a "Recent Activity" widget to the existing main dashboard/page.tsx/(dashboard)/dashboard/page.tsx) (admin only, in a sidebar card or bottom section).

PHASE 6 — Navigation
Find the admin sidebar component (likely in shared or components/admin/) and add a navigation link: Activity Log → /dashboard/manage-activity, with an appropriate icon (e.g. ClipboardList from lucide-react).
Verification

Start the server and hit GET /api/activity-history with an admin JWT — should return empty array initially
Perform a login, enrollment, or course creation → call the endpoint again → log should appear with correct performedBy, actionType, entity, description
Open /dashboard/manage-activity in the browser — stats cards should show totals, both tabs should render and filter correctly
Test DELETE /api/activity-history/:id from the admin page table row
Confirm ActivityFeed widget appears on main dashboard page
Decisions

No VIEW action type added — interface stays CREATE | UPDATE | DELETE as designed; view tracking would flood the log and isn't requested
Admin-only UI — user-facing "My Activity" tab skipped per your choice
ActivityFeed built as reusable widget (not page-specific) so it can be dropped anywhere (course detail, user profile, etc.) in the future
logActivity() wrapped in try/catch or uses the existing built-in error-swallowing so a logging failure never breaks the main API response