export default function TagBadgeList({ tags, onRemove, darkMode }) {
    return (
        <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
                <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    {tag}
                    <button onClick={() => onRemove(tag)} className="hover:text-red-500">×</button>
                </span>
            ))}
        </div>
    );
}
