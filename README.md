# GoPal - Fitness Tracking and Social Application

GoPal is a web-based fitness tracking application that helps users log their physical activities, maintain a workout journal, and connect with friends. The application features a virtual companion (your "Pal") that evolves and grows as you make progress on your fitness journey.

## Features

- **Activity Tracking**: Log various types of exercises (running, walking, cycling, swimming, hiking, etc.)
- **Journal**: Keep a fitness journal to document your progress and thoughts
- **Virtual Companion**: Customize your personal fitness pal that evolves as you achieve fitness milestones
- **Social Features**: Connect with friends, view their activities, and provide encouragement
- **Weather Integration**: Get real-time weather updates to plan your outdoor activities
- **Achievement System**: Earn achievements and XP by completing fitness goals

## Contributors

- Rane Gray (GitHub: [ranegray](https://github.com/ranegray))
- Benjamin Mast (GitHub: [Ben-Mast](https://github.com/Ben-Mast))
- Ana Manica (GitHub: [anamanica](https://github.com/anamanica))
- Samuel Ramirez (GitHub: [samuelARamirez](https://github.com/samuelARamirez))
- Ben Atkinson (GitHub: [beat2319](https://github.com/beat2319))
- Aisli Steele (GitHub: [aist6825](https://github.com/aist6825))

## Technology Stack

- **Frontend**: HTML, JavaScript, Handlebars.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with pg-promise
- **Authentication**: Session-based with bcryptjs
- **Container**: Docker, Docker Compose
- **Testing**: Mocha, Chai

## Prerequisites

To run GoPal locally, you need to have the following installed:

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A free [OpenWeatherMap API key](https://openweathermap.org/api) for weather functionality

## Setup and Installation

### 1. Clone the repository

### 2. Environment Setup

Create a .env file in the ProjectSourceCode directory with the following variables:
```
HOST=db
PORT=5432
POSTGRES_DB=gopal_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
SESSION_SECRET=your_session_secret
WEATHER_API_KEY=your_openweathermap_api_key
```

### 3. Start the Docker containers

`docker-compose up`

This will:
- Start a PostgreSQL database container
- Initialize the database with the schema from init_data/create.sql and sample data from init_data/insert.sql
- Start the Node.js application
- Run built-in unit tests


### 4. Access the application

Open your browser and navigate to:
`http://localhost:3000`

## Project Structure

- `/server`: Backend Node.js code
    - `/server/utils`: Utility functions for achievements, date handling, etc.
- `/views`: Handlebars templates
    - `/views/layouts`: Main layout templates
    - `/views/pages`: Page templates
    - `/views/partials`: Reusable components
- `/js`: Frontend JavaScript code
- `/extra_resources`: Static assets like images and CSS
- `/init_data`: Database initialization scripts
    - `create.sql`: Schema definition
    - `insert.sql`: Sample data
