# ManageMate Native 📱

A comprehensive employee shift management mobile application built with React Native and Expo, powered by Supabase backend.

## Overview

ManageMate Native is a mobile workforce management solution that enables employees to manage their work schedules, track time, request time off, and stay connected with their team. The app provides real-time shift updates, time tracking capabilities, and seamless schedule management.

## Features

### 🏠 Home Screen

- **Time Tracking**: Clock in/out functionality with real-time elapsed time tracking
- **Upcoming Shifts**: View and manage your upcoming work schedules
- **Open Shifts**: Browse and claim available open shifts
- **Quick Actions**: Fast access to common tasks (schedule, time off, clock in/out)
- **Welcome Dashboard**: Personalized greeting and current status overview

### 📅 Schedule Management

- **Monthly Calendar View**: Interactive calendar showing your scheduled shifts
- **Shift Details**: View detailed information about each shift (time, location, role)
- **Navigation**: Easy month-to-month navigation
- **Visual Indicators**: Color-coded shifts for better visibility
- **Shift Claiming**: Pick up open shifts directly from the calendar

### ⏰ Timesheet

- **Time Tracking**: View all your worked hours by week
- **Week Navigation**: Browse past and current weeks
- **Export Functionality**: Export timesheet data (coming soon)
- **Detailed Records**: Clock in/out times with duration calculation

### 🏖️ Vacation Management

- **Time Off Requests**: Submit vacation/time-off requests
- **Status Tracking**: Monitor request status (pending, approved, rejected)
- **Request History**: View all past and current time-off requests
- **Date Selection**: Easy-to-use date picker for request submission

### 👤 Profile & Settings

- **User Profile**: View and manage your profile information
- **Account Settings**: Configure app preferences
- **Notifications**: Manage notification settings
- **Team Directory**: Access colleague contact information
- **Reports & Analytics**: View work insights
- **Help & Support**: Access FAQs and assistance
- **Secure Sign Out**: Safe logout functionality

## Tech Stack

### Frontend

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe code
- **React Navigation**: Tab and stack navigation
- **date-fns**: Date manipulation and formatting

### Backend & Services

- **Supabase**:
  - Authentication (email/password, Google OAuth)
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security

### UI Components

- **Expo Vector Icons**: Ionicons for consistent iconography
- **React Native Safe Area Context**: Safe area handling
- **Custom Theming**: Light/dark mode support

## Project Structure

```
managemate-native/
├── app/                          # Main application screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── schedule.tsx         # Schedule/calendar view
│   │   ├── timesheet.tsx        # Timesheet tracking
│   │   └── others.tsx           # Profile & settings
│   ├── _layout.tsx              # Root layout with auth gate
│   ├── login.tsx                # Authentication screen
│   ├── vacations.tsx            # Vacation requests
│   └── open-shifts.tsx          # Available shifts listing
├── components/                   # Reusable components
│   ├── cards/                   # Card components
│   │   ├── ClockButton.tsx      # Clock in/out button
│   │   ├── ShiftCard.tsx        # Shift display card
│   │   ├── ShiftDetailCard.tsx  # Detailed shift info
│   │   ├── TimeTrackingCard.tsx # Time tracking widget
│   │   └── VacationCard.tsx     # Vacation request card
│   ├── common/                  # Common UI components
│   │   ├── WelcomeSection.tsx   # Welcome header
│   │   ├── QuickActionsPanel.tsx # Quick action buttons
│   │   └── ProfileSkeleton.tsx  # Loading skeleton
│   ├── navigation/              # Navigation components
│   │   ├── CalendarGrid.tsx     # Calendar view
│   │   ├── MonthNavigator.tsx   # Month navigation
│   │   └── WeekNavigator.tsx    # Week navigation
│   ├── BackHeader.tsx           # Back navigation header
│   ├── ErrorBoundary.tsx        # Error handling wrapper
│   ├── ThemedText.tsx           # Themed text component
│   └── ThemedView.tsx           # Themed view component
├── hooks/                       # Custom React hooks
│   ├── useProfile.ts            # User profile data
│   ├── useShifts.ts             # Shift management
│   ├── useVacations.ts          # Vacation requests
│   └── useColorScheme.ts        # Theme detection
├── constants/                   # App constants
│   └── Colors.ts                # Color theme definitions
└── supabase.ts                  # Supabase client configuration
```

## Key Functionality

### Authentication Flow

1. User lands on login screen ([`app/login.tsx`](app/login.tsx))
2. AuthGate in [`app/_layout.tsx`](app/_layout.tsx) checks authentication status
3. Authenticated users redirected to main app
4. Unauthenticated users stay on login

### Data Management

- **Custom Hooks**: Centralized data fetching with [`useProfile`](hooks/useProfile.ts), [`useShifts`](hooks/useShifts.ts), [`useVacations`](hooks/useVacations.ts)
- **Real-time Updates**: Automatic data refresh on screen focus
- **Optimistic UI**: Immediate feedback on user actions
- **Error Handling**: Comprehensive error boundaries and user-friendly messages

### Time Tracking

- **Clock In/Out**: Managed through [`ClockButton.tsx`](components/cards/ClockButton.tsx)
- **Shift Validation**: Ensures users have scheduled shifts before clocking in
- **Duration Tracking**: Real-time elapsed time calculation
- **Data Persistence**: Automatic saving to Supabase

### Theme Support

- **Light/Dark Mode**: Automatic theme detection
- **Consistent Colors**: Centralized theme in [`Colors.ts`](constants/Colors.ts)
- **Dynamic Styling**: Theme-aware components throughout

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd managemate-native
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Update [`supabase.ts`](supabase.ts) with your project credentials
   - Set up required database tables and policies

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Database Schema

### Required Tables

- `profiles`: User profile information
- `shifts`: Shift schedules and assignments
- `timesheets`: Clock in/out records
- `vacation_requests`: Time-off requests
- `open_shifts`: Available shifts for claiming

## Features in Development

- ✅ Authentication (Email/Password, Google OAuth)
- ✅ Time Tracking (Clock In/Out)
- ✅ Shift Management
- ✅ Schedule Viewing
- ✅ Vacation Requests
- 🚧 Push Notifications
- 🚧 Timesheet Export
- 🚧 Profile Editing
- 🚧 Team Directory
- 🚧 Reports & Analytics
- 🚧 Password Reset

## Contributing

Contributions are welcome! Please ensure:

- Code follows existing patterns
- TypeScript types are properly defined
- Error handling is implemented
- Components are accessible

## License

[Add your license here]

## Support

For issues or questions, please [create an issue](link-to-issues) or contact [support email].

---

Built with ❤️ using React Native and Expo
