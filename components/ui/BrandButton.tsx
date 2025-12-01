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
        <Link href={href} className="brand-btn">
          {children}
        </Link>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper className={className}>
      <button {...props} className="brand-btn">
        {children}
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
    background-color: #283435; /* Charcoal base */
    min-width: 9em;
    padding: 0 1.5em;
    height: 3em;
    border-radius: 30em;
    font-weight: bold;
    font-size: 15px;
    font-family: inherit;
    border: none;
    position: relative;
    overflow: hidden;
    z-index: 1;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;

    /* Neumorphism for dark theme */
    box-shadow: 6px 6px 12px #1a2324, -6px -6px 12px #364647;
    transition: box-shadow 0.3s ease, transform 0.1s ease;
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
    left: -100%; /* Start completely off-left */
    width: 100%;
    height: 100%;
    border-radius: 30em;

    /* The sliding line is actually a gradient that looks like a shine/line */
    background: linear-gradient(
      120deg,
      transparent,
      rgba(23, 137, 192, 0.4),
      /* #1789C0 with opacity */ transparent
    );

    transition: all 0.6s ease;
    z-index: -1;
  }

  .brand-btn:hover::before {
    left: 100%; /* Slide to completely off-right */
  }
`;

export default BrandButton;
