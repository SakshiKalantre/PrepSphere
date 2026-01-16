export function getChatReply(input: string): string | null {
  const msg = input.toLowerCase()

  const links = {
    home: '/',
    signIn: '/sign-in',
    signUp: '/sign-up',
    studentDashboard: '/dashboard/student',
    tpoDashboard: '/dashboard/tpo',
    adminDashboard: '/dashboard/admin',
    apiDocs: 'http://localhost:8000/docs'
  }

  const contact = {
    email: 'placements@smpndoshi.edu.in'
  }

  if (/(help|hi|hello|start|guide)/.test(msg)) {
    return `Welcome to PrepSphere! I can help with:
- Registration and login
- Role-based dashboards (Student, TPO, Admin)
- Jobs and Events

Quick links:
- Sign In: ${links.signIn}
- Sign Up: ${links.signUp}
- Home: ${links.home}`
  }

  if (/(sign\s*up|register)/.test(msg)) {
    return `Sign Up:
- Go to ${links.signUp}
- Choose role: STUDENT, TPO or ADMIN
- TPO/Admin require a secret password (from admin)
- Student can use social login (Google/GitHub/LinkedIn)
- After signup, proceed to sign-in`
  }

  if (/sign\s*up.*(link|url)|signup.*(link|url)/.test(msg)) {
    return `Sign Up link: ${links.signUp}`
  }

  if (/(sign\s*in|login|log\s*in)/.test(msg)) {
    return `Sign In:
- Visit ${links.signIn}
- Student: use social login (Google/GitHub/LinkedIn)
- TPO/Admin: use email/password and secret password
- After sign-in, you’ll be redirected based on role:
  - Student: ${links.studentDashboard}
  - TPO: ${links.tpoDashboard}
  - Admin: ${links.adminDashboard}`
  }

  if (/sign\s*in.*(link|url)|login.*(link|url)/.test(msg)) {
    return `Sign In link: ${links.signIn}`
  }

  if (/(student.*dashboard|student.*profile|resume|certificate)/.test(msg)) {
    return `Student Dashboard (${links.studentDashboard}):
- Profile: edit personal details, degree, year, skills, about
- Documents: upload resume and certificates
- Jobs: view and apply to listings
- Events: register for upcoming workshops and talks`
  }

  if (/tpo.*dashboard|approve.*profile|review.*resume|job.*posting/.test(msg)) {
    return `TPO Dashboard (${links.tpoDashboard}):
- Approve student profiles
- Review uploaded resumes
- Create and manage job postings
- Manage campus events and send notifications`
  }

  if (/admin.*dashboard|manage.*users|analytics|content/.test(msg)) {
    return `Admin Dashboard (${links.adminDashboard}):
- Manage users and roles
- View analytics (users, jobs, applications)
- Edit college content and recruiters section`
  }

  if (/jobs?|openings|positions/.test(msg)) {
    return `Jobs:
- View current listings on the Student dashboard
- Backend API: GET /api/v1/jobs
- Each job includes title, company, location, salary, and deadlines`
  }

  if (/events?|workshop|session|talk/.test(msg)) {
    return `Events:
- Check upcoming events on the Student dashboard
- Backend API: GET /api/v1/events
- Includes date, time, and location`
  }

  if (/logout|sign\s*out|log\s*out/.test(msg)) {
    return `Logout:
- Use the Logout button at the top of any dashboard
- You will be redirected to ${links.home}`
  }

  if (/dashboard.*(student|tpo|admin).*link/.test(msg)) {
    if (/student/.test(msg)) return `Student Dashboard: ${links.studentDashboard}`
    if (/tpo/.test(msg)) return `TPO Dashboard: ${links.tpoDashboard}`
    if (/admin/.test(msg)) return `Admin Dashboard: ${links.adminDashboard}`
  }

  if (/api.*docs|documentation|swagger/.test(msg)) {
    return `API Documentation: ${links.apiDocs}`
  }

  if (/email|contact.*email|college.*email|placement.*email/.test(msg)) {
    return `College Placement Cell Email: ${contact.email}`
  }

  if (/clerk|social|google|github|linkedin/.test(msg)) {
    return `Authentication:
- Clerk is used for authentication
- Student: social login (Google/GitHub/LinkedIn)
- TPO/Admin: manual login with email/password and secret password
- Webhook syncs Clerk users to the database`
  }

  return null
}
