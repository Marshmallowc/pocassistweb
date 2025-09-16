import React from 'react';
import './Table.less';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`custom-table-container ${className}`}>
      <table className="custom-table">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return <thead className={`custom-table-header ${className}`}>{children}</thead>;
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return <tbody className={`custom-table-body ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return <tr className={`custom-table-row ${className}`}>{children}</tr>;
};

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return <th className={`custom-table-head ${className}`}>{children}</th>;
};

export const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => {
  return <td className={`custom-table-cell ${className}`}>{children}</td>;
};
