// ============================================================================
// 产品切换器 — 单一入口脚本（合并 ProductSwitcher + 挂载逻辑）
// 通过 Babel standalone 在浏览器中实时编译
// React/ReactDOM 通过 UMD 全局加载（详见 portal.html head）
// ============================================================================
const { useState, useEffect, useMemo, useCallback, createContext, useContext } = React;

// ============================================================================
// Context for external control
// ============================================================================
const ProductSwitcherContext = createContext({
  openDrawer: () => {},
  closeDrawer: () => {},
  isOpen: false,
  isDark: false,
});

const useProductSwitcher = () => useContext(ProductSwitcherContext);

// ============================================================================
// 数据：22 个系统按 5 个分类组织
// ============================================================================
const CATEGORIES = [
  { id: 'infra', name: '基础设施', icon: '🖥️' },
  { id: 'data', name: '数据服务', icon: '🗄️' },
  { id: 'security', name: '安全中心', icon: '🛡️' },
  { id: 'devops', name: '研发运维', icon: '⚙️' },
  { id: 'business', name: '业务应用', icon: '📊' },
];

const ALL_SYSTEMS = [
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
// 系统卡片子组件
// ============================================================================
const SystemCard = ({ system, isDark, isFavorite, onAccess, onToggleFavorite, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-3 rounded-xl cursor-pointer transition-all duration-200 bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10"
      onClick={() => onAccess(system)}
      data-system-id={system.id}
      data-system-name={system.name}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
          {system.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-slate-700 truncate">{system.name}</h4>
          {!compact && system.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{system.description}</p>
          )}
        </div>
      </div>

      <button
        onClick={e => {
          e.stopPropagation();
          onToggleFavorite(system.id);
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } ${
          isFavorite
            ? 'text-yellow-500 hover:text-yellow-400 bg-yellow-50'
            : 'text-slate-400 hover:text-slate-600 bg-slate-50'
        }`}
        title={isFavorite ? '取消收藏' : '添加收藏'}
        data-fav-btn={system.id}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  );
};

// ============================================================================
// 主组件：ProductSwitcher
// ============================================================================
const ProductSwitcher = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSystems, setRecentSystems] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    try {
      const recent = localStorage.getItem(STORAGE_KEY_RECENT);
      if (recent) setRecentSystems(JSON.parse(recent));
      const favorites = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (favorites) setFavoriteIds(new Set(JSON.parse(favorites)));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const recordRecent = useCallback((system) => {
    setRecentSystems(prev => {
      const filtered = prev.filter(s => s.id !== system.id);
      const updated = [system, ...filtered].slice(0, 5);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((systemId) => {
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

  const handleAccess = useCallback((system, openNewTab = false) => {
    recordRecent(system);
    if (openNewTab) {
      window.open(system.url, '_blank');
    } else {
      console.log('切换到系统:', system.name, system.url);
    }
    setIsOpen(false);
  }, [recordRecent]);

  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SYSTEMS;
    const query = searchQuery.toLowerCase();
    return ALL_SYSTEMS.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)) ||
      s.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedSystems = useMemo(() => {
    const groups = {};
    filteredSystems.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSystems]);

  const favoriteSystems = useMemo(() => {
    return ALL_SYSTEMS.filter(s => favoriteIds.has(s.id));
  }, [favoriteIds]);

  const isFavoritesEmpty = favoriteSystems.length === 0;

  return (
    <ProductSwitcherContext.Provider value={{ openDrawer, closeDrawer, isOpen, isDark }}>
      {children}

      {/* 遮罩层 */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: '56px' }}
        onClick={() => setIsOpen(false)}
        data-testid="drawer-overlay"
      />

      {/* 抽屉面板 */}
      <div
        className={`fixed left-0 top-14 z-50 h-[calc(100vh-56px)] w-80 sm:w-96 lg:w-[50vw] xl:w-[66.67vw] bg-white border-r border-slate-200 shadow-xl shadow-slate-200/50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="drawer-panel"
      >
        <div className="flex h-full">
          {/* 左侧菜单 */}
          <div className="w-56 border-r border-slate-100 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索产品..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  data-testid="search-input"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="p-2 border-b border-slate-100">
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => { setActiveMenu('products'); setActiveCategory('all'); }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeMenu === 'products' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  data-testid="tab-products"
                >
                  产品与服务
                </button>
                <button
                  onClick={() => setActiveMenu('favorites')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeMenu === 'favorites' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  data-testid="tab-favorites"
                >
                  <span>⭐</span>
                  <span>收藏</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {activeMenu === 'products' && (
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    data-testid="cat-all"
                  >
                    全部产品
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        activeCategory === cat.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      data-testid={`cat-${cat.id}`}
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
                      activeCategory === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    全部收藏 ({favoriteIds.size})
                  </button>
                </div>
              )}
            </div>

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
            {!searchQuery && recentSystems.length > 0 && activeMenu === 'products' && (
              <div className="mb-6" data-testid="recent-section">
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
                      <div key={categoryId} className="mb-6" data-testid={`section-${categoryId}`}>
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
// 面包屑式产品切换器（替代简单汉堡按钮）
//  - 显示当前产品名 + 下拉箭头
//  - 点击调用 useProductSwitcher().openDrawer
//  - 在打开状态高亮显示
// ============================================================================
const ProductSwitcherBreadcrumb = () => {
  const { openDrawer, isOpen } = useProductSwitcher();

  return (
    <button
      onClick={openDrawer}
      aria-label="切换产品"
      data-testid="product-switcher-breadcrumb"
      className={`
        group flex items-center gap-2 h-9 pl-3 pr-2.5
        rounded-lg border transition-all duration-200
        ${isOpen
          ? 'bg-white/15 border-white/20 text-white'
          : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20'
        }
      `}
    >
      {/* 产品图标（应用 logo 缩略） */}
      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* 产品名（面包屑文字） */}
      <span className="text-sm font-medium whitespace-nowrap">天机·智信</span>

      {/* 面包屑分隔符 */}
      <span className="text-white/30 text-xs">/</span>

      {/* 当前模块指示（动态可改为当前 product.name） */}
      <span className="text-sm text-white/70 whitespace-nowrap">产品与服务</span>

      {/* 下拉箭头 */}
      <svg
        className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

// ============================================================================
// 根 App 组件：用 ProductSwitcher 包裹面包屑式切换器
// ============================================================================
const App = () => (
  <ProductSwitcher>
    <ProductSwitcherBreadcrumb />
  </ProductSwitcher>
);

// ============================================================================
// 挂载到 DOM
// ============================================================================
const mountProductSwitcher = () => {
  const rootEl = document.getElementById('hamburger-root');
  if (!rootEl) {
    console.warn('[ProductSwitcher] hamburger-root element not found');
    return;
  }
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
  console.log('[ProductSwitcher] mounted');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountProductSwitcher);
} else {
  mountProductSwitcher();
}