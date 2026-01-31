import React from 'react';
import TagCheckboxSelector from './TagCheckboxSelector';

export default function AddTagButton({ accountId, existingTags, availableTags = [], onUpdate, darkMode, api }) {
    
    const handleToggle = async (tagName) => {
        const isSelected = existingTags.includes(tagName);
        let newTags;
        if (isSelected) {
            newTags = existingTags.filter(t => t !== tagName);
        } else {
            newTags = [...existingTags, tagName];
        }
        
        try {
            const result = await api.updateAccountTags(accountId, newTags);
            if (result.success) {
                onUpdate(accountId, result.data);
            }
        } catch (error) {
            console.error('Failed to update tags:', error);
        }
    };
    
    return (
        <TagCheckboxSelector
            availableTags={availableTags}
            selectedTags={existingTags}
            onToggle={handleToggle}
            allowCustom
            closeOnSelect
            placeholder="搜索或输入新标签..."
            darkMode={darkMode}
            trigger={
                <button
                    className={`px-2 py-0.5 text-xs rounded ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                    +
                </button>
            }
        />
    );
}
