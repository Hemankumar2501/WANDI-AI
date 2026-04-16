# 🚀 Visual Studio Code Setup Guide

## ✅ Project Status: READY FOR VS CODE

All errors have been cleared and the project is ready to run in Visual Studio Code!

## 📋 Prerequisites

Before opening in VS Code, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Git installed (optional, for version control)

## 🎯 Quick Start in VS Code

### 1. Open Project in VS Code

```bash
cd wanderwise-ai-main
code .
```

Or simply:

- Open VS Code
- File → Open Folder
- Select the `wanderwise-ai-main` folder

### 2. Install Recommended Extensions

VS Code will prompt you to install recommended extensions. Click "Install All" or install manually:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### 3. Install Dependencies

Open the integrated terminal (Ctrl+` or View → Terminal) and run:

```bash
npm install
```

### 4. Set Up Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Start Development Server

```bash
npm run dev
```

The app will open at: `http://localhost:8080`

## 🛠️ Available Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
| `npm run test`    | Run tests                |

## ✅ Verification Checklist

### No Errors Found ✓

- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ No build errors
- ✅ All imports resolved
- ✅ All components properly typed

### Files Cleaned ✓

- ✅ Removed unused components (FloatingMap, Icon3D, Image3D)
- ✅ Removed unnecessary lock files (bun.lockb)
- ✅ Clean project structure
- ✅ Proper .gitignore configuration

### Documentation Complete ✓

- ✅ README.md
- ✅ LICENSE
- ✅ CONTRIBUTING.md
- ✅ DEPLOYMENT_GUIDE.md
- ✅ SUPABASE_SETUP.md
- ✅ .env.example

## 🎨 VS Code Features Configured

### Auto-formatting

- Format on save enabled
- Prettier as default formatter
- ESLint auto-fix on save

### TypeScript

- Workspace TypeScript version configured
- IntelliSense enabled
- Type checking active

### File Exclusions

- node_modules hidden from explorer
- dist folder hidden
- .git folder hidden

## 🗂️ Project Structure

```
wanderwise-ai-main/
├── .vscode/              # VS Code settings
│   ├── settings.json     # Editor settings
│   └── extensions.json   # Recommended extensions
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   ├── pages/            # Page components
│   └── test/             # Test files
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── tailwind.config.ts    # Tailwind config
```

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is busy:

```bash
# Kill the process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### ESLint Not Working

```bash
# Restart ESLint server
Ctrl+Shift+P → "ESLint: Restart ESLint Server"
```

## 🎯 Key Features to Test

1. **Map Page** (`/map`)
   - Search locations
   - Get directions with different travel modes
   - Switch map types
   - Try popular destinations

2. **Theme Switcher**
   - Drag the floating theme button
   - Switch between Solo, Couple, Team themes
   - See theme persist on refresh

3. **Authentication**
   - Sign up with email
   - Login with Google OAuth
   - Password reset flow

## 📝 Development Tips

### Hot Module Replacement (HMR)

- Changes auto-reload in browser
- No need to restart server
- Fast development cycle

### TypeScript IntelliSense

- Hover over variables for type info
- Auto-complete for imports
- Inline error detection

### Debugging

- Use VS Code debugger
- Set breakpoints in code
- Inspect variables in real-time

## 🚀 Ready to Code!

Everything is set up and ready. Just run:

```bash
npm run dev
```

And start coding! The development server will automatically reload when you make changes.

---

**Current Status:** ✅ All systems operational, no errors detected!
