# SkillBridge+

SkillBridge+ is a student opportunity discovery and application platform. Students can browse internships, workshops, competitions, and other opportunities, view details, and submit applications. Administrators can manage the opportunity catalog and review platform activity.

The project is a lightweight full-stack web application built with a Node.js/Express server, MongoDB persistence, server-side sessions, and a static HTML/CSS/JavaScript frontend.

## Features

### Students

- Create a student account and sign in
- Browse all published opportunities
- Search opportunities by title
- View opportunity details, dates, deadlines, categories, descriptions, and venues
- Apply to an opportunity before its deadline
- Prevent duplicate applications
- View previously submitted applications
- View whether an application is pending, approved, or rejected
- Sign out from the application

### Administrators

- Sign in through the same login page using an administrator account
- View dashboard counts for students, opportunities, and applications
- Create opportunities
- Edit existing opportunities
- Delete opportunities
- List registered students
- Delete a student and their applications
- Review all student applications
- Approve or reject individual applications
- Delete an individual application
- Automatically remove applications associated with a deleted opportunity

## Tech stack

- **Runtime:** Node.js
- **Backend:** Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** Express sessions with bcryptjs password hashing
- **Frontend:** HTML, CSS, and browser JavaScript
- **Configuration:** dotenv

## Project structure

```text
SkillBridge/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── main.js
│   │   └── student.js
│   ├── admin-applications.html
│   ├── admin-students.html
│   ├── admin.html
│   ├── applications.html
│   ├── index.html
│   ├── login.html
│   ├── manage-opportunities.html
│   ├── opportunity-form.html
│   ├── opportunity.html
│   ├── opportunities.html
│   ├── register.html
│   └── student.html
├── server/
│   ├── models/
│   │   ├── Application.js
│   │   ├── Opportunity.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── opportunities.js
│   │   └── student.js
│   ├── app.js
│   └── db.js
├── .env
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or later
- npm
- A MongoDB database, such as a MongoDB Atlas cluster

## Getting started

1. Clone or download the repository.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root. Do not commit this file.

   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   SESSION_SECRET=replace-with-a-long-random-secret
   NODE_ENV=development
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=replace-with-a-secure-password
   ```

   `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` must be set before starting the server. The application uses the admin credentials to create the first administrator account if no administrator exists.

4. Start the application:

   ```bash
   npm start
   ```

   The server listens on `http://localhost:3000` by default. Set `PORT` in `.env` to use another port.

5. Open [http://localhost:3000](http://localhost:3000) in a browser.

The `dev` script currently starts the same server as `npm start`; it does not provide file watching or automatic restarts.

## Application flow

### Authentication and sessions

Registration creates a student account, hashes the password with bcryptjs, and starts a session. Login works for both students and administrators. The browser uses the session endpoint to decide which dashboard to show.

Role checks are enforced on the server:

- Student endpoints require a session with the `student` role.
- Admin endpoints require a session with the `admin` role.
- Passwords are stored as bcrypt hashes rather than plain text.

### Opportunity lifecycle

Administrators provide a title, description, category, event date, application deadline, and venue. The server rejects an opportunity when its deadline is after the event date.

Students can apply while the deadline day is still active. The application check treats the deadline as ending at `23:59:59.999` UTC. Each student can apply to a given opportunity only once.

## API reference

All API requests are served by the same Express application.

### Session and authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/session` | Public | Returns the current session user, or `null`. |
| `POST` | `/api/auth/register` | Public | Creates a student account and starts a session. |
| `POST` | `/api/auth/login` | Public | Authenticates a student or administrator. |
| `POST` | `/api/auth/logout` | Authenticated | Destroys the current session. |

### Public opportunities

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/opportunities` | Public | Lists opportunities; optional `search` query filters by title. |
| `GET` | `/api/opportunities/:id` | Public | Returns one opportunity by MongoDB ID. |

### Student endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/student/applications` | Student | Lists the signed-in student's applications. |
| `POST` | `/api/student/apply` | Student | Submits an application using `{ "opportunityId": "..." }`. |

### Administrator endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/admin/dashboard` | Admin | Returns student, opportunity, and application counts. |
| `GET` | `/api/admin/opportunities` | Admin | Lists all opportunities for management. |
| `POST` | `/api/admin/opportunities` | Admin | Creates an opportunity. |
| `PUT` | `/api/admin/opportunities/:id` | Admin | Updates an opportunity. |
| `DELETE` | `/api/admin/opportunities/:id` | Admin | Deletes an opportunity and its applications. |
| `GET` | `/api/admin/applications` | Admin | Lists all applications with student and opportunity details. |
| `PUT` | `/api/admin/applications/:id/status` | Admin | Approves or rejects one application using `{ "status": "approved" }` or `{ "status": "rejected" }`. |
| `DELETE` | `/api/admin/applications/:id` | Admin | Deletes one application. |
| `GET` | `/api/admin/students` | Admin | Lists registered students. |
| `DELETE` | `/api/admin/students/:id` | Admin | Deletes one student and their applications. |

## Data models

### User

- `name`
- `email` (unique)
- `password` (bcrypt hash)
- `role` (`student` or `admin`)
- `createdAt`

### Opportunity

- `title`
- `description`
- `category`
- `date`
- `deadline`
- `venue`
- `createdAt`

### Application

- `studentId` (reference to `User`)
- `opportunityId` (reference to `Opportunity`)
- `status` (`pending`, `approved`, or `rejected`)
- `appliedAt`

## Frontend pages

| Page | Purpose |
| --- | --- |
| `index.html` | Public landing page |
| `opportunities.html` | Search and browse opportunities |
| `opportunity.html` | View one opportunity and apply |
| `login.html` | Sign in |
| `register.html` | Create a student account |
| `student.html` | Student dashboard |
| `applications.html` | Student's applications |
| `admin.html` | Administrator dashboard |
| `admin-students.html` | List and delete student accounts |
| `manage-opportunities.html` | Create, edit, and delete opportunities |
| `opportunity-form.html` | Opportunity create/edit form |
| `admin-applications.html` | Review all applications |

## UI and UX

The frontend uses a small custom design system in `public/css/style.css` rather than a UI framework. It provides:

- A restrained teal and blue color theme
- Consistent navigation, buttons, cards, forms, and status badges
- Responsive layouts for smaller screens
- Clear application status indicators for `pending`, `approved`, and `rejected`
- Accessible labels and visible input focus states

## Development notes

- Static files in `public/` are served directly by Express.
- `server/app.js` loads environment variables, connects to MongoDB, configures sessions, serves the frontend, and mounts API routers.
- `server/db.js` connects to MongoDB and bootstraps the first admin account when needed.
- There is currently no automated test suite or lint script in `package.json`.
- Deleting a student also deletes that student's applications.

## Security considerations

Before deploying beyond local development:

- Replace all development credentials and use a strong, randomly generated `SESSION_SECRET`.
- Keep `.env` out of version control and rotate any credentials that may have been exposed.
- Configure secure, HTTP-only, same-site session cookies for production.
- Use HTTPS in production.
- Add validation and rate limiting appropriate for a public deployment.
- Restrict MongoDB network access and use a least-privilege database user.

## License

No license has been specified for this project yet.
