import React from "react";

export const Card = ({ children, className = "", ...props }) => (
  <div className={`shadow-lg ${className}`} {...props}>{children}</div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
