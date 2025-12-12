import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import BrandButton from "@/components/ui/BrandButton";

type MenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

export type BubbleMenuProps = {
  logo: ReactNode | string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: MenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
  isHidden?: boolean;
};

const DEFAULT_ITEMS: MenuItem[] = [
  {
    label: "home",
    href: "#",
    ariaLabel: "Home",
    rotation: -8,
    hoverStyles: { bgColor: "#3b82f6", textColor: "#ffffff" },
  },
  {
    label: "about",
    href: "#",
    ariaLabel: "About",
    rotation: 8,
    hoverStyles: { bgColor: "#10b981", textColor: "#ffffff" },
  },
  {
    label: "projects",
    href: "#",
    ariaLabel: "Documentation",
    rotation: 8,
    hoverStyles: { bgColor: "#f59e0b", textColor: "#ffffff" },
  },
  {
    label: "blog",
    href: "#",
    ariaLabel: "Blog",
    rotation: 8,
    hoverStyles: { bgColor: "#ef4444", textColor: "#ffffff" },
  },
  {
    label: "contact",
    href: "#",
    ariaLabel: "Contact",
    rotation: -8,
    hoverStyles: { bgColor: "#8b5cf6", textColor: "#ffffff" },
  },
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  menuAriaLabel = "Toggle menu",
  menuBg = "#fff",
  menuContentColor = "#111",
  useFixedPosition = false,
  items,
  animationEase = "bounce.out",
  animationDuration = 0.5,
  staggerDelay = 0.12,
  isHidden = false,
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;

  const containerClassName = [
    "bubble-menu",
    useFixedPosition ? "fixed" : "absolute",
    "left-0 right-0 top-8",
    "flex items-center justify-between",
    "gap-4 px-8",
    "pointer-events-none",
    "z-[1001]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  // Close menu when isHidden changes to true (scroll down)
  useEffect(() => {
    if (isHidden && isMenuOpen) {
      handleToggle();
    }
  }, [isHidden]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: "flex" });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase,
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: "power3.out",
            },
            "-=" + animationDuration * 0.9
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: "power3.in",
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: "power3.in",
      });
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          gsap.set(overlay, { display: "none", opacity: 1 });
          setShowOverlay(false);
        },
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        // Always apply rotation regardless of device
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = item.rotation ?? 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      {/* Workaround for silly Tailwind capabilities */}
      <style>{`
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        
        @keyframes rotateBorder {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @media (min-width: 0px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            box-shadow: 0 0 20px #1789c0, 0 0 40px rgba(23, 137, 192, 0.4) !important;
          }
          .bubble-menu-items .pill-link:hover .sliding-line {
            left: 100% !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
            box-shadow: inset 4px 4px 12px #1a2324, inset -4px -4px 12px #364647 !important;
          }
        }
        /* Removed mobile-specific block to enforce desktop behavior everywhere */
      `}</style>

      <nav
        className={containerClassName}
        style={style}
        aria-label="Main navigation"
      >
        <BrandButton
          type="button"
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          withGlow={false}
          className={[
            "bubble toggle-bubble menu-btn",
            isMenuOpen ? "open" : "",
            "!min-w-0 !p-0", // Reset min-width and padding
            "pointer-events-auto",
            "will-change-transform",
          ].join(" ")}
          style={{
            width: "3.5rem",
            height: "3.5rem",
            minWidth: "3.5rem",
            borderRadius: "50%",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <span
            className="menu-line block mx-auto rounded-[2px]"
            style={{
              width: 26,
              height: 2,
              background: "#C01F19", // Fire Red
              transform: isMenuOpen ? "translateY(4px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="menu-line short block mx-auto rounded-[2px]"
            style={{
              marginTop: "6px",
              width: 26,
              height: 2,
              background: "rgb(23, 137, 192)", // Custom Blue RGB(23, 137, 192)
              transform: isMenuOpen
                ? "translateY(-4px) rotate(-45deg)"
                : "none",
            }}
          />
        </BrandButton>
      </nav>

      {showOverlay && !isHidden && (
        <div
          ref={overlayRef}
          className={[
            "bubble-menu-items",
            useFixedPosition ? "fixed" : "absolute",
            "inset-0",
            "flex items-center justify-center",
            "pointer-events-none",
            "z-[1000]",
          ].join(" ")}
          aria-hidden={!isMenuOpen}
        >
          <ul
            className={[
              "pill-list",
              "list-none m-0 px-6",
              "w-full max-w-[1600px] mx-auto",
              "flex flex-wrap",
              "gap-x-0 gap-y-1",
              "pointer-events-auto",
            ].join(" ")}
            role="menu"
            aria-label="Menu links"
          >
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                role="none"
                className={[
                  "pill-col",
                  "flex justify-center items-stretch",
                  "[flex:0_0_calc(100%/3)]",
                  "box-border",
                ].join(" ")}
              >
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  onClick={(e) => {
                    // Delay closing by 1.5 seconds to show the active color
                    setTimeout(() => {
                      handleToggle();
                    }, 1500);
                  }} // Close menu on click with delay
                  className={[
                    "pill-link",
                    "w-full",
                    "rounded-[999px]",
                    "no-underline",
                    "text-white",
                    "flex items-center justify-center",
                    "relative",
                    "box-border",
                    "whitespace-nowrap overflow-hidden",
                  ].join(" ")}
                  style={
                    {
                      ["--item-rot"]: `${item.rotation ?? 0}deg`,
                      ["--pill-bg"]: "#283435",
                      ["--pill-color"]: "#ffffff",
                      ["--hover-bg"]: item.hoverStyles?.bgColor || "#C01F19",
                      ["--hover-color"]:
                        item.hoverStyles?.textColor || "#ffffff",
                      background: "transparent",
                      color: "var(--pill-color)",
                      minHeight: "var(--pill-min-h, 160px)",
                      padding: "clamp(1.5rem, 3vw, 8rem) 0",
                      fontSize: "clamp(1.5rem, 4vw, 4rem)",
                      fontWeight: 400,
                      lineHeight: 0,
                      willChange: "transform",
                      height: 10,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: "6px 6px 12px #1a2324, -6px -6px 12px #364647",
                      transition:
                        "box-shadow 0.3s ease, transform 0.1s ease, background 0.3s ease",
                      overflow: "hidden",
                      zIndex: 1,
                    } as CSSProperties
                  }
                  ref={(el) => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  {/* Dots border animation */}
                  <span
                    className="dots_border_bubble"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "calc(100% + 4px)",
                      height: "calc(100% + 4px)",
                      backgroundColor: "transparent",
                      borderRadius: "999px",
                      zIndex: -2,
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%) rotate(0deg)",
                        width: "200%",
                        height: "200%",
                        background:
                          "conic-gradient(from 0deg, transparent 0%, transparent 80%, rgba(255, 255, 255, 0.8) 100%)",
                        animation: "rotateBorder 3s linear infinite",
                        zIndex: -1,
                        display: "block",
                      }}
                    />
                  </span>

                  {/* Inner mask - background */}
                  <span
                    style={{
                      content: '""',
                      position: "absolute",
                      inset: "2px",
                      backgroundColor: "#283435",
                      borderRadius: "999px",
                      zIndex: -1,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Sliding line effect */}
                  <span
                    className="sliding-line"
                    style={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(120deg, transparent, rgba(23, 137, 192, 0.4), transparent)",
                      transition: "all 0.6s ease",
                      zIndex: 5,
                      pointerEvents: "none",
                    }}
                  />

                  <span
                    className="pill-label inline-block"
                    style={{
                      willChange: "transform, opacity",
                      height: "1.2em",
                      lineHeight: 1.2,
                      position: "relative",
                      zIndex: 10,
                    }}
                    ref={(el) => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
