import { useState } from 'react';

export default function SearchBox({ placeholder = 'Search places...', onSearch }) {
  const [value, setValue] = useState('');

  function handleChange(e) {
    setValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  }

  return (
    <input
      type="text"
      className="search-box"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', minWidth: '220px', fontSize: '15px', marginBottom: '16px' }}
    />
  );
}
