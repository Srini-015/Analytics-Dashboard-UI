const members = [
  { name: "Nora Patel", role: "Data Analyst", region: "North", utilization: 82, status: "On Track" },
  { name: "Rayan Khan", role: "BI Engineer", region: "Central", utilization: 74, status: "On Track" },
  { name: "Emily Stone", role: "Product Analyst", region: "South", utilization: 91, status: "High Load" },
  { name: "Arjun Mehta", role: "Reporting Lead", region: "North", utilization: 68, status: "On Track" },
];

function TeamPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>Team</h1>
          <p>Monitor team allocation and operational load by member.</p>
        </div>
        <div className="period-chip">4 Active Pods</div>
      </header>

      <section className="team-grid">
        {members.map((member) => (
          <article className="card member-card" key={member.name}>
            <div className="member-head">
              <div className="avatar" aria-hidden="true">
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>

            <div className="member-row">
              <span>Region</span>
              <strong>{member.region}</strong>
            </div>

            <div className="member-row">
              <span>Utilization</span>
              <strong>{member.utilization}%</strong>
            </div>
            <div className="progress" aria-label={`Utilization ${member.utilization}%`}>
              <span style={{ width: `${member.utilization}%` }} />
            </div>

            <div className="member-row">
              <span>Status</span>
              <span className={`badge${member.status === "High Load" ? " warning" : ""}`}>{member.status}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default TeamPage;
