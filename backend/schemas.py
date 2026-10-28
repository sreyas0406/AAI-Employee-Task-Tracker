from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    priority: Literal["Low", "Medium", "High"]
    assigned_employee: str = Field(
        min_length=1,
        max_length=100
    )


class TaskResponse(TaskCreate):
    id: int
    status: Literal["Pending", "In Progress", "Completed"]

    model_config = ConfigDict(from_attributes=True)


class TaskStatusUpdate(BaseModel):
    status: Literal["Pending", "In Progress", "Completed"]
    