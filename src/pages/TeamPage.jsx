import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ALL = "All";

const members = [
  {
    name: "Nora Patel",
    role: "Data Analyst",
    region: "North",
    pod: "Revenue Ops",
    utilization: 82,
    status: "On Track",
    velocity: 36,
    ticketsClosed: 28,
    overtimeHours: 4,
  },
  {
    name: "Rayan Khan",
    role: "BI Engineer",
    region: "Central",
    pod: "Platform",
    utilization: 74,
    status: "On Track",
    velocity: 41,
    ticketsClosed: 33,
    overtimeHours: 2,
  },
  {
    name: "Emily Stone",
    role: "Product Analyst",
    region: "South",
    pod: "Client Intelligence",
    utilization: 91,
    status: "High Load",
    velocity: 44,
    ticketsClosed: 39,
    overtimeHours: 10,
  },
  {
    name: "Arjun Mehta",
    role: "Reporting Lead",
    region: "North",
    pod: "Reporting Core",
    utilization: 68,
    status: "On Track",
    velocity: 31,
    ticketsClosed: 24,
    overtimeHours: 1,
  },
  {
    name: "Sofia Reed",
    role: "Analytics Engineer",
    region: "Central",
    pod: "Platform",
    utilization: 88,
    status: "High Load",
    velocity: 46,
    ticketsClosed: 35,
    overtimeHours: 8,
  },
  {
    name: "Dev Malhotra",
    role: "Operations Analyst",
    region: "South",
    pod: "Client Intelligence",
    utilization: 63,
    status: "On Track",
    velocity: 27,
    ticketsClosed: 22,
    overtimeHours: 0,
  },
];

const regions = [ALL, ...new Set(members.map((member) => member.region))];
const roles = [ALL, ...new Set(members.map((member) => member.role))];
const statuses = [ALL, ...new Set(members.map((member) => member.status))];

function getLoadTier(utilization) {
  if (utilization >= 90) {
    return "Critical";
  }
  if (utilization >= 80) {
    return "High";
  }
  if (utilization >= 65) {
    return "Balanced";
  }
  return "Light";
}

function compareMembers(a, b, sortBy) {
  if (sortBy === "utilization_asc") {
    return a.utilization - b.utilization;
  }
  if (sortBy === "velocity_desc") {
    return b.velocity - a.velocity;
  }
  if (sortBy === "tickets_desc") {
    return b.ticketsClosed - a.ticketsClosed;
  }
  if (sortBy === "name_asc") {
    return a.name.localeCompare(b.name);
  }
  return b.riskScore - a.riskScore;
}

