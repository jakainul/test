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

    // Get unique categories
    const categories = Array.from(new Set(savings.map(s => s.category)));

    // Build cumulative data for each category
    const datasets = categories.map(category => {
      let cumulativeAmount = 0;
      const data = months.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthSavings = sortedSavings.filter(s => 
          s.category === category && 
          s.year === parseInt(year) && 
          s.month === month
        );
        
        // Add this month's savings to cumulative total
        const monthTotal = monthSavings.reduce((sum, s) => sum + s.amount, 0);
        cumulativeAmount += monthTotal;
        
        return cumulativeAmount;
      });

      return {
        label: category,
        data,
        borderColor: getCategoryColor(category),
        backgroundColor: getCategoryColor(category) + '20', // Add transparency
        tension: 0.1,
        fill: false,
      };
    });

    // Format month labels for display - use month names directly
    const labels = months.map(monthKey => {
      const [year, month] = monthKey.split('-');
      return `${month.substring(0, 3)} ${year}`;
    });

    return {
      labels,
      datasets,
    };
  }, [savings]);

  const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
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

      {trendData && (
        <div className="chart-container">
          <Line data={trendData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default SavingsSummary;