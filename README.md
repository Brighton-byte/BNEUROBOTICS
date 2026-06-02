# 🤖 BNEUROBOTICS

**Empowering Innovation Through Artificial Intelligence, Machine Learning, and Robotics**

BNEUROBOTICS is a technology and education platform dedicated to advancing learning, innovation, and practical development in Artificial Intelligence (AI), Machine Learning (ML), Robotics, Embedded Systems, and emerging technologies.

The platform serves as both an educational hub and a marketplace, providing learners, educators, researchers, and innovators with access to quality robotics components, development boards, sensors, modules, and learning resources required to build the technologies of tomorrow.

---

## 🚀 Mission

To make AI, Machine Learning, and Robotics education accessible while providing the tools, components, and resources needed to transform ideas into real-world solutions.

---

## 🌟 What We Offer

### 📚 Education & Learning

* Artificial Intelligence Fundamentals
* Machine Learning Concepts
* Robotics Engineering
* Embedded Systems
* Programming Tutorials
* Project-Based Learning
* STEM Education Resources
* Innovation and Research Support

### 🛒 Robotics & Technology Store

* Arduino Boards
* Raspberry Pi Boards
* Sensors and Modules
* Robotics Kits
* Electronic Components
* Development Tools
* AI Hardware Solutions
* Educational Technology Equipment

### 🔬 Innovation & Research

* AI Projects
* Robotics Projects
* Automation Solutions
* Smart Systems Development
* Research and Prototyping
* Emerging Technology Applications

---

---

## 🛠️ Technology Stack & Core Modules

The BNeurobotics system is split into two layers:

1. **Frontend (Decoupled Client)**
   - **HTML5 & Vanilla Javascript**: Fast client render, modular components.
   - **Vanilla CSS**: Custom styling tokens with dynamic high-contrast and responsive layouts.
   - **Progressive Web App (PWA)**: Runs service-worker cache logic, offline capability, installation support.
   - **SEO/Accessibility**: Custom structures satisfying WCAG 2.1 AA and meta tag schemas.

2. **Backend (API Server)**
   - **Node.js & Express**: API Router, secure rate limiting, error routing.
   - **MongoDB (via Mongoose)**: NoSQL object databases.
   - **Security**: Bcrypt password hashing, JWT stateless authentication, Helmet.js headers, rate-limiting, and sanitized inputs.

---

---

## ✨ Website Features

* Responsive Design
* Modern User Interface
* Educational Content
* Product Showcase
* Technology Resources
* Project Portfolio
* Contact and Collaboration Opportunities

---

## 🎯 Target Audience

BNEUROBOTICS is designed for:

* Students
* Teachers and Educators
* Researchers
* Robotics Enthusiasts
* Software Developers
* AI Engineers
* STEM Institutions
* Technology Innovators

---

## 📂 Project Structure

