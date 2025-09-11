import React from 'react';
import { Salary } from '../types';
import { deleteSalary } from '../api';

interface SalaryListProps {
  salaries: Salary[];
  onSalaryDeleted: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SalaryList: React.FC<SalaryListProps> = ({ salaries, onSalaryDeleted, showToast }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
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

  if (salaries.length === 0) {
    return (
      <div className="card">
        <h3 style={{ color: '#059669', marginBottom: '16px' }}>Salary Entries</h3>
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
          No salary entries yet. Add your first salary above!
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ color: '#059669', marginBottom: '16px' }}>Salary Entries</h3>
      {salaries.map((salary) => (
        <div key={salary.id} className="list-item">
          <div className="list-item-info">
            <div className="list-item-amount">
              {formatCurrency(salary.amount)}
            </div>
            <div className="list-item-meta">
              {salary.month} {salary.year}
            </div>
          </div>
          <button
            onClick={() => handleDelete(salary.id, salary)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default SalaryList;