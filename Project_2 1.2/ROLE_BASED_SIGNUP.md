# Role-Based Signup Implementation

This document explains how the role-based signup feature has been implemented in the PrepSphere application.

## Overview

The role-based signup feature allows users to select their role (Student, TPO, or Admin) during the signup process. The selected role is stored in the database and used to determine the user's access level in the application.

## Implementation Details

### Frontend Implementation

1. **Custom Signup Page**: A custom signup page has been created at `/app/sign-up/[[...sign-up]]/page.tsx` that includes a dropdown for role selection.

2. **Role Selection Dropdown**: The signup form includes a dropdown with the following options:
   - Student (default)
   - TPO (Training and Placement Officer)
   - Admin

3. **Unsafe Metadata**: The selected role is passed to Clerk using the `unsafeMetadata` property, which is then sent to the backend via webhooks.

### Backend Implementation

1. **Webhook Endpoint**: A new webhook endpoint has been created at `/api/v1/clerk/webhook` to handle user creation events from Clerk.

2. **Role Extraction**: The webhook endpoint extracts the role from the `unsafe_metadata` field in the Clerk webhook payload.

3. **Database Storage**: The user's role is stored in the `users` table in the PostgreSQL database using the correct enum values:
   - `STUDENT` (uppercase)
   - `TPO` (uppercase)
   - `ADMIN` (uppercase)

## How It Works

1. User visits the signup page and selects their role from the dropdown
2. User completes the signup process with Clerk
3. Clerk sends a webhook notification to the backend
4. Backend webhook endpoint receives the notification
5. Backend extracts the role from the webhook payload
6. Backend creates a new user record in the database with the selected role
7. User can now log in and will be directed to the appropriate dashboard based on their role

## Testing the Implementation

### 1. View Current Users
Run the following script to see all users and their roles:
```bash
python view_users_with_roles.py
```

### 2. Test Webhook Endpoint
Run the following script to test the webhook endpoint:
```bash
python test_role_signup.py
```

### 3. Manual Database Verification
You can also verify the data directly in PostgreSQL:
```sql
SELECT id, email, first_name, last_name, role FROM users ORDER BY created_at DESC;
```

## Important Notes

1. **Enum Values**: The database uses uppercase enum values (`STUDENT`, `TPO`, `ADMIN`) to match the PostgreSQL enum type.

2. **Default Role**: If no role is specified during signup, the system defaults to `STUDENT`.

3. **Webhook Security**: In production, you should enable webhook signature verification by uncommenting the verification code in `clerk_webhook.py`.

4. **Clerk Configuration**: Make sure to configure the webhook URL in your Clerk dashboard to point to your backend endpoint.

## Troubleshooting

### "invalid input value for enum userrole" Error
This error occurs when trying to insert a role value that doesn't match the enum values in the database. Ensure you're using:
- ✅ `'STUDENT'` (uppercase)
- ✅ `'TPO'` (uppercase)
- ✅ `'ADMIN'` (uppercase)
- ❌ `'student'` (lowercase)
- ❌ `'Student'` (mixed case)

### Webhook Not Receiving Events
1. Check that the webhook URL is correctly configured in your Clerk dashboard
2. Ensure your backend server is running and accessible
3. Verify the webhook secret in `clerk_webhook.py`