```text
BNeurobotics/
├── PLAN.md                             # Project plan and master file structure (this file)
└── BNeuro2/                            # Main application root
    ├── index.html                      # Homepage: primary portal for AI, Robotics, and IoT
    ├── about.html                      # Company information, mission, and team page
    ├── products.html                   # E-commerce store front: products catalog page
    ├── education.html                  # LMS homepage: courses & training paths catalog
    ├── beginner.html                   # Beginner robotics/IoT course syllabus and registration
    ├── intermediate-courses.html       # Intermediate course track details
    ├── advanced-courses.html           # Advanced courses and expert track details
    ├── enroll.html                     # Course registration and checkout page
    ├── dashboard.html                  # User/Student dashboard: progress tracker & profile
    ├── instructor-dashboard.html       # Instructor panel: manage courses & view feedback
    ├── blog.html                       # Blog page: tech news, updates, articles, categories
    ├── contact.html                    # Contact form page and company location details
    ├── jobs.html                       # Careers page: job listings and applications
    ├── login.html                      # User & Student login page
    ├── forgot-password.html            # Password recovery interface
    ├── admin-login.html                # Admin authentication panel
    ├── admin-dashboard.html            # Admin panel: overall site metrics, users, courses
    ├── footer-template.html            # Shared modular footer component layout
    ├── testIndex.html                  # Sandbox testing home page
    │
    ├── manifest.json                   # PWA metadata configuration for offline/install support
    ├── service-worker.js               # Service Worker: manages caching and offline network assets
    ├── robots.txt                      # SEO: crawler directives
    ├── sitemap.xml                     # SEO: XML sitemap configuration
    │
    ├── css/                            # Custom styles directory (Vanilla CSS)
    │   ├── style.css                   # Core application stylesheet (common elements, layout)
    │   ├── responsive.css              # Media queries for responsive layouts
    │   ├── accessibility.css           # Styling for screen readers, high-contrast, keyboard focus
    │   ├── dark-mode.css               # Dynamic dark mode overrides
    │   ├── cart.css                    # Shopping cart slide-in and page styles
    │   ├── chat.css                    # Live chat widget style rules
    │   ├── blog.css                    # Blog layout and responsive articles styling
    │   ├── admin-login.css             # Login-specific styles for administrators
    │   ├── admin-charts.css            # Styles for reports and dashboard charts
    │   ├── contact-enhanced.css        # Interactive form layouts for contact/newsletter
    │   ├── footer-modern.css           # Styling for the updated modular footer
    │   ├── notification-system.css     # Toast messages and status alerts styling
    │   └── pwa.css                     # Progressive Web App installation banners styling
    │
    ├── js/                             # Frontend logic and interactivity scripts
    │   ├── main.js                     # Base utility script: navigation, animations, general actions
    │   ├── api.js                      # Fetch helper module mapping to backend API endpoints
    │   ├── accessibility.js            # Accessibility hooks, voice options, font scaling
    │   ├── lazy-load.js                # Lazy loader using IntersectionObserver for images
    │   ├── dark-mode.js                # LocalStorage based dark mode toggle script
    │   ├── cart.js                     # LocalStorage shopping cart utility and badge updates
    │   ├── search.js                   # Unified auto-complete search across blog, store, & LMS
    │   ├── chat.js                     # Live chat logic (message queues, auto-responses)
    │   ├── blog.js                     # Blog dynamic page loading, likes, tags, pagination
    │   ├── products.js                 # Catalog filter UI, details modal, cart integration
    │   ├── education.js                # LMS progress updates, interactive quiz player, enrollment
    │   ├── jobs.js                     # Career directory rendering and job applications form logic
    │   ├── notification-system.js      # Toast alerts generator (success, warning, error)
    │   ├── pwa.js                      # PWA setup, caching policies, and service worker registration
    │   ├── home-effects.js             # Landing page visuals, text carousels, and banners
    │   ├── about-effects.js            # Team cards animations and company timelines
    │   ├── admin-login.js              # Admin authentication request logic
    │   ├── admin-dashboard.js          # Admin UI state navigation, tables render, item deletion
    │   ├── admin-analytics.js          # Chart generation and metrics aggregation interface
    │   └── footer-enhanced.js          # Dynamically inject modular footer across pages
    │
    ├── assets/                         # Static dependencies and third-party libraries
    │   ├── css/
    │   │   ├── animate.min.css         # Keyframe animations library
    │   │   └── fontawesome.min.css     # FontAwesome iconography stylesheet
    │   ├── fonts/                      # FontAwesome binary font packages (8 files)
    │   │   ├── fa-brands-400.ttf
    │   │   ├── fa-brands-400.woff2
    │   │   ├── fa-regular-400.ttf
    │   │   ├── fa-regular-400.woff2
    │   │   ├── fa-solid-900.ttf
    │   │   ├── fa-solid-900.woff2
    │   │   ├── fa-v4compatibility.ttf
    │   │   └── fa-v4compatibility.woff2
    │   └── js/
    │       ├── typed.min.js            # Text typing effect library (home page)
    │       └── particles.min.js        # Interactive particles backdrop library
    │
    ├── backend/                        # Node.js, Express & MongoDB Server API
    │   ├── server.js                   # Main application entry point & Express middleware setup
    │   ├── init-db.js                  # Database initializer: seeds defaults (Admin, Products, etc.)
    │   ├── package.json                # Server-side package dependencies and run scripts
    │   ├── .env                        # Configuration secrets (JWT keys, Stripe keys, ports)
    │   ├── .env.example                # Shared structure template for environment config
    │   │
    │   ├── config/
    │   │   └── database.js             # Mongoose MongoDB cluster connection script
    │   │
    │   ├── middleware/
    │   │   └── auth.js                 # Authentication middleware validating JWT tokens
    │   │
    │   ├── models/                     # Mongoose Schemas defining database collections
    │   │   ├── User.js                 # Accounts database schema (roles: User, Instructor, Admin)
    │   │   ├── Product.js              # Store item specifications schema (ratings, reviews)
    │   │   ├── Course.js               # LMS course path structure (modules, lessons, quizzes)
    │   │   ├── Order.js                # Customer shopping orders & payment logs schema
    │   │   └── Blog.js                 # Article database fields, comments, like tracker schema
    │   │
    │   └── routes/                     # Express router endpoints mapping to client actions
    │       ├── auth.js                 # Handles registration, credentials check, and updates
    │       ├── users.js                # Handles profile retrieval and role changes (Admin)
    │       ├── products.js             # Handles store catalog retrieval and editor actions
    │       ├── courses.js              # Handles syllabus tracking, lesson updates, and progress
    │       ├── orders.js               # Handles purchase processing and payment updates
    │       ├── blog.js                 # Handles comments, posts likes, and CMS editing
    │       ├── search.js               # Handles full-text search index and suggestions
    │       ├── contact.js              # Handles newsletter signups and contact submissions
    │       └── analytics.js            # Handles dashboard statistics calculations (Admin)
    │
    └── images/                         # Media directory containing all assets and placeholders
        ├── logo.png                    # Brand identity header icon
        ├── parallax-bg.jpg             # Section backgrounds
        └── [various-product/course-images]
```

