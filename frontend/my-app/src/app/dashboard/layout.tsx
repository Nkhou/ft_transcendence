
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {

    
  return (
    <div className="w-screen h-screen bg-black">
        {children}
       

    </div>
  );
}
