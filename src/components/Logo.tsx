const Logo = () => {
  return (
    <svg width="200" height="48" viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg" className="fill-current">
      <defs>
        <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#0073e6", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#00c6ff", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      <g transform="translate(70,60)">
        <circle cx="0" cy="0" r="40" fill="url(#gradBlue)" />
        <circle cx="0" cy="0" r="8" fill="#ffffff" />
        <line x1="0" y1="-40" x2="0" y2="-12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="12" x2="0" y2="40" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="-40" y1="0" x2="-12" y2="0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="0" x2="40" y2="0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="-28" y1="-28" x2="-10" y2="-10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="10" x2="28" y2="28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <line x1="-28" y1="28" x2="-10" y2="10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="-10" x2="28" y2="-28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </g>
      
      <text x="150" y="70" fontFamily="Helvetica, Arial, sans-serif" fontSize="36" fill="currentColor" fontWeight="600">
        Intérim Centrale
      </text>
    </svg>
  );
};

export default Logo;