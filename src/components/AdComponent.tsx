import React, { useEffect } from 'react';

const AdComponent: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//www.highperformanceformat.com/29c7ae6e74bda21ea49d7327f05d3f1f/invoke.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <div id="container-f49f5f35a629b31aaf9ba8a5189fb849"></div>
    </div>
  );
};

export default AdComponent;
