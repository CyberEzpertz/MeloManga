# Melomanga

**Melomanga** is a mobile-first web application, developed as a project output for the **EMPATHY** class. It enhances the manga reading experience by recommending Spotify music that matches the mood of each manga section.

The application leverages the **Spotify Web API** and **Reccobeats** for music recommendations.

---

## 🚀 Local Development

### Prerequisites

Make sure you have [pnpm](https://pnpm.io/installation) installed globally:

```bash
npm install -g pnpm
````

### Running the Development Server

Clone the repository and run the following commands:

```bash
pnpm install
pnpm dev
```

Then open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

This project uses the `/src` directory for organizing code:

```
src/
├── app/                         # Next.js app directory (routes/pages)
│   └── [page]/_components/      # Page-specific components
├── components/                  # Reusable components
│   └── ui/                      # UI primitives (from Shadcn)
├── lib/                         # Utility functions, helpers, and config
```

We use [Shadcn UI](https://ui.shadcn.com/) for consistent and customizable UI components.

---

## ✅ Commit Guidelines & Branching

We follow [Conventional Commits](https://www.conventionalcommits.org/) and a **feature-branching workflow** to keep commit history clean and meaningful.

* Always create a new branch for each feature or fix (e.g., `feat/music-recommendation`).
* Commit using conventional prefixes like `feat:`, `fix:`, `refactor:`, `docs:`, etc.
* Refer to this [cheat sheet](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13) for formatting examples.

Example:

```bash
feat: add mood detection logic for manga pages
```

---

## 👥 Members

* **Caramat**, Christian
* **Fontillas**, Matthew
* **Murillo**, Jan
* **Ong**, Matthew
* **Rivera**, Lenz