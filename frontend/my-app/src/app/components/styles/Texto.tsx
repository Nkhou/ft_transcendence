"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from '@/app/utils/cn';

export const Texto = ({
words = "a",
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" "); // This will safely split the default empty string
  useEffect(() => {
    if (scope.current) {
      animate(
        "span",
        {
          opacity: 2,
        },
        {
          duration :2,
          delay: stagger(0.2),
        }
      );
    }
  }, [scope.current, animate]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0 font-light"
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-light ", className)} >
      <div className="mt-4 bg-transparent" >
      <div className="flex flex-wrap bg-transparent ">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
