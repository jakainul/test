import React from 'react';

interface SavingsFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const SavingsFilter: React.FC<SavingsFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
}) => {
  const categories = [
    'All Categories',
    'ETFs',
    'Stocks',
    'Savings Account'
  ];

  const months = [
    'All Months',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = ['All Years'];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year.toString());
  }

  return (
    <div className="filter-section">
      <h4 style={{ marginBottom: '16px', color: '#374151' }}>Filter Savings</h4>
      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="filter-savings-category">Category</label>
          <select
            id="filter-savings-category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="filter-savings-month">Month</label>
          <select
            id="filter-savings-month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="filter-savings-year">Year</label>
          <select
            id="filter-savings-year"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SavingsFilter;