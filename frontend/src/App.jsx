import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.department) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const params = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        department: formData.department,
      });

      const response = await fetch(
        `${API_URL}/api/employees?${params.toString()}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (response.status === 422) {
          throw new Error("Please check the employee details.");
        }

        if (response.status === 500) {
          throw new Error(
            errorData?.detail || "Unable to create employee."
          );
        }

        throw new Error("Failed to create employee.");
      }

      setFormData({
        name: "",
        email: "",
        department: "",
      });

      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Employee Management</h1>
        <p>Full Stack DevOps Project</p>
      </header>

      <main className="container">
        <section className="card">
          <h2>Add Employee</h2>

          <form onSubmit={handleSubmit} className="employee-form">
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
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Employee"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
        </section>

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
            <p className="status">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="status">No employees found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>
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