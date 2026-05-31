import { prisma } from "@/lib/prisma";
import { authorized, unauthorized, serialize, sanitize } from "@/lib/server";

export const dynamic = "force-dynamic";

// PATCH /api/tasks/:id — update a task
export async function PATCH(request, { params }) {
  if (!authorized(request)) return unauthorized();
  const { id } = await params;
  try {
    const body = await request.json();
    const data = sanitize(body, { partial: true });
    const task = await prisma.task.update({ where: { id }, data });
    return Response.json(serialize(task));
  } catch (err) {
    const status = err.code === "P2025" ? 404 : 400;
    return Response.json({ error: String(err.message || err) }, { status });
  }
}

// DELETE /api/tasks/:id — delete a task
export async function DELETE(request, { params }) {
  if (!authorized(request)) return unauthorized();
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    const status = err.code === "P2025" ? 404 : 400;
    return Response.json({ error: String(err.message || err) }, { status });
  }
}
