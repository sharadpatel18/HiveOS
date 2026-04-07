import db from "@/db";
import { taskAssignments, tasks, users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { updateTaskValidation } from "@/validations/task.validation";
import { eq, aliasedTable } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await withAuth();
    if ("error" in auth) return auth.error;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Task ID is required", success: false },
        { status: 400 },
      );
    }

    const findTask = await db.select().from(tasks).where(eq(tasks.id, id));

    if (findTask.length === 0) {
      return NextResponse.json(
        { message: "Task not found", success: false },
        { status: 404 },
      );
    }

    const assignedUser = aliasedTable(users, "assignedUser");
    const assignedByUser = aliasedTable(users, "assignedByUser");

    const findAssigneeData = await db
      .select({
        id: taskAssignments.userId,
        name: assignedUser.name,
        email: assignedUser.email,
        role: assignedUser.role,
        assignedBy: {
          name: assignedByUser.name,
          email: assignedByUser.email,
          id: assignedByUser.id,
          role: assignedByUser.role,
        },
      })
      .from(taskAssignments)
      .leftJoin(assignedUser, eq(assignedUser.id, taskAssignments.userId))
      .leftJoin(
        assignedByUser,
        eq(assignedByUser.id, taskAssignments.assignedById),
      )
      .where(eq(taskAssignments.taskId, id))
      .limit(1);

    return NextResponse.json(
      { ...findTask[0], assignee: findAssigneeData },
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await withAuth();
    if ("error" in auth) return auth.error;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Task ID is required", success: false },
        { status: 400 },
      );
    }

    const allowedRoles = ["FOUNDER", "MANAGER", "TEAMLEAD"];

    if (!allowedRoles.includes(auth.user.role as string)) {
      return NextResponse.json(
        {
          message: "You are not authorized to update this task",
          success: false,
        },
        { status: 403 },
      );
    }

    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));

    if (existingTask.length === 0) {
      return NextResponse.json(
        { message: "Task not found", success: false },
        { status: 404 },
      );
    }

    const body = await request.json();

    const validated = updateTaskValidation.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: validated.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    const updateData = validated.data;

    // prevent empty patch
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          message: "At least one field is required to update",
          success: false,
        },
        { status: 400 },
      );
    }

    await db.update(tasks).set(updateData).where(eq(tasks.id, id));

    return NextResponse.json(
      {
        message: "Task updated successfully",
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH TASK ERROR:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await withAuth();
    if ("error" in auth) return auth.error;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Task ID is required", success: false },
        { status: 400 },
      );
    }

    if (
      auth.user.role !== "FOUNDER" &&
      auth.user.role !== "MANAGER" &&
      auth.user.role !== "TEAMLEAD"
    ) {
      return NextResponse.json(
        {
          message: "You are not authorized to delete this task",
          success: false,
        },
        { status: 403 },
      );
    }

    const findTask = await db.select().from(tasks).where(eq(tasks.id, id));

    if (findTask.length === 0) {
      return NextResponse.json(
        { message: "Task not found", success: false },
        { status: 404 },
      );
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return NextResponse.json(
      { message: "Task deleted successfully", success: true },
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
