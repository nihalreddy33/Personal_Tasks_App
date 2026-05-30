import {
  headlineStats,
  statusCounts,
  priorityCounts,
  projectCounts,
  weeklySeries,
  activityHeatmap,
  STATUS_COLORS,
} from "../lib/tasks";
import {
  DonutChart,
  GroupedBars,
  BarLabels,
  HBars,
  HeatMap,
  Legend,
} from "../components/charts";

export default function Performance({ tasks, projects }) {
  const stats = headlineStats(tasks);
  const sc = statusCounts(tasks);
  const series = weeklySeries(tasks, 10);
  const byProject = projectCounts(tasks, projects);
  const byPriority = priorityCounts(tasks).filter((p) => p.value > 0);
  const heat = activityHeatmap(tasks, 14);

  const statusSegments = [
    { label: "Done", value: sc.done, color: STATUS_COLORS.done },
    { label: "In Progress", value: sc.inprogress, color: STATUS_COLORS.inprogress },
    { label: "To Do", value: sc.todo, color: STATUS_COLORS.todo },
  ];

  const completedTotal = tasks.filter((t) => t.completedAt).length;

  return (
    <>
      <div className="stat-grid">
        <MetricCard label="Completion Rate" value={stats.completionPct + "%"} />
        <MetricCard
          label="Completed / Week"
          value={stats.doneThisWeek}
          delta={stats.doneDelta}
        />
        <MetricCard
          label="Created / Week"
          value={stats.createdThisWeek}
          delta={stats.createdDelta}
        />
        <MetricCard label="Overdue" value={stats.overdue} tone={stats.overdue ? "red" : "green"} />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Task Performance</h3>
            <p className="muted">Created vs. completed per week, last 10 weeks</p>
          </div>
          <Legend
            items={[
              { label: "Created", color: "var(--c-created)" },
              { label: "Completed", color: "var(--c-done)" },
            ]}
          />
        </div>
        <GroupedBars data={series} height={260} />
        <BarLabels data={series} />
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>Status Breakdown</h3>
          </div>
          <div className="donut-wrap">
            <DonutChart
              segments={statusSegments}
              centerLabel={stats.total}
              centerSub="tasks"
            />
            <div className="donut-legend">
              {statusSegments.map((s) => (
                <div className="dl-row" key={s.label}>
                  <span className="dot" style={{ background: s.color }} />
                  <span className="dl-name">{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>By Priority</h3>
          </div>
          <div className="donut-wrap">
            <DonutChart
              segments={byPriority.map((p) => ({
                label: p.label,
                value: p.value,
                color: p.color,
              }))}
              centerLabel={byPriority.reduce((s, p) => s + p.value, 0)}
              centerSub="tasks"
            />
            <div className="donut-legend">
              {byPriority.map((p) => (
                <div className="dl-row" key={p.id}>
                  <span className="dot" style={{ background: p.color }} />
                  <span className="dl-name">{p.label}</span>
                  <strong>{p.value}</strong>
                </div>
              ))}
              {byPriority.length === 0 && <p className="muted">No tasks yet</p>}
            </div>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>Workload by Project</h3>
          </div>
          <HBars data={byProject} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Activity Timeline</h3>
              <p className="muted">{completedTotal} tasks completed over 14 weeks</p>
            </div>
          </div>
          <HeatMap grid={heat} />
          <div className="heat-legend">
            <span className="muted">Less</span>
            <span className="hl-cell" style={{ background: "var(--track)" }} />
            <span className="hl-cell" style={{ background: "rgba(99,102,241,.4)" }} />
            <span className="hl-cell" style={{ background: "rgba(99,102,241,.7)" }} />
            <span className="hl-cell" style={{ background: "rgba(99,102,241,1)" }} />
            <span className="muted">More</span>
          </div>
        </section>
      </div>
    </>
  );
}

function MetricCard({ label, value, delta, tone = "indigo" }) {
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
    </div>
  );
}
