export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const years = [2024, 2025, 2026];
export const categories = ["Sales", "Marketing", "Support"];
export const departments = ["North", "Central", "South"];

const seasonality = [0.9, 0.95, 1.02, 1.05, 1.08, 1.12, 1.15, 1.1, 1.04, 1.0, 0.97, 1.2];
const categoryMultiplier = {
  Sales: 1.3,
  Marketing: 1,
  Support: 0.8,
};
const departmentMultiplier = {
  North: 1.05,
  Central: 1,
  South: 0.96,
};
const yearMultiplier = {
  2024: 0.92,
  2025: 1,
  2026: 1.08,
};

export const allRecords = years.flatMap((year) =>
  months.flatMap((month, monthIndex) =>
    categories.flatMap((category) =>
      departments.map((department) => {
        const baseline = 2200 + monthIndex * 105;
        const sales = Math.round(
          baseline *
            seasonality[monthIndex] *
            categoryMultiplier[category] *
            departmentMultiplier[department] *
            yearMultiplier[year]
        );
        const revenue = Math.round(sales * (1.4 + (monthIndex % 3) * 0.07));
        const users = Math.round((sales / 24) * (0.85 + monthIndex * 0.015));

        return {
          year,
          month,
          monthIndex,
          category,
          department,
          sales,
          revenue,
          users,
        };
      })
    )
  )
);
