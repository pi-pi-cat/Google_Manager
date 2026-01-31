import { useState, useEffect } from 'react';
import TagCheckboxSelector from './TagCheckboxSelector';

export default function AddTagButton({ accountId, existingTags, onUpdate, darkMode, api }) {
    const [show, setShow] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    
    useEffect(() => {
        if (show) {
            api.getTags().then(setAvailableTags);
        }
    }, [show, api]);
    
    const handleToggle = async (tagName) => {
        const newTags = [...existingTags, tagName];
        const result = await api.updateAccountTags(accountId, newTags);
        if (result.success) {
            onUpdate(accountId, result.data);
            setShow(false);
        }
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
                <div className={`absolute z-20 mt-1 left-0 w-64 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <TagCheckboxSelector
                        availableTags={availableTags}
                        selectedTags={[]}
                        onToggle={handleToggle}
                        darkMode={darkMode}
                        excludeTags={existingTags}
                        buttonText="添加标签"
                    />
                </div>
            )}
        </div>
    );
}
