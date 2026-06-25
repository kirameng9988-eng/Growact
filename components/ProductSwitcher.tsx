import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';

// ============================================================================
// Context for external control
// ============================================================================
interface ProductSwitcherContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
  isDark: boolean;
}

const ProductSwitcherContext = createContext<ProductSwitcherContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
  isOpen: false,
  isDark: false,
});

export const useProductSwitcher = () => useContext(ProductSwitcherContext);

// ============================================================================
// 类型定义
// ============================================================================
interface SystemItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

// ============================================================================
// 模拟数据：20+系统按分类组织
// ============================================================================
const CATEGORIES: Category[] = [
  { id: 'infra', name: '基础设施', icon: '🖥️' },
  { id: 'data', name: '数据服务', icon: '🗄️' },
  { id: 'security', name: '安全中心', icon: '🛡️' },
  { id: 'devops', name: '研发运维', icon: '⚙️' },
  { id: 'business', name: '业务应用', icon: '📊' },
];

const ALL_SYSTEMS: SystemItem[] = [
  // 基础设施
  { id: 'ecs', name: '云服务器', icon: '🖥️', category: 'infra', description: '弹性计算服务', url: '/ecs' },
  { id: 'vpc', name: '私有网络', icon: '🌐', category: 'infra', description: '网络隔离配置', url: '/vpc' },
  { id: 'clb', name: '负载均衡', icon: '⚖️', category: 'infra', description: '流量分发管理', url: '/clb' },
  { id: 'cdn', name: 'CDN加速', icon: '🚀', category: 'infra', description: '内容分发网络', url: '/cdn' },
  // 数据服务
  { id: 'rds', name: '关系数据库', icon: '🗃️', category: 'data', description: 'MySQL/PostgreSQL', url: '/rds' },
  { id: 'redis', name: '缓存数据库', icon: '⚡', category: 'data', description: 'Redis集群', url: '/redis' },
  { id: 'mq', name: '消息队列', icon: '📨', category: 'data', description: 'Kafka/RabbitMQ', url: '/mq' },
  { id: 'es', name: '搜索引擎', icon: '🔍', category: 'data', description: 'ElasticSearch', url: '/es' },
  // 安全中心
  { id: 'cam', name: '访问控制', icon: '🔑', category: 'security', description: '身份认证授权', url: '/cam' },
  { id: 'ssl', name: '证书管理', icon: '📜', category: 'security', description: 'SSL证书部署', url: '/ssl' },
  { id: 'waf', name: 'Web防火墙', icon: '🛡️', category: 'security', description: 'DDoS防护', url: '/waf' },
  { id: 'soc', name: '安全运营', icon: '📡', category: 'security', description: '威胁检测响应', url: '/soc' },
  // 研发运维
  { id: 'coding', name: '代码托管', icon: '💻', category: 'devops', description: 'Git仓库服务', url: '/coding' },
  { id: 'pipeline', name: '持续交付', icon: '🔄', category: 'devops', description: 'CI/CD流水线', url: '/pipeline' },
  { id: 'container', name: '容器服务', icon: '📦', category: 'devops', description: 'Kubernetes集群', url: '/container' },
  { id: 'monitor', name: '监控中心', icon: '📈', category: 'devops', description: 'APM性能监控', url: '/monitor' },
  // 业务应用
  { id: 'crm', name: '客户管理', icon: '👥', category: 'business', description: 'CRM客户关系', url: '/crm' },
  { id: 'oa', name: '办公协同', icon: '📝', category: 'business', description: '审批流程', url: '/oa' },
  { id: 'bi', name: '数据分析', icon: '📊', category: 'business', description: 'BI报表平台', url: '/bi' },
  { id: 'form', name: '表单引擎', icon: '📋', category: 'business', description: '可视化表单', url: '/form' },
  { id: 'sms', name: '短信服务', icon: '📱', category: 'business', description: '短信网关', url: '/sms' },
  { id: 'mail', name: '邮件服务', icon: '✉️', category: 'business', description: '企业邮箱', url: '/mail' },
];

