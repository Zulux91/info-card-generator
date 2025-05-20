import React from "react";

export const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="bg-zinc-800 text-white px-3 py-2 rounded-lg w-full border border-zinc-700"
  />
);
