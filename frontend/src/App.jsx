import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/employees`);

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle form changes
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      department: "",
    });

    setEditingId(null);
  };

  // Create / Update employee
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.department) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const url = editingId
        ? `${API_URL}/api/employees/${editingId}`
        : `${API_URL}/api/employees`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            responseData?.detail ||
              "Employee with this email already exists."
          );
        }

        if (response.status === 404) {
          throw new Error(
            responseData?.detail || "Employee not found."
          );
        }

        if (response.status === 422) {
          throw new Error("Please check the employee details.");
        }

        throw new Error(
          responseData?.detail ||
            `Failed to ${editingId ? "update" : "create"} employee.`
        );
      }

      resetForm();
      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit employee
  const handleEdit = (employee) => {
    setEditingId(employee.id);

    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });

    setError("");
  };

  // Delete employee
  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/employees/${employeeId}`,
        {
          method: "DELETE",
        }
      );

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Failed to delete employee."
        );
      }

      if (editingId === employeeId) {
        resetForm();
      }

      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Employee Management</h1>
        <p>Full Stack DevOps Project</p>
      </header>

      <main className="container">
        {/* Employee Form */}
        <section className="card">
          <h2>
            {editingId ? "Edit Employee" : "Add Employee"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="employee-form"
          >
            <div className="form-group">
              <label htmlFor="name">Name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter employee name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter employee email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">
                Department
              </label>

              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                  ? "Update Employee"
                  : "Add Employee"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && (
            <p className="error">{error}</p>
          )}
        </section>

        {/* Employee List */}
        <section className="card">
          <div className="section-header">
            <h2>Employees</h2>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchEmployees}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="status">
              Loading employees...
            </p>
          ) : employees.length === 0 ? (
            <p className="status">
              No employees found.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(employee)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(employee.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;