import { projectColor } from "../lib/tasks";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "board", label: "Task Board", icon: BoardIcon },
  { id: "performance", label: "Performance", icon: ChartIcon },
];

export default function Sidebar({ view, onNavigate, projects, onAddTask }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="sb-logo">✦</span>
        <span className="sb-name">TaskFlow</span>
      </div>

      <nav className="sb-nav">
        <p className="sb-section">Menu</p>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={"sb-link" + (view === item.id ? " active" : "")}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sb-projects">
        <div className="sb-section row-between">
          <span>Projects</span>
          <button className="sb-add" onClick={onAddTask} title="New task">
            +
          </button>
        </div>
        <ul>
          {projects.map((p) => (
            <li key={p}>
              <span
                className="dot"
                style={{ background: projectColor(projects, p) }}
              />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="sb-user">
        <div className="sb-avatar">N</div>
        <div className="sb-user-meta">
          <strong>You</strong>
          <span>Personal workspace</span>
        </div>
      </div>
    </aside>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 3 4-6" />
    </svg>
  );
}
