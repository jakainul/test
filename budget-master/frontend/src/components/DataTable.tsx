import React, { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  className?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = "No data available",
  className = ""
}: DataTableProps<T>) {
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (data.length === 0) {
    return (
      <div className={`data-table-container ${className}`}>
        <div className="data-table-empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`
                    ${column.sortable ? 'sortable' : ''}
                    ${column.align ? `align-${column.align}` : 'align-left'}
                  `}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key as string) : undefined}
                >
                  <div className="header-content">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <span className="sort-icon">
                        {getSortIcon(column.key as string)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr key={index} className="data-row">
                {columns.map((column) => {
                  const value = record[column.key as keyof T];
                  const content = column.render ? column.render(value, record) : value;
                  
                  return (
                    <td
                      key={column.key as string}
                      className={column.align ? `align-${column.align}` : 'align-left'}
                      data-label={column.title}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;