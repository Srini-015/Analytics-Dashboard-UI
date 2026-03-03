import { useState } from "react";

function SettingsPage() {
  const [settings, setSettings] = useState({
    timezone: "UTC-05:00",
    defaultYear: "2026",
    emailAlerts: true,
    weeklyDigest: false,
  });

  const updateField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Settings</h1>
          <p>Manage dashboard preferences and notification behavior.</p>
        </div>
        <button type="button" className="period-chip action-chip">
          Save Changes
        </button>
      </header>

      <section className="settings-grid">
        <article className="card settings-card">
          <h2>Display Preferences</h2>
          <label>
            Timezone
            <select value={settings.timezone} onChange={updateField("timezone")}>
              <option value="UTC-08:00">UTC-08:00</option>
              <option value="UTC-05:00">UTC-05:00</option>
              <option value="UTC+00:00">UTC+00:00</option>
              <option value="UTC+05:30">UTC+05:30</option>
            </select>
          </label>

          <label>
            Default Year
            <select value={settings.defaultYear} onChange={updateField("defaultYear")}>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </label>
        </article>

        <article className="card settings-card">
          <h2>Notifications</h2>
          <label className="switch-row">
            <span>Email Alerts</span>
            <input type="checkbox" checked={settings.emailAlerts} onChange={updateField("emailAlerts")} />
          </label>

          <label className="switch-row">
            <span>Weekly Digest</span>
            <input type="checkbox" checked={settings.weeklyDigest} onChange={updateField("weeklyDigest")} />
          </label>

          <div className="settings-summary">
            <p>Current profile</p>
            <strong>
              {settings.timezone}, default year {settings.defaultYear}
            </strong>
          </div>
        </article>
      </section>
    </>
  );
}

export default SettingsPage;
