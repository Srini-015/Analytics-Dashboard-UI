import { useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";

const AUTH_STORAGE_KEY = "mini2-auth-user";

const navItems = [
  { label: "Dashboard", path: "/app" },
  { label: "Reports", path: "/app/reports" },
  { label: "Team", path: "/app/team" },
  { label: "Settings", path: "/app/settings" },
];

function readStoredUser() {
  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
}

function PublicOnlyRoute({ isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}

function ProtectedRoute({ isAuthenticated }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function LandingPage({ isAuthenticated }) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="brand landing-brand">
          <span className="brand-dot" />
          PulseBoard
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-link">
            Login
          </Link>
          <Link to="/register" className="landing-btn secondary-btn">
            Register
          </Link>
        </div>
      </header>

      <section className="landing-hero card">
        <p className="eyebrow">Analytics Workspace</p>
        <h1>Track decisions, not just numbers.</h1>
        <p>
          PulseBoard gives your team a focused dashboard to monitor sales, revenue trends, and operational load in one
          place.
        </p>
        <div className="landing-cta-row">
          <Link to={isAuthenticated ? "/app" : "/login"} className="landing-btn">
            {isAuthenticated ? "Open Dashboard" : "Get Started"}
          </Link>
          <Link to="/register" className="landing-link">
            Create account
          </Link>
        </div>
      </section>

      <section className="landing-feature-grid">
        <article className="card landing-feature-card">
          <h2>Dynamic Filters</h2>
          <p>Drill down by year, category, and department to inspect performance quickly.</p>
        </article>
        <article className="card landing-feature-card">
          <h2>Visual Trends</h2>
          <p>Compare bar and line charts to understand trajectory and detect anomalies early.</p>
        </article>
        <article className="card landing-feature-card">
          <h2>Team Visibility</h2>
          <p>Balance utilization and reduce bottlenecks with a live view of member workload.</p>
        </article>
      </section>
    </div>
  );
}

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-screen">
      <section className="auth-card card">
        <div className="auth-head">
          <div className="brand auth-brand">
            <span className="brand-dot" />
            PulseBoard
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        <p className="auth-footer">{footer}</p>
      </section>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fromPath = useMemo(() => {
    const from = location.state?.from?.pathname;
    if (typeof from === "string" && from.startsWith("/app")) {
      return from;
    }
    return "/app";
  }, [location.state]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please provide both email and password.");
      return;
    }

    onLogin({
      name: email.split("@")[0] || "Analyst",
      email,
    });
    navigate(fromPath, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue to your analytics workspace."
      footer={
        <>
          Need an account?{" "}
          <Link to="/register" className="auth-inline-link">
            Register
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </label>

        {errorMessage && (
          <p role="alert" className="auth-error">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="auth-submit">
          Login
        </button>
      </form>
    </AuthLayout>
  );
}

function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    onRegister({
      name: fullName.trim(),
      email: email.trim(),
    });
    navigate("/app", { replace: true });
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Set up your PulseBoard workspace access."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="auth-inline-link">
            Login
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Alex Morgan" />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
          />
        </label>

        {errorMessage && (
          <p role="alert" className="auth-error">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="auth-submit">
          Create Account
        </button>
      </form>
    </AuthLayout>
  );
}

function DashboardLayout({ onLogout, user }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          PulseBoard
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>{user?.name || "Signed in"}</p>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [authUser, setAuthUser] = useState(readStoredUser);

  const handleLogin = (profile) => {
    setAuthUser(profile);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  };

  const handleRegister = (profile) => {
    setAuthUser(profile);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  };

  const handleLogout = () => {
    setAuthUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage isAuthenticated={Boolean(authUser)} />} />

      <Route element={<PublicOnlyRoute isAuthenticated={Boolean(authUser)} />}>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
      </Route>

      <Route element={<ProtectedRoute isAuthenticated={Boolean(authUser)} />}>
        <Route path="/app" element={<DashboardLayout onLogout={handleLogout} user={authUser} />}>
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
