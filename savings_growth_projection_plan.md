# Savings Growth Trends Enhancement Plan

## Current Implementation Analysis

The current `SavingsSummary.tsx` component shows:
- Historical cumulative savings data by category (ETFs, Stocks, Savings Account)
- Line chart using Chart.js and react-chartjs-2
- Monthly data points with cumulative growth
- Color-coded categories: ETFs (blue), Stocks (red), Savings Account (green)

## Planned Enhancement: Future Growth Projections

### Overview
Add dashed trend lines showing projected growth over 20 years for Stocks and ETFs at 5%, 7%, and 10% annual growth rates.

### Technical Implementation Plan

#### 1. Data Structure Changes
- Extend the chart to show 20 years from current date
- Calculate future projections based on current portfolio values
- Create separate datasets for historical vs projected data

#### 2. Projection Algorithm
```typescript
// For each investment category (Stocks, ETFs):
// 1. Get the latest cumulative value
// 2. Calculate monthly growth: (1 + annualRate)^(1/12) - 1
// 3. Project forward 20 years (240 months)
// 4. Create three projection lines: 5%, 7%, 10%
```

#### 3. Visual Enhancements
- **Historical data**: Solid lines (current implementation)
- **Projection data**: Dashed lines with distinct styling
- **Growth rate indicators**: Legend showing 5%, 7%, 10% rates
- **Color scheme**: 
  - Stocks projections: Red variants (lighter/darker shades)
  - ETFs projections: Blue variants (lighter/darker shades)
- **Timeline**: X-axis spanning 20 years from current date

#### 4. Chart Configuration Updates
- Add line dash patterns for projections
- Update legend to include growth rates
- Extend x-axis to 20-year timeframe
- Add visual separator between historical and projected data
- Enhanced tooltips showing growth rates

#### 5. Component Structure Changes
- New utility functions for projection calculations
- Enhanced dataset generation logic
- Updated chart options for dashed lines
- Responsive design for longer timeline

### Expected User Experience
1. **Historical View**: Current savings growth clearly visible
2. **Future Insights**: Three growth scenarios for informed decision-making
3. **Investment Comparison**: Visual comparison between Stocks vs ETFs growth potential
4. **Long-term Planning**: 20-year outlook for retirement/financial planning

### Implementation Priority
1. Core projection calculation logic
2. Chart dataset generation for projections
3. Visual styling (dashed lines, colors)
4. Legend and tooltip enhancements
5. Responsive design adjustments