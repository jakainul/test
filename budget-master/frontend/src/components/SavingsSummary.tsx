import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Savings } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SavingsSummaryProps {
  savings: Savings[];
}

interface HistoricalDataset {
  label: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
  borderWidth: number;
  pointRadius: number;
  category: string;
  finalValue: number;
}

const SavingsSummary: React.FC<SavingsSummaryProps> = ({ savings }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ETFs':
        return 'rgb(59, 130, 246)'; // Blue
      case 'Stocks':
        return 'rgb(239, 68, 68)'; // Red
      case 'Savings Account':
        return 'rgb(5, 150, 105)'; // Green
      default:
        return 'rgb(107, 114, 128)'; // Gray
    }
  };

  const getProjectionColor = (category: string, rate: number): string => {
    const baseColors = {
      'ETFs': {
        0.05: 'rgb(30, 64, 175)',    // Dark blue
        0.07: 'rgb(59, 130, 246)',   // Medium blue  
        0.10: 'rgb(147, 197, 253)',  // Light blue
      },
      'Stocks': {
        0.05: 'rgb(153, 27, 27)',    // Dark red
        0.07: 'rgb(239, 68, 68)',    // Medium red
        0.10: 'rgb(252, 165, 165)',  // Light red
      }
    };
    
    return (baseColors as any)[category]?.[rate] || 'rgb(107, 114, 128)';
  };

  const calculateProjections = (
    startValue: number, 
    annualRate: number, 
    months: number
  ): number[] => {
    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
    const projection = [];
    let value = startValue;
    
    for (let i = 0; i < months; i++) {
      value *= (1 + monthlyRate);
      projection.push(Math.round(value));
    }
    return projection;
  };

  const generateFutureMonths = (startDate: Date, monthCount: number): string[] => {
    const months = [];
    for (let i = 0; i < monthCount; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i + 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();
      months.push(`${year}-${monthName}`);
    }
    return months;
  };

  const trendData = useMemo(() => {
    if (savings.length === 0) return null;

    // Helper function to convert month name to number
    const getMonthNumber = (monthName: string): number => {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months.indexOf(monthName) + 1;
    };

    // Sort savings by date
    const sortedSavings = [...savings].sort((a, b) => {
      const dateA = new Date(a.year, getMonthNumber(a.month) - 1);
      const dateB = new Date(b.year, getMonthNumber(b.month) - 1);
      return dateA.getTime() - dateB.getTime();
    });

    // Get unique months in chronological order
    const monthsSet = new Set<string>();
    sortedSavings.forEach(saving => {
      const monthKey = `${saving.year}-${saving.month}`;
      monthsSet.add(monthKey);
    });
    const months = Array.from(monthsSet).sort((a, b) => {
      const [yearA, monthA] = a.split('-');
      const [yearB, monthB] = b.split('-');
      const dateA = new Date(parseInt(yearA), getMonthNumber(monthA) - 1);
      const dateB = new Date(parseInt(yearB), getMonthNumber(monthB) - 1);
      return dateA.getTime() - dateB.getTime();
    });

    // Generate 20 years of future months (240 months)
    const currentDate = new Date();
    const futureMonths = generateFutureMonths(currentDate, 240);
    const allMonths = [...months, ...futureMonths];

    // Get unique categories
    const categories = Array.from(new Set(savings.map(s => s.category)));

    // Build historical datasets
    const historicalDatasets: HistoricalDataset[] = categories.map(category => {
      let cumulativeAmount = 0;
      const data = months.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthSavings = sortedSavings.filter((s: Savings) => 
          s.category === category && 
          s.year === parseInt(year) && 
          s.month === month
        );
        
        // Add this month's savings to cumulative total
        const monthTotal = monthSavings.reduce((sum: number, s: Savings) => sum + s.amount, 0);
        cumulativeAmount += monthTotal;
        
        return cumulativeAmount;
      });

      // Extend data array with nulls for future months (projections will fill these)
      const extendedData = [...data, ...new Array(240).fill(null)];

      return {
        label: `${category} (Historical)`,
        data: extendedData,
        borderColor: getCategoryColor(category),
        backgroundColor: getCategoryColor(category) + '20',
        tension: 0.1,
        fill: false,
        borderWidth: 3,
        pointRadius: 2,
        category: category,
        finalValue: data[data.length - 1] || 0
      };
    });

    // Build projection datasets for Stocks and ETFs only
    const projectionDatasets: any[] = [];
    const investmentCategories = ['Stocks', 'ETFs'];
    const growthRates = [0.05, 0.07, 0.10];
    
    investmentCategories.forEach(category => {
      const historicalData = historicalDatasets.find(ds => ds.category === category);
      if (!historicalData || historicalData.finalValue === 0) return;
      
      growthRates.forEach(rate => {
        const projections = calculateProjections(historicalData.finalValue, rate, 240);
        const projectionData = [...new Array(months.length).fill(null), ...projections];
        
        projectionDatasets.push({
          label: `${category} ${(rate * 100)}% Growth`,
          data: projectionData,
          borderColor: getProjectionColor(category, rate),
          backgroundColor: getProjectionColor(category, rate) + '10',
          borderDash: [8, 4],
          tension: 0.1,
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
        });
      });
    });

    // Extend Savings Account with minimal growth (1%)
    const savingsDataset = historicalDatasets.find(ds => ds.category === 'Savings Account');
    if (savingsDataset && savingsDataset.finalValue > 0) {
      const savingsProjections = calculateProjections(savingsDataset.finalValue, 0.01, 240);
      savingsDataset.data = [...savingsDataset.data.filter(val => val !== null), ...savingsProjections];
      savingsDataset.label = 'Savings Account';
    }

    // Format month labels for display
    const labels = allMonths.map(monthKey => {
      if (monthKey.includes('-')) {
        const [year, month] = monthKey.split('-');
        return `${month.substring(0, 3)} ${year}`;
      }
      return monthKey;
    });

    return {
      labels,
      datasets: [...historicalDatasets.filter(ds => ds.category !== 'Savings Account'), savingsDataset, ...projectionDatasets].filter(Boolean),
    };
  }, [savings]);

  const totalSavings = savings.reduce((sum: number, saving: Savings) => sum + saving.amount, 0);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, i: number) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              lineDash: dataset.borderDash || [],
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i
            }));
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (value === null) return '';
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          },
          beforeBody: function(tooltipItems: any[]) {
            const monthIndex = tooltipItems[0].dataIndex;
            const totalMonths = tooltipItems[0].chart.data.labels.length;
            const historicalMonths = totalMonths - 240; // 240 future months
            
            if (monthIndex >= historicalMonths) {
              return ['📊 Future Projection'];
            }
            return ['📈 Historical Data'];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Timeline (20-Year Projection)',
          font: { size: 14, weight: 'bold' as const }
        },
        ticks: {
          maxTicksLimit: 15,
          callback: function(value: any, index: number, ticks: any[]) {
            // Show every 2 years
            if (index % 24 === 0) {
              return ticks[index] ? ticks[index].label : '';
            }
            return '';
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cumulative Value (€)',
          font: { size: 14, weight: 'bold' as const }
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 6,
      }
    }
  };

  if (savings.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 style={{ color: '#059669', marginBottom: '16px' }}>💎 Savings Growth Trends by Category</h3>
      
      <div className="summary-total" style={{ 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#059669', marginBottom: '4px' }}>
          Total Savings
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065f46' }}>
          {formatCurrency(totalSavings)}
        </div>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '16px' }}>
          📊 Future Projections (20 Years)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ fontSize: '14px', color: '#78350f' }}>
            <strong>Conservative (5%):</strong> Stable long-term growth
          </div>
          <div style={{ fontSize: '14px', color: '#78350f' }}>
            <strong>Moderate (7%):</strong> Historical market average
          </div>
          <div style={{ fontSize: '14px', color: '#78350f' }}>
            <strong>Aggressive (10%):</strong> High-growth potential
          </div>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#78350f', fontStyle: 'italic' }}>
          Note: Projections are estimates based on compound annual growth. Actual results may vary.
        </p>
      </div>

      {trendData && (
        <div className="chart-container">
          <Line data={trendData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default SavingsSummary;