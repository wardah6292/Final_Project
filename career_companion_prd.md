# Career Companion — Product Requirements Document

## Header

**Project Name:** Career Companion  
**Date:** 02 Jan 2026  
**Author(s):** You  
**Version:** v1.0  

**Short Pitch**  
Career Companion is a personal AI assistant for students and early-career job seekers (0–3 years) that helps them decide whether to apply for a role and how to apply effectively. It analyzes CVs against job descriptions, explains fit and skill gaps with clear keyword insights, and generates tailored cover letters—reducing uncertainty, repeated effort, and stress during the application process.

**Relevant Links**  
TBD

---

## 1) Core Context

### Problem
Students and early-career job seekers apply to many roles simultaneously but lack clear signals on whether a role is worth applying to and how to prepare effectively. Job descriptions are vague, rejection feedback is rare, and candidates are unsure if their CV truly matches role expectations. This uncertainty leads to stress, repeated effort, and reduced confidence throughout the job search.

### Solution
Career Companion provides a single workspace where users can evaluate job fit before applying. By analyzing CVs against job descriptions, explaining skill gaps and keyword relevance, and generating tailored cover letters, the product prioritizes confident decision-making and learning—not just content generation.

### Target Users
- University students applying for internships or graduate roles  
- Early-career professionals (0–3 years experience)  
- Career switchers targeting entry-level roles

### Primary Use Cases
1. User uploads a CV and pastes a job description
2. System analyzes role fit and keyword alignment
3. User reviews explained skill gaps and strengths
4. System recommends whether applying is worthwhile
5. User generates a tailored cover letter
6. Application materials are saved together

### North-Star Metric
Percentage of analyzed roles where users report confidence in their decision to apply or not apply.

### Non-Goals
- Job discovery or aggregation
- Full resume rewriting or formatting tools
- Interview preparation or mock interviews (V1)
- Recruiter-facing or employer analytics

---

## 2) UX Foundations

### Personas
**Primary Persona — The Uncertain Applicant**  
A student or early-career professional applying to many roles, unsure how to assess fit and frustrated by repeated rejections without feedback.

### Key Insights / Pain Points
- Unsure which roles are worth the effort
- Rewrites similar cover letters repeatedly
- Does not understand why they are rejected
- Overwhelmed by scattered documents

### Experience Principles
- **Explain, don’t just generate**
- **Reduce cognitive load**
- **Build confidence through clarity**
- **Keep the experience calm and supportive**

### Accessibility & Inclusion Requirements
- Clear, simple language (non-technical)
- Keyboard navigation support
- High-contrast UI and readable typography

### High-Level Journey
Upload CV → Paste job description → Review fit analysis → Decide to apply → Generate cover letter → Save application

---

## 3) Scope & Priorities

### MVP (V1) Goals
- CV and job description analysis
- Keyword and skill gap explanation
- Apply / Don’t Apply recommendation
- Cover letter generation
- Application-level storage

### Out of Scope
- Resume formatting tools
- Employer feedback loops
- Multi-language support (V1)

### Assumptions & Risks
- AI explanations are trusted by users
- Job descriptions contain enough signal
- Risk of over-reliance on recommendations

---

## 4) Tech Overview

### Frontend
- Web app (React)

### Backend
- Node.js or Python service

### Database
- Relational DB for users and applications

### APIs / Integrations
- LLM API for analysis and generation

### Deployment
- Cloud-hosted (e.g. Vercel + managed backend)

### Security / Privacy
- User data stored securely
- No CVs shared with third parties

---

## 5) Feature Modules

### 5.1 Job Fit Analysis (P0)

**User Story**  
As a user, I want to know how well my CV matches a job description so I can decide whether applying is worthwhile.

**Acceptance Criteria**
- User can upload a CV and paste a job description
- System highlights matching and missing keywords
- System explains skill gaps in plain language
- Fit score or qualitative assessment is shown

---

### 5.2 Apply Recommendation (P0)

**User Story**  
As a user, I want a clear recommendation on whether to apply so I can prioritize my effort.

**Acceptance Criteria**
- System provides Apply / Borderline / Don’t Apply guidance
- Recommendation is explained with reasons
- User can proceed regardless of recommendation

---

### 5.3 Cover Letter Generator (P1)

**User Story**  
As a user, I want a tailored cover letter so I can apply faster without rewriting from scratch.

**Acceptance Criteria**
- Generated letter references job-specific keywords
- Tone is professional and entry-level appropriate
- User can edit and regenerate

---

## 6) AI Design

### System Prompt / Rules
- Prioritize explanation before generation
- Avoid absolute claims or guarantees
- Use supportive, non-judgmental tone

### Prompt Patterns
- CV ↔ JD comparison prompts
- Explanation-first response templates
- Controlled generation for cover letters

### Safety & Reliability Notes
- Avoid discouraging language
- Make uncertainty explicit
- Encourage user judgment

---

## 7) IA, Flows & UI

### Main Screens
- Upload & Analyze
- Fit Analysis Results
- Cover Letter Editor
- Saved Applications

### Key Flows
Analyze → Review → Decide → Generate → Save

### Design Tokens / Components
- Neutral color palette
- Card-based analysis sections

### Localization / Tone
- English only (V1)
- Calm, encouraging, professional tone

---

## 8) Iteration & Workflow

### Sprint Rhythm
- 1–2 week iterations

### Review Process
- Manual QA + self-review

### Spike / Risk Items
- Prompt reliability
- Explanation clarity

---

## 9) Quality

### Testing Requirements
- Core flows manually tested
- Edge cases for weak CVs

### Accessibility Checks
- Keyboard navigation
- Contrast compliance

### Performance Targets
- Analysis response <10s

---

## 10) Metrics & Analytics

### Events & Data
- CV uploaded
- Analysis completed
- Recommendation viewed
- Cover letter generated

### KPIs
- Analyses per user
- Repeat usage
- Self-reported confidence

### Experimentation
- Compare explanation depth vs confidence

---

## 11) Launch & Operations

### Environments
- Local
- Production

### Rollout Plan
- Personal use
- Portfolio demo

### Support & Maintenance
- No live support (personal project)

