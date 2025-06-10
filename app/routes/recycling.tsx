import type { ActionFunctionArgs, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser, requireUserId } from "~/session.server";
import { db } from "~/db";
import { students, recycling, classrooms } from "~/db/schema";
import { z } from "zod";
import { eq, like } from "drizzle-orm";

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

export async function action({ request }: ActionFunctionArgs) {
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
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-scree p-6">
      <h1 className="text-3xl font-bold text-gray-300 mb-6">Recycling Page</h1>
      {user && (
        <p className="text-gray-300 mb-4">Welcome, {user.email}!</p>
      )}

      <div className="p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Record Recycling</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="recordRecycling" />
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-300">Select Student</label>
            <select
              id="studentId"
              name="studentId"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a student</option>
              {studentsList.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email}) - {student.classroom?.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.studentId && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.studentId[0]}</p>
            )}
          </div>



          <div>
            <label htmlFor="classroomId" className="block text-sm font-medium text-gray-300">Classroom</label>
            <select
              id="classroomId"
              name="classroomId"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a classroom</option>
              {allClassrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.classroomId && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.classroomId[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="item" className="block text-sm font-medium text-gray-300">Item</label>
            <input
              type="text"
              id="item"
              name="item"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {actionData?.errors?.item && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.item[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-300">Weight (grams)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {actionData?.errors?.weight && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.weight[0]}</p>
            )}
          </div>
          {actionData?.errors?._global && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors._global[0]}</p>
          )}
          <button
            type="submit"
            name="intent"
            value="recordRecycling"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Record Recycling
          </button>
        </Form>
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
                <p className="text-sm text-gray-500">Classroom: {record.classroom?.name} - Recycled At: {new Date(record?.recycledAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}