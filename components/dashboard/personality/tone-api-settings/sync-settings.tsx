import { Select, SelectItem, Checkbox, Button } from '@nextui-org/react';

export default function SyncSettings() {
  return (
    <div className="space-y-4">
      <h2>Sync Settings</h2>
      <Select placeholder="Sync Frequency">
        {["Every hour", "Daily", "Weekly", "Monthly", "On Demand"].map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>
      <div className="flex flex-col space-y-2">
        <Checkbox>Inbox</Checkbox>
        <Checkbox>Drafts</Checkbox>
        <Checkbox isSelected>Sent</Checkbox> {/* Sent is pre-selected */}
      </div>
      <Button>Save Sync Settings</Button>
    </div>
  );
}
