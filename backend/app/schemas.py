from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    name: str
    email: str
    department: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    department: str | None = None


class EmployeeResponse(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)