import { ReactNode } from 'react';


export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen bg-transparent text-white">
      {children}
    </div>
  );
}
