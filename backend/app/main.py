from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Employee
from .schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate


app = FastAPI(
    title="Employee Management API",
    version="1.0.0",
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://44.211.185.97:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "employee-backend",
    }


# Get all employees
@app.get(
    "/api/employees",
    response_model=list[EmployeeResponse],
)
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()


# Get employee by ID
@app.get(
    "/api/employees/{employee_id}",
    response_model=EmployeeResponse,
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee


# Create employee
@app.post(
    "/api/employees",
    response_model=EmployeeResponse,
    status_code=201,
)
def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
):
    existing_employee = (
        db.query(Employee)
        .filter(Employee.email == employee_data.email)
        .first()
    )

    if existing_employee:
        raise HTTPException(
            status_code=409,
            detail="Employee with this email already exists",
        )

    employee = Employee(
        name=employee_data.name,
        email=employee_data.email,
        department=employee_data.department,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


# Update employee
@app.put(
    "/api/employees/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    update_data = employee_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


# Delete employee
@app.delete("/api/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully",
        "employee_id": employee_id,
    }