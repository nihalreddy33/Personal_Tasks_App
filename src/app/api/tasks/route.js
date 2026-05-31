import { prisma } from "@/lib/prisma";
import { authorized, unauthorized, serialize, sanitize } from "@/lib/server";

export const dynamic = "force-dynamic";

// GET /api/tasks — list all tasks
export async function GET(request) {
  if (!authorized(request)) return unauthorized();
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: "asc" } });
    return Response.json(tasks.map(serialize));
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}

// POST /api/tasks — create a task
export async function POST(request) {
  if (!authorized(request)) return unauthorized();
  try {
    const body = await request.json();
    const data = sanitize(body);
    const task = await prisma.task.create({ data });
    return Response.json(serialize(task), { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 400 });
  }
}
