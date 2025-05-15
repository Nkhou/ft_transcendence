"use client";

import { ReactNode } from 'react';


export default function OtpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen bg-transparent text-white">
      {children}
    </div>
  );
}


// export default function OTPLayout