---

## 🔮 Future Development

Planned enhancements include:

* E-Commerce Integration
* AI-Powered Learning Assistant
* Online Robotics Courses
* Interactive Simulations
* Project Marketplace
* Research Publications
* Community Forum
* Product Management System
* User Accounts and Dashboards

---

## 🤝 Contributing

Contributions, suggestions, and collaborations are welcome.

If you would like to improve this project:

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Submit a Pull Request

---

## 📞 Contact

For collaborations, partnerships, educational opportunities, or technical discussions, feel free to reach out.

**BNEUROBOTICS**
Building intelligent technologies for a smarter future.

<img width="1894" height="900" alt="image" src="https://github.com/user-attachments/assets/4120b2f4-3970-40fb-b942-0cea9463934f" />
<img width="1913" height="912" alt="image" src="https://github.com/user-attachments/assets/79a31a9d-ce08-4676-9276-79c3c833929d" />
<img width="1906" height="759" alt="image" src="https://github.com/user-attachments/assets/7cbaf419-70d7-41ef-ab18-78ee055001c6" />
<img width="1913" height="903" alt="image" src="https://github.com/user-attachments/assets/e45f2044-d041-403c-bcd3-6e5fd9cc4c35" />
<img width="1917" height="743" alt="image" src="https://github.com/user-attachments/assets/7645111a-a6a2-4aec-a63b-2c13bb520b67" />
<img width="1915" height="761" alt="image" src="https://github.com/user-attachments/assets/37541a43-b40a-4607-aa82-91e2eb293005" />
<img width="1915" height="762" alt="image" src="https://github.com/user-attachments/assets/798a04ab-fc8d-452c-a427-cf49a66a64e2" />
<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/d015fb40-7121-44b8-a9bd-0d9645fd0fd1" />
<img width="1919" height="665" alt="image" src="https://github.com/user-attachments/assets/401532a7-3682-4fa0-a918-f45cf939469f" />
<img width="1910" height="898" alt="image" src="https://github.com/user-attachments/assets/b9a531ed-51bd-455a-a536-783d2251c6b5" />
<img width="1914" height="915" alt="image" src="https://github.com/user-attachments/assets/c8f1b123-cf0f-4cc6-9b29-3337a4f75796" />
<img width="1913" height="913" alt="image" src="https://github.com/user-attachments/assets/c0fdb253-6410-4304-8374-6178ed1777aa" />

### "Innovate. Learn. Build. Transform."
