import React from 'react';
import { Salary } from '../types';
import { deleteSalary } from '../api';

interface SalaryListProps {
  salaries: Salary[];
  onSalaryDeleted: () => void;
}

const SalaryList: React.FC<SalaryListProps> = ({ salaries, onSalaryDeleted }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this salary entry?')) {
      try {
        await deleteSalary(id);
        onSalaryDeleted();
      } catch (error) {
        console.error('Error deleting salary:', error);
        alert('Error deleting salary. Please try again.');
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
            onClick={() => handleDelete(salary.id)}
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