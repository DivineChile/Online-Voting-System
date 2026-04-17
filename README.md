# Student Voting System

A secure web-based student voting system for a polytechnic, built as an HND Final Year Project.

## Project Overview

This project is an online student election platform designed for institutional use only. It allows authorized users to manage elections, authenticate securely, cast votes, and view results based on role and election status.

The system is designed to ensure:

- only eligible students can vote
- each student can vote only once per election
- elections are controlled by admin users
- election officers can oversee election activities
- results are hidden until the election is closed and published
- all critical actions are secure, auditable, and role-based

## User Roles

### Admin
- create and manage users
- create elections
- add positions
- add candidates
- activate, close, and publish elections
- view audit logs
- view results

### Student
- log in with institution-provided credentials
- view active elections
- vote once per election
- view results only after publication

### Election Officer
- log in with institution-provided credentials
- monitor active elections
- oversee election activity
- access role-appropriate election views

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Supabase JavaScript client

### Backend
- Node.js
- Express
- Supabase server client

### Database / Infrastructure
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

## Project Structure

```text
student-voting-system/
├── frontend/
├── backend/
├── docs/
├── .gitignore
└── README.md