// /components/shared/LogsTable.tsx
import React from 'react';

export interface Column {
  header: string;
  accessorKey: string;
  cell?: ({ row }: { row: { original: any } }) => React.ReactNode;
}

interface LogsTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  dataKeyMapping?: { [key: string]: string }; // Keeping this for backward compatibility
}

const LogsTable: React.FC<LogsTableProps> = ({ 
  columns, 
  data, 
  className = "logs-table",
  dataKeyMapping 
}) => {
  return (
    <div className="logs-table-container">
      <table className={className}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessorKey} className="logs-table-header">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="logs-table-row">
              {columns.map((column) => {
                const dataKey = dataKeyMapping 
                  ? dataKeyMapping[column.header] 
                  : column.accessorKey;
                
                return (
                  <td key={column.accessorKey} className="logs-table-cell">
                    {column.cell 
                      ? column.cell({ row: { original: row } })
                      : row[dataKey]
                    }
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;