# portfolio# Mariia Kit Portfolio

This is my personal technology portfolio. I created it to show not only the tools and technologies I have worked with, but also how I think, solve problems, learn, and grow.

My portfolio focuses on:

- Quality Assurance
- Business Analysis
- Software Development
- AI
- Problem solving
- Continuous learning

The website is designed as a multi-page portfolio for GitHub Pages.

---

## Portfolio Structure

### Home
`index.html`

The Home page is the first impression of the portfolio.

It includes:

- My name
- A short introduction
- QA, Business Analysis, Software Development, and AI
- My interactive white owl
- Featured projects

The owl is one of the signature elements of the portfolio. Its head and eyes react to the visitor's cursor.

---

### About Me
`about.html`

This page tells more about who I am and how I approach work.

It currently focuses on:

- Curiosity
- Problem solving
- Attention to detail
- Persistence
- Reliability
- My career direction

This page can grow with me.

I can later add more personal information, such as:

- Where I am from
- Languages I speak
- Places I have traveled
- Hobbies
- Books I enjoy
- Nature and walking
- Puzzles
- Family values
- Things that inspire me
- Interesting facts about me

I do not have to keep this page strictly technical. A small personal section can help employers understand who I am outside of work.

For example, I could later add a section called:

**Beyond Tech**

and include something like:

> Outside of technology, I enjoy traveling, long walks, nature, reading, and puzzles. Traveling gives me a chance to experience different places and perspectives, and I enjoy bringing that same curiosity into the way I learn technology.

---

## My Photo

There is already a place for my photo on the About page.

Right now it shows an `MK` placeholder.

When I am ready, I can add my photo to the `images` folder.

Example:

`images/mariia.jpg`

Then replace the placeholder section in `about.html` with:

```html
<img class="profile-photo" src="images/mariia.jpg" alt="Mariia Kit">
```

And add this style to `styles.css` if it is not already there:

```css
.profile-photo {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 16px;
}
```

---

## Skills
`skills.html`

This page contains the skills I am developing through real practice.

Current categories include:

- QA & Testing
- Development
- Business Analysis
- Data & Tools
- AI
- Problem Solving

I can change, remove, or add skills anytime.

For example, if I become more confident with Python, automation, cybersecurity, cloud technologies, or another tool, I can update this page.

---

## Projects
`projects.html`

This page contains the projects I want employers to notice.

Current projects include:

### Avalon Accounting Application

A Java 17 and Spring Boot accounting application with:

- PostgreSQL
- JPA
- Thymeleaf
- Spring Security
- Maven
- Docker
- Stripe integration
- Products
- Categories
- Clients and vendors
- Companies
- Users
- Sales and purchase invoices
- Payments
- Reporting

Repository:

https://github.com/M555K/Avalon-Accounting-project

There is also a dedicated project page:

`accounting-project.html`

### Individual Tech Project

This will become one of my main portfolio projects.

I plan to build something that solves a real problem and may include AI and/or cybersecurity.



---

## Experience
`experience.html`

This page includes my current technology journey and relevant training.

It currently includes:

- i.c.stars
- CompTIA A+
- Google AI Essentials
- Earlier software development and testing training

When I upload my final résumé, I can expand this section with more complete dates, roles, and experience.

---

## Contact
`contact.html`

Current contact information:

- Email: mkit@icstarts.org
- LinkedIn: https://www.linkedin.com/in/mariia-kit-profile
- GitHub: https://github.com/mariiakit-official

---

## Resume

My resume is not added yet.

When I am ready, I can place the PDF inside the project.

Example:

`assets/Mariia_Kit_Resume.pdf`

Then I can replace the `Resume soon` text in the navigation with:

```html
<a class="resume-link" href="assets/Mariia_Kit_Resume.pdf" target="_blank">Resume</a>
```

---

# How to Update My Portfolio Later

I can change this portfolio anytime.

I do not need to rebuild it from the beginning.

### To change my introduction
Edit:

`index.html`

### To change my personal story
Edit:

`about.html`

### To add travel, hobbies, languages, or personal facts
Edit:

`about.html`

A good place is below the current About section in a new section such as:

- Beyond Tech
- More About Me
- Life Outside Technology
- What Keeps Me Curious

### To add a new project
Edit:

`projects.html`

If the project is important enough, I can also create a separate page for it, just like:

`accounting-project.html`

### To update my skills
Edit:

`skills.html`

### To update certifications or experience
Edit:

`experience.html`

### To change my email, LinkedIn, or GitHub
Update the links in:

- the navigation
- `contact.html`
- the footer

### To change colors or design
Edit:

`styles.css`

### To change the owl movement
Edit:

`script.js`

The owl currently reacts to the visitor's mouse position.

---

# Ideas I Can Add Later

My portfolio does not need to stay exactly the same.

As I grow, I can add:

- A travel section
- Languages I speak
- A timeline of my career transition
- New certifications
- New projects
- Project screenshots
- Live demos
- GitHub repository buttons
- Testimonials
- Recommendations
- Volunteer experience
- My tech expo project
- AI projects
- Cybersecurity projects
- Blog posts
- Lessons learned
- Books or courses I recommend
- A downloadable résumé
- A contact form

The goal is for the portfolio to grow with me instead of feeling finished forever.

---

# GitHub Pages

The portfolio uses relative links, so it is ready to work with GitHub Pages.

Keep `index.html` in the repository root.

Main files:

- `index.html`
- `about.html`
- `skills.html`
- `projects.html`
- `accounting-project.html`
- `experience.html`
- `contact.html`
- `styles.css`
- `script.js`

---

# My Portfolio Principle

I do not want this portfolio to make it look like I know everything.

I want it to show:

- how I think
- what I have built
- what I am learning
- how I approach problems
- how I improve
- and where I am going next

I can keep changing this portfolio as my experience grows.