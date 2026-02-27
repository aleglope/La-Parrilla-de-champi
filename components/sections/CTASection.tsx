// CTASection.tsx
import React from 'react';

const CTASection = () => {
  const phoneNumber = '711 22 43 28';

  return (
    <div>
      <p>Contact us at: <a href={`tel:${phoneNumber.replace(/ /g, '')}`}>{phoneNumber}</a></p>
    </div>
  );
};

export default CTASection;