function TeamPage() {
  const [filters, setFilters] = useState({
    search: "",
    region: ALL,
    role: ALL,
    status: ALL,
    sortBy: "risk_desc",
    highRiskOnly: false,
  });

  const handleFilterChange = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const membersWithRisk = useMemo(
    () =>
      members.map((member) => {
        const availableCapacity = Math.max(0, 100 - member.utilization);
        const loadTier = getLoadTier(member.utilization);
        const riskScore = Math.round(
          member.utilization * 0.7 + member.overtimeHours * 2.2 + (member.status === "High Load" ? 10 : 0)
        );

        return {
          ...member,
          availableCapacity,
          loadTier,
          riskScore,
          shortName: member.name.split(" ")[0],
        };
      }),
    []
  );

  const visibleMembers = useMemo(
    () =>
      membersWithRisk
        .filter((member) => {
          const search = filters.search.trim().toLowerCase();
          if (
            search &&
            ![member.name, member.role, member.region, member.pod].some((value) => value.toLowerCase().includes(search))
          ) {
            return false;
          }
          if (filters.region !== ALL && member.region !== filters.region) {
            return false;
          }
          if (filters.role !== ALL && member.role !== filters.role) {
            return false;
          }
          if (filters.status !== ALL && member.status !== filters.status) {
            return false;
          }
          if (filters.highRiskOnly && member.riskScore < 75) {
            return false;
          }
          return true;
        })
        .sort((a, b) => compareMembers(a, b, filters.sortBy)),
    [filters, membersWithRisk]
  );

  const summary = useMemo(() => {
    const seed = {
      count: 0,
      utilization: 0,
      velocity: 0,
      tickets: 0,
      highLoadCount: 0,
      criticalCount: 0,
    };

    const totals = visibleMembers.reduce((acc, member) => {
      acc.count += 1;
      acc.utilization += member.utilization;
      acc.velocity += member.velocity;
      acc.tickets += member.ticketsClosed;
      acc.highLoadCount += member.status === "High Load" ? 1 : 0;
      acc.criticalCount += member.loadTier === "Critical" ? 1 : 0;
      return acc;
    }, seed);

    const averageUtilization = totals.count ? Math.round(totals.utilization / totals.count) : 0;
    const averageVelocity = totals.count ? Math.round(totals.velocity / totals.count) : 0;

    return {
      ...totals,
      averageUtilization,
      averageVelocity,
    };
  }, [visibleMembers]);

  const memberCapacityChart = useMemo(
    () =>
      visibleMembers.map((member) => ({
        member: member.shortName,
        utilized: member.utilization,
        available: member.availableCapacity,
      })),
    [visibleMembers]
  );

  const regionPerformanceChart = useMemo(() => {
    const regionMap = new Map();

    visibleMembers.forEach((member) => {
      if (!regionMap.has(member.region)) {
        regionMap.set(member.region, {
          region: member.region,
          utilizationTotal: 0,
          velocityTotal: 0,
          count: 0,
        });
      }
      const row = regionMap.get(member.region);
      row.utilizationTotal += member.utilization;
      row.velocityTotal += member.velocity;
      row.count += 1;
    });

    return [...regionMap.values()].map((row) => ({
      region: row.region,
      avgUtilization: row.count ? Math.round(row.utilizationTotal / row.count) : 0,
      avgVelocity: row.count ? Math.round(row.velocityTotal / row.count) : 0,
    }));
  }, [visibleMembers]);

  const highRiskQueue = useMemo(
    () => visibleMembers.filter((member) => member.riskScore >= 75).slice(0, 4),
    [visibleMembers]
  );

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Team</h1>
          <p>Monitor team allocation, delivery velocity, and workload risk by member.</p>
        </div>
        <div className="period-chip">{summary.count} Visible Members</div>
      </header>

      <section className="card team-controls-card">
        <div className="chart-title">
          <h2>Team Operations Controls</h2>
          <span>Search, filter, and prioritize where to act</span>
        </div>

        <div className="team-controls-grid">
          <label>
            Search Member or Pod
            <input
              type="text"
              value={filters.search}
              onChange={handleFilterChange("search")}
              placeholder="Search by name, role, region, pod"
            />
          </label>

          <label>
            Region
            <select value={filters.region} onChange={handleFilterChange("region")}>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label>
            Role
            <select value={filters.role} onChange={handleFilterChange("role")}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={filters.status} onChange={handleFilterChange("status")}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort By
            <select value={filters.sortBy} onChange={handleFilterChange("sortBy")}>
              <option value="risk_desc">Risk (High to Low)</option>
              <option value="utilization_asc">Utilization (Low to High)</option>
              <option value="velocity_desc">Velocity (High to Low)</option>
              <option value="tickets_desc">Tickets Closed</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </label>

          <label className="checkbox-field team-checkbox-field">
            Focus Mode
            <span className="checkbox-inline">
              <input
                type="checkbox"
                checked={filters.highRiskOnly}
                onChange={handleFilterChange("highRiskOnly")}
              />
              Show high-risk members only
            </span>
          </label>
        </div>
      </section>

      <section className="team-insight-grid">
        <article className="card mini-card team-insight-card">
          <p>Average Utilization</p>
          <h3>{summary.averageUtilization}%</h3>
          <small>Across visible members</small>
        </article>
        <article className="card mini-card team-insight-card">
          <p>Average Velocity</p>
          <h3>{summary.averageVelocity}</h3>
          <small>Stories per sprint</small>
        </article>
        <article className="card mini-card team-insight-card">
          <p>High Load Members</p>
          <h3>{summary.highLoadCount}</h3>
          <small>{summary.criticalCount} critical-load members</small>
        </article>
        <article className="card mini-card team-insight-card">
          <p>Tickets Closed</p>
          <h3>{summary.tickets}</h3>
          <small>Current review period</small>
        </article>
      </section>

      <section className="team-chart-grid">
        <article className="card chart-card">
          <div className="chart-title">
            <h2>Member Capacity Mix</h2>
            <span>Utilized vs available capacity</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberCapacityChart}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d8e1e8" />
                <XAxis dataKey="member" stroke="#48606b" />
                <YAxis stroke="#48606b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilized" stackId="capacity" name="Utilized %" fill="#145a72" radius={[6, 6, 0, 0]} />
                <Bar dataKey="available" stackId="capacity" name="Available %" fill="#d8e7ef" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <div className="chart-title">
            <h2>Regional Performance</h2>
            <span>Average utilization and delivery velocity</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={regionPerformanceChart}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d8e1e8" />
                <XAxis dataKey="region" stroke="#48606b" />
                <YAxis yAxisId="left" stroke="#48606b" />
                <YAxis yAxisId="right" orientation="right" stroke="#8d5d3d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="avgUtilization" name="Avg Utilization %" fill="#2f7d99" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgVelocity" name="Avg Velocity" stroke="#d4632b" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="team-grid">
        {visibleMembers.length > 0 ? (
          visibleMembers.map((member) => (
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
                <span>Pod</span>
                <strong>{member.pod}</strong>
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

              <div className="member-meta-grid">
                <div>
                  <span>Velocity</span>
                  <strong>{member.velocity}</strong>
                </div>
                <div>
                  <span>Tickets</span>
                  <strong>{member.ticketsClosed}</strong>
                </div>
                <div>
                  <span>Capacity</span>
                  <strong>{member.availableCapacity}%</strong>
                </div>
                <div>
                  <span>Risk</span>
                  <strong>{member.riskScore}</strong>
                </div>
              </div>

              <div className="member-row">
                <span>Status</span>
                <span className={`badge${member.status === "High Load" ? " warning" : ""}`}>{member.status}</span>
              </div>
              <div className="member-row">
                <span>Load Tier</span>
                <span className={`tag${member.loadTier === "Critical" ? " warning" : ""}`}>{member.loadTier}</span>
              </div>
            </article>
          ))
        ) : (
          <article className="card member-empty">
            <h3>No members found</h3>
            <p>Try changing search text or relaxing filters.</p>
          </article>
        )}
      </section>

      {highRiskQueue.length > 0 && (
        <section className="card team-risk-card">
          <div className="chart-title">
            <h2>High-Risk Queue</h2>
            <span>Members requiring immediate rebalancing</span>
          </div>

          <div className="table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Pod</th>
                  <th>Utilization</th>
                  <th>Overtime (hrs)</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {highRiskQueue.map((member) => (
                  <tr key={member.name}>
                    <td>{member.name}</td>
                    <td>{member.pod}</td>
                    <td>{member.utilization}%</td>
                    <td>{member.overtimeHours}</td>
                    <td>
                      <span className="tag warning">{member.riskScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

export default TeamPage;
