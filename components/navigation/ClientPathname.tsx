// /components/navigation/ClientPathname.tsx

'use client';

import { usePathname } from 'next/navigation';

const ClientPathname = () => {
  const pathname = usePathname(); // Get the current pathname

  return (
    <span data-testid="client-pathname">
      {pathname || '/'}
    </span>
  );
};

export default ClientPathname;
