import { useState } from 'react'
import { Radar, Search, Users, ChartNoAxesCombined, Target, Download, Store, GitCompareArrows, Filter, FileSpreadsheet, LayoutDashboard, Settings, Menu, ExternalLink, LoaderCircle } from 'lucide-react'

type Community = {
  id: number; name: string; screen_name?: string; members_count?: number;
  url?: string; source: string; photo_200?: string
}

const API = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')

export default function App() {
  const [query, setQuery] = useState('детская одежда')
  const [items, setItems] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('')
  const [error, setError] = useState('')

  async function search() {
    if (query.trim().length < 2) return
    setLoading(true); setError('')
    try {
      if (!API) throw new Error('Backend ещё не подключён. После публикации API поиск станет доступен.');
      const res = await fetch(`${API}/api/communities/search?q=${encodeURIComponent(query)}&count=30`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Ошибка поиска')
      setItems(data.items); setMode(data.mode)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить поиск')
    } finally { setLoading(false) }
  }

  function exportCsv() {
    const rows = [['Название', 'Подписчики', 'Ссылка'], ...items.map(x => [x.name, String(x.members_count ?? ''), x.url ?? ''])]
    const csv = '\uFEFF' + rows.map(row => row.map(v => `"${v.replaceAll('"', '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'vk-communities.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const nav = [
    [LayoutDashboard, 'Обзор'], [Search, 'Поиск сообществ'], [Store, 'Конкуренты'],
    [ChartNoAxesCombined, 'Аналитика'], [GitCompareArrows, 'Пересечения'],
    [Filter, 'Фильтры'], [FileSpreadsheet, 'Экспорт'],
  ] as const

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon"><Radar size={22}/></div><div><b>VK AUDIENCE</b><small>HUNTER</small></div></div>
      <div className="workspace"><span className="dot"/> Рабочее пространство <b>⌄</b></div>
      <p className="navLabel">РАБОЧАЯ ОБЛАСТЬ</p>
      {nav.map(([Icon, label], i) => <button className={`navItem ${i === 1 ? 'active' : ''}`} key={label}><Icon size={17}/>{label}</button>)}
      <div className="sidebarBottom"><button className="navItem"><Settings size={17}/>Настройки</button><div className="profile"><div className="avatar">AH</div><div><b>Администратор</b><small>Локальный режим</small></div></div></div>
    </aside>
    <main className="main">
      <header><button className="mobileMenu"><Menu/></button><div><span className="crumb">Рабочая область /</span> Поиск сообществ</div><div className="status"><span className="dot"/> Сервис готов</div></header>
      <section className="content">
        <div className="pageTop"><div><p className="eyebrow">AUDIENCE DISCOVERY</p><h1>Поиск сообществ</h1><p className="sub">Находите тематические сообщества и оценивайте потенциал рекламных аудиторий.</p></div><div className="nicheTag">Первая ниша · Детские товары</div></div>
        <div className="stats">
          <Stat icon={<Users/>} label="Найдено сообществ" value={String(items.length)} />
          <Stat icon={<ChartNoAxesCombined/>} label="В выборке подписчиков" value={items.reduce((s,x)=>s+(x.members_count||0),0).toLocaleString('ru-RU')} />
          <Stat icon={<Target/>} label="Подготовлено аудиторий" value="0" />
          <Stat icon={<Download/>} label="Экспортов" value="0" />
        </div>
        <div className="searchCard">
          <div className="cardTitle"><div><h2>Найти сообщества VK</h2><p>Введите тематику, товар или интерес аудитории</p></div><span className="apiPill">VK API / DEMO</span></div>
          <div className="searchRow"><div className="searchInput"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Например, детская одежда"/></div><button className="primary" onClick={search} disabled={loading}>{loading?<LoaderCircle className="spin" size={17}/>:<Search size={17}/>} Найти сообщества</button></div>
          <div className="chips"><span>Популярные запросы:</span>{['детская одежда','игрушки','товары для новорождённых','мамы и дети'].map(x=><button key={x} onClick={()=>setQuery(x)}>{x}</button>)}</div>
        </div>
        <div className="resultsHead"><div><h2>Результаты поиска</h2><p>{items.length ? `Найдено: ${items.length}` : 'Здесь появятся найденные сообщества'}</p></div>{items.length>0&&<button className="secondary" onClick={exportCsv}><Download size={16}/> Экспорт CSV</button>}</div>
        {error&&<div className="error">{error}</div>}
        {items.length===0&&!error&&<div className="empty"><div className="emptyIcon"><Search size={24}/></div><b>Пока нет результатов</b><span>Запустите поиск, чтобы увидеть сообщества по выбранной тематике.</span></div>}
        {items.length>0&&<div className="tableWrap"><table><thead><tr><th>СООБЩЕСТВО</th><th>ПОДПИСЧИКИ</th><th>ИСТОЧНИК</th><th></th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><div className="community"><div className="communityAvatar">{x.photo_200?<img src={x.photo_200}/>:<Store size={18}/>}</div><div><b>{x.name}</b><small>vk.com/{x.screen_name||`club${x.id}`}</small></div></div></td><td>{(x.members_count||0).toLocaleString('ru-RU')}</td><td><span className={`source ${x.source}`}>{x.source==='vk_api'?'VK API':'Демо-данные'}</span></td><td><a href={x.url||'#'} target="_blank" rel="noreferrer" className="openLink"><ExternalLink size={16}/></a></td></tr>)}</tbody></table><div className="tableFoot">Данные сообществ. Список участников и персональные ID не собираются.</div></div>}
        <div className="notice"><Target size={18}/><div><b>Следующий этап: анализ аудитории</b><p>Добавим оценку качества сообществ, сравнение пересечений и подготовку community targeting для VK Ads.</p></div></div>
        <footer>VK Audience Hunter <span>·</span> Первая версия 0.1.0 <span>·</span> Локальный запуск</footer>
      </section>
    </main>
  </div>
}

function Stat({icon,label,value}:{icon:React.ReactNode,label:string,value:string}) {
  return <div className="stat"><div className="statIcon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>
}
