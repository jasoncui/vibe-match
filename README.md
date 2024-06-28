# Vibe Match

## Overview

Vibe Match is a web application that allows users to connect through their musical tastes. By leveraging Spotify's API, Vibe Match analyzes users' listening habits and provides compatibility scores between users based on their favorite tracks, artists, and genres.

## Features

- **Spotify Integration**: Users can log in with their Spotify accounts to access their listening data.
- **Music Profile**: Each user gets a personalized music profile showcasing their top tracks, artists, and genres.
- **Compatibility Calculation**: Users can calculate their music compatibility with other users, receiving a score and seeing shared musical interests.
- **User Discovery**: Find and connect with users who have similar music tastes.

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: Next.js API routes (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Spotify OAuth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Spotify Developer account
- Supabase account

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-username/vibe-match.git
   cd vibe-match
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. Set up Supabase:

   - Create necessary tables: `profiles`, `user_top_tracks`, `user_top_artists`, `user_top_genres`, `user_compatibility`
   - Set up Row Level Security (RLS) policies for each table

5. Run the development server:

   ```
   npm run dev
   ```

6. Open `http://localhost:3000` in your browser to see the application.

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: Reusable React components
- `/lib`: Utility functions and API helpers
- `/styles`: Global styles and Tailwind config

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Spotify API for providing access to user music data
- Supabase for the backend infrastructure
- Next.js team for the amazing framework
