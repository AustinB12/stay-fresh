# Plan: Email & Password Authentication

## Overview

Add email/password sign-up and sign-in alongside the existing Google OAuth flow. Supabase supports this natively with no extra dependencies needed.

---

## Supabase Setup

- In the Supabase dashboard, go to **Authentication → Providers** and confirm **Email** is enabled.
- Decide whether to require email confirmation. For a smoother dev experience, disable "Confirm email" under **Auth → Settings** initially, then re-enable for production.

---

## 1. Extend `AuthProvider.tsx`

Add three new methods to `AuthContextType` and implement them:

```ts
signUpWithEmail: (email: string, password: string) =>
  Promise<{ error: string | null }>;
signInWithEmail: (email: string, password: string) =>
  Promise<{ error: string | null }>;
resetPassword: (email: string) => Promise<{ error: string | null }>;
```

Implementations use the existing `supabase` client:

- `supabase.auth.signUp({ email, password })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })`

---

## 2. Update `Login.tsx`

Refactor the login page into a tabbed/toggled layout with two views:

### View A — Sign In

- Email `<Input>` + Password `<Input type="password">`
- "Sign In" button → calls `signInWithEmail`
- "Forgot password?" link → switches to a small inline reset form
- Divider ("or")
- Existing "Sign in with Google" button

### View B — Sign Up

- Email `<Input>` + Password `<Input type="password">` + Confirm Password field
- Client-side validation: passwords match, minimum length (8 chars)
- "Create Account" button → calls `signUpWithEmail`
- Show success message if email confirmation is required ("Check your inbox")
- Divider + Google button

Toggle between views with a "Don't have an account? Sign up" / "Already have an account? Sign in" text link below the form.

---

## 3. Password Reset Flow

- On "Forgot password?" click, show an inline email field + "Send reset link" button.
- On success, show a confirmation message.
- Supabase sends the user a magic link; no additional page/route needed unless you want to handle the `type=recovery` session event to show a "Set new password" form.

### Optional — Handle recovery redirect

If you want an in-app "set new password" screen:

- Detect `supabase.auth.onAuthStateChange` event `PASSWORD_RECOVERY`
- Show a modal/page with a new password field
- Call `supabase.auth.updateUser({ password: newPassword })`

---

## 4. Error Handling

Map common Supabase error messages to user-friendly strings:
| Supabase error | Displayed message |
|---|---|
| `Invalid login credentials` | "Incorrect email or password." |
| `User already registered` | "An account with this email already exists." |
| `Email not confirmed` | "Please confirm your email before signing in." |
| `Password should be at least 6 characters` | "Password must be at least 8 characters." |

---

## 5. Files to Change

| File                              | Change                                                                |
| --------------------------------- | --------------------------------------------------------------------- |
| `src/components/AuthProvider.tsx` | Add `signUpWithEmail`, `signInWithEmail`, `resetPassword` to context  |
| `src/components/Login.tsx`        | Full refactor: tabbed sign-in/sign-up UI, email fields, error display |

No routing changes needed — the existing conditional render in `App.tsx` that shows `<Login>` when `user` is null handles everything.

---

## Out of Scope

- Social providers beyond Google
- Magic link / passwordless email
- Username-based auth
