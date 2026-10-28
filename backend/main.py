from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Task Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Employee Task Tracker API is running!"}


@app.post(
    "/tasks/",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db)
):
    data = task.model_dump()

    data = {
        key: value.strip() if isinstance(value, str) else value
        for key, value in data.items()
    }

    if not data["title"] or not data["description"]:
        raise HTTPException(
            status_code=422,
            detail="Title and description cannot be empty."
        )

    if not data["assigned_employee"]:
        raise HTTPException(
            status_code=422,
            detail="Assigned employee cannot be empty."
        )

    new_task = models.Task(**data, status="Pending")
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@app.get("/tasks/", response_model=list[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).order_by(
        models.Task.id.desc()
    ).all()


@app.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    return task


@app.patch("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    update: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    task.status = update.status
    db.commit()
    db.refresh(task)

    return task

@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def edit_task(
    task_id: int,
    update: schemas.TaskCreate,
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    data = update.model_dump()
    data = {
        key: value.strip() if isinstance(value, str) else value
        for key, value in data.items()
    }

    if not data["title"] or not data["description"]:
        raise HTTPException(
            status_code=422,
            detail="Title and description cannot be empty."
        )

    if not data["assigned_employee"]:
        raise HTTPException(
            status_code=422,
            detail="Assigned employee cannot be empty."
        )

    for key, value in data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task




@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully.",
        "id": task_id
    }
