// /components/layout/innerContent.tsx

import { ReactNode, HTMLAttributes } from 'react';

interface InnerContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  extra?: string;
}

export default function InnerContent({ children, extra = '', ...rest }: InnerContentProps) {
  return (
    <div
      className={`itemx-center mx-auto flex flex-col xl:max-w-[1170px] ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}