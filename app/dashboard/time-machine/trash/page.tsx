// /app/dashboard/time-machine/trash/page.tsx

import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import TrashCan from "@/components/dashboard/time-machine/TrashCan";

const TrashPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  // Display a loading message while the user ID is being retrieved
  if (!userId || typeof userId !== "string") {
    return <p>Loading...</p>;
  }

  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>Trash | My Application</title>
        <meta name="description" content="View and manage trashed files." />
      </Head>

      {/* Main Component */}
      <TrashCan userId={userId} />
    </>
  );
};

export default TrashPage;
