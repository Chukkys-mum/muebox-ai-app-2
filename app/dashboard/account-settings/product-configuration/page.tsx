// /app/dashboard/account-settings/product-configuration/page.tsx

'use client';

import React from 'react';
import DashboardLayout from '@/components/layout';
import ProductConfiguration from '@/components/dashboard/account-settings/product-configuration';

const ProductConfigurationPage: React.FC = () => {
  return (
    <DashboardLayout
      title="Product Configuration"
      description="Configure and manage integrated features for your account."
      user={null} // Pass null if user data is not available
      userDetails={null} // Pass null if user details are not available
      products={[]} // Pass an empty array if no products are available
      subscription={null} // Pass null if no subscription data is available
    >
      <ProductConfiguration />
    </DashboardLayout>
  );
};

export default ProductConfigurationPage;
