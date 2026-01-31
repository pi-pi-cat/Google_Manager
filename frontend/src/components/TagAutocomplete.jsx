import { useState, useEffect } from 'react';

export default function TagAutocomplete({ availableTags, selectedTags, onSelect, maxTags = 10, darkMode }) {
    const [input, setInput] = useState('');
    const [filtered, setFiltered] = useState([]);
    
    useEffect(() => {
        if (input) {
            setFiltered(availableTags.filter(t => 
                t.name.toLowerCase().includes(input.toLowerCase()) && 
                !selectedTags.includes(t.name)
            ));
        } else {
            setFiltered([]);
        }
    }, [input, availableTags, selectedTags]);
    
    const handleSelect = (tagName) => {
        if (selectedTags.length < maxTags) {
            onSelect(tagName);
            setInput('');
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            handleSelect(input.trim());
        }
    };
    
    return (
        <div className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入或选择tag..."
                className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'} border`}
            />
            {filtered.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {filtered.map(tag => (
                        <button
                            key={tag.name}
                            onClick={() => handleSelect(tag.name)}
                            className={`w-full px-3 py-2 text-left hover:bg-blue-500 hover:text-white`}
                        >
                            {tag.name} ({tag.count})
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
