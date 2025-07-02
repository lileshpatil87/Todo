import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setToken }) {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const login = async (username, password) => {
    setAuthLoading(true);
    setAuthError("");

    const response = await fetch("https://todobackend-nhf4.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setAuthLoading(false);

    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      navigate("/");
    } else {
      setAuthError(data.message || "Login failed");
    }
  };

  return (
    <div
      className="max-w-md mx-auto mt-20 p-10 rounded-2xl shadow-xl border border-[#E0AAFF] bg-[#F6ECFF]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <h2 className="text-4xl font-bold text-center text-[#7B2CBF] mb-6">
        Welcome Back
      </h2>

      <p className="text-center text-[#5A189A] mb-8 text-sm font-medium">
        Please enter your credentials to continue
      </p>

      {authError && (
        <div className="mb-4 text-center text-red-600 font-semibold text-sm">
          {authError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(username, password);
        }}
      >
        <label className="block mb-2 text-sm text-[#3C096C] font-medium">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 mb-5 w-full rounded-lg border-2 border-[#D9B8FF] focus:outline-none focus:ring-2 focus:ring-[#C77DFF] placeholder:text-[#5A189A] text-sm"
          placeholder="Enter your username"
        />

        <label className="block mb-2 text-sm text-[#3C096C] font-medium">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 mb-6 w-full rounded-lg border-2 border-[#D9B8FF] focus:outline-none focus:ring-2 focus:ring-[#C77DFF] placeholder:text-[#5A189A] text-sm"
          placeholder="Enter your password"
        />

        <button
          type="submit"
          className="w-full py-3 bg-[#9D4EDD] hover:bg-[#7B2CBF] text-white text-base font-semibold rounded-lg transition duration-200 shadow-md"
        >
          {authLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-[#3C096C] text-sm">
        Don’t have an account?{" "}
        <Link to="/signup">
          <span className="text-[#7B2CBF] hover:underline font-semibold">
            Signup
          </span>
        </Link>
      </div>
    </div>
  );
}
