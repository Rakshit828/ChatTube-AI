import React from "react";

const InputField = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>
);

export default InputField;
