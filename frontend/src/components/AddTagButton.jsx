import { useState, useEffect } from 'react';
import TagAutocomplete from './TagAutocomplete';

export default function AddTagButton({ accountId, existingTags, onUpdate, darkMode, api }) {
    const [show, setShow] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    
    useEffect(() => {
        if (show) {
            api.getTags().then(setAvailableTags);
        }
    }, [show, api]);
    
    const handleSelect = async (tagName) => {
        const newTags = [...existingTags, tagName];
        await api.updateAccountTags(accountId, newTags);
        onUpdate();
        setShow(false);
    };
    
    return (
        <div className="relative">
            <button
                onClick={() => setShow(!show)}
                className={`px-2 py-0.5 text-xs rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
                +
            </button>
            {show && (
                <div className={`absolute z-20 mt-1 p-3 w-64 rounded-lg shadow-lg ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                    <TagAutocomplete
                        availableTags={availableTags}
                        selectedTags={existingTags}
                        onSelect={handleSelect}
                        darkMode={darkMode}
                    />
                </div>
            )}
        </div>
    );
}
