
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
      className="relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm p-10 shadow-xl"
      ref={containerRef}
    >
      <div className="flex size-full max-w-3xl items-stretch justify-between gap-10 relative">
        <div className="flex flex-row items-center justify-between absolute inset-0">
          <Circle ref={div1Ref}>
            <img src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" alt="Google Drive" className="w-10 h-10 object-contain" />
          </Circle>
          <Circle ref={div4Ref}>
            <img src="https://www.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png" alt="Google Docs" className="w-10 h-10 object-contain" />
          </Circle>
        </div>
        
        <div className="flex flex-row items-center justify-between absolute inset-0 top-1/4">
          <Circle ref={div2Ref}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-10 h-10 object-contain" />
          </Circle>
          <div ref={centerRef} className="size-24 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo className="w-full h-full" />
          </div>
          <Circle ref={div5Ref}>
            <img src="https://cdn.zapier.com/zapier/images/favicon.ico" alt="Zapier" className="w-10 h-10 object-contain" />
          </Circle>
        </div>
        
        <div className="flex flex-row items-center justify-between absolute inset-0 top-2/3">
          <Circle ref={div3Ref}>
            <img src="https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png" alt="WhatsApp" className="w-10 h-10 object-contain" />
          </Circle>
          <Circle ref={div6Ref}>
            <img src="https://static.xx.fbcdn.net/rsrc.php/v3/y0/r/XNhD3z4SR_Q.png" alt="Messenger" className="w-10 h-10 object-contain" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={centerRef}
        curvature={-75}
        endYOffset={-10}
        pathWidth={1}
        pathOpacity={0.2}
        gradientStartColor="#646cff"
        gradientStopColor="#82aeff"
        pathColor="#e2e8f0"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={centerRef}
        pathWidth={1}
        pathOpacity={0.2}
        gradientStartColor="#646cff"
        gradientStopColor="#82aeff"
        pathColor="#e2e8f0"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={centerRef}
        curvature={75}
        endYOffset={10}
        pathWidth={1}
        pathOpacity={0.2}
        gradientStartColor="#646cff"
        gradientStopColor="#82aeff"
        pathColor="#e2e8f0"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={centerRef}
        curvature={-75}
        endYOffset={-10}
        reverse
        pathWidth={1}
        pathOpacity={0.2}
        gradientStartColor="#646cff"
        gradientStopColor="#82aeff"
        pathColor="#e2e8f0"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={centerRef}
        reverse
        pathWidth={1}
        pathOpacity={0.2}
        gradientStartColor="#646cff"
        gradientStopColor="#82aeff"
        pathColor="#e2e8f0"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={centerRef}
        curvature={75}
        endYOffset={10}
        reverse
        pathWidth={1}
        pathOpacity={0.2}
        gradientStartColor="#646cff"
        gradientStopColor="#82aeff"
        pathColor="#e2e8f0"
      />
    </div>
  );
}
