<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Guidelines — Next.js Portfolio Template

## Project Overview

A **multilingual Next.js 16 portfolio template** with full authentication, dark mode, i18n (en/de/es), React Query, Zod validation, and Tailwind CSS 4. Uses the **App Router** with server components by default, locale-based routing, and clean separation between server and client concerns.

**Tech stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · TanStack Query 5 · Zod 4 · React Hook Form · Framer Motion · next-themes · react-i18next · Axios · Cloudinary

---

## Folder & Architecture Guide

```
app/[locale]/           → All routes live here (locale-prefixed)
  (home)/               → Route group for main layout (navbar/footer)
  [...slug]/            → Catch-all → renders 404 page
  layout.tsx            → Root layout: providers, fonts, SEO
  i18n.ts               → Server-side translation initializer
  get-query-client.ts   → React Query client (cached per request)

components/
  providers/            → Context providers (Theme, QueryClient, Toast, Translations)
  home/                 → Layout components (NavBar, Footer)
  ui/                   → Reusable UI components (Dialog, Tabs, SearchBar, etc.)
  skeletons/            → Loading skeleton components

src/
  api/                  → API caller functions (AuthAPI.ts pattern)
  hooks/                → Custom React hooks
  types/                → Zod schemas + inferred TypeScript types
  locales/{en,de,es}/   → Translation JSON files by namespace
  utils/                → Pure helper functions (date, text, copy)
  store/                → Zustand stores (empty, ready to use)
  contexts/             → React Context (ThemeContext — prefer next-themes)

lib/
  axios.ts              → Pre-configured Axios instance (baseURL from env, withCredentials)
```

**Path alias:** `@/` maps to the project root.

---

## Architecture: Server vs Client

Every file is a server component unless it has `"use client"`.

| Need | Use |
|------|-----|
| Data fetching, metadata, translations | Server component (async, no `"use client"`) |
| State, events, hooks, animations | Client component (`"use client"`) |
| Hybrid | `Component.tsx` (server) + `ComponentClient.tsx` (client) |

**Provider order** (`app/[locale]/layout.tsx`):
```
<Theme> → <ReactQueryProvider> → <ToastProvider> → {children}
```
`TranslationsProvider` wraps children inside each page layout.

---

## Critical Conventions

- **Route params are always awaited:** `const { locale } = await params`
- **Server components are async** and accept `params: Promise<{ locale: string }>`
- **No localStorage in render** — use lazy `useState` initializer or `useEffect`
- **Theme:** Use `next-themes` (`useTheme`). `ThemeContext` in `src/contexts/` is a legacy duplicate — avoid it
- **Filter state lives in the URL** — use `useFilters()` from `src/hooks/useFilters.ts`, not `useState`
- **Zustand** is installed but unused — add stores in `src/store/` when client state grows complex

---

## Key Patterns

### New page
```typescript
// app/[locale]/(home)/page-name/page.tsx
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["metadata"]);
  return { title: t("title.pageName") };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, ["common"]);
  return (
    <TranslationsProvider locale={locale} namespaces={["common"]} resources={resources}>
      <YourClientContent />
    </TranslationsProvider>
  );
}
```

### New API module (follow `src/api/AuthAPI.ts`)
```typescript
export async function getItems(params: ItemSearchParams) {
  try {
    const { data } = await api.get(`/items?page=${params.page}`);
    const response = itemsSchema.safeParse(data);
    if (response.success) return response.data;
    console.error("Schema Validation Failed", response.error);
  } catch (error) {
    if (isAxiosError(error)) throw new Error(error.response?.data?.errors[0].message || "Error");
    throw new Error("Unexpected error");
  }
}
```

### New Zod schema + type
```typescript
// src/types/items.ts
export const itemSchema = z.object({ id: z.string(), name: z.string() });
export type Item = z.infer<typeof itemSchema>;

// src/types/index.ts — always re-export here
export * from "./items";
```

### Translations
- Add keys to **all three locales**: `src/locales/en/`, `de/`, `es/`
- `common.json` → UI text | `metadata.json` → page titles, OpenGraph
- Client: `const { t } = useTranslation("common")`
- Server: `const { t } = await initTranslations(locale, ["common"])`

### Mutations with toast feedback
```typescript
const { mutate } = useMutation({
  mutationFn: createItem,
  onSuccess: () => { toast.success("Done!"); queryClient.invalidateQueries({ queryKey: ["items"] }); },
  onError: (error) => toast.error(error.message),
});
```

---

## Common Pitfalls

- **`useEffect` + `setState` to read localStorage** → ESLint error. Use lazy `useState(() => localStorage.getItem("key"))` instead
- **Forgetting all three locale files** when adding translation keys
- **Inlining Zod schemas in components** — always put them in `src/types/`
- **`"use client"` on parent components** — keep server boundary as far down the tree as possible
- **Not awaiting `params`** — always destructure after `await params`

---

## Build & Run

```bash
npm run dev      # Development (Turbopack)
npm run build    # Production build
npm run lint     # ESLint (zero warnings policy)
```

