# TalentX Frontend – Instructions

## Purpose
This project is the frontend for the TalentX MVP.
It consumes the backend REST API exactly as defined.
It must not invent or assume backend behavior.

---

## Tech Stack (Mandatory)
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- NextAuth (Auth.js v5)
- shadcn

---

## Architectural Rules
- Backend is the source of truth
- Frontend does not duplicate business logic
- All role enforcement is reflected in UI AND backend
- REST API only (no direct DB access)

---

## Authentication
- Use NextAuth with email-based authentication
- Store access token in session
- Attach token to every backend request:
  Authorization: Bearer <token>

Session must expose:
```ts
{
  user: {
    id: string
    role: "EMPLOYER" | "TALENT"
  }
}
Shared Types (Must Match Backend)
export type UserRole = "EMPLOYER" | "TALENT";
export type ApplicationSource = "MANUAL" | "INVITATION";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";
Required Pages
Public
/jobs → Job listing

/jobs/[id] → Job detail

Auth
/login

/onboarding → Select role (EMPLOYER or TALENT)

Employer
/employer/dashboard

/employer/jobs/new

/employer/jobs/[id]

Talent
/talent/dashboard

/talent/invitations

Core UI Rules
Job Listing
Show:

Job title

Company name

Application count

Search by title

Job Detail
Publicly accessible

Show:

Title

Company

Tech stack

Description

Deadline

Apply button:

Disabled if expired

If guest → redirect to login

After login → return to same job

Employer Flow
Create Job
Input:

Title

Company name

Tech stack

Deadline

On submit:

Call backend

Backend generates JD

Display generated description

View Applicants
List applicants with:

Name

Source (MANUAL | INVITATION)

Talent Matching
Display AI score (0–100)

Allow inviting talent

Talent Flow
Job Feed
Ranked job list based on AI score

Display score clearly

Apply to Job
Call backend apply endpoint

Source:

MANUAL or INVITATION

Invitations
List invitations

Show:

Company name

Job title

Deadline

Status

Allow Accept / Decline

Data Fetching Rules
Use fetch or a lightweight wrapper

Always handle loading & error states

Never assume successful responses

Styling Rules
Tailwind CSS v4 only

use shadcn as component library

Clean, readable UI over visual polish

