# GigFlow – Where Opportunities Flow to You

GigFlow is an AI-powered career ecosystem that combines job searching, freelancing, AI career tools, professional development, career coaching, learning resources, and career analytics into one seamless platform.

This application is built using ONLY native HTML5, CSS3 (Vanilla CSS), and Vanilla JavaScript. No node modules, frameworks, or dependencies are required.

## Folder Structure

```
GigFlow/
│
├── index.html                  # Landing Page / Portal
├── login.html                  # Auth Portal
├── signup.html                 # Auth Signup
├── dashboard.html              # Main App Dashboard
├── profile.html                # User Profile Manager
├── jobs.html                   # Job Board / Listings
├── job-details.html            # Job Details View
├── freelance.html              # Freelance Project List
├── project-details.html        # Freelance Project Details
├── ats-checker.html            # AI ATS Score & Resume Keyword Tool
├── resume-builder.html         # Live Resume Creator
├── cover-letter.html           # AI Cover Letter Generator
├── interview-prep.html         # AI Mock Interview Practice
├── application-tracker.html    # Kanban Job tracking board
├── learning.html               # Learning Roadmaps & Courses
├── portfolio.html              # Interactive Portfolio Builder
├── analytics.html              # Interactive Statistics Dashboard
├── live-coach.html             # Live Chat & Coach Booking System
├── settings.html               # User preferences & theme settings
│
├── css/
│   ├── style.css               # Design system & theme tokens
│   ├── dashboard.css           # Global layout & sidebar
│   ├── pages.css               # Page-specific styling
│   ├── animations.css          # Keyframes & shimmers
│   └── responsive.css          # Mobile query overrides
│
└── js/
    ├── app.js                  # Shared layouts & theme switcher
    ├── auth.js                 # Authentication validator
    ├── storage.js              # LocalStorage mock databases
    ├── dashboard.js            # Dashboard logic
    ├── jobs.js                 # Jobs listings manager
    ├── freelance.js            # Freelance bids manager
    ├── tracker.js              # Kanban board drag & drop
    ├── analytics.js            # Visual SVG line/bar chart builder
    └── profile.js              # Profile inputs manager
```

## Running the Application

1. Open your code editor (e.g. VS Code) in the `GigFlow/` folder.
2. Double click `index.html` or open it using any browser of your choice.
3. The platform will run instantly. Routing works via relative paths.

## Key Features

1. **Light / Dark Mode**: Theme switch persists across sessions using `localStorage` triggers.
2. **Layout Injector**: Global navbar, sidebar, and footer elements are injected via standard JavaScript arrays dynamically, preventing repeated code while avoiding CORS issues when running from `file://` protocol.
3. **Persisted Profile**: Profile editing forms save details immediately, including photo uploader support converting images to base64 URIs.
4. **Kanban drag-and-drop**: Change status checkpoints of job applications by dragging cards directly on columns.
5. **Interactive SVG Charts**: Progression graphs and application metrics charts drawn dynamically using customized math algorithms in JS and pure CSS vectors.
