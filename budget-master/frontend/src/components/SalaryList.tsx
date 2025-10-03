import React, { useState, useMemo } from 'react';
import { Salary } from '../types';
import { deleteSalary } from '../api';
import DataTable, { Column } from './DataTable';

interface SalaryListProps {
  salaries: Salary[];
  onSalaryDeleted: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SalaryList: React.FC<SalaryListProps> = ({ salaries, onSalaryDeleted, showToast }) => {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDelete = async (id: number, salary: Salary) => {
    if (window.confirm('Are you sure you want to delete this salary entry?')) {
      try {
        await deleteSalary(id);
        showToast(`Salary entry for ${salary.month} ${salary.year} deleted successfully!`, 'success');
        onSalaryDeleted();
      } catch (error) {
        console.error('Error deleting salary:', error);
        showToast('Error deleting salary. Please try again.', 'error');
      }
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const sortedSalaries = useMemo(() => {
    if (!sortKey) return salaries;

    return [...salaries].sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortKey === 'date') {
        // Create comparable date strings
        aValue = `${a.year}-${String(new Date(`${a.month} 1, ${a.year}`).getMonth() + 1).padStart(2, '0')}`;
        bValue = `${b.year}-${String(new Date(`${b.month} 1, ${b.year}`).getMonth() + 1).padStart(2, '0')}`;
      } else {
        aValue = a[sortKey as keyof Salary];
        bValue = b[sortKey as keyof Salary];
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [salaries, sortKey, sortDirection]);

  const columns: Column<Salary>[] = [
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      width: '40%',
      render: (_, record) => (
        <span className="table-date">
          {record.month} {record.year}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      align: 'right',
      width: '40%',
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
      width: '20%',
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
      <h3 style={{ color: '#059669', marginBottom: '16px', paddingLeft: '24px' }}>Salary Entries</h3>
      <DataTable
        columns={columns}
        data={sortedSalaries}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        emptyMessage="No salary entries yet. Add your first salary above!"
      />
    </div>
  );
};

export default SalaryList;