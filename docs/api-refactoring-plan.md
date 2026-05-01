# API Refactoring Plan: High Standard Architecture

## 🎯 Objective

Move SEO-critical data fetching from Client Side (Redux/useEffect) to **Server Side (Next.js Server Components)** and implement a professional **Service Layer Pattern**.

---

## 🛠 Phase 1: Architecture Setup (One Time Setup)

- [ ] **Create Base HTTP Client**
  - Create file: `src/lib/api-client.ts`
  - Implement a reusable `fetch` wrapper with base URL, error handling, and type support.

- [ ] **Create Service Directory**
  - Create folder: `src/services/`
  - This will act as the central repository for all server-side API calls.

---

## 📋 Phase 2: Audit & Implementation (To-Do List)

Identify which data is crucial for SEO (e.g., Course Details, Blog Posts, Product Lists) and move them.

### 1. Course Related Data (Priority: High)

_Current Status: Likely using Redux/Client Fetch_

- [ ] Create `src/services/course.service.ts`
- [ ] Implement `getAllCourses()`
- [ ] Implement `getCourseBySlug(slug: string)`
- [ ] **Refactor Page:** `src/app/(CommonLayout)/(home)/all-courses/page.tsx` -> Use `CourseService.getAllCourses()`
- [ ] **Refactor Page:** `src/app/(CommonLayout)/(home)/all-courses/[slug]/page.tsx` -> Use `CourseService.getCourseBySlug()`

### 2. Project/Portfolio Data

_Current Status: Client Side_

- [ ] Create `src/services/project.service.ts`
- [ ] Implement `getAllProjects()`
- [ ] **Refactor Section:** `ProjectsSection.tsx` is currently receiving data via props (Good!), ensure the _parent page_ is fetching via Service.

### 3. User/Auth Data (Keep on Client/Redux usually, but verify)

- [ ] Keep User Profile / Session data in Redux (No change needed for SEO).

---

## 🚀 How to Implement (Step-by-Step Guide)

### Step 1: Create `src/lib/api-client.ts`

```typescript
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.caddcore.cloud/api/v1";

export const apiClient = {
  get: async <T>(endpoint: string, tags: string[] = []): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { tags, revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
};
```

### Step 2: Create a Service (e.g., `src/services/course.service.ts`)

```typescript
import { apiClient } from "@/lib/api-client";
// Define Interfaces
export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  // ...other fields
}

export const CourseService = {
  getAll: async () => {
    return await apiClient.get<ICourse[]>("/courses");
  },
  getBySlug: async (slug: string) => {
    return await apiClient.get<ICourse>(`/courses/${slug}`);
  },
};
```

### Step 3: Use in Server Page (`page.tsx`)

```typescript
import { CourseService } from "@/services/course.service";
import ProjectSection from "@/components/programs/ProjectsSection";

export default async function CourseDetailsPage({ params }: { params: { slug: string } }) {
  // Fetch data directly on the server
  const course = await CourseService.getBySlug(params.slug);

  return (
    <main>
      <h1>{course.title}</h1>
      {/* Pass data to Client Components */}
      <ProjectSection projects={course.projects} />
    </main>
  );
}
```

---

## ✅ Checklist for "High Standard"

- [ ] No `useEffect` used for initial data fetching on public pages.
- [ ] `page.tsx` is `async` and awaits data.
- [ ] API URLs are not hardcoded in components; they are in `services/`.
- [ ] Types (Interfaces) are defined and reused.
