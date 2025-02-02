"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<any>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleDimensions = useTransform(scrollYProgress, [0, 1], [0.7, 0.9]);

  if (isMobile) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <header className="text-center mb-8">
            {titleComponent}
          </header>
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[40rem] md:h-[50rem] flex items-center justify-center relative"
      ref={containerRef}
    >
      <div
        className="py-8 md:py-10 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <header className="max-w-5xl mx-auto text-center relative z-10 mb-8 md:mb-12">
          {titleComponent}
        </header>
        <motion.div
          style={{
            scale: scaleDimensions,
            opacity: scrollYProgress,
          }}
        >
          <Card>
            {children}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(0deg)",
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className={cn(
        "max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl",
        className
      )}
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
        {children}
      </div>
    </div>
  );
};