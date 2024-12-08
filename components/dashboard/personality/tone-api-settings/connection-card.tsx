// ConnectionCard.tsx
import React, { useState } from "react";
import Header from "@/components/ui/header";
import InformationIconModal from "@/components/ui/information-icon-modal";
import TableEmails from "@/components/ui/TableEmails";

const columns = [
  { uid: "email", label: "Email", sortable: true },
  { uid: "category", label: "Category", sortable: true },
  { uid: "status", label: "Status", sortable: false },
];

const accounts = [
  { id: 1, email: "example1@example.com", category: "client", status: "Connected" },
  { id: 2, email: "example2@example.com", category: "vendor", status: "Not Connected" },
  // Add more sample data as needed
];

export default function ConnectionCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-800 text-black dark:text-white p-6 rounded-lg shadow-md">
      <Header
        title="Manage Emails"
        description="Connect your email accounts to enable AI tone analysis, allowing contextualized responses in different tones."
        onHelpIconClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <InformationIconModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tone API Settings Help"
          description="To enable tone analysis, connect your email accounts and select folders to sync with the AI. The Sent folder is mandatory for syncing to ensure accurate tone analysis of your email communications. Once synced, the AI can analyze tone in various contexts and help craft responses that align with your chosen communication style."
        />
      )}
      <TableEmails data={accounts} columns={columns} rowsPerPage={5} totalItems={accounts.length} />
    </div>
  );
}
