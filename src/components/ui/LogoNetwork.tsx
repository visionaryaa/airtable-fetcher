
"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import Logo from "@/components/Logo";

const Circle = ({ className = "", children, ref }: { className?: string; children?: React.ReactNode; ref?: React.RefObject<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex size-16 items-center justify-center rounded-full bg-white/95 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className}`}
    >
      {children}
    </div>
  );
};

export function LogoNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg bg-card/95 dark:bg-[#1A1F2C]/95 backdrop-blur-sm p-10 shadow-xl"
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg max-h-[400px] items-stretch justify-between gap-10 relative">
        <div className="flex flex-row items-center justify-between absolute inset-0">
          <Circle ref={div1Ref}>
            <img src="https://i.postimg.cc/tg2Xq57M/IMG-7594.png" alt="Proselect" className="w-full h-full object-contain" />
          </Circle>
          <Circle ref={div4Ref}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s" alt="Adecco" className="w-full h-full object-contain" />
          </Circle>
        </div>
        
        <div className="flex flex-row items-center justify-between absolute inset-0 top-1/4">
          <Circle ref={div2Ref}>
            <img src="https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png" alt="Tempo Team" className="w-full h-full object-contain" />
          </Circle>
          <div ref={centerRef} className="size-24 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo className="w-full h-full" />
          </div>
          <Circle ref={div5Ref}>
            <img src="https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png" alt="ASAP" className="w-full h-full object-contain" />
          </Circle>
        </div>
        
        <div className="flex flex-row items-center justify-between absolute inset-0 top-2/3">
          <Circle ref={div3Ref}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s" alt="Randstad" className="w-full h-full object-contain" />
          </Circle>
          <Circle ref={div6Ref}>
            <img src="https://i.postimg.cc/053yKcZg/IMG-7592.png" alt="Accent Jobs" className="w-full h-full object-contain" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={centerRef}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={centerRef}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={centerRef}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={centerRef}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={centerRef}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={centerRef}
        curvature={75}
        endYOffset={10}
        reverse
      />
    </div>
  );
}
