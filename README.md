# Employee Task Tracker

A simple web application for creating, viewing, updating, and deleting employee tasks.

## Features

- Create tasks with a title, description, priority, and assigned employee.
- View all tasks in a dashboard.
- Update task details.
- Change task status.
- Delete tasks.
- Store task data persistently using SQLite.
- REST API built with Python FastAPI.
- React-based frontend.
- API testing using FastAPI Swagger UI.

## Technology Stack

- Frontend: React.js, HTML, CSS, JavaScript
- Backend: Python, FastAPI
- Database: SQLite
- API Testing: FastAPI Swagger UI
- Tools: VS Code, Git, GitHub

## Project Structure

```text
AAI_tech_task/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── tasks.db
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

## Backend Setup

Open a terminal in the project folder.

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload
```

Backend URL: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

## Frontend Setup

Open a second terminal from the main project folder.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually:

http://localhost:5173

## Testing

The application was tested for:

- Creating tasks
- Viewing tasks
- Updating task details
- Changing task status
- Deleting tasks
- Checking persistence after refreshing the browser
- Testing API endpoints using Swagger UI

## Database

SQLite is used to store task information persistently.

## Author

S
