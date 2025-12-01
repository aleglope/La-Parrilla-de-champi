"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";

interface BrandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
}

const BrandButton = ({
  children,
  className,
  href,
  ...props
}: BrandButtonProps) => {
  if (href) {
    return (
      <StyledWrapper className={className}>
        {/* Pasamos ...props al Link también, excepto href y className que ya se pasan */}
        <Link
          href={href}
          className="brand-btn font-heading"
          {...(props as any)}
        >
          <div className="dots_border" />
          <span className="btn-content">{children}</span>
        </Link>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper className={className}>
      <button {...props} className="brand-btn font-heading">
        <div className="dots_border" />
        <span className="btn-content">{children}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: inline-block;

  .brand-btn {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    color: white;
    background-color: transparent; /* Changed to transparent to let inner mask show */
    min-width: 9em;
    padding: 0 1.5em;
    height: 3em;
    border-radius: 30em;
    font-weight: bold;
    font-size: 15px;
    font-family: inherit;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    z-index: 1;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;

    /* Neumorphism for dark theme applied to wrapper or handled by inner elements */
    box-shadow: 6px 6px 12px #1a2324, -6px -6px 12px #364647;
    transition: box-shadow 0.3s ease, transform 0.1s ease;
  }

  .btn-content {
    position: relative;
    z-index: 10;
  }

  .brand-btn:hover {
    /* Blue hover glow using #1789C0 */
    box-shadow: 0 0 20px #1789c0, 0 0 40px rgba(23, 137, 192, 0.4);
    transform: translateY(-2px);
  }

  .brand-btn:active {
    box-shadow: inset 4px 4px 12px #1a2324, inset -4px -4px 12px #364647;
    transform: scale(0.98);
  }

  /* Sliding line background effect */
  .brand-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    border-radius: 30em;

    background: linear-gradient(
      120deg,
      transparent,
      rgba(23, 137, 192, 0.4),
      transparent
    );

    transition: all 0.6s ease;
    z-index: 5; /* Increased z-index to be on top of mask but below content */
    pointer-events: none;
  }

  .brand-btn:hover::before {
    left: 100%;
  }

  /* Animated border light effect */
  .dots_border {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    background-color: transparent;
    border-radius: 30em;
    z-index: -2;
    pointer-events: none;
  }

  .dots_border::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      transparent 80%,
      rgba(255, 255, 255, 0.8) 100%
    );
    animation: rotate 3s linear infinite;
    z-index: -1;
  }

  /* Inner mask - THIS IS THE BACKGROUND */
  .brand-btn::after {
    content: "";
    position: absolute;
    inset: 2px; /* A bit more inset to show the light border clearly */
    background-color: #283435; /* This is the actual button color */
    border-radius: 30em;
    z-index: -1; /* Behind content */
    pointer-events: none;
  }

  @keyframes rotate {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

export default BrandButton;
