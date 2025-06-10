import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server";
import { db } from "~/db";
import { students, classrooms } from "~/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";


export const meta: MetaFunction = () => {
  return [{
    title: "Students",
    description: "Manage students",
  }];
};

const CreateStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  classroomId: z.string().min(1, "Classroom is required"),
});

export async function action({ request }: ActionFunctionArgs) {

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "createStudent") {
    const submission = CreateStudentSchema.safeParse(Object.fromEntries(formData));

    if (!submission.success) {
      return ({ errors: submission.error.flatten().fieldErrors });
    }

    const { name, email, classroomId } = submission.data;

    try {
      await db.insert(students).values({
        name,
        email,
        classroomId: parseInt(classroomId),
      });
      return redirect("/students");
    } catch (error: unknown) {
      if (error.code === "23505") {
        return ({ errors: { email: ["Email already exists"] } });
      }
      return ({ errors: { _global: ["Failed to create student"] } });
    }
  } else if (intent === "deleteStudent") {
    const studentId = formData.get("studentId");
    if (typeof studentId !== "string" || studentId.length === 0) {
      return ({ errors: { _global: ["Student ID is required"] }});
    }
    try {
      await db.delete(students).where(eq(students.id, parseInt(studentId)));
      return redirect("/students");
    } catch (error) {
      return ({ errors: { _global: ["Failed to delete student"] }  });
    }
  }

  return ({ errors: { _global: ["Invalid intent"] } });
}



export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const allClassrooms = await db.select().from(classrooms);
  const allStudents = await db.select({
    id: students.id,
    name: students.name,
    email: students.email,
    classroomId: students.classroomId,
    classroom: {
      name: classrooms.name,
    },
  }).from(students).leftJoin(classrooms, eq(students.classroomId, classrooms.id));

  return ({ user, allClassrooms, allStudents });
}

export default function Students() {
  const { user, allClassrooms, allStudents } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Students Page</h1>
      {user && (
        <p className="text-gray-100 mb-4">Welcome, {user.email}!</p>
      )}

      <div className="p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Create New Student</h2>
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {actionData?.errors?.name && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.name[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.email[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="classroomId" className="block text-sm font-medium text-gray-700">Classroom</label>
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
          {actionData?.errors?._global && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors._global[0]}</p>
          )}
          <button
            type="submit"
            name="intent"
            value="createStudent"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Student
          </button>
        </Form>
      </div>

      <div className=" p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Existing Students</h2>
        {allStudents.length === 0 ? (
          <p className="text-gray-200">No students found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {allStudents.map((student) => (
              <li key={student.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-200">{student.name} ({student.email})</p>
                  <p className="text-sm text-gray-100">Classroom: {student?.classroom?.name}</p>
                </div>
                <Form method="post">
                  <input type="hidden" name="_action" value="deleteStudent" />
                  <input type="hidden" name="studentId" value={student.id} />
                  <button
                    type="submit"
                    className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}