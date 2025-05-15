import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Slide in the sidebar when it mounts
    gsap.to(sidebarRef.current, {
      x: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    return () => {
      // Slide out sidebar when it's closed
      gsap.to(sidebarRef.current, {
        x: '100%',
        duration: 0.5,
        ease: "power3.in",
      });
    };
  }, []);

  const handleClose = () => {
    // Animate close with GSAP before calling closeSidebar
    gsap.to(sidebarRef.current, {
      x: '100%',
      duration: 0.5,
      ease: "power3.in",
      onComplete: closeSidebar,
    });
  };

  const handleMouseEnter = (index: number) => {
    if (itemsRef.current[index]) {
      gsap.to(itemsRef.current[index], {
        scale: 1.2,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = (index: number) => {
    if (itemsRef.current[index]) {
      gsap.to(itemsRef.current[index], {
        scale: 1,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  };

  return (
    <div
      ref={sidebarRef}
      className="fixed top-0 right-0 h-full z-50 bg-purple-500 rounded-[3%] shadow-lg w-64 transform translate-x-full"
    >
      <button onClick={handleClose} className="focus:outline-none mt-6 ml-5">
        <img src="/icons/close.svg" alt="Close" className="w-6 h-6" />
      </button>
      <div className="p-4 flex flex-col space-y-[5rem] font-[hossine] mt-[20rem] items-center">
        {['Edit profile', 'Friends', 'Services'].map((text, index) => (
          <div
            key={index}
            ref={(el) => {
              itemsRef.current[index] = el; // Correctly assign the ref without returning anything
            }}
            className="text-white text-3xl cursor-pointer hover:text-purple-500"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {text}
          </div>
        ))}
        
      </div>
    </div>
  );
};

export default Sidebar;
