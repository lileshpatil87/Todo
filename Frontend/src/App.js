import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const fetchTasks = async (token) => {
    const response = await fetch("https://todobackend-nhf4.onrender.com/task", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log("Fetched tasks:", data);
    // Ensure tasks is always an array
    setTasks(Array.isArray(data) ? data : data.tasks || []);
  };

  useEffect(() => {
    if (token) fetchTasks(token);
  }, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
  };

  const addTask = async (text) => {
    const response = await fetch("https://todobackend-nhf4.onrender.com/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, status: "pending", priority: "medium" }),
    });
    const { task: newTask } = await response.json();
    setTasks([...tasks, newTask]);
  };

  const deleteTask = async (id) => {
    await fetch(`https://todobackend-nhf4.onrender.com/task/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const updateTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    const response = await fetch(`https://todobackend-nhf4.onrender.com/task/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    const { task: updatedTask } = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const updateTaskPriority = async (id, newPriority) => {
    const response = await fetch(`https://todobackend-nhf4.onrender.com/task/${id}/priority`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priority: newPriority }),
    });
    const { task: updatedTask } = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  const MainApp = () => (
    <div className="flex flex-col min-h-screen font-sans">
      <nav className="bg-[#E0AAFF] text-[#10002B] px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-end items-center space-x-4">
          <a
            href="#"
            className="px-4 py-2 rounded-full transition-colors duration-200 hover:bg-[#C77DFF] hover:text-white bg-[#F5E6FF] text-[#5A189A] font-semibold shadow-sm"
          >
            Home
          </a>
          <button
            onClick={logout}
            className="px-5 py-2 bg-[#9D4EDD] hover:bg-[#7B2CBF] text-white font-bold rounded-full shadow transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 px-20 p-8 bg-[#FAF5FF]">
        <h1 className="text-5xl font-bold text-center mb-10 text-[#5A189A] drop-shadow-sm tracking-wide">
          MERN To-Do App
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask(e.target[0].value);
            e.target[0].value = "";
          }}
          className="mb-8 flex gap-3 justify-center"
        >
          <input
            type="text"
            className="p-4 border-2 border-[#C77DFF] rounded-lg w-2/3 focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] text-lg"
            placeholder="Add a task"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-[#9D4EDD] hover:bg-[#7B2CBF] text-white font-bold rounded-lg transition-colors duration-200"
          >
            Add
          </button>
        </form>

        <div className="mb-8 flex gap-4 justify-center">
          <select
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 border-2 border-[#C77DFF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] text-base"
            value={filterStatus}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-3 border-2 border-[#C77DFF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] text-base"
            value={filterPriority}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <ul className="space-y-6">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className="p-5 bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#F3E6FF] hover:shadow-lg transition duration-300"
            >
              <div className="flex-1">
                <span className="text-xl text-[#240046] font-medium">
                  {task.text}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({task.status}, {task.priority})
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => updateTaskStatus(task._id, task.status)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors duration-200 text-sm shadow-sm ${
                    task.status === "pending"
                      ? "bg-yellow-300 text-yellow-900 hover:bg-yellow-400"
                      : "bg-green-300 text-green-900 hover:bg-green-400"
                  }`}
                >
                  {task.status === "pending" ? "Mark Complete" : "Mark Pending"}
                </button>
                <select
                  value={task.priority}
                  onChange={(e) => updateTaskPriority(task._id, e.target.value)}
                  className="p-2 border-2 border-[#C77DFF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D4EDD] text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-full text-sm shadow transition-colors duration-200 ml-2"
                  title="Delete Task"
                >
                  <i className="fas fa-trash" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <footer className="bg-[#C77DFF] text-white p-4 text-center shadow-inner mt-auto">
        © 2025 Your To-Do App
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={token ? <MainApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
