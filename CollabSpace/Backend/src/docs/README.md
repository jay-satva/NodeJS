# CollabSpace API Docs

## Swagger

- UI: `http://localhost:3000/api-docs`
- Raw OpenAPI JSON: `http://localhost:3000/api-docs.json`
- Alternate JSON route: `http://localhost:3000/api/openapi.json`

Swagger is mounted from [index.ts](C:/Jay/Nodejs/CollabSpace/Backend/index.ts) and uses [openapi.json](C:/Jay/Nodejs/CollabSpace/Backend/src/docs/openapi.json).

## Postman

Import [CollabSpace.postman_collection.json](C:/Jay/Nodejs/CollabSpace/Backend/src/docs/CollabSpace.postman_collection.json) into Postman.

Collection variables included:

- `baseUrl`
- `token`
- `orgId`
- `projectId`
- `taskId`
- `commentId`
- `tagId`
- `userId`

Recommended flow:

1. Run `POST {{baseUrl}}/api/auth/register`
2. Run `POST {{baseUrl}}/api/auth/login`
3. Copy the returned JWT into the collection variable `token`
4. Use organization, project, task, tag, and comment routes

## Role Rules

- `SUPER_ADMIN`
  - create organizations
  - see all users
  - manage all organizations, projects, tasks, tags, and comments
- org `ADMIN`
  - manage members inside that organization
  - manage projects, tasks, and tags in that organization
- org `MANAGER`
  - manage projects, tasks, and tags in that organization
- org `MEMBER`
  - read organization/project/task data they can access
  - update status only for tasks assigned to them
  - comment on tasks inside accessible projects

## Task Workflow

Task status transitions are strict:

`BACKLOG -> ONGOING -> DEVELOPMENT_COMPLETED -> UNIT_TESTING -> QA -> QA_COMPLETED -> COMPLETED`

The board endpoint returns tasks grouped by status in one request:

- `GET /api/organizations/:orgId/projects/:projectId/tasks/board`

Assignment changes are available at:

- `GET /api/organizations/:orgId/projects/:projectId/tasks/:taskId/assignment-history`

Activity logs are available at:

- `GET /api/organizations/:orgId/projects/:projectId/tasks/:taskId/activity-logs`
