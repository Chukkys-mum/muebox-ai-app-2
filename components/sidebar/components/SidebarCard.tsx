// /components/sidebar/components/SidebarCard.tsx

'use client';

import { useState, useContext } from 'react';
import { FaUser } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BiSolidCheckSquare } from 'react-icons/bi';
import { IoIosStar } from 'react-icons/io';
import TeamSwitcher from './TeamSwitcher';
import {
  useUser,
  usePlan,
  useProducts,
  SubscriptionContext,
  UserDetailsContext,
  UserDetails,
  ProductWithPrice,
} from '@/context/layout';
import type { Price } from '@/types/subscription';  

interface SidebarCardProps {
  collapsed: boolean;
}

export default function SidebarCard({ collapsed }: SidebarCardProps) {
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);
  const user = useUser();
  const userDetails = useContext(UserDetailsContext);
  const subscription = useContext(SubscriptionContext);
  const { plan, setPlan } = usePlan();
  const products = useProducts();

  const handlePlanSelection = (productId: string, priceId: string) => {
    setPlan({
      product: productId,
      price: priceId
    });
  };

  // Component for PRO users
  const ProCard = () => (
    <div className={`flex items-center border-t border-gray-600 dark:border-gray-800
      ${collapsed ? 'justify-center p-4' : 'p-4'}`}>
      <Avatar className={`${collapsed ? 'h-8 w-8' : 'h-10 w-10'}`}>
        <AvatarImage src={user?.user_metadata?.avatar_url} />
        <AvatarFallback className="font-bold dark:text-foreground">
          {userDetails?.full_name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      {!collapsed && (
        <div className="ml-3 flex-grow">
          <p className="text-sm font-semibold text-white dark:text-white">
            {userDetails?.full_name || 'Pro User'}
          </p>
          <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-blue-500">
            PRO
          </Badge>
        </div>
      )}
      
      <button
        onClick={() => setShowTeamSwitcher(true)}
        className="ml-2 text-gray-400 hover:text-white transition-colors"
      >
        <FaUser className={`${collapsed ? 'h-4 w-4' : 'h-5 w-5'}`} />
      </button>
    </div>
  );

  // Component for free users
  const FreeCard = () => (
    <div className={`border-t border-gray-600 dark:border-gray-800
      ${collapsed ? 'p-2' : 'p-4'}`}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={`w-full bg-gradient-to-r from-purple-500 to-blue-500 
              hover:from-purple-600 hover:to-blue-600 text-white
              ${collapsed ? 'p-2' : 'px-4 py-2'}`}
          >
            {collapsed ? 'PRO' : 'Upgrade to PRO'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Upgrade to PRO</h2>
            <div className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <BiSolidCheckSquare className="h-5 w-5 text-purple-500 mr-2" />
                  <span>Access to all premium features</span>
                </div>
                <div className="flex items-center">
                  <BiSolidCheckSquare className="h-5 w-5 text-purple-500 mr-2" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center">
                  <BiSolidCheckSquare className="h-5 w-5 text-purple-500 mr-2" />
                  <span>Advanced analytics</span>
                </div>
              </div>

              {/* Plans */}
              {products.map((product: ProductWithPrice) => (
                product.prices?.filter(price => price.unit_amount !== undefined)
                  .map((price: Price) => (  // Add the Price type here
                  <div
                    key={price.id}
                    className={`p-4 border rounded-lg cursor-pointer
                      ${plan.price === price.id ? 'border-purple-500' : 'border-gray-200'}
                    `}
                    onClick={() => handlePlanSelection(product.id, price.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{price.interval === 'year' ? 'Yearly' : 'Monthly'}</p>
                        <p className="text-sm text-gray-500">
                          {price.interval === 'year' ? 'Save 20%' : 'Flexible plan'}
                        </p>
                      </div>
                      <p className="text-xl font-bold">
                        ${(price.unit_amount ?? 0) / 100}  {/* Add null coalescing operator */}
                        <span className="text-sm text-gray-500">/{price.interval}</span>
                      </p>
                    </div>
                  </div>
                ))
              ))}
            </div>

            {/* Reviews */}
            <div className="mt-6 text-center">
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <IoIosStar key={star} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Loved by thousands of users</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!collapsed && (
        <button
          onClick={() => setShowTeamSwitcher(true)}
          className="mt-4 w-full text-sm text-gray-400 hover:text-white transition-colors text-center"
        >
          Switch Team
        </button>
      )}
    </div>
  );

  return (
    <>
      {subscription ? <ProCard /> : <FreeCard />}
      {showTeamSwitcher && (
        <TeamSwitcher onClose={() => setShowTeamSwitcher(false)} />
      )}
    </>
  );
}