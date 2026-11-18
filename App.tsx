import { useEffect, useMemo, useState } from 'react'
import { Radar, Search, Users, ChartNoAxesCombined, Target, Download, Store, GitCompareArrows, Filter, FileSpreadsheet, LayoutDashboard, Settings, Menu, ExternalLink, LoaderCircle, RefreshCw, History, Wifi, WifiOff } from 'lucide-react'

type Community = {
  id: number
  name: string
  screen_name?: string
  members_count?: number
  url?: string
  source: string
  photo_200?: string
}
type HistoryItem = { id: number; query: string; total: number; mode: string; created_at: string }
const API = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

export default function App() {
  const [query, setQuery] = useState('детская одежда')
  const [items, setItems] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('')
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [minMembers, setMinMembers] = useState('0')
  const [sort, setSort] = useState('members')

  async function checkHealth() {
    if (!API) { setConnected(false); return }
    try {
      const res = await fetch(`${API}/api/health`)
      setConnected(res.ok)
    } catch { setConnected(false) }
  }

  async function loadHistory() {
    if (!API) return
    try {
      const res = await fetch(`${API}/api/history?limit=8`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.items || [])
      }
    } catch { /* history is optional while the local API is offline */ }
  }

  useEffect(() => {
    void checkHealth()
    void loadHistory()
  }, [])

  async function search(searchQuery = query) {
    if (searchQuery.trim().length < 2) return
    setLoading(true); setError('')
    try {
      if (!API) throw new Error('Локальный backend не запущен. Запустите start-local.bat на ноутбуке.')
      const res = await fetch(`${API}/api/communities/search?q=${encodeURIComponent(searchQuery)}&count=100`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Ошибка поиска')
      setItems(data.items || [])
      setMode(data.mode || '')
      await loadHistory()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить поиск')
    } finally { setLoading(false) }
  }

  const visibleItems = useMemo(() => {
    const filtered = items.filter(x => (x.members_count || 0) >= Math.max(0, Number(minMembers) || 0))
    return [...filtered].sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name, 'ru')
      : (b.members_count || 0) - (a.members_count || 0))
  }, [items, minMembers, sort])

  function exportCsv() {
    const rows = [['ID сообщества VK', 'Название', 'Подписчики', 'Ссылка'], ...visibleItems.map(x => [String(x.id), x.name, String(x.members_count ?? ''), x.url ?? ''])]
    const csv = '\uFEFF' + rows.map(row => row.map(v => `"${v.replaceAll('"', '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'vk-community-ids.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const nav = [
    [LayoutDashboard, 'Обзор'], [Search, 'Поиск сообществ'], [Store, 'Конкуренты'],
    [ChartNoAxesCombined, 'Аналитика'], [GitCompareArrows, 'Пересечения'],
    [Filter, 'Фильтры'], [FileSpreadsheet, 'Экспорт'],
  ] as const

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon"><Radar size={22}/></div><div><b>VK AUDIENCE</b><small>HUNTER</small></div></div>
      <div className="workspace"><span className="dot"/> Локальное пространство <b>⌄</b></div>
      <p className="navLabel">РАБОЧАЯ ОБЛАСТЬ</p>
      {nav.map(([Icon, label], i) => <button className={`navItem ${i === 1 ? 'active' : ''}`} key={label}><Icon size={17}/>{label}</button>)}
      <div className="sidebarBottom"><button className="navItem"><Settings size={17}/>Настройки</button><div className="profile"><div className="avatar">AH</div><div><b>Администратор</b><small>Данные на этом ноутбуке</small></div></div></div>
    </aside>
    <main className="main">
      <header><button className="mobileMenu"><Menu/></button><div><span className="crumb">Рабочая область /</span> Поиск сообществ</div><div className="status">{connected ? <><Wifi size={14}/> Backend подключён</> : <><WifiOff size={14}/> Backend не подключён</>}</div></header>
      <section className="content">
        <div className="pageTop"><div><p className="eyebrow">AUDIENCE DISCOVERY</p><h1>Поиск сообществ</h1><p className="sub">Находите открытые тематические сообщества и оценивайте потенциал рекламных аудиторий.</p></div><div className="nicheTag">Первая ниша · Детские товары</div></div>
        <div className="stats">
          <Stat icon={<Users/>} label="Сообществ в результатах" value={String(visibleItems.length)} />
          <Stat icon={<ChartNoAxesCombined/>} label="Подписчиков в выборке" value={visibleItems.reduce((s,x)=>s+(x.members_count||0),0).toLocaleString('ru-RU')} />
          <Stat icon={<Target/>} label="Подготовлено аудиторий" value="0" />
          <Stat icon={<History/>} label="Поисков сохранено" value={String(history.length)} />
        </div>
        <div className="searchCard">
          <div className="cardTitle"><div><h2>Найти сообщества VK</h2><p>Введите тематику, товар или интерес аудитории</p></div><span className="apiPill">{mode === 'vk_api' ? 'VK API · LIVE' : mode === 'demo' ? 'ДЕМО-ДАННЫЕ' : 'ЛОКАЛЬНЫЙ ПОИСК'}</span></div>
          <div className="searchRow"><div className="searchInput"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Например, детская одежда"/></div><button className="primary" onClick={()=>search()} disabled={loading}>{loading?<LoaderCircle className="spin" size={17}/>:<Search size={17}/>} Найти сообщества</button></div>
          <div className="chips"><span>Популярные запросы:</span>{['детская одежда','игрушки','товары для новорождённых','мамы и дети'].map(x=><button key={x} onClick={()=>{setQuery(x);void search(x)}}>{x}</button>)}</div>
        </div>
        <div className="resultsHead"><div><h2>Результаты поиска</h2><p>{visibleItems.length ? `Показано: ${visibleItems.length} из ${items.length}` : 'Здесь появятся найденные сообщества'}</p></div>{items.length>0&&<button className="secondary" onClick={exportCsv}><Download size={16}/> Экспорт ID сообществ</button>}</div>
        {error&&<div className="error">{error}</div>}
        {items.length>0&&<div className="filterBar"><label><Filter size={15}/> От подписчиков <input type="number" min="0" value={minMembers} onChange={e=>setMinMembers(e.target.value)}/></label><label>Сортировка <select value={sort} onChange={e=>setSort(e.target.value)}><option value="members">По числу подписчиков</option><option value="name">По названию</option></select></label></div>}
        {items.length===0&&!error&&<div className="empty"><div className="emptyIcon"><Search size={24}/></div><b>Пока нет результатов</b><span>Запустите поиск, чтобы увидеть сообщества по выбранной тематике.</span></div>}
        {visibleItems.length>0&&<div className="tableWrap"><table><thead><tr><th>СООБЩЕСТВО</th><th>ПОДПИСЧИКИ</th><th>ИСТОЧНИК</th><th></th></tr></thead><tbody>{visibleItems.map(x=><tr key={x.id}><td><div className="community"><div className="communityAvatar">{x.photo_200?<img src={x.photo_200} alt=""/>:<Store size={18}/>}</div><div><b>{x.name}</b><small>vk.com/{x.screen_name||`club${x.id}`}</small></div></div></td><td>{(x.members_count||0).toLocaleString('ru-RU')}</td><td><span className={`source ${x.source}`}>{x.source==='vk_api'?'VK API':'Демо-данные'}</span></td><td><a href={x.url||'#'} target="_blank" rel="noreferrer" className="openLink" aria-label="Открыть сообщество"><ExternalLink size={16}/></a></td></tr>)}</tbody></table><div className="tableFoot">Анализируются сообщества и агрегированные показатели. Экспорт содержит ID сообществ, а не ID их подписчиков. Для рекламы используйте штатный таргетинг VK по сообществам.</div></div>}
        {history.length>0&&<div className="historyCard"><div className="historyTitle"><h2>Последние поиски</h2><button className="iconButton" onClick={()=>{void loadHistory();void checkHealth()}} title="Обновить"><RefreshCw size={15}/></button></div>{history.slice(0,5).map(h=><button className="historyItem" key={h.id} onClick={()=>{setQuery(h.query);void search(h.query)}}><span><b>{h.query}</b><small>{new Date(h.created_at).toLocaleString('ru-RU')}</small></span><span>{h.total} результатов</span></button>)}</div>}
        <div className="notice"><Target size={18}/><div><b>Следующий этап: анализ аудитории</b><p>Добавим оценку качества сообществ, сравнение тематик и подготовку аналитики для VK Ads.</p></div></div>
        <footer>VK Audience Hunter <span>·</span> Локальная версия 0.2.0 <span>·</span> SQLite на ноутбуке</footer>
      </section>
    </main>
  </div>
}

function Stat({icon,label,value}:{icon:React.ReactNode,label:string,value:string}) {
  return <div className="stat"><div className="statIcon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>
}
