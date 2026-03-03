const reports = [
  { name: "Monthly Sales Summary", owner: "Nora Patel", format: "PDF", updated: "Feb 26, 2026" },
  { name: "Quarterly Revenue Forecast", owner: "Rayan Khan", format: "Sheet", updated: "Feb 21, 2026" },
  { name: "Regional Performance", owner: "Emily Stone", format: "CSV", updated: "Feb 19, 2026" },
  { name: "Campaign Attribution", owner: "Arjun Mehta", format: "PDF", updated: "Feb 17, 2026" },
];

function ReportsPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Reports</h1>
          <p>Review generated analytics exports and their latest updates.</p>
        </div>
        <button type="button" className="period-chip action-chip">
          Generate Report
        </button>
      </header>

      <section className="simple-grid">
        <article className="card mini-card">
          <p>Scheduled Reports</p>
          <h3>12</h3>
        </article>
        <article className="card mini-card">
          <p>Completed This Week</p>
          <h3>31</h3>
        </article>
        <article className="card mini-card">
          <p>Pending Review</p>
          <h3>5</h3>
        </article>
      </section>

      <section className="card table-card">
        <div className="chart-title table-title">
          <h2>Recent Reports</h2>
          <span>Latest outputs by analytics team</span>
        </div>

        <div className="table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Format</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.name}>
                  <td>{report.name}</td>
                  <td>{report.owner}</td>
                  <td>
                    <span className="tag">{report.format}</span>
                  </td>
                  <td>{report.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ReportsPage;
