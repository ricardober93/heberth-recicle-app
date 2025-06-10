import type { ActionFunctionArgs, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser, requireUserId } from "~/session.server";
import { db } from "~/db";
import { students, recycling, classrooms } from "~/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import RecyclingForm from "../components/RecyclingForm";

export const meta: MetaFunction = () => {
  return [{
    title: "Recycling",
    description: "Manage recycling for students",
  }];
};

const RecordRecyclingSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classroomId: z.string().min(1, "Classroom is required"),
  item: z.string().min(1, "Item is required"),
  weight: z.string().regex(/^\d+$/, "Weight must be a number").transform(Number).refine(val => val > 0, "Weight must be positive"),
});





interface ActionErrors {
  errors: {
    studentId?: string[];
    classroomId?: string[];
    item?: string[];
    weight?: string[];
    _global?: string[];
  };
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionErrors | Response> {
  await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "recordRecycling") {
      const submission = RecordRecyclingSchema.safeParse(Object.fromEntries(formData));

    if (!submission.success) {
      return { errors: submission.error.flatten().fieldErrors };
    }

    const { studentId, classroomId, item, weight } = submission.data;

    try {
      await db.insert(recycling).values({
        studentId: parseInt(studentId),
        classroomId: parseInt(classroomId),
        item,
        weight,
      });
      return redirect("/recycling");
    } catch (error) {
      return { errors: { _global: ["Failed to record recycling"] } };
    }
  }

  return { errors: { _global: ["Invalid intent"] } };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);  
  const studentsList = await db.select({
    id: students.id,
    name: students.name,
    email: students.email,
    classroom: {
      name: classrooms.name,
    },
  }).from(students).leftJoin(classrooms, eq(students.classroomId, classrooms.id));

  const allClassrooms = await db.select().from(classrooms);
  const allRecyclingRecords = await db.select({
    id: recycling.id,
    student: {
      name: students.name,
      email: students.email,
    },
    classroom: {
      name: classrooms.name,
    },
    item: recycling.item,
    weight: recycling.weight,
    recycledAt: recycling.recycledAt,
  })
  .from(recycling)
  .leftJoin(
    students, 
    eq(recycling.studentId, students.id)
  )
  .leftJoin(
    classrooms,
    eq(recycling.classroomId, classrooms.id)
  )
  .orderBy(recycling.recycledAt);

  return { user, studentsList, allClassrooms, allRecyclingRecords };
}

export default function Recycling() {
  const { user, studentsList, allClassrooms, allRecyclingRecords } = useLoaderData<typeof loader>();

  const actionData = useActionData<ActionErrors>();


  return (
    <div className="min-h-scree p-6">
      <h1 className="text-3xl font-bold text-gray-300 mb-6">Recycling Page</h1>
      {user && (
        <p className="text-gray-300 mb-4">Welcome, {user.email}!</p>
      )}

      <div className="p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Record Recycling</h2>
        <RecyclingForm students={studentsList} classrooms={allClassrooms} errors={actionData?.errors} />
      </div>

      <div className="p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-400 mb-4">Recycling History</h2>
        {allRecyclingRecords.length === 0 ? (
          <p className="text-gray-600">No recycling records found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {allRecyclingRecords.map((record) => (
              <li key={record.id} className="py-3">
                <p className="text-lg font-medium text-gray-200">{record.student?.name} ({record.student?.email}) - {record.item} ({record.weight}g)</p>
                <p className="text-sm text-gray-500">Classroom: {record.classroom?.name} - Recycled At: {record.recycledAt ? new Date(record.recycledAt).toLocaleString() : "Unknown"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}