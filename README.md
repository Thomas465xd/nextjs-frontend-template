<div align="center">

# Next.js Portfolio Template

A production-ready, multilingual frontend template built with **Next.js 16**, **React 19**, and **TypeScript 5**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=react-query)

</div>

---

## Features

- **Multilingual (i18n)** — English, German, and Spanish out of the box via `react-i18next`
- **Dark Mode** — System-aware theme switching powered by `next-themes`
- **Authentication-ready** — Full auth API layer with Zod-validated schemas
- **Server-first architecture** — App Router with server components by default
- **Type-safe API layer** — Axios + Zod runtime validation on every response
- **URL-based filter state** — No `useState` for filters — state lives in the URL
- **SEO** — Dynamic metadata, OpenGraph, sitemap, robots.txt, and web manifest
- **Animations** — Framer Motion integrated and ready to use
- **Image optimization** — Cloudinary + `next/image` pre-configured

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Headless UI, Framer Motion |
| Data Fetching | TanStack Query 5, Axios |
| Forms & Validation | React Hook Form, Zod 4 |
| i18n | i18next, react-i18next, next-i18n-router |
| Theme | next-themes |
| Notifications | react-toastify, SweetAlert2 |
| Images | Cloudinary, next-cloudinary |
| Analytics | Vercel Analytics |
| Icons | lucide-react, react-icons |

---

## Project Structure

```
app/[locale]/           # All routes (locale-prefixed)
  (home)/               # Route group — shares NavBar + Footer layout
  [...slug]/            # Catch-all → renders 404
  layout.tsx            # Root layout: providers, fonts, SEO
  i18n.ts               # Server-side translation initializer
  get-query-client.ts   # React Query client (SSR-safe, cached per request)

components/
  providers/            # ThemeProvider, ReactQueryProvider, ToastProvider, TranslationsProvider
  home/                 # NavBar, Footer
  ui/                   # Reusable components: Dialog, Tabs, SearchBar, Pagination, etc.
  skeletons/            # Loading skeleton components

src/
  api/                  # API caller functions (AuthAPI.ts as reference pattern)
  hooks/                # useAuth, useFilters, useMobile, useTimer, useTheme
  types/                # Zod schemas + inferred TypeScript types
  locales/              # en / de / es JSON translation files
  utils/                # Pure helpers: date formatting, clipboard, text
  store/                # Zustand stores (empty, ready to use)

lib/
  axios.ts              # Pre-configured Axios instance
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A backend API (or mock server) for authentication endpoints

### Installation

```bash
git clone https://github.com/your-username/nextjs-template.git
cd nextjs-template
npm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
# Backend API base URL
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000/api

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Customization Guide

### Adding a new page

Create a folder under `app/[locale]/(home)/` and add a `page.tsx`:

```typescript
// app/[locale]/(home)/contact/page.tsx
import initTranslations from "@/app/[locale]/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["metadata"]);
  return { title: t("title.contact") };
}

export default async function ContactPage({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, ["common"]);
  return (
    <TranslationsProvider locale={locale} namespaces={["common"]} resources={resources}>
      <ContactForm />
    </TranslationsProvider>
  );
}
```

Then add translation keys to all three locale files:

```
src/locales/en/common.json
src/locales/de/common.json
src/locales/es/common.json
```

### Adding an API module

Follow the pattern in `src/api/AuthAPI.ts`:

```typescript
// src/api/ProjectsAPI.ts
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { projectsSchema } from "@/src/types";

export async function getProjects() {
  try {
    const { data } = await api.get("/projects");
    const response = projectsSchema.safeParse(data);
    if (response.success) return response.data;
    console.error("Schema Validation Failed", response.error);
  } catch (error) {
    if (isAxiosError(error)) throw new Error(error.response?.data?.errors[0].message || "Error");
    throw new Error("Unexpected error");
  }
}
```

### Adding a Zod schema + type

```typescript
// src/types/projects.ts
import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  tags: z.array(z.string()),
});

export type Project = z.infer<typeof projectSchema>;

// src/types/index.ts — always re-export here
export * from "./projects";
```

### Creating a data-fetching hook

```typescript
// src/hooks/useProjects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/src/api/ProjectsAPI";

export const useProjects = () => {
  const query = useQuery({ queryKey: ["projects"], queryFn: getProjects });
  return { projects: query.data, isLoading: query.isLoading, isError: query.isError };
};
```

---

## Locale Configuration

Supported locales are defined in `i18nConfig.ts`:

```typescript
{ locales: ["en", "de", "es"], defaultLocale: "en", prefixDefault: false }
```

URL structure: `/contact` (en), `/de/contact`, `/es/contact`.

Locale detection order: URL prefix → `NEXT_LOCALE` cookie → `Accept-Language` header → default.

---

## Available Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production (Turbopack)
npm run start    # Start production server
npm run lint     # ESLint with zero-warnings policy
```

---

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy

Vercel Analytics is already integrated — no extra setup needed.

For other platforms, run `npm run build` and serve the `.next` output with `npm start`.

