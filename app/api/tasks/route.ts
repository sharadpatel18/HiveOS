import db from "@/db";
import {
  company,
  users,
  teams,
  tasks,
  taskAssignments,
  teamMembers,
  companyMembers,
} from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { taskValidation } from "@/validations/task.validation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { TaskPriority, TaskStatus } from "@/types/task";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await withAuth();
    if ("error" in auth) return auth.error as Response;

    const body = await request.json();

    const validateSchema = taskValidation.safeParse(body);
    if (!validateSchema.success) {
      return NextResponse.json(
        { message: validateSchema.error.issues[0].message, success: false },
        { status: 400 },
      );
    }

    if (
      auth.user.role !== "FOUNDER" &&
      auth.user.role !== "MANAGER" &&
      auth.user.role !== "TEAMLEAD"
    ) {
      return NextResponse.json(
        { message: "You are not authorized to view tasks" },
        { status: 403 },
      );
    }
    const data = validateSchema.data;

    // Check team exists and belongs to the company (implicitly validates company too)
    const findTeam = await db
      .select({ id: teams.id })
      .from(teams)
      .where(
        and(eq(teams.id, data.teamId), eq(teams.companyId, data.companyId)),
      );

    if (findTeam.length === 0) {
      return NextResponse.json(
        { message: "Team not found or does not belong to this company" },
        { status: 404 },
      );
    }

    // Check assignedBy user exists
    const findAssigner = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, data.assignedById));

    if (findAssigner.length === 0) {
      return NextResponse.json(
        { message: "Assigner not found" },
        { status: 404 },
      );
    }

    // Check all assignees are valid team members
    const validTeamMembers = await db
      .select({ id: teamMembers.id, userId: teamMembers.userId })
      .from(teamMembers)
      .where(
        and(
          inArray(teamMembers.id, data.assigneeIds),
          eq(teamMembers.teamId, data.teamId),
        ),
      );

    const validCompanyMembers = await db
      .select({ id: companyMembers.id, userId: companyMembers.userId })
      .from(companyMembers)
      .where(
        and(
          inArray(companyMembers.userId, data.assigneeIds),
          eq(companyMembers.companyId, data.companyId),
        ),
      );
    const validIds = validTeamMembers
      .map((m) => m.id)
      .concat(validCompanyMembers.map((m) => m.userId));

    const invalidIds = data.assigneeIds.filter((id) => !validIds.includes(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          message: `These users are not members of this team: ${invalidIds.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Insert task
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        companyId: data.companyId,
        teamId: data.teamId,
      })
      .returning();

    // Insert task assignments using actual userIds
    const userIds = validTeamMembers.map((m) => m.userId);

    await db.insert(taskAssignments).values(
      userIds.map((userId) => ({
        taskId: newTask.id,
        userId,
        assignedById: data.assignedById,
      })),
    );

    return NextResponse.json(
      { message: "Task created successfully", success: true, data: newTask },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await withAuth();
    if ("error" in auth) return auth.error as Response;

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const teamId = searchParams.get("teamId");

    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 },
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { message: "Team ID is required" },
        { status: 400 },
      );
    }

    // Check team exists and belongs to the company
    const findTeam = await db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.id, teamId), eq(teams.companyId, companyId)));

    if (findTeam.length === 0) {
      return NextResponse.json(
        { message: "Team not found or does not belong to this company" },
        { status: 404 },
      );
    }

    // if (
    //   auth.user.role !== "FOUNDER" &&
    //   auth.user.role !== "MANAGER" &&
    //   auth.user.role !== "TEAMLEAD"
    // ) {
    //   return NextResponse.json(
    //     { message: "You are not authorized to view tasks" },
    //     { status: 403 },
    //   );
    // }

    // Fetch tasks with assignees
    const taskList = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: sql<TaskPriority>`${tasks.priority}`,
        status: sql<TaskStatus>`${tasks.status}`,
        due: tasks.dueDate,
        companyId: tasks.companyId,
        teamId: tasks.teamId,
        assignedById: taskAssignments.assignedById,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignee: {
          id: sql<string | null>`${users.id}`,
          name: sql<string | null>`${users.name}`,
          email: sql<string | null>`${users.email}`,
          assignedById: sql<string | null>`${taskAssignments.assignedById}`,
        },
      })
      .from(tasks)
      .leftJoin(taskAssignments, eq(taskAssignments.taskId, tasks.id))
      .leftJoin(users, eq(users.id, taskAssignments.userId))
      .where(and(eq(tasks.teamId, teamId), eq(tasks.companyId, companyId)));

    // Group assignees under each task
    const groupedTasks = taskList.reduce((acc, row) => {
      const existing = acc.find((t) => t.id === row.id);

      const assignee =
        row.assignee.id &&
        row.assignee.name &&
        row.assignee.email &&
        row.assignee.assignedById
          ? {
              id: row.assignee.id,
              name: row.assignee.name,
              email: row.assignee.email,
              assignedById: row.assignee.assignedById,
            }
          : null;

      if (existing) {
        if (assignee) existing.assignees.push(assignee);
      } else {
        acc.push({
          id: row.id,
          title: row.title,
          description: row.description,
          priority: row.priority,
          status: row.status,
          due: row.due,
          assignedById: row.assignedById,
          companyId: row.companyId,
          teamId: row.teamId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          assignees: assignee ? [assignee] : [],
        });
      }
      return acc;
    }, [] as any[]);

    return NextResponse.json(
      { data: groupedTasks, success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
