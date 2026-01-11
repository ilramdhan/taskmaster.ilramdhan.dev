<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/check-square.svg" alt="TaskMaster Logo" width="80" height="80">
  <h1>TaskMaster</h1>
  <p><strong>A Modern Task Management Application</strong></p>
  <p>Comprehensive, client-side task management dashboard with analytics, calendar view, and dark mode</p>

  ![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)
</div>

---

## 📖 Overview

**TaskMaster** is a feature-rich, client-side task management application built with React and TypeScript. It provides a comprehensive solution for managing tasks with features like subtasks, calendar integration, analytics dashboard, and more—all running entirely in the browser with localStorage persistence.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard Analytics** | Visual charts showing task distribution by priority and 30-day activity trends |
| ✅ **Task Management** | Full CRUD operations with subtasks, priorities, categories, and deadlines |
| 📅 **Calendar View** | Interactive calendar with drag-and-drop task scheduling |
| 🗄️ **Archive & Recycle Bin** | Soft delete with recovery options |
| 📥 **Import/Export** | JSON and CSV support for data backup and migration |
| 🌙 **Dark Mode** | Toggle between light and dark themes |
| 💾 **Persistent Storage** | All data saved automatically to localStorage |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |

---

## 🏗️ Architecture

### Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  React 18.3 + TypeScript 5.2                                │
│  ├── UI Components (Custom)                                 │
│  ├── State Management (React Hooks + useMemo)               │
│  └── Styling (TailwindCSS CDN)                              │
├─────────────────────────────────────────────────────────────┤
│  Libraries:                                                  │
│  ├── Recharts (Charts & Analytics)                          │
│  └── Lucide React (Icons)                                   │
├─────────────────────────────────────────────────────────────┤
│  Build Tool: Vite 7.3                                       │
├─────────────────────────────────────────────────────────────┤
│  Storage: Browser LocalStorage                               │
│  ├── utm_user (User session)                                │
│  ├── utm_tasks (Task data)                                  │
│  ├── utm_activities (Activity log)                          │
│  └── utm_theme (Theme preference)                           │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
TaskMaster/
├── App.tsx              # Main application component (~2000 lines)
│   ├── Types & Interfaces
│   ├── Constants & Helpers
│   ├── Modal Component
│   ├── Toast Component
│   ├── TaskCard Component
│   └── Main App Logic
├── index.tsx            # React entry point
├── index.html           # HTML template with TailwindCSS config
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── metadata.json        # App metadata
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd TaskMaster

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📋 Usage Guide

### Authentication

Use the following credentials to login:
- **Username:** `admin`
- **Password:** `123`

### Navigation

| Menu | Description |
|------|-------------|
| **Dashboard** | Overview with statistics and charts |
| **My Tasks** | Full task list with filters and views (Grid/List/Kanban) |
| **Calendar** | Monthly calendar with task visualization |
| **Archived** | View archived tasks |
| **Recycle Bin** | Recover or permanently delete tasks |

### Task Properties

| Property | Options |
|----------|---------|
| **Priority** | High, Medium, Low |
| **Category** | Work, Personal, Shopping, Health, Other |
| **Status** | Pending, Completed |
| **Dates** | Start Date, Deadline |
| **Subtasks** | Unlimited checklist items |
| **Image** | Optional URL attachment |

### Data Management

- **Export JSON** - Backup all tasks as JSON file
- **Export CSV** - Export tasks for Excel/Sheets
- **Import JSON** - Restore from backup
- **Import CSV** - Import from spreadsheet
- **Reset to Default** - Restore sample data

---

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Key Components

| Component | Purpose |
|-----------|---------|
| `Modal` | Reusable modal dialog |
| `ToastContainer` | Notification system |
| `TaskCard` | Task display (supports Grid/List/Board views) |

### State Management

The application uses React hooks for state management:
- `useState` for local state
- `useMemo` for computed values (stats, filtered tasks, charts)
- `useEffect` for side effects (localStorage sync)

---

## 📄 License

This project is open source and available under the MIT License.

---

<div align="center">
  <p>Built with ❤️ using React + TypeScript + Vite</p>
</div>
