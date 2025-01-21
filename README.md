# Turl - Curling Tournament Management System

## Overview
Turl is a web application that streamlines the organization and management of curling tournaments. Built as a two-part system, it consists of this Next.js frontend and a dedicated NestJS backend service ([turl-server](https://github.com/rrirrirr/turl-server)). The platform enables tournament organizers to efficiently create and manage competitions while providing teams with easy access to their schedules, results, and tournament information through personalized team pages. It is still in development and some things are set up for demoing.

## Features
- **Tournament Management**: Create and manage curling tournaments with ease
- **Team System**: Register teams and manage team rosters
- **Automated Scheduling**: Generate game schedules automatically
- **Team Pages**: Dedicated pages for each team showing upcoming games and results
- **Progress Tracking**: Monitor tournament progress and standings

## Tech Stack
### Frontend ([Repository](https://github.com/rrirrirr/turl))
- **Framework**: Next.js 13
- **UI Components**: Mantine UI
- **Authentication**: NextAuth.js
- **Data Fetching**: SWR

### Backend ([Repository](https://github.com/rrirrirr/turl-server))
- **Framework**: NestJS
- **Database**: PostgreSQL/SQLite
- **API**: RESTful endpoints

## Getting Started

### Prerequisites
- Node.js (LTS version)
- npm
- PostgreSQL (for backend)

### Installation

1. Clone the repositories
```bash
# Frontend
git clone https://github.com/rrirrirr/turl.git
cd turl
npm install

# Backend
git clone https://github.com/rrirrirr/turl-server.git
cd turl-server
npm install
```

2. Start the development servers
```bash
# Frontend (http://localhost:3000)
npm run dev

# Backend (http://localhost:3001)
npm run dev
```

## Development Scripts

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run code linting
```

### Backend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
```
