# Copilot Instructions — Next.js Portfolio Template

## Project Overview

A **multilingual Next.js 16 portfolio template** with full authentication, dark mode, i18n (en/de/es), React Query, Zod validation, and Tailwind CSS 4. It uses the **App Router** with server components by default, locale-based routing, and a clean separation between server and client concerns.

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

This project uses the **server-first** pattern. Every file is a server component unless it has `"use client"`.

| Need | Use |
|------|-----|
| Data fetching, metadata, translations | Server component (async, no `"use client"`) |
| State, events, hooks, animations | Client component (`"use client"`) |
| Hybrid (server renders, client handles UI) | Pattern: `NavBar.tsx` (server) + `NavBarClient.tsx` (client) |

**Provider order** (see `app/[locale]/layout.tsx`):
```
<Theme> → <ReactQueryProvider> → <ToastProvider> → {children}
```
`TranslationsProvider` wraps children inside each page layout.

---

## Development Patterns

### Adding a new page

1. Create folder: `app/[locale]/(home)/page-name/`
2. Add `page.tsx` (server component by default)
3. For localized metadata, use `generateMetadata()` with `initTranslations(locale, ["metadata"])`
4. Wrap client content with `TranslationsProvider` if translations are needed on the client
5. Add translations to `src/locales/{en,de,es}/common.json`

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
      <YourContent />
    </TranslationsProvider>
  );
}
```

### Adding translations

Add keys to all three locales: `src/locales/en/`, `de/`, `es/`.
- **common.json** → UI text (nav, buttons, errors, labels)
- **metadata.json** → Page titles, descriptions, OpenGraph

Client usage: `const { t } = useTranslation("common")`
Server usage: `const { t } = await initTranslations(locale, ["common"])`

### Adding a new API module

Follow the pattern in `src/api/AuthAPI.ts`:
1. Import `api` from `@/lib/axios` and Zod schemas from `@/src/types`
2. Validate responses with `schema.safeParse(data)` before returning
3. Wrap in try/catch, use `isAxiosError` for typed error handling
4. Throw `new Error(error.response?.data?.errors[0].message || "Fallback message")`

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

### Adding Zod schemas and types

Add schemas to `src/types/` and re-export from `src/types/index.ts`:
```typescript
// src/types/items.ts
export const itemSchema = z.object({ id: z.string(), name: z.string() });
export type Item = z.infer<typeof itemSchema>;

// src/types/index.ts
export * from "./items";
```

### Creating a custom hook

Place in `src/hooks/`. For React Query data:
```typescript
export const useItems = () => {
  const query = useQuery({ queryKey: ["items"], queryFn: getItems });
  return { items: query.data, isLoading: query.isLoading, isError: query.isError };
};
```

For localStorage/SSR-safe values, use lazy state initialization (not `useEffect` + `setState`):
```typescript
const [value] = useState(() => {
  if (typeof window === "undefined") return defaultValue;
  return localStorage.getItem("key") || defaultValue;
});
```

### Forms with validation

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<MyForm>({
  resolver: zodResolver(mySchema)
});
```
Display errors with `<ErrorMessage variant="mini">`. Available variants: `standard`, `mini`, `toast`, `inline`, `subtle`.

### URL filter state

Use `useFilters()` from `src/hooks/useFilters.ts` — do not manage filter state in component state:
```typescript
const { update, toggleSort, resetParams } = useFilters();
update("search", query);       // ?search=query&page=1
toggleSort("name");            // toggles sortBy and sortOrder
```

---

## Conventions

- **Server components are async**, accept `params: Promise<{ locale: string }>`, and must `await params`
- **Route params** are always awaited: `const { locale } = await params`
- **Hybrid components:** If only part of a component needs interactivity, split into `Component.tsx` (server) + `ComponentClient.tsx` (client)
- **No direct localStorage in render** — use lazy state init or `useEffect`
- **Theme:** Use `next-themes` (`useTheme` from `next-themes`). `ThemeContext` is a legacy duplicate — avoid
- **Zustand store** at `src/store/` — add stores here when client state becomes complex

---

## Copilot Usage Guidelines

### Effective prompts for this project

| Task | Example Prompt |
|------|---------------|
| New page | "Create a new server component page at `app/[locale]/(home)/contact/` with `generateMetadata` using `initTranslations`" |
| API function | "Add a `getProjects` function to a new `src/api/ProjectsAPI.ts` following the AuthAPI.ts error handling pattern" |
| Hook | "Create a `useProjects` hook in `src/hooks/` wrapping `getProjects` with `useQuery`" |
| Schema | "Add a Zod schema for a Project type with id, title, description, imageUrl, and tags array. Export it from `src/types/index.ts`" |
| Component | "Create a reusable `ProjectCard` server component in `components/ui/` using Tailwind and lucide-react icons" |
| Translation key | "Add a `projects` section to `src/locales/en/common.json`, `de/common.json`, and `es/common.json`" |

### Common pitfalls to avoid

- **Don't use `useEffect` + `setState` to read localStorage** — causes the `setState within effect` ESLint error. Use lazy `useState` initializer instead
- **Don't add `"use client"` unless necessary** — prefer server components for data fetching and static content
- **Don't create new API files without Zod validation** — always `safeParse` responses
- **Don't manage filter state in `useState`** — use `useFilters()` which stores state in the URL
- **Don't forget all three locale files** when adding new translation keys
- **Don't duplicate `ThemeContext`** — use `next-themes` for all theme needs

---

## Best Practices

- **Prefer server components** for anything that doesn't need interactivity — they reduce JS bundle size
- **Co-locate schemas and types** in `src/types/` — never inline Zod schemas in components
- **Re-export all types from `src/types/index.ts`** to keep imports clean
- **Use `generateStaticParams`** when adding routes with dynamic locale segments
- **SEO:** Every page should have `generateMetadata()` with title, description, and OpenGraph
- **Images:** Use `next/image` with Cloudinary URLs — already configured in `next.config.ts`
- **Mutations:** Use `useMutation` from React Query + `queryClient.invalidateQueries` on success
- **Error feedback:** Use `react-toastify` for async success/error — ToastProvider is already mounted

---

## Quick Start Recipes

### New route with data fetching
```typescript
// app/[locale]/(home)/projects/page.tsx
export default async function ProjectsPage({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, ["common"]);
  return (
    <TranslationsProvider locale={locale} namespaces={["common"]} resources={resources}>
      <ProjectsList />  {/* "use client" component that calls useProjects() */}
    </TranslationsProvider>
  );
}
```

### New mutation with toast
```typescript
const { mutate, isPending } = useMutation({
  mutationFn: createProject,
  onSuccess: () => {
    toast.success("Project created!");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  },
  onError: (error) => toast.error(error.message),
});
```

### Protected route check
```typescript
const { isAuthenticated, isLoading } = useAuth();
if (isLoading) return <Loader />;
if (!isAuthenticated) redirect(`/${locale}/login`);
```

### Conditional dark mode styles
```typescript
// Use Tailwind dark: prefix — avoid runtime class logic where possible
<div className="bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200">
```
