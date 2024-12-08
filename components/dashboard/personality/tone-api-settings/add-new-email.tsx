import { Button } from "@nextui-org/react";
import { FaRegUserCircle } from 'react-icons/fa';

export default function ConnectionCard() {
  const accounts = [
    { email: 'user@gmail.com', status: 'Connected', category: 'Work', icon: 'gmail-icon' },
    { email: 'user@outlook.com', status: 'Not Connected', category: '', icon: 'outlook-icon' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-zinc-950 dark:text-white bg-white dark:bg-zinc-900">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Category</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, index) => (
            <tr key={index} className="border-b border-zinc-200 dark:border-zinc-700">
              <td className="py-2 px-4 flex items-center">
                <FaRegUserCircle className="mr-2 text-zinc-950 dark:text-white" />
                {account.email}
              </td>
              <td className="py-2 px-4">{account.category || "Add Category"}</td>
              <td className={`py-2 px-4 ${account.status === 'Connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {account.status}
              </td>
              <td className="py-2 px-4">
                <Button color={account.status === "Connected" ? "danger" : "primary"}>
                  {account.status === "Connected" ? "Disconnect" : "Connect"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
