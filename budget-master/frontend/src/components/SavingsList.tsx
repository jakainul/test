import React, { useState, useMemo } from 'react';
import { Savings } from '../types';
import { deleteSavings } from '../api';
import SavingsFilter from './SavingsFilter';
import DataTable, { Column } from './DataTable';

interface SavingsListProps {
  savings: Savings[];
  onSavingsDeleted: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SavingsList: React.FC<SavingsListProps> = ({ savings, onSavingsDeleted, showToast }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ETFs':
        return '📊';
      case 'Stocks':
        return '📈';
      case 'Savings Account':
        return '🏦';
      default:
        return '💰';
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const filteredAndSortedSavings = useMemo(() => {
    // First filter the data
    let filtered = savings.filter(saving => {
      const categoryMatch = selectedCategory === 'All Categories' || 
                           saving.category === selectedCategory;
      const monthMatch = selectedMonth === 'All Months' || saving.month === selectedMonth;
      const yearMatch = selectedYear === 'All Years' || saving.year.toString() === selectedYear;
      
      return categoryMatch && monthMatch && yearMatch;
    });

    // Then sort if needed
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortKey === 'date') {
          // Create comparable date strings
          aValue = `${a.year}-${String(new Date(`${a.month} 1, ${a.year}`).getMonth() + 1).padStart(2, '0')}`;
          bValue = `${b.year}-${String(new Date(`${b.month} 1, ${b.year}`).getMonth() + 1).padStart(2, '0')}`;
        } else {
          aValue = a[sortKey as keyof Savings];
          bValue = b[sortKey as keyof Savings];
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [savings, selectedCategory, selectedMonth, selectedYear, sortKey, sortDirection]);

  const handleDelete = async (id: number, saving: Savings) => {
    if (window.confirm('Are you sure you want to delete this savings entry?')) {
      try {
        await deleteSavings(id);
        const desc = saving.description ? ` (${saving.description})` : '';
        showToast(`${saving.category} entry for ${saving.month} ${saving.year}${desc} deleted successfully!`, 'success');
        onSavingsDeleted();
      } catch (error) {
        console.error('Error deleting savings:', error);
        showToast('Error deleting savings entry. Please try again.', 'error');
      }
    }
  };

  const columns: Column<Savings>[] = [
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      width: '15%',
      render: (_, record) => (
        <span className="table-date">
          {record.month} {record.year}
        </span>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      width: '20%',
      render: (_, record) => (
        <div className="table-category">
          <span className="table-category-icon">{getCategoryIcon(record.category)}</span>
          <span>{record.category}</span>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      width: '30%',
      render: (value) => (
        <span className="table-description" title={value || ''}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      align: 'right',
      width: '20%',
      render: (value) => (
        <span className="table-amount">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      width: '15%',
      render: (_, record) => (
        <div className="table-actions">
          <button
            onClick={() => handleDelete(record.id, record)}
            className="table-btn table-btn-danger"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h3 style={{ color: '#059669', marginBottom: '16px', paddingLeft: '24px' }}>Savings Entries</h3>
      
      <div style={{ marginBottom: '16px', paddingLeft: '24px', paddingRight: '24px' }}>
        <SavingsFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredAndSortedSavings}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        emptyMessage={
          savings.length === 0 
            ? "No savings entries yet. Add your first savings entry above!"
            : "No savings entries match the selected filters."
        }
      />
    </div>
  );
};

export default SavingsList;