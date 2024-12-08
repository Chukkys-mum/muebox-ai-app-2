// app/dashboard/user-management/users/[userId]/page.tsx
export default function UserPage({ params }: { params: { userId: string } }) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Details</h1>
        {/* Add your user details component here */}
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </div>
    );
  }
  