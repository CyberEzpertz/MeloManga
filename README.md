# Melomanga

**Melomanga** is a mobile-first web application, developed as a project output for the **EMPATHY** class. It enhances the manga reading experience by recommending Spotify music that matches the mood of each manga section.

The application leverages **Reccobeats** and **Google's Generative AI** for music recommendations.

🌐 **Live Site**: [https://melo-manga.vercel.app](https://melo-manga.vercel.app)

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js (v18 or later)](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

Install `pnpm` globally if needed:

```bash
npm install -g pnpm
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

---

## 🚢 Production Build

To run the app in production mode locally:

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Build the application**

   ```bash
   pnpm build
   ```

3. **Start the server**

   ```bash
   pnpm start
   ```

Then visit [http://localhost:3000](http://localhost:3000)

---

## 🚀 Local Development

To run the app in development mode:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/melomanga.git
   cd melomanga
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

Open your browser and go to [http://localhost:3000](http://localhost:3000)

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

* Always create a new branch for each feature or fix (e.g., `feat/music-recommendation`)
* Use commit prefixes like `feat:`, `fix:`, `refactor:`, `docs:`, etc.
* Refer to this [cheat sheet](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13) for examples

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