import React, { useState, useMemo, useEffect } from 'react';
import api from '../services/api';
import {
    Search,
    Mail,
    Key,
    Edit3,
    Trash2,
    ShieldCheck,
    ExternalLink,
    Clock,
    StickyNote,
    Copy,
    History,
    Filter
} from 'lucide-react';
import ActionButton from './ActionButton';
import Pagination from './Pagination';
import usePagination from '../hooks/usePagination';
import HistoryDrawer from './HistoryDrawer';
import TagBadgeList from './TagBadgeList';
import AddTagButton from './AddTagButton';
import TagCheckboxSelector from './TagCheckboxSelector';

/**
 * 账号列表视图组件
 */
const AccountListView = ({
    accounts,
    search,
    setSearch,
    selectedDomain,
    setSelectedDomain,
    selectedTags,
    onTagsChange,
    copyToClipboard,
    generate2FA,
    twoFACode,
    toggleStatus,
    toggleSoldStatus,
    onEdit,
    onDelete,
    loading,
    onSearchChange,
    darkMode,
    onAccountUpdate
}) => {
    // 筛选状态: 'all' | 'sold' | 'unsold'
    const [soldFilter, setSoldFilter] = useState('all');
    // 域名筛选状态
    const [domains, setDomains] = useState([]);
    // 所有可用标签
    const [availableTags, setAvailableTags] = useState([]);
    // 加载所有标签
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await api.getTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error('获取标签失败:', error);
            }
        };
        fetchTags();
    }, []);

    // 获取域名列表
    React.useEffect(() => {
        const fetchDomains = async () => {
            try {
                const data = await api.getDomains();
                setDomains(data);
            } catch (error) {
                console.error('获取域名列表失败:', error);
            }
        };
        fetchDomains();
    }, []);

    // 根据筛选过滤账号
    const filteredAccounts = useMemo(() => {
        if (soldFilter === 'all') return accounts;
        return accounts.filter(acc => acc.soldStatus === soldFilter);
    }, [accounts, soldFilter]);

    // 使用分页 Hook
    const pagination = usePagination(filteredAccounts, 10);

    // 历史抽屉状态
    const [historyDrawer, setHistoryDrawer] = useState({ isOpen: false, account: null });

    // 搜索时重置到第一页
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        pagination.resetPage();
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    };

    // 标签筛选变更
    const handleTagToggle = (tagName) => {
        const isSelected = selectedTags.includes(tagName);
        const newTags = isSelected 
            ? selectedTags.filter(t => t !== tagName)
            : [...selectedTags, tagName];
        pagination.resetPage();
        if (onTagsChange) onTagsChange(newTags);
    };

    const handleTagRemove = (tagName) => {
        const newTags = selectedTags.filter(t => t !== tagName);
        pagination.resetPage();
        if (onTagsChange) onTagsChange(newTags);
    };

    // 监听筛选条件变化，通知父组件加载数据
    useEffect(() => {
        if (onSearchChange) {
            // 这里我们复用onSearchChange来传递tags参数，或者需要父组件支持新的props
            // 由于父组件 loadAccounts 直接调用 api.getAccounts(search, domain)
            // 我们需要修改父组件的调用方式，或者在这里触发一个新的回调
            // 但 AccountListView 的 props 只有 onSearchChange
            // 让我们看看 App.jsx 是怎么写的
            // App.jsx: const data = await api.getAccounts('', selectedDomain);
            // App.jsx 似乎没有传递 tags 参数
            // 我们需要修改 AccountListView 的 props 接收一个 onFilterChange 回调
            // 暂时先只在组件内部处理筛选显示，实际 API 调用需要父组件配合
            // 但任务要求 "Pass to API: api.getAccounts(search, domain, selectedTags.join(','))"
            // 这意味着我们需要修改 App.jsx 或者在这里直接调用 loadAccounts
            // AccountListView 接收 accounts 作为 props，所以数据是由父组件提供的
            // 我们需要通知父组件更新数据
        }
    }, [selectedTags]);

    // 打开历史抽屉
    const openHistoryDrawer = (account) => {
        setHistoryDrawer({ isOpen: true, account });
    };

    // 关闭历史抽屉
    const closeHistoryDrawer = () => {
        setHistoryDrawer({ isOpen: false, account: null });
    };

    // 复制全部信息
    const copyAllInfo = (acc) => {
        // 去除2FA密钥中的空格
        const cleanSecret = acc.secret ? acc.secret.replace(/\s/g, '') : '';
        const fullInfo = `邮箱账号：${acc.email}
密码：${acc.password}
恢复邮箱：${acc.recovery}
谷歌验证码获取：https://2fa.run/2fa/${cleanSecret}
【账号到手后必备工作】：https://qcn4p837qb99.feishu.cn/wiki/S2bFwQ5vBifHgCkrmgrcAUzlnJd?from=from_copylink`;
        copyToClipboard(fullInfo, '全部信息');
    };

    // 移除标签
    const handleRemoveAccountTag = async (accountId, tagToRemove) => {
        const account = accounts.find(a => a.id === accountId);
        if (account && account.tags) {
            const newTags = account.tags.filter(t => t !== tagToRemove);
            const result = await api.updateAccountTags(accountId, newTags);
            
            // 立即更新状态
            if (result.success && onAccountUpdate) {
                onAccountUpdate(accountId, result.data);
            } else if (onSearchChange) {
                // 回退方案：重新加载
                onSearchChange(search);
            }
        }
    };

    // 账号标签更新回调
    const handleAccountUpdate = (accountId, updatedAccount) => {
        if (onAccountUpdate) {
            onAccountUpdate(accountId, updatedAccount);
        } else if (onSearchChange) {
            onSearchChange(search);
        }
    };

    return (
        <>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>账号库</h1>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>管理您的所有谷歌账号资产</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                        <input
                            type="text"
                            placeholder="搜索邮箱或备注内容..."
                            value={search}
                            onChange={handleSearchChange}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${darkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'} border`}
                        />
                    </div>
                </div>

                {/* 域名筛选按钮 */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedDomain('')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${selectedDomain === ''
                            ? (darkMode ? 'bg-blue-600 text-white shadow' : 'bg-blue-500 text-white shadow')
                            : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200')}`}
                    >
                        全部
                    </button>
                    {domains.map(d => (
                        <button
                            key={d.domain}
                            onClick={() => setSelectedDomain(d.domain)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${selectedDomain === d.domain
                                ? (darkMode ? 'bg-blue-600 text-white shadow' : 'bg-blue-500 text-white shadow')
                                : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200')}`}
                        >
                            <span>{d.domain}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedDomain === d.domain 
                                ? 'bg-white/20' 
                                : (darkMode ? 'bg-slate-700' : 'bg-slate-100')}`}>
                                {d.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 筛选按钮 */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                        <Filter size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                        <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>筛选：</span>
                    </div>
                    
                    {/* Tag Filter */}
                    <div className="min-w-[180px]">
                        <TagCheckboxSelector 
                            availableTags={availableTags}
                            selectedTags={selectedTags}
                            onToggle={handleTagToggle}
                            darkMode={darkMode}
                            maxSelections={10}
                            buttonText="选择标签筛选"
                        />
                    </div>

                    <div className={`flex gap-1 p-1 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => { setSoldFilter('all'); pagination.resetPage(); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${soldFilter === 'all'
                                ? (darkMode ? 'bg-slate-600 text-white shadow' : 'bg-white text-slate-800 shadow')
                                : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
                        >
                            全部 ({accounts.length})
                        </button>
                        <button
                            onClick={() => { setSoldFilter('unsold'); pagination.resetPage(); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${soldFilter === 'unsold'
                                ? 'bg-green-500 text-white shadow'
                                : (darkMode ? 'text-green-400 hover:bg-green-900/30' : 'text-green-600 hover:bg-green-50')}`}
                        >
                            未售出 ({accounts.filter(a => a.soldStatus !== 'sold').length})
                        </button>
                        <button
                            onClick={() => { setSoldFilter('sold'); pagination.resetPage(); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${soldFilter === 'sold'
                                ? 'bg-red-500 text-white shadow'
                                : (darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50')}`}
                        >
                            已售出 ({accounts.filter(a => a.soldStatus === 'sold').length})
                        </button>
                    </div>
                </div>

                <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b text-xs uppercase tracking-wider font-semibold ${darkMode
                                    ? 'bg-slate-700/50 border-slate-600 text-slate-400'
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400'}`}>
                                    <th className="px-4 py-4 text-center w-[60px]">序号</th>
                                    <th className="px-4 py-4">谷歌账号</th>
                                    <th className="px-4 py-4 text-center w-[70px]">状态</th>
                                    <th className="px-4 py-4">恢复邮箱</th>
                                    <th className="px-4 py-4 w-[120px]">2FA 验证</th>
                                    <th className="px-4 py-4 text-center w-[320px]">操作面板</th>
                                    <th className="px-4 py-4 text-center w-[80px]">出售</th>
                                    <th className="px-4 py-4 w-[150px]">标签</th>
                                    <th className="px-4 py-4 w-[100px]">备注</th>
                                    <th className="px-4 py-4 w-[100px]">导入时间</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center text-slate-400">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                                <p className="text-lg font-medium">加载中...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pagination.paginatedData.length > 0 ? pagination.paginatedData.map((acc, index) => (
                                    <tr key={acc.id} className={`transition-colors group ${darkMode
                                        ? (index % 2 === 0 ? 'bg-slate-800/80' : 'bg-slate-900/60') + ' hover:bg-slate-700/70'
                                        : (index % 2 === 0 ? 'bg-white' : 'bg-blue-50/60') + ' hover:bg-blue-100/70'}`}>
                                        {/* 序号 - 显示全局序号 */}
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-lg ${darkMode
                                                ? 'bg-slate-700 text-slate-300'
                                                : 'bg-slate-100 text-slate-600'}`}>
                                                {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                                            </span>
                                        </td>
                                        {/* 谷歌账号 */}
                                        <td className="px-4 py-4 max-w-[280px]">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                                    <Mail size={16} className={darkMode ? 'text-blue-400 flex-shrink-0' : 'text-blue-500 flex-shrink-0'} />
                                                    <span className="truncate" title={acc.email}>{acc.email}</span>
                                                </span>
                                                <button
                                                    onClick={() => openHistoryDrawer(acc)}
                                                    className={`p-1 rounded-md transition-all flex-shrink-0 ${darkMode
                                                        ? 'text-slate-500 hover:text-purple-400 hover:bg-slate-700'
                                                        : 'text-slate-300 hover:text-purple-500 hover:bg-purple-50'}`}
                                                    title="查看修改历史"
                                                >
                                                    <History size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        {/* 状态 */}
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => toggleStatus(acc.id)}
                                                className={`px-2 py-1 rounded-full text-xs font-black transition-all duration-300 transform active:scale-95 whitespace-nowrap ${acc.status === 'pro' ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.2)]' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'}`}
                                            >
                                                {acc.status === 'pro' ? 'Pro' : '未开启'}
                                            </button>
                                        </td>
                                        {/* 恢复邮箱 */}
                                        <td className="px-4 py-4 max-w-[280px]">
                                            <span className={`text-sm font-medium truncate block ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} title={acc.recovery}>{acc.recovery}</span>
                                        </td>
                                        {/* 2FA 验证 - 点击复制 */}
                                        <td className="px-4 py-4">
                                            <div className="w-[100px] h-10 flex flex-col justify-center">
                                                {twoFACode.id === acc.id ? (
                                                    <div className="flex flex-col gap-1 w-full animate-in zoom-in-95">
                                                        <div
                                                            onClick={() => copyToClipboard(twoFACode.code, '2FA验证码')}
                                                            className="flex items-center justify-between bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-all"
                                                            title="点击复制2FA验证码">
                                                            <span className="font-bold tracking-widest text-base">{twoFACode.code}</span>
                                                            <span className="text-[10px] font-bold tabular-nums opacity-60">{twoFACode.expiry}s</span>
                                                        </div>
                                                        <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                                                                style={{ width: `${(twoFACode.expiry / 30) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-sm italic">未获取</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* 操作面板 */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                                    <ActionButton icon={<Mail size={14} />} label="账号" color="blue" darkMode={darkMode} onClick={() =>
                                                        copyToClipboard(acc.email, '邮箱')} />
                                                    <ActionButton icon={<Key size={14} />} label="密码" color="green" darkMode={darkMode} onClick={() =>
                                                        copyToClipboard(acc.password, '密码')} />
                                                    <ActionButton icon={<ExternalLink size={14} />} label="恢复" color="orange" darkMode={darkMode} onClick={() =>
                                                        copyToClipboard(acc.recovery, '恢复邮箱')} />
                                                </div>

                                                <button onClick={() => generate2FA(acc.id, acc.secret)}
                                                    className={`p-1.5 rounded-lg transition-all shadow-sm ${darkMode
                                                        ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-500 hover:text-white border border-blue-700/50'
                                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                                    title="获取2FA验证码"
                                                >
                                                    <ShieldCheck size={16} />
                                                </button>

                                                <div className={`h-5 w-[1px] ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}></div>

                                                <button onClick={() => onEdit(acc)} className={`p-1.5 rounded-lg transition-all ${darkMode
                                                    ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700'
                                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`} title="编辑">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => onDelete(acc.id)} className={`p-1.5 rounded-lg transition-all ${darkMode
                                                    ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700'
                                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`} title="删除">
                                                    <Trash2 size={16} />
                                                </button>

                                                <div className={`h-5 w-[1px] ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}></div>

                                                <button onClick={() => copyAllInfo(acc)}
                                                    className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-sm"
                                                    title="复制全部信息">
                                                    <Copy size={12} />
                                                    <span>全部</span>
                                                </button>
                                            </div>
                                        </td>
                                        {/* 出售状态 */}
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => toggleSoldStatus(acc.id, acc.soldStatus)}
                                                className={`px-2 py-1 rounded-full text-xs font-black transition-all duration-300 transform active:scale-95 whitespace-nowrap ${acc.soldStatus === 'sold'
                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                                    : 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.2)]'}`}
                                            >
                                                {acc.soldStatus === 'sold' ? '已售出' : '未售出'}
                                            </button>
                                        </td>
                                        {/* 标签 */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <TagBadgeList 
                                                    tags={acc.tags || []} 
                                                    onRemove={(tag) => handleRemoveAccountTag(acc.id, tag)} 
                                                    darkMode={darkMode} 
                                                />
                                                <AddTagButton 
                                                    accountId={acc.id} 
                                                    existingTags={acc.tags || []} 
                                                    availableTags={availableTags}
                                                    onUpdate={(id, data) => handleAccountUpdate(id, data)} 
                                                    darkMode={darkMode} 
                                                    api={api}
                                                />
                                            </div>
                                        </td>
                                        {/* 备注 */}
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                                <StickyNote size={14} className={darkMode ? 'text-slate-500 flex-shrink-0' : 'text-slate-300 flex-shrink-0'} />
                                                <span className="truncate max-w-[80px]" title={acc.remark}>{acc.remark || <span
                                                    className={darkMode ? 'text-slate-500 italic' : 'text-slate-300 italic'}>无</span>}</span>
                                            </div>
                                        </td>
                                        {/* 导入时间 */}
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>
                                                <Clock size={14} className={darkMode ? 'text-slate-500 flex-shrink-0' : 'text-slate-300 flex-shrink-0'} />
                                                <span className="whitespace-nowrap">{acc.createdAt || '-'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center text-slate-300">
                                                <Search size={48} className="mb-4 opacity-20" />
                                                <p className="text-lg font-medium">未找到相关账号</p>
                                                <p className="text-sm">尝试更换关键词或导入新账号</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页组件 */}
                    {!loading && accounts.length > 0 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            pageSize={pagination.pageSize}
                            onPageChange={pagination.goToPage}
                            onPageSizeChange={pagination.changePageSize}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                        />
                    )}
                </div>
            </div>

            {/* 历史记录抽屉 */}
            <HistoryDrawer
                isOpen={historyDrawer.isOpen}
                onClose={closeHistoryDrawer}
                account={historyDrawer.account}
                darkMode={darkMode}
            />
        </>
    );
};

export default AccountListView;
