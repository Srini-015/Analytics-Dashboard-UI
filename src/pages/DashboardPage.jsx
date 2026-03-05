import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { allRecords, months, years } from "../data";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const wholeNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const oneDecimal = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const rangeMonthMap = {
  full: months,
  q1: months.slice(0, 3),
  q2: months.slice(3, 6),
  q3: months.slice(6, 9),
  q4: months.slice(9, 12),
};

const rangeLabelMap = {
  full: "Full Year",
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",
};

const metricConfig = {
  sales: {
    label: "Sales",
    color: "#145a72",
    format: (value) => currency.format(Number(value) || 0),
    axisFormat: (value) => compactCurrency.format(Number(value) || 0),
  },
  revenue: {
    label: "Revenue",
    color: "#d4632b",
    format: (value) => currency.format(Number(value) || 0),
    axisFormat: (value) => compactCurrency.format(Number(value) || 0),
  },
  users: {
    label: "Users",
    color: "#2f7d99",
    format: (value) => wholeNumber.format(Number(value) || 0),
    axisFormat: (value) => compactNumber.format(Number(value) || 0),
  },
};

const reportFormatOptions = [
  { value: "txt", label: "TXT" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

const quickPresetOptions = [
  { id: "overview", label: "Overview", range: "full", primaryMetric: "sales", showMovingAverage: false, reportFormat: "txt" },
  { id: "growth", label: "Growth", range: "full", primaryMetric: "revenue", showMovingAverage: true, reportFormat: "csv" },
  { id: "efficiency", label: "Efficiency", range: "q4", primaryMetric: "users", showMovingAverage: true, reportFormat: "json" },
];

const quarterKeys = ["q1", "q2", "q3", "q4"];
const uniqueCategories = [...new Set(allRecords.map((row) => row.category))].sort();
const uniqueDepartments = [...new Set(allRecords.map((row) => row.department))].sort();

function DashboardPage() {
  const [filters, setFilters] = useState({
    year: String(years[years.length - 1]),
    category: "",
    department: "",
  });
  const [analyticsControls, setAnalyticsControls] = useState({
    range: "full",
    primaryMetric: "sales",
    showMovingAverage: true,
  });
  const [reportMeta, setReportMeta] = useState({
    clientName: "",
    reportTitle: "Client Performance Report",
  });
  const [reportFormat, setReportFormat] = useState("txt");
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [activePreset, setActivePreset] = useState("overview");
  const [quickNote, setQuickNote] = useState("Use presets for fast setup, or open advanced controls when needed.");
  const [inputRow, setInputRow] = useState({
    month: months[0],
    sales: "",
    revenue: "",
    users: "",
  });
  const [clientEntries, setClientEntries] = useState([]);
  const [formError, setFormError] = useState("");

  const handleFilterChange = (key) => (event) => {
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleAnalyticsControlChange = (key) => (event) => {
    setAnalyticsControls((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleMovingAverageToggle = (event) => {
    setAnalyticsControls((current) => ({
      ...current,
      showMovingAverage: event.target.checked,
    }));
  };

  const handleMetaChange = (key) => (event) => {
    setReportMeta((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleInputChange = (key) => (event) => {
    setInputRow((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleReportFormatChange = (event) => {
    setReportFormat(event.target.value);
  };

  const applyQuickPreset = (presetId) => {
    const preset = quickPresetOptions.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setAnalyticsControls((current) => ({
      ...current,
      range: preset.range,
      primaryMetric: preset.primaryMetric,
      showMovingAverage: preset.showMovingAverage,
    }));
    setReportFormat(preset.reportFormat);
    setActivePreset(preset.id);
    setShowAdvancedControls(false);
    setQuickNote(`${preset.label} preset applied. You can still fine-tune in Advanced Controls.`);
  };

  const handleToggleAdvancedControls = () => {
    setShowAdvancedControls((current) => !current);
  };

  const handleClientEntrySubmit = (event) => {
    event.preventDefault();

    const salesValue = Number(inputRow.sales);
    const revenueValue = Number(inputRow.revenue);
    const usersValue = Number(inputRow.users);

    if ([salesValue, revenueValue, usersValue].some((value) => !Number.isFinite(value) || value < 0)) {
      setFormError("Please enter valid numbers (0 or higher) for sales, revenue, and users.");
      return;
    }

    const nextEntry = {
      month: inputRow.month,
      sales: Math.round(salesValue),
      revenue: Math.round(revenueValue),
      users: Math.round(usersValue),
    };

    setClientEntries((current) => {
      const hasMonth = current.some((row) => row.month === nextEntry.month);
      const updated = hasMonth
        ? current.map((row) => (row.month === nextEntry.month ? nextEntry : row))
        : [...current, nextEntry];

      return [...updated].sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
    });

    setFormError("");
    setInputRow((current) => ({
      ...current,
      sales: "",
      revenue: "",
      users: "",
    }));
  };

  const handleClearClientInput = () => {
    setClientEntries([]);
    setFormError("");
  };

  const filteredRecords = useMemo(
    () =>
      allRecords.filter((row) => {
        const categoryFilter = filters.category.trim().toLowerCase();
        const departmentFilter = filters.department.trim().toLowerCase();
        const yearFilter = filters.year.trim();
        const selectedYear = Number(yearFilter);

        if (yearFilter) {
          if (!Number.isFinite(selectedYear) || row.year !== selectedYear) {
            return false;
          }
        }

        if (categoryFilter && row.category.toLowerCase() !== categoryFilter) {
          return false;
        }

        if (departmentFilter && row.department.toLowerCase() !== departmentFilter) {
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

  const clientMonthlyMetrics = useMemo(() => {
    const entryByMonth = new Map(clientEntries.map((row) => [row.month, row]));
    return months.map((month) => {
      const row = entryByMonth.get(month);
      return {
        month,
        sales: row?.sales ?? 0,
        revenue: row?.revenue ?? 0,
        users: row?.users ?? 0,
      };
    });
  }, [clientEntries]);

  const usingClientInput = clientEntries.length > 0;
  const activeMetrics = usingClientInput ? clientMonthlyMetrics : monthlyMetrics;
  const activeMonthSet = useMemo(
    () => new Set(rangeMonthMap[analyticsControls.range] || months),
    [analyticsControls.range]
  );
  const displayedMetrics = useMemo(
    () => activeMetrics.filter((row) => activeMonthSet.has(row.month)),
    [activeMetrics, activeMonthSet]
  );

  const selectedMetricKey = analyticsControls.primaryMetric in metricConfig ? analyticsControls.primaryMetric : "sales";
  const selectedMetric = metricConfig[selectedMetricKey];
  const selectedRangeLabel = rangeLabelMap[analyticsControls.range] || rangeLabelMap.full;

  const metricsWithSignals = useMemo(
    () =>
      displayedMetrics.map((row, index, dataset) => {
        const primaryValue = row[selectedMetricKey];
        const previousValue = index > 0 ? dataset[index - 1][selectedMetricKey] : 0;
        const growthPercent = previousValue > 0 ? ((primaryValue - previousValue) / previousValue) * 100 : 0;
        const movingStart = Math.max(0, index - 2);
        const movingSlice = dataset.slice(movingStart, index + 1);
        const movingAverage = Math.round(
          movingSlice.reduce((sum, point) => sum + point[selectedMetricKey], 0) / movingSlice.length
        );

        return {
          ...row,
          primaryValue,
          growthPercent,
          movingAverage,
        };
      }),
    [displayedMetrics, selectedMetricKey]
  );

  const totals = useMemo(
    () =>
      metricsWithSignals.reduce(
        (acc, point) => {
          acc.sales += point.sales;
          acc.revenue += point.revenue;
          acc.users += point.users;
          return acc;
        },
        { sales: 0, revenue: 0, users: 0 }
      ),
    [metricsWithSignals]
  );
  const yearTotals = useMemo(
    () =>
      activeMetrics.reduce(
        (acc, point) => {
          acc.sales += point.sales;
          acc.revenue += point.revenue;
          acc.users += point.users;
          return acc;
        },
        { sales: 0, revenue: 0, users: 0 }
      ),
    [activeMetrics]
  );
  const yearAveragePrimary = yearTotals[selectedMetricKey] / months.length;
  const yearComparisonRows = useMemo(
    () =>
      activeMetrics.map((row) => {
        const primaryValue = row[selectedMetricKey];
        const shareOfYearPercent = yearTotals[selectedMetricKey] > 0 ? (primaryValue / yearTotals[selectedMetricKey]) * 100 : 0;
        const versusYearMonthlyAveragePercent =
          yearAveragePrimary > 0 ? ((primaryValue - yearAveragePrimary) / yearAveragePrimary) * 100 : 0;

        return {
          ...row,
          primaryValue,
          shareOfYearPercent,
          versusYearMonthlyAveragePercent,
          inSelectedRange: activeMonthSet.has(row.month),
        };
      }),
    [activeMetrics, activeMonthSet, selectedMetricKey, yearAveragePrimary, yearTotals]
  );
  const yearAverageRevenue = Math.round(yearTotals.revenue / months.length);
  const selectedRangeRevenueShareOfYear = yearTotals.revenue > 0 ? (totals.revenue / yearTotals.revenue) * 100 : 0;

  const avgSalePerUser = totals.users > 0 ? Math.round(totals.sales / totals.users) : 0;
  const projectedGrowth = totals.sales > 0 ? Math.round((totals.revenue / totals.sales - 1) * 100) : 0;

  const primaryInsights = useMemo(() => {
    if (!metricsWithSignals.length) {
      return {
        bestMonth: "N/A",
        bestValue: 0,
        weakestMonth: "N/A",
        weakestValue: 0,
        averageValue: 0,
        trendPercent: 0,
      };
    }

    const bestPoint = metricsWithSignals.reduce((best, point) =>
      point.primaryValue > best.primaryValue ? point : best
    );
    const weakestPoint = metricsWithSignals.reduce((weakest, point) =>
      point.primaryValue < weakest.primaryValue ? point : weakest
    );
    const averageValue = Math.round(
      metricsWithSignals.reduce((sum, point) => sum + point.primaryValue, 0) / metricsWithSignals.length
    );
    const firstValue = metricsWithSignals[0].primaryValue;
    const lastValue = metricsWithSignals[metricsWithSignals.length - 1].primaryValue;
    const trendPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
      bestMonth: bestPoint.month,
      bestValue: bestPoint.primaryValue,
      weakestMonth: weakestPoint.month,
      weakestValue: weakestPoint.primaryValue,
      averageValue,
      trendPercent,
    };
  }, [metricsWithSignals]);

  const hasVisibleData = metricsWithSignals.some((point) => point.sales || point.revenue || point.users);
  const clientCoveragePercent = Math.round((clientEntries.length / months.length) * 100);
  const dataSourceLabel = usingClientInput ? "Client Input" : "Filtered Internal Data";
  const dashboardHealth = useMemo(() => {
    if (!hasVisibleData) {
      return {
        level: "No Data",
        recommendation: "Add records or relax filters to start analytics.",
      };
    }

    const negativeMonths = metricsWithSignals.filter((point) => point.growthPercent < 0).length;
    if (projectedGrowth >= 25 && primaryInsights.trendPercent >= 8) {
      return {
        level: "Strong",
        recommendation: "Stable growth detected. Use CSV export for presentation and planning.",
      };
    }
    if (negativeMonths >= Math.ceil(metricsWithSignals.length / 2)) {
      return {
        level: "Watch",
        recommendation: "Frequent declines found. Enable moving average and review weakest months.",
      };
    }

    return {
      level: "Balanced",
      recommendation: "Performance is mixed. Compare Growth and Efficiency presets for decisions.",
    };
  }, [hasVisibleData, metricsWithSignals, primaryInsights.trendPercent, projectedGrowth]);

  const handleCompleteYearInput = () => {
    const existingRowsByMonth = new Map(clientEntries.map((row) => [row.month, row]));
    const baseRowsByMonth = new Map(monthlyMetrics.map((row) => [row.month, row]));

    const completedRows = months.map((month, index) => {
      const existing = existingRowsByMonth.get(month);
      if (existing) {
        return existing;
      }

      const base = baseRowsByMonth.get(month);
      if (base && (base.sales > 0 || base.revenue > 0 || base.users > 0)) {
        return {
          month,
          sales: base.sales,
          revenue: base.revenue,
          users: base.users,
        };
      }

      const sales = Math.round(10500 + index * 620);
      const revenue = Math.round(sales * (1.38 + (index % 4) * 0.05));
      const users = Math.round(280 + index * 12);

      return {
        month,
        sales,
        revenue,
        users,
      };
    });

    setClientEntries(completedRows);
    setFormError("");
    setQuickNote("12-month input completed. You can edit any month and compare with yearly totals.");
  };

  const handleAutoFillClientData = () => {
    const hasInternalBase = monthlyMetrics.some((row) => row.sales > 0 || row.revenue > 0 || row.users > 0);

    const generatedRows = hasInternalBase
      ? monthlyMetrics.map((row, index) => ({
          month: row.month,
          sales: Math.round(row.sales * (1.04 + (index % 3) * 0.015)),
          revenue: Math.round(row.revenue * (1.05 + (index % 4) * 0.01)),
          users: Math.round(row.users * (1.03 + (index % 5) * 0.01)),
        }))
      : months.map((month, index) => {
          const sales = Math.round(10500 + index * 620);
          const revenue = Math.round(sales * (1.38 + (index % 4) * 0.05));
          const users = Math.round(280 + index * 12);
          return {
            month,
            sales,
            revenue,
            users,
          };
        });

    setClientEntries(generatedRows);
    setFormError("");
    setQuickNote("Demo client data loaded for all months.");
  };

  const handleSmartSetup = () => {
    if (!activeMetrics.length) {
      setQuickNote("No active data found. Add data first, then use Smart Setup.");
      return;
    }

    const metricKeys = ["sales", "revenue", "users"];
    const metricScores = metricKeys.map((metricKey) => {
      const values = activeMetrics.map((row) => row[metricKey]);
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      if (!mean) {
        return { metricKey, score: 0 };
      }
      const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
      const volatility = Math.sqrt(variance) / mean;
      return { metricKey, score: volatility };
    });

    const recommendedMetric = metricScores.reduce((best, candidate) =>
      candidate.score > best.score ? candidate : best
    ).metricKey;

    const bestQuarter = quarterKeys
      .map((range) => {
        const monthSet = new Set(rangeMonthMap[range]);
        const score = activeMetrics
          .filter((row) => monthSet.has(row.month))
          .reduce((sum, row) => sum + row[recommendedMetric], 0);
        return { range, score };
      })
      .reduce((best, current) => (current.score > best.score ? current : best), { range: "full", score: -1 });

    setAnalyticsControls((current) => ({
      ...current,
      range: bestQuarter.score > 0 ? bestQuarter.range : "full",
      primaryMetric: recommendedMetric,
      showMovingAverage: true,
    }));
    setReportFormat("csv");
    setShowAdvancedControls(true);
    setActivePreset("smart");
    setQuickNote(
      `Smart Setup applied: ${metricConfig[recommendedMetric].label} in ${
        bestQuarter.score > 0 ? rangeLabelMap[bestQuarter.range] : "Full Year"
      }.`
    );
  };

  const handleFastReportWorkflow = () => {
    setReportFormat("csv");
    setAnalyticsControls((current) => ({
      ...current,
      range: "full",
      primaryMetric: "revenue",
      showMovingAverage: true,
    }));
    setActivePreset("fast-report");

    if (!usingClientInput) {
      handleAutoFillClientData();
      setQuickNote("Fast workflow ready. Demo client data added. Click Download Report.");
      return;
    }

    setQuickNote("Fast workflow ready. Click Download Report.");
  };

  const handleResetDashboard = () => {
    setFilters({
      year: String(years[years.length - 1]),
      category: "",
      department: "",
    });
    setAnalyticsControls({
      range: "full",
      primaryMetric: "sales",
      showMovingAverage: true,
    });
    setReportFormat("txt");
    setShowAdvancedControls(false);
    setActivePreset("overview");
    setQuickNote("Dashboard reset to default easy mode.");
  };

  const handleDownloadReport = () => {
    const generatedAt = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
    const clientName = reportMeta.clientName.trim() || "N/A";
    const reportTitle = reportMeta.reportTitle.trim() || "Client Performance Report";
    const reportYear = filters.year.trim() || "All";
    const rangeRows = metricsWithSignals.map((row) => ({
      month: row.month,
      sales: row.sales,
      revenue: row.revenue,
      users: row.users,
      primaryMetricValue: row.primaryValue,
      growthPercent: Number(row.growthPercent.toFixed(2)),
      movingAverage: row.movingAverage,
    }));
    const fullYearRows = yearComparisonRows.map((row) => ({
      month: row.month,
      sales: row.sales,
      revenue: row.revenue,
      users: row.users,
      primaryMetricValue: row.primaryValue,
      shareOfYearPercent: Number(row.shareOfYearPercent.toFixed(2)),
      versusYearMonthlyAveragePercent: Number(row.versusYearMonthlyAveragePercent.toFixed(2)),
      inSelectedRange: row.inSelectedRange,
    }));

    const metaPayload = {
      title: reportTitle,
      client: clientName,
      year: reportYear,
      range: selectedRangeLabel,
      primaryMetric: selectedMetric.label,
      dataSource: dataSourceLabel,
      generatedAt,
    };

    const summaryPayload = {
      totalSales: totals.sales,
      totalRevenue: totals.revenue,
      totalUsers: totals.users,
      fullYearSales: yearTotals.sales,
      fullYearRevenue: yearTotals.revenue,
      fullYearUsers: yearTotals.users,
      avgSalePerUser,
      projectedGrowthPercent: projectedGrowth,
      bestMonth: primaryInsights.bestMonth,
      bestValue: primaryInsights.bestValue,
      weakestMonth: primaryInsights.weakestMonth,
      weakestValue: primaryInsights.weakestValue,
      trendPercent: Number(primaryInsights.trendPercent.toFixed(2)),
    };

    const jsonPayload = {
      meta: metaPayload,
      summary: summaryPayload,
      selectedRangeMetrics: rangeRows,
      fullYearComparison: fullYearRows,
    };

    let content = "";
    let mimeType = "text/plain;charset=utf-8";
    let extension = "txt";

    if (reportFormat === "csv") {
      extension = "csv";
      mimeType = "text/csv;charset=utf-8";
      const csvLines = [
        "Month,Sales,Revenue,Users,PrimaryMetric,% of Year,Vs Year Monthly Avg %,In Selected Range",
        ...fullYearRows.map(
          (row) =>
            `${row.month},${row.sales},${row.revenue},${row.users},${row.primaryMetricValue},${row.shareOfYearPercent},${row.versusYearMonthlyAveragePercent},${row.inSelectedRange ? "Yes" : "No"}`
        ),
      ];
      content = csvLines.join("\n");
    } else if (reportFormat === "json") {
      extension = "json";
      mimeType = "application/json;charset=utf-8";
      content = JSON.stringify(jsonPayload, null, 2);
    } else {
      const lines = [
        reportTitle,
        `Client: ${clientName}`,
        `Year: ${reportYear}`,
        `Range: ${selectedRangeLabel}`,
        `Primary Metric: ${selectedMetric.label}`,
        `Data Source: ${dataSourceLabel}`,
        `Generated At: ${generatedAt}`,
        "",
        "Summary",
        `Total Sales: ${currency.format(totals.sales)}`,
        `Total Revenue: ${currency.format(totals.revenue)}`,
        `Total Users: ${wholeNumber.format(totals.users)}`,
        "",
        "Year Totals (12 Months)",
        `Year Sales: ${currency.format(yearTotals.sales)}`,
        `Year Revenue: ${currency.format(yearTotals.revenue)}`,
        `Year Users: ${wholeNumber.format(yearTotals.users)}`,
        `Avg Sale / User: ${currency.format(avgSalePerUser)}`,
        `Projected Growth: ${projectedGrowth}%`,
        "",
        "Insights",
        `Best Month (${selectedMetric.label}): ${primaryInsights.bestMonth} (${selectedMetric.format(primaryInsights.bestValue)})`,
        `Weakest Month (${selectedMetric.label}): ${primaryInsights.weakestMonth} (${selectedMetric.format(primaryInsights.weakestValue)})`,
        `Net Trend: ${primaryInsights.trendPercent >= 0 ? "+" : ""}${oneDecimal.format(primaryInsights.trendPercent)}%`,
        "",
        "Month vs Year Comparison",
        "Month,Sales,Revenue,Users,PrimaryMetric,% of Year,Vs Year Monthly Avg %,In Selected Range",
        ...fullYearRows.map(
          (row) =>
            `${row.month},${row.sales},${row.revenue},${row.users},${row.primaryMetricValue},${row.shareOfYearPercent},${row.versusYearMonthlyAveragePercent},${row.inSelectedRange ? "Yes" : "No"}`
        ),
      ];
      content = lines.join("\n");
    }

    const safeClient = clientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/(^-|-$)/g, "");
    const safeTitle = reportTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/(^-|-$)/g, "");
    const safeRange = (analyticsControls.range || "full").toLowerCase();
    const fileName = `${safeClient || "client"}-${safeTitle || "report"}-${safeRange}-${reportYear}.${extension}`;
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Track category performance with dynamic filtering.</p>
        </div>
        <div className="period-chip">
          {selectedRangeLabel} {filters.year.trim() || "All Years"} - {dataSourceLabel}
        </div>
      </header>

      <section className="card quick-tools-card">
        <div className="chart-title">
          <h2>Easy Mode + Smart Actions</h2>
          <span>One-click setup for fast analysis and reporting</span>
        </div>

        <div className="quick-tools-row">
          {quickPresetOptions.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${activePreset === preset.id ? "is-active" : ""}`}
              onClick={() => applyQuickPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
          <button type="button" className="preset-btn" onClick={handleSmartSetup}>
            Smart Setup
          </button>
          <button type="button" className="preset-btn" onClick={handleFastReportWorkflow}>
            Fast Report
          </button>
          <button type="button" className="preset-btn" onClick={handleToggleAdvancedControls}>
            {showAdvancedControls ? "Hide Advanced" : "Show Advanced"}
          </button>
          <button type="button" className="preset-btn" onClick={handleResetDashboard}>
            Reset
          </button>
        </div>

        <p className="quick-tools-note">{quickNote}</p>
        <p className="quick-tools-note">
          Health: <strong>{dashboardHealth.level}</strong> - {dashboardHealth.recommendation}
        </p>
      </section>

      <section className="card filter-card">
        <label>
          Year
          <input
            type="text"
            inputMode="numeric"
            list="year-options"
            value={filters.year}
            onChange={handleFilterChange("year")}
            placeholder="e.g. 2026"
          />
        </label>

        <label>
          Category
          <input
            type="text"
            list="category-options"
            value={filters.category}
            onChange={handleFilterChange("category")}
            placeholder="e.g. Sales"
          />
        </label>

        <label>
          Department
          <input
            type="text"
            list="department-options"
            value={filters.department}
            onChange={handleFilterChange("department")}
            placeholder="e.g. North"
          />
        </label>

        <datalist id="year-options">
          {years.map((year) => (
            <option key={year} value={year} />
          ))}
        </datalist>
        <datalist id="category-options">
          {uniqueCategories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <datalist id="department-options">
          {uniqueDepartments.map((department) => (
            <option key={department} value={department} />
          ))}
        </datalist>
      </section>

      {showAdvancedControls && (
        <section className="card advanced-controls-card">
          <div className="chart-title">
            <h2>Advanced Analytics Controls</h2>
            <span>Choose time range and metric behavior</span>
          </div>

          <div className="advanced-controls-grid">
            <label>
              Time Range
              <select value={analyticsControls.range} onChange={handleAnalyticsControlChange("range")}>
                <option value="full">Full Year</option>
                <option value="q1">Q1</option>
                <option value="q2">Q2</option>
                <option value="q3">Q3</option>
                <option value="q4">Q4</option>
              </select>
            </label>

            <label>
              Primary Metric
              <select value={analyticsControls.primaryMetric} onChange={handleAnalyticsControlChange("primaryMetric")}>
                <option value="sales">Sales</option>
                <option value="revenue">Revenue</option>
                <option value="users">Users</option>
              </select>
            </label>

            <label className="checkbox-field">
              Trend Smoothing
              <span className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={analyticsControls.showMovingAverage}
                  onChange={handleMovingAverageToggle}
                />
                Enable 3-month moving average
              </span>
            </label>

            <article className="advanced-context">
              <p>Data Health</p>
              <h3>{usingClientInput ? `${clientCoveragePercent}% coverage` : "Internal baseline"}</h3>
              <small>
                {usingClientInput
                  ? `${clientEntries.length} of ${months.length} months entered`
                  : "Add client rows to override filtered internal records"}
              </small>
            </article>
          </div>
        </section>
      )}

      <section className="card client-input-card">
        <div className="chart-title">
          <h2>Client Input and Report Builder</h2>
          <span>Add month-wise data to generate client charts and report</span>
        </div>

        <form className="client-input-form" onSubmit={handleClientEntrySubmit}>
          <label>
            Client Name
            <input
              type="text"
              value={reportMeta.clientName}
              onChange={handleMetaChange("clientName")}
              placeholder="Acme Corporation"
            />
          </label>

          <label>
            Report Title
            <input
              type="text"
              value={reportMeta.reportTitle}
              onChange={handleMetaChange("reportTitle")}
              placeholder="Client Performance Report"
            />
          </label>

          <label>
            Report Format
            <select value={reportFormat} onChange={handleReportFormatChange}>
              {reportFormatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Month
            <select value={inputRow.month} onChange={handleInputChange("month")}>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sales
            <input type="number" min="0" value={inputRow.sales} onChange={handleInputChange("sales")} placeholder="12000" />
          </label>

          <label>
            Revenue
            <input
              type="number"
              min="0"
              value={inputRow.revenue}
              onChange={handleInputChange("revenue")}
              placeholder="18500"
            />
          </label>

          <label>
            Users
            <input type="number" min="0" value={inputRow.users} onChange={handleInputChange("users")} placeholder="320" />
          </label>

          {formError && (
            <p role="alert" className="auth-error client-input-error">
              {formError}
            </p>
          )}

          <div className="client-input-actions">
            <button type="submit" className="landing-btn">
              Add or Update Month
            </button>
            <button type="button" className="landing-btn secondary-btn" onClick={handleCompleteYearInput}>
              Complete 12 Months
            </button>
            <button type="button" className="landing-btn secondary-btn" onClick={handleAutoFillClientData}>
              Auto Fill Demo Data
            </button>
            <button
              type="button"
              className="landing-btn secondary-btn"
              onClick={handleClearClientInput}
              disabled={!usingClientInput}
            >
              Clear Client Data
            </button>
            <button type="button" className="landing-btn secondary-btn" onClick={handleDownloadReport}>
              Download Report
            </button>
          </div>
        </form>

        <p className="client-input-status">
          {usingClientInput
            ? `Client input is active (${clientEntries.length}/12 months entered). Year revenue: ${currency.format(
                yearTotals.revenue
              )}`
            : "No client input added yet. Charts currently show internal filtered data."}
        </p>
      </section>

      <section className="kpi-grid">
        <article className="card kpi">
          <p>Total Sales ({selectedRangeLabel})</p>
          <h3>{currency.format(totals.sales)}</h3>
        </article>
        <article className="card kpi">
          <p>Total Revenue ({selectedRangeLabel})</p>
          <h3>{currency.format(totals.revenue)}</h3>
        </article>
        <article className="card kpi">
          <p>Total Users ({selectedRangeLabel})</p>
          <h3>{wholeNumber.format(totals.users)}</h3>
        </article>
        <article className="card kpi">
          <p>Avg Sale / User</p>
          <h3>{currency.format(avgSalePerUser)}</h3>
          <small>{projectedGrowth}% projected growth</small>
        </article>
      </section>

      <section className="year-summary-grid">
        <article className="card mini-card year-summary-card">
          <p>Year Sales (12 Months)</p>
          <h3>{currency.format(yearTotals.sales)}</h3>
        </article>
        <article className="card mini-card year-summary-card">
          <p>Year Revenue (12 Months)</p>
          <h3>{currency.format(yearTotals.revenue)}</h3>
        </article>
        <article className="card mini-card year-summary-card">
          <p>Average Monthly Revenue</p>
          <h3>{currency.format(yearAverageRevenue)}</h3>
        </article>
        <article className="card mini-card year-summary-card">
          <p>{selectedRangeLabel} Revenue vs Year</p>
          <h3>{oneDecimal.format(selectedRangeRevenueShareOfYear)}%</h3>
          <small>Selected range share of year revenue</small>
        </article>
      </section>

      <section className="insight-grid">
        <article className="card mini-card insight-card">
          <p>Best Month ({selectedMetric.label})</p>
          <h3>{primaryInsights.bestMonth}</h3>
          <small>{selectedMetric.format(primaryInsights.bestValue)}</small>
        </article>
        <article className="card mini-card insight-card">
          <p>Weakest Month ({selectedMetric.label})</p>
          <h3>{primaryInsights.weakestMonth}</h3>
          <small>{selectedMetric.format(primaryInsights.weakestValue)}</small>
        </article>
        <article className="card mini-card insight-card">
          <p>Average {selectedMetric.label}</p>
          <h3>{selectedMetric.format(primaryInsights.averageValue)}</h3>
          <small>{selectedRangeLabel} average</small>
        </article>
        <article className="card mini-card insight-card">
          <p>Net Trend</p>
          <h3>{primaryInsights.trendPercent >= 0 ? "+" : ""}{oneDecimal.format(primaryInsights.trendPercent)}%</h3>
          <small>First vs last month in view</small>
        </article>
      </section>

      <section className="card table-card month-year-compare-card">
        <div className="chart-title table-title">
          <h2>Month vs Year Comparison ({selectedMetric.label})</h2>
          <span>Compare each month with full-year totals</span>
        </div>
        <div className="table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>{selectedMetric.label}</th>
                <th>% of Year</th>
                <th>Vs Year Avg</th>
                <th>Range Match</th>
              </tr>
            </thead>
            <tbody>
              {yearComparisonRows.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{selectedMetric.format(row.primaryValue)}</td>
                  <td>{oneDecimal.format(row.shareOfYearPercent)}%</td>
                  <td>{row.versusYearMonthlyAveragePercent >= 0 ? "+" : ""}{oneDecimal.format(row.versusYearMonthlyAveragePercent)}%</td>
                  <td>
                    <span className={`tag ${row.inSelectedRange ? "" : "warning"}`}>
                      {row.inSelectedRange ? "In Range" : "Out of Range"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="chart-grid">
        <article className="card chart-card">
          <div className="chart-title">
            <h2>Primary Metric by Month</h2>
            <span>{selectedMetric.label} focus ({selectedRangeLabel})</span>
          </div>
          <div className="chart-wrap">
            {hasVisibleData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsWithSignals}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#d8e1e8" />
                  <XAxis dataKey="month" stroke="#48606b" />
                  <YAxis stroke="#48606b" tickFormatter={selectedMetric.axisFormat} />
                  <Tooltip formatter={(value) => selectedMetric.format(value)} />
                  <Legend />
                  <Bar
                    dataKey={selectedMetricKey}
                    name={selectedMetric.label}
                    fill={selectedMetric.color}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <p>No data available for current filters. Adjust inputs or add client records.</p>
              </div>
            )}
          </div>
        </article>

        <article className="card chart-card">
          <div className="chart-title">
            <h2>Momentum and Growth</h2>
            <span>Primary metric, moving average, and month-over-month growth</span>
          </div>
          <div className="chart-wrap">
            {hasVisibleData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metricsWithSignals}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#d8e1e8" />
                  <XAxis dataKey="month" stroke="#48606b" />
                  <YAxis yAxisId="left" stroke="#48606b" tickFormatter={selectedMetric.axisFormat} />
                  <YAxis yAxisId="right" orientation="right" stroke="#7d4f9d" tickFormatter={(value) => `${Math.round(value)}%`} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "MoM Growth %") {
                        return `${oneDecimal.format(Number(value) || 0)}%`;
                      }
                      return selectedMetric.format(value);
                    }}
                  />
                  <Legend />
                  <ReferenceLine
                    yAxisId="left"
                    y={primaryInsights.averageValue}
                    stroke="#6f8a95"
                    strokeDasharray="4 4"
                    ifOverflow="extendDomain"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey={selectedMetricKey}
                    name={selectedMetric.label}
                    fill={selectedMetric.color}
                    barSize={26}
                    radius={[8, 8, 0, 0]}
                  />
                  {analyticsControls.showMovingAverage && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="movingAverage"
                      name="3-Month Moving Avg"
                      stroke="#0f3f50"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthPercent"
                    name="MoM Growth %"
                    stroke="#7d4f9d"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <p>No trend data to display. Add matching records for this range.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}

export default DashboardPage;