const STORAGE_KEY_RECENT = 'product_switcher_recent';
const STORAGE_KEY_FAVORITES = 'product_switcher_favorites';

// ============================================================================
// 主组件
// ============================================================================
interface ProductSwitcherProps {
  children?: React.ReactNode;
}

const ProductSwitcher: React.FC<ProductSwitcherProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>('products');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSystems, setRecentSystems] = useState<SystemItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  // 加载本地存储数据
  useEffect(() => {
    try {
      const recent = localStorage.getItem(STORAGE_KEY_RECENT);
      if (recent) setRecentSystems(JSON.parse(recent));

      const favorites = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (favorites) setFavoriteIds(new Set(JSON.parse(favorites)));
    } catch {}
  }, []);

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // 记录最近访问
  const recordRecent = useCallback((system: SystemItem) => {
    setRecentSystems(prev => {
      const filtered = prev.filter(s => s.id !== system.id);
      const updated = [system, ...filtered].slice(0, 5);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 切换收藏
  const toggleFavorite = useCallback((systemId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(systemId)) {
        next.delete(systemId);
      } else {
        next.add(systemId);
      }
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // 访问系统
  const handleAccess = useCallback((system: SystemItem, openNewTab: boolean = false) => {
    recordRecent(system);
    if (openNewTab) {
      window.open(system.url, '_blank');
    } else {
      console.log('切换到系统:', system.name, system.url);
    }
    setIsOpen(false);
  }, [recordRecent]);

  // 搜索过滤
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SYSTEMS;
    const query = searchQuery.toLowerCase();
    return ALL_SYSTEMS.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 按分类分组
  const groupedSystems = useMemo(() => {
    const groups: Record<string, SystemItem[]> = {};
    filteredSystems.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSystems]);

  // 收藏的系统
  const favoriteSystems = useMemo(() => {
    return ALL_SYSTEMS.filter(s => favoriteIds.has(s.id));
  }, [favoriteIds]);

  const isFavoritesEmpty = favoriteSystems.length === 0;

  return (
    <ProductSwitcherContext.Provider value={{ openDrawer, closeDrawer, isOpen, isDark }}>
      {children}

      {/* 遮罩层 - 仅遮住内容区域，不遮导航栏 */}
      <div
        className={`
          fixed left-0 right-0 bottom-0 z-40 bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ top: '56px' }}
        onClick={() => setIsOpen(false)}
      />

      {/* 下拉面板 - 从导航栏下方展开，左侧抽屉样式 */}
      <div
        className={`
          fixed left-0 top-14 z-50 h-[calc(100vh-56px)]
          w-80 sm:w-96 lg:w-[50vw] xl:w-[66.67vw] bg-white border-r border-slate-200
          shadow-xl shadow-slate-200/50
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full">
          {/* 左侧菜单 */}
          <div className="w-56 border-r border-slate-100 bg-slate-50/50 flex flex-col">
            {/* 搜索框 */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索产品..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 标签切换 */}
            <div className="p-2 border-b border-slate-100">
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => { setActiveMenu('products'); setActiveCategory('all'); }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeMenu === 'products'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  产品与服务
                </button>
                <button
                  onClick={() => setActiveMenu('favorites')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeMenu === 'favorites'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>⭐</span>
                  <span>收藏</span>
                </button>
              </div>
            </div>

            {/* 分类菜单 */}
            <div className="flex-1 overflow-y-auto p-2">
              {activeMenu === 'products' && (
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === 'all'
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    全部产品
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        activeCategory === cat.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeMenu === 'favorites' && (
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === 'all'
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    全部收藏 ({favoriteIds.size})
                  </button>
                </div>
              )}
            </div>

            {/* 底部固定区域 - 运营门户 */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">运营门户</p>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                  <span>📊</span>
                  <span className="truncate">公共数据授权运营服务平台</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                  <span>🔬</span>
                  <span className="truncate">数据实验室运营平台</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 最近访问 */}
            {!searchQuery && recentSystems.length > 0 && activeMenu === 'products' && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">最近访问</h3>
                <div className="grid grid-cols-4 gap-3">
                  {recentSystems.map(system => (
                    <SystemCard
                      key={system.id}
                      system={system}
                      isDark={isDark}
                      isFavorite={favoriteIds.has(system.id)}
                      onAccess={handleAccess}
                      onToggleFavorite={toggleFavorite}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 产品列表 */}
            {activeMenu === 'products' && (
              <div>
                {searchQuery ? (
                  <>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      搜索结果 ({filteredSystems.length})
                    </h3>
                    {filteredSystems.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-slate-500">未找到匹配的产品</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        {filteredSystems.map(system => (
                          <SystemCard
                            key={system.id}
                            system={system}
                            isDark={isDark}
                            isFavorite={favoriteIds.has(system.id)}
                            onAccess={handleAccess}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : activeCategory === 'all' ? (
                  Object.entries(groupedSystems).map(([categoryId, systems]) => {
                    const category = CATEGORIES.find(c => c.id === categoryId);
                    if (!category) return null;
                    return (
                      <div key={categoryId} className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{systems.length}</span>
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                          {systems.map(system => (
                            <SystemCard
                              key={system.id}
                              system={system}
                              isDark={isDark}
                              isFavorite={favoriteIds.has(system.id)}
                              onAccess={handleAccess}
                              onToggleFavorite={toggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      {CATEGORIES.find(c => c.id === activeCategory)?.name || activeCategory}
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {(groupedSystems[activeCategory] || []).map(system => (
                        <SystemCard
                          key={system.id}
                          system={system}
                          isDark={isDark}
                          isFavorite={favoriteIds.has(system.id)}
                          onAccess={handleAccess}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 收藏列表 */}
            {activeMenu === 'favorites' && (
              <div>
                {isFavoritesEmpty ? (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="text-slate-500">暂无收藏的产品</p>
                    <p className="text-slate-400 text-sm mt-1">点击产品卡片上的星号添加收藏</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {favoriteSystems.map(system => (
                      <SystemCard
                        key={system.id}
                        system={system}
                        isDark={isDark}
                        isFavorite={true}
                        onAccess={handleAccess}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProductSwitcherContext.Provider>
  );
};

// ============================================================================
// 系统卡片组件
// ============================================================================
interface SystemCardProps {
  system: SystemItem;
  isDark: boolean;
  isFavorite: boolean;
  onAccess: (system: SystemItem, newTab?: boolean) => void;
  onToggleFavorite: (id: string) => void;
  compact?: boolean;
}

const SystemCard: React.FC<SystemCardProps> = ({
  system,
  isDark,
  isFavorite,
  onAccess,
  onToggleFavorite,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative
        p-3 rounded-xl cursor-pointer
        transition-all duration-200
        bg-white border border-slate-100
        hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10
        ${compact ? '' : ''}
      `}
      onClick={() => onAccess(system)}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
          {system.icon}
        </div>

        {/* 文字 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-slate-700 truncate">{system.name}</h4>
          {!compact && system.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{system.description}</p>
          )}
        </div>
      </div>

      {/* 收藏按钮（hover显示） */}
      <button
        onClick={e => {
          e.stopPropagation();
          onToggleFavorite(system.id);
        }}
        className={`
          absolute top-2 right-2 p-1.5 rounded-lg transition-all
          ${isHovered ? 'opacity-100' : 'opacity-0'}
          ${isFavorite
            ? 'text-yellow-500 hover:text-yellow-400 bg-yellow-50'
            : 'text-slate-400 hover:text-slate-600 bg-slate-50'
          }
        `}
        title={isFavorite ? '取消收藏' : '添加收藏'}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  );
};

export default ProductSwitcher;