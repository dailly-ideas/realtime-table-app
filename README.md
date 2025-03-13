# Real-time Data Table

A modern React application featuring a real-time data table with Supabase integration. Built with React, TypeScript, TailwindCSS, and Supabase.

## Features

- 🔄 Real-time data updates using Supabase subscriptions
- 📊 Interactive data table with sorting and pagination
- ✏️ CRUD operations (Create, Read, Update, Delete)
- 🎨 Modern UI with TailwindCSS and Headless UI
- 🚀 Type-safe with TypeScript
- 📱 Responsive design
- 🔔 Toast notifications for user feedback
- 🐳 Docker support for easy development setup

## Prerequisites

- Docker and Docker Compose
- Git

## Setup with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd realtime-table
```

2. Create a `.env` file in the web-app directory:
```env
# Web App Environment Variables
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
```

3. Start Supabase services first:
```bash
# Navigate to Supabase directory
cd supabase/docker

# Copy the example environment file
cp .env.example .env

# Start Supabase services
docker compose up -d

# Wait for all services to be healthy (this may take a minute)
docker compose ps
```

4. Start the web application (in a new terminal):
```bash
# Go back to project root
cd ../web-app

# Start the web application
docker compose up -d
```

The services will be available at:
- Web App: http://localhost:5173
- Supabase Studio: http://localhost:3000
- Supabase API: http://localhost:8000
- PostgreSQL Database: localhost:5432

## Accessing Services

### Supabase Studio
- URL: http://localhost:3000
- Username: supabase
- Password: this-password-is-for-supabase-studio

### PostgreSQL Database
- Host: localhost
- Port: 5432
- Database: postgres
- Username: postgres
- Password: your-super-secret-password

## Development Commands

### Supabase Services
```bash
# Start Supabase services
cd supabase/docker
docker compose up -d

# View Supabase logs
docker compose logs -f

# Stop Supabase services
docker compose down

# Reset Supabase (including database)
docker compose down -v
```

### Web Application
```bash
# Start web application
docker compose up -d

# View web app logs
docker compose logs -f

# Stop web application
docker compose down

# Rebuild web application
docker compose up -d --build
```

## Troubleshooting

1. If services aren't starting properly:
```bash
# Check service status
docker compose ps

# View detailed logs
docker compose logs -f
```

2. If you need to reset everything:
```bash
# Stop and remove all containers, networks, and volumes
cd supabase/docker
docker compose down -v
cd ../..
docker compose down -v

# Start everything again
cd supabase/docker
docker compose up -d
cd ../..
docker compose up -d
```

3. Common issues:
- If the web app can't connect to Supabase, ensure all Supabase services are healthy before starting the web app
- If you see database connection errors, wait a minute for the database to fully initialize
- If you need to reset the database, use `docker compose down -v` to remove the volumes

## Project Structure

```
.
├── web-app/                  # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config/         # Configuration files
│   │   └── App.tsx        # Main application
│   ├── Dockerfile         # Web app container configuration
│   └── docker-compose.yml # Web app container orchestration
│
└── supabase/              # Supabase configuration
    └── docker/           # Supabase Docker configuration
        ├── volumes/     # Persistent data and configuration
        └── docker-compose.yml # Supabase container orchestration
```

## Features in Detail

### DataTable Component
- Displays data in a paginated table format
- Supports sorting by clicking column headers
- Real-time updates when data changes
- Edit and delete functionality for each row
- Status badges with different colors

### AddRecordDialog Component
- Modal dialog for adding new records
- Form validation
- Dynamic field generation based on table schema
- Responsive design

### Real-time Updates
The application uses Supabase's real-time subscriptions to automatically update the table when:
- A new record is added
- An existing record is updated
- A record is deleted

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.dev/)
- [@tanstack/react-table](https://tanstack.com/table/v8) 