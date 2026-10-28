import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  assigned_employee: "",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tasks/`);
      if (!response.ok) throw new Error("Could not load tasks.");

      setTasks(await response.json());
    } catch {
      setError(
        "Cannot connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Please check the task details."
        );
      }

      setForm(emptyForm);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not create the task.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(task, newStatus) {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Could not update task.");

      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not update task.");
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete task.");

      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not delete task.");
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigned_employee: task.assigned_employee,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveEdit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tasks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Could not edit task. Check the backend API.");
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not edit task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            
          </p>
          <h1>Employee Task Tracker</h1>
          <p className="subtitle">
            
          </p>
        </div>
        <button className="refresh-btn" onClick={loadTasks}>
          ↻ Refresh
        </button>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pending</span>
          <strong>{tasks.filter(t => t.status === "Pending").length}</strong>
        </div>
        <div className="stat-card">
          <span>In progress</span>
          <strong>
            {tasks.filter(t => t.status === "In Progress").length}
          </strong>
        </div>
        <div className="stat-card">
          <span>Completed</span>
          <strong>
            {tasks.filter(t => t.status === "Completed").length}
          </strong>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{editingId ? "Edit task" : "Create a task"}</h2>
            <p>Fill in the details below.</p>
          </div>
          {editingId && (
            <button
              className="secondary-btn"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          className="task-form"
          onSubmit={editingId ? saveEdit : handleSubmit}
        >
          <label>
            Task title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Develop login page"
              maxLength={200}
              required
            />
          </label>

          <label>
            Assigned employee
            <input
              name="assigned_employee"
              value={form.assigned_employee}
              onChange={handleChange}
              placeholder="e.g. Rahul"
              maxLength={100}
              required
            />
          </label>

          <label>
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>

          <label className="description-field">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the task..."
              required
            />
          </label>

          <button className="primary-btn" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "+ Create task"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>All tasks</h2>
            <p>Your tasks are stored in the SQLite database.</p>
          </div>
          <span className="task-count">{tasks.length} tasks</span>
        </div>

        {loading ? (
          <p className="empty">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty">No tasks yet. Create your first task above.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Employee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      <p className="task-description">{task.description}</p>
                    </td>
                    <td>{task.assigned_employee}</td>
                    <td>
                      <span className={`priority ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={e => updateStatus(task, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task.id)}
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

      <footer>Employee Task Tracker</footer>
    </main>
  );
}

export default App;
