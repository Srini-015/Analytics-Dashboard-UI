import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { allRecords, categories, departments, months, years } from "../data";

const ALL = "All";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function DashboardPage() {
  const [filters, setFilters] = useState({
    year: String(years[years.length - 1]),
    category: ALL,
    department: ALL,
  });

  const handleFilterChange = (key) => (event) => {
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const filteredRecords = useMemo(
    () =>
      allRecords.filter((row) => {
        if (row.year !== Number(filters.year)) {
          return false;
        }
        if (filters.category !== ALL && row.category !== filters.category) {
          return false;
        }
        if (filters.department !== ALL && row.department !== filters.department) {
          return false;
        }
        return true;
      }),
    [filters]
  );

  const monthlyMetrics = useMemo(
    () =>
      months.map((month) => {
        const rows = filteredRecords.filter((record) => record.month === month);

        return {
          month,
          sales: rows.reduce((sum, record) => sum + record.sales, 0),
          revenue: rows.reduce((sum, record) => sum + record.revenue, 0),
          users: rows.reduce((sum, record) => sum + record.users, 0),
        };
      }),
    [filteredRecords]
  );

  const totals = useMemo(
    () =>
      monthlyMetrics.reduce(
        (acc, point) => {
          acc.sales += point.sales;
          acc.revenue += point.revenue;
          acc.users += point.users;
          return acc;
        },
        { sales: 0, revenue: 0, users: 0 }
      ),
    [monthlyMetrics]
  );

  const avgSalePerUser = totals.users > 0 ? Math.round(totals.sales / totals.users) : 0;
  const projectedGrowth = totals.sales > 0 ? Math.round((totals.revenue / totals.sales - 1) * 100) : 0;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Track category performance with dynamic filtering.</p>
        </div>
        <div className="period-chip">Year {filters.year}</div>
      </header>

      <section className="card filter-card">
        <label>
          Year
          <select value={filters.year} onChange={handleFilterChange("year")}>
            {[...years].reverse().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={filters.category} onChange={handleFilterChange("category")}>
            <option value={ALL}>{ALL} Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Department
          <select value={filters.department} onChange={handleFilterChange("department")}>
            <option value={ALL}>{ALL} Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="kpi-grid">
        <article className="card kpi">
          <p>Total Sales</p>
          <h3>{currency.format(totals.sales)}</h3>
        </article>
        <article className="card kpi">
          <p>Total Revenue</p>
          <h3>{currency.format(totals.revenue)}</h3>
        </article>
        <article className="card kpi">
          <p>Total Users</p>
          <h3>{totals.users.toLocaleString("en-US")}</h3>
        </article>
        <article className="card kpi">
          <p>Avg Sale / User</p>
          <h3>{currency.format(avgSalePerUser)}</h3>
          <small>{projectedGrowth}% projected growth</small>
        </article>
      </section>

      <section className="chart-grid">
        <article className="card chart-card">
          <div className="chart-title">
            <h2>Bar Chart: Sales by Month</h2>
            <span>Category comparison view</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMetrics}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d8e1e8" />
                <XAxis dataKey="month" stroke="#48606b" />
                <YAxis stroke="#48606b" />
                <Tooltip formatter={(value) => currency.format(value)} />
                <Legend />
                <Bar dataKey="sales" fill="#145a72" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <div className="chart-title">
            <h2>Line Chart: Revenue Trend</h2>
            <span>Monthly growth tracking</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyMetrics}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d8e1e8" />
                <XAxis dataKey="month" stroke="#48606b" />
                <YAxis stroke="#48606b" />
                <Tooltip formatter={(value) => currency.format(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d4632b"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#d4632b" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </>
  );
}

export default DashboardPage;
