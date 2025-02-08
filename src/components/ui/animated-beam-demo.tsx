
import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import Logo from "@/components/Logo";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  const agencies = [
    { name: "Proselect", img: "https://i.postimg.cc/tg2Xq57M/IMG-7594.png" },
    { name: "Tempo-Team", img: "https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png" },
    { name: "Accent Jobs", img: "https://i.postimg.cc/053yKcZg/IMG-7592.png" },
    { name: "AGO Jobs", img: "https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png" },
    { name: "SD Worx", img: "https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png" },
    { name: "Robert Half", img: "https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg" }
  ];

  return (
    <div
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background/50 p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <img src={agencies[0].img} alt={agencies[0].name} className="w-full h-full object-contain" />
          </Circle>
          <Circle ref={div5Ref}>
            <img src={agencies[1].img} alt={agencies[1].name} className="w-full h-full object-contain" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <img src={agencies[2].img} alt={agencies[2].name} className="w-full h-full object-contain" />
          </Circle>
          <Circle ref={div4Ref} className="size-20">
            <svg width="64" height="64" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="fill-current">
              <defs>
                <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#0073e6", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#00c6ff", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="40" fill="url(#gradBlue)" />
              <circle cx="60" cy="60" r="8" fill="#ffffff" />
              <line x1="60" y1="20" x2="60" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="60" y1="72" x2="60" y2="100" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="60" x2="48" y2="60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="72" y1="60" x2="100" y2="60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="32" y1="32" x2="50" y2="50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="70" y1="70" x2="88" y2="88" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="88" x2="50" y2="70" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="70" y1="50" x2="88" y2="32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Circle>
          <Circle ref={div6Ref}>
            <img src={agencies[3].img} alt={agencies[3].name} className="w-full h-full object-contain" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <img src={agencies[4].img} alt={agencies[4].name} className="w-full h-full object-contain" />
          </Circle>
          <Circle ref={div7Ref}>
            <img src={agencies[5].img} alt={agencies[5].name} className="w-full h-full object-contain" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
      />
    </div>
  );
}
