// components/dashboard/shared/Filter.tsx
interface FilterProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}

const Filter: React.FC<FilterProps> = ({ label, value, onChange, options }) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}:
      </label>
      <select
        value={value}
        onChange={onChange}
        className="logs-select"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;