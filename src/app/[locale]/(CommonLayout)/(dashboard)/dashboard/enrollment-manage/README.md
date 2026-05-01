# Enrollment Management Page

## Overview
The Enrollment Management Page provides a centralized dashboard for administrators to monitor and manage all program enrollments across the platform.

## Route
```
/dashboard/enrollment-manage
```

## Features

### 1. **Dashboard Statistics**
- **Total Enrollments**: Shows the sum of all enrollments across all programs
- **Active Programs**: Displays the count of currently active programs
- **Programs with Enrollments**: Shows how many programs have at least one enrollment
- **Average Enrollment Rate**: Calculates the average enrollment percentage for programs with capacity limits

### 2. **Search & Filter Functionality**
- **Search**: Search programs by title
- **Filter by Type**: Filter programs by type (training, seminar, webinar, workshop, course)
- **Filter by Level**: Filter programs by difficulty level (beginner, intermediate, advanced, all-levels)

### 3. **Program Cards Display**
Each program card shows:
- **Program Image**: Visual representation of the program (with fallback gradient)
- **Status Badge**: Shows if the program is Active or Inactive
- **Program Type & Level**: Quick badges for categorization
- **Program Title**: Full program name (truncated to 2 lines)
- **Start Date**: When the program begins
- **Enrollment Progress**:
  - Current enrollment count vs capacity
  - Visual progress bar with color coding:
    - 🟢 Green: 0-49% full
    - 🟡 Yellow: 50-69% full
    - 🟠 Orange: 70-89% full
    - 🔴 Red: 90-100% full
  - Percentage display
- **View Enrollments Button**: Links to detailed enrollment page

### 4. **Responsive Design**
- **Mobile**: Single column layout
- **Tablet**: 2 columns
- **Desktop**: 3 columns
- Fully responsive statistics cards and filters

### 5. **Pagination**
- Smart pagination for large program lists
- Shows current page, total pages, and total programs
- Previous/Next navigation
- Direct page number selection

## Navigation Flow

```
Dashboard
  └── Enrollment Management (/dashboard/enrollment-manage)
       └── View Enrollments Button
            └── Program Enrollments Detail Page (/dashboard/manage-courses/{id}/enrollments)
```

## Color Scheme
Consistent with the existing design system:
- **Primary**: Red (#DC2626 / red-800)
- **Secondary**: Black (#000000)
- **Success**: Green
- **Warning**: Yellow/Orange
- **Danger**: Red
- **Background**: White with gray accents

## Technologies Used
- **Next.js 14+**: App Router with Server Components
- **React 18+**: Client-side interactivity
- **Framer Motion**: Smooth animations and transitions
- **Lucide Icons**: Modern, consistent iconography
- **RTK Query**: API data fetching and caching
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling

## API Integration
Uses the following Redux API hooks:
- `useGetProgramsQuery`: Fetches all programs with pagination and filters

## Key Components

### Stats Cards
```tsx
- Total Enrollments (Users icon, red background)
- Active Programs (BookOpen icon, red background)
- Programs with Enrollments (UserCheck icon, red background)
- Avg. Enrollment Rate (Award icon, red background)
```

### Program Card Structure
```tsx
- Image Section (with status badge overlay)
- Info Section
  - Type & Level badges
  - Title
  - Start date
  - Enrollment progress bar
  - View button
```

## User Experience Features

### Loading States
- Centered spinner with loading message
- Smooth fade-in animations when data loads

### Error Handling
- Clear error messages with AlertCircle icon
- Red background for visibility
- Retry-friendly messaging

### Empty States
- "No Programs Found" message
- Helpful guidance based on context (search vs no data)
- AlertCircle icon for consistency

### Animations
- Staggered fade-in for program cards (0.1s delay per card)
- Progress bar fill animation (0.5s duration)
- Hover effects on cards (shadow increase)
- Smooth transitions on all interactive elements

## Accessibility
- Semantic HTML structure
- ARIA-friendly icons with contextual sizes
- High contrast colors for readability
- Keyboard navigation support
- Screen reader friendly labels

## Performance Optimizations
- `useMemo` for computed statistics (prevents unnecessary recalculations)
- Optimized image loading with Next.js Image component
- Efficient filtering and search
- Pagination to limit data load
- RTK Query caching for API responses

## Future Enhancements (Potential)
1. Export enrollment data as CSV
2. Bulk actions on programs
3. Advanced filtering (by date range, enrollment status)
4. Sort options (by enrollments, date, name)
5. Quick enrollment insights (completion rates, active learners)
6. Email notifications for full programs
7. Enrollment trends graph/chart

## Maintenance Notes
- Ensure program images are optimized for web
- Monitor API response times for pagination
- Keep color scheme consistent with design system
- Update TypeScript types when API schema changes

## Testing Checklist
- ✅ Programs load correctly
- ✅ Search functionality works
- ✅ Filters apply correctly
- ✅ Pagination navigates properly
- ✅ Links to enrollment details work
- ✅ Responsive design on all screen sizes
- ✅ Loading states display
- ✅ Error states display
- ✅ Empty states display
- ✅ Animations are smooth
- ✅ Statistics calculate correctly
