from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Employee

app = FastAPI(
    title="Employee Management API",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "employee-backend",
    }


@app.get("/api/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()


@app.post("/api/employees")
def create_employee(
    name: str,
    email: str,
    department: str,
    db: Session = Depends(get_db),
):
    employee = Employee(
        name=name,
        email=email,
        department=department,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee