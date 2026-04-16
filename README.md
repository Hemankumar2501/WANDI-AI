# 🌍 WanderWise AI

A modern, AI-powered travel planning application with interactive maps, real-time directions, and beautiful theme customization.

![WanderWise AI](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.19-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🗺️ Interactive World Explorer

- **Real-time Map Integration** - Powered by Google Maps Embed API
- **Multi-Modal Directions** - Compare routes by car, bike, walk, or public transit
- **Live Location Tracking** - Get your current position instantly
- **Popular Destinations** - Quick access to major cities worldwide
- **Multiple Map Views** - Roadmap, Satellite, Hybrid, and Terrain modes
- **Smart Search** - Find any location, address, or landmark globally

### 🎨 Three Unique Themes

- **Solo Mode** - Sharp, minimalist design with blue/cyan colors
- **Couple Mode** - Romantic, flowing design with pink/purple colors
- **Team Mode** - Bold, energetic design with orange/yellow colors
- **Draggable Theme Switcher** - Move anywhere on screen for convenience

### 🔐 Authentication & Security

- **Supabase Integration** - Secure user authentication
- **Google OAuth** - One-click social login
- **Protected Routes** - Secure access to features
- **Password Reset** - Email-based password recovery

### 🎭 Modern UI/UX

- **Glassmorphism Effects** - Beautiful frosted glass design
- **Animated Backgrounds** - Live gradients and floating particles
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Powered by Framer Motion
- **Video Backgrounds** - Immersive travel-themed videos

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for authentication)
- Google Maps API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/wanderwise-ai.git
cd wanderwise-ai
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database**

Run the SQL scripts in order:

- `setup-database.sql` - Creates the database schema
- `supabase-schema.sql` - Sets up tables and policies

See `SUPABASE_SETUP.md` for detailed instructions.

5. **Start the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions for Vercel, Netlify, and other platforms.

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Shadcn/ui** - UI components
- **React Router** - Navigation

### Backend & Services

- **Supabase** - Authentication & Database
- **Google Maps API** - Maps & Directions
- **PostgreSQL** - Database (via Supabase)

### Development Tools

- **ESLint** - Code linting
- **Vitest** - Unit testing
- **PostCSS** - CSS processing

## 📁 Project Structure

```
wanderwise-ai/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── layout/     # Layout components (Navbar, Footer)
│   │   └── ui/         # UI components (shadcn/ui)
│   ├── contexts/       # React contexts (Theme)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (Supabase client)
│   ├── pages/          # Page components
│   │   ├── Index.tsx   # Homepage
│   │   ├── MapView.tsx # Interactive map page
│   │   ├── Login.tsx   # Login page
│   │   ├── Signup.tsx  # Signup page
│   │   ├── Chat.tsx    # AI chat page
│   │   ├── Explore.tsx # Explore page
│   │   └── Dashboard.tsx # User dashboard
│   ├── test/           # Test files
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── tailwind.config.ts  # Tailwind config
```

## 🎯 Key Features Explained

### Interactive Map Page

The map page (`/map`) provides a comprehensive navigation experience:

- Search any location worldwide
- Get directions with multiple travel modes
- Switch between map types (roadmap, satellite, etc.)
- View popular destinations with one click
- Track your live location

### Theme System

Three distinct themes that change the entire UI:

- **Solo**: Blue/cyan colors, sharp corners, bold typography
- **Couple**: Pink/purple colors, rounded corners, italic typography
- **Team**: Orange/yellow colors, hexagonal style, uppercase typography

Themes persist across sessions using localStorage.

### Authentication Flow

- Login page is the default entry point
- Protected routes require authentication
- Google OAuth for quick signup
- Email/password authentication
- Password reset functionality

## 🔧 Configuration

### Google Maps API

The app uses Google Maps Embed API. The API key is embedded in the code for the map functionality. For production, consider:

1. Restricting the API key to your domain
2. Setting up billing alerts
3. Enabling only required APIs

### Supabase Setup

1. Create a new Supabase project
2. Run the provided SQL scripts
3. Enable Google OAuth in Supabase dashboard
4. Add your site URL to allowed redirect URLs

## 🧪 Testing

Run tests:

```bash
npm run test
```

## 📝 Environment Variables

| Variable                 | Description                 | Required |
| ------------------------ | --------------------------- | -------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes      |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com/) for backend services
- [Google Maps](https://developers.google.com/maps) for mapping services
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide Icons](https://lucide.dev/) for icons

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by WanderWise Team
