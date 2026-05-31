import { prisma } from "@/lib/prisma";
import { authorized, unauthorized, serializeProject } from "@/lib/server";

export const dynamic = "force-dynamic";

// GET /api/projects — list projects (oldest first)
export async function GET(request) {
  if (!authorized(request)) return unauthorized();
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
    });
    return Response.json(projects.map(serializeProject));
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 500 });
  }
}

// POST /api/projects — create a project (idempotent on name)
export async function POST(request) {
  if (!authorized(request)) return unauthorized();
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 120);
    if (!name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }
    // Idempotent: return the existing project if the name is taken.
    const existing = await prisma.project.findUnique({ where: { name } });
    if (existing) return Response.json(serializeProject(existing));

    const project = await prisma.project.create({ data: { name } });
    return Response.json(serializeProject(project), { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 400 });
  }
}
