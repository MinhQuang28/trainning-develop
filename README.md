# AI CHAT BOT

Ai chat bot application was built with React, TypeScript and Vite.

## 🏗️ Project Structure

### Tech Stack

- **Frontend Framework**: React 19.1.1 + TypeScript 5.9.2
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.13 + CSS Variables
- **State Management**: React Context API
- **Routing**: React Router v7
- **Authentication**: JWT
- **Icons**: Lucide React

### Folder Structure

```
app/
├── api/                 # API route
├── components/           # Reusable UI components
│   └── ui/              # Base UI components (Button, Input, etc.)
├── config/              # App configurations
│   └── constants/       # App constants
├── types/               # TypeScript types
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── context/             # Context providers
└── utils/               # Helper functions
```

## 🚀 Main Functionality

### 1. Intelligent AI Chat System

- **Context-aware Conversations**: Automatically processes previous messages to maintain natural and coherent dialogue.

- **Streaming Responses**: Displays AI replies in real time for a smoother chat experience.

- **Message History Management**: Stores and loads conversations efficiently.

### 2. UI/UX Features

- **Responsive Design**: Works on both mobile and desktop
- **Dark Mode Support**: Support dark theme

## 🔧 Install and Run

### System Requirement

- Node.js 18+
- Yarn or npm
- Git

### Dependencies Install

```bash
yarn install

npm install
```

### Environment Variable

Create a .env file with the following:

```env
DATABASE_URL
JWT_SECRET_KEY=""
OLLAMA_API_KEY=""
OLLAMA_AI_MODEL=""
REDIS_URL=""
```

### Run Project

```bash
# Development mode
yarn dev

# Testing
yarn test

# Build production
yarn build

# Preview build
yarn preview

# Format code
yarn format
```

## 📱 Main Page

### Public Routes

- **Login** (`/login`): Login
- **Register** (`/register`): Register

### Protected Routes

- **Dashboard** (`/:id?`): Chat page

## 🎨 UI Components

### Base Components

- **Separator**: Separate section
- **DropDownMenu**: Drop down menu
- **FormField**: Text input

### Custom Hooks

- **useInfiniteScroll**: Infinite scrolling cho lists

## 📱 Responsive Design

- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch Friendly**: Optimized for touch devices
- **Flexible Layouts**: Adaptive layouts along to screen size

## 🧪 Development Tools

- **Prettier**: Code formatting
- **TypeScript**: Type safety and IntelliSense
- **Vite**: Fast development server and HMR

## 📦 Build & Deployment

### Development

- **Hot Module Replacement**: Update code immediately
- **Source Maps**: Debug with browser dev tools
- **Fast Refresh**: React component hot reload

## 🔄 Version Control

- **Git Flow**: Feature branches and release management
- **Commit Convention**: Conventional commits
- **Code Review**: Pull request workflow

## 📚

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
