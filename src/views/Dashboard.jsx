import {
  headlineStats,
  weeklySeries,
  projectCounts,
  isOverdue,
  dueLabel,
  projectColor,
} from "../lib/tasks";
import { GroupedBars, BarLabels, HBars, Legend } from "../components/charts";

export default function Dashboard({ tasks, projects, onEdit, onGoPerformance }) {
  const stats = headlineStats(tasks);
  const series = weeklySeries(tasks, 8);
  const byProject = projectCounts(tasks, projects);

  const upcoming = tasks
    .filter((t) => t.status !== "done" && t.due)
    .sort((a, b) => (a.due < b.due ? -1 : 1))
    .slice(0, 5);

  return (
    <>
      <div className="stat-grid">
        <StatCard
          label="Total Tasks"
          value={stats.total}
          delta={stats.createdDelta}
          sub={`${stats.createdThisWeek} created this week`}
          tone="indigo"
        />
        <StatCard
          label="In Progress"
          value={stats.inprogress}
          sub={`${stats.todo} still to do`}
          tone="amber"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          sub={stats.overdue ? "Needs attention" : "All on track"}
          tone={stats.overdue ? "red" : "green"}
        />
        <StatCard
          label="Completed"
          value={stats.done}
          delta={stats.doneDelta}
          sub={`${stats.doneThisWeek} done this week`}
          tone="green"
        />
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Weekly Activity</h3>
              <p className="muted">Tasks created vs. completed, last 8 weeks</p>
            </div>
            <button className="link-btn" onClick={onGoPerformance}>
              View details →
            </button>
          </div>
          <Legend
            items={[
              { label: "Created", color: "var(--c-created)" },
              { label: "Completed", color: "var(--c-done)" },
            ]}
          />
          <GroupedBars data={series} />
          <BarLabels data={series} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>By Project</h3>
          </div>
          <HBars data={byProject} />
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>Completion</h3>
          </div>
          <div className="completion">
            <div className="completion-num">{stats.completionPct}%</div>
            <div className="progress-track big">
              <div
                className="progress-fill"
                style={{ width: stats.completionPct + "%" }}
              />
            </div>
            <p className="muted">
              {stats.done} of {stats.total} tasks complete
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Upcoming Due</h3>
          </div>
          <ul className="due-list">
            {upcoming.map((t) => (
              <li key={t.id} onClick={() => onEdit(t)}>
                <span
                  className="dot"
                  style={{ background: projectColor(projects, t.project) }}
                />
                <span className="due-title">{t.title}</span>
                <span className={"due-tag" + (isOverdue(t) ? " overdue" : "")}>
                  {dueLabel(t.due)}
                </span>
              </li>
            ))}
            {upcoming.length === 0 && (
              <p className="muted">No upcoming due dates</p>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}

function StatCard({ label, value, delta, sub, tone }) {
  const showDelta = typeof delta === "number";
  const up = delta >= 0;
  return (
    <div className={"stat-card " + tone}>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {showDelta && (
          <span className={"trend " + (up ? "up" : "down")}>
            {up ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}
