import { useId } from "react";

/** The Adbyrd "A" mark, inlined from brand/icon.svg so it needs no network request. */
export function AdbyrdMark({
  className,
  title = "Adbyrd",
}: {
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="80 30 920 1020" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient
          id={`${id}a`}
          x1="345.4"
          y1="147"
          x2="1035.3"
          y2="836.9"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#eb2027" />
          <stop offset=".5" stopColor="#f58520" />
          <stop offset=".8" stopColor="#f69220" />
          <stop offset="1" stopColor="#ed2d25" />
        </linearGradient>
        <linearGradient
          id={`${id}b`}
          x1="482.7"
          y1="648.4"
          x2="853.2"
          y2="1018.9"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#eb2027" />
          <stop offset=".4" stopColor="#f05923" />
          <stop offset="1" stopColor="#f69220" />
        </linearGradient>
        <linearGradient
          id={`${id}c`}
          x1="-8.2"
          y1="948.5"
          x2="793"
          y2="147.4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f69220" />
          <stop offset="1" stopColor="#f05a26" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#${id}a)`}
        points="794.2 1042.9 455.1 37.4 683 37.4 993 879.2 794.2 1042.9"
      />
      <polygon
        fill={`url(#${id}b)`}
        points="408.3 855.1 794.2 1042.9 993.7 878.4 475.2 655.9 408.3 855.1"
      />
      <polygon
        fill="#db4d26"
        points="563.1 693.6 475.2 655.9 408.3 855.1 472.7 886.4 563.1 693.6"
      />
      <polygon fill="#db4d26" points="584.2 419.7 730.6 166.2 683.1 37.1 455.2 37.1 584.2 419.7" />
      <polygon
        fill={`url(#${id}c)`}
        points="86.3 1042.9 345.3 1042.9 683 37.4 455.1 37.4 86.3 1042.9"
      />
    </svg>
  );
}

export function AdbyrdWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <AdbyrdMark className="h-6 w-6" title="" />
      <span className="text-[1.05rem] font-bold tracking-tight text-navy-700">Adbyrd</span>
    </span>
  );
}
