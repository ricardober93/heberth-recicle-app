import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { getUser } from "~/session.server";
import { db } from "~/db";
import { classrooms } from "~/db/schema";
import { eq } from "drizzle-orm";
import ClassroomForm from "../components/ClassroomForm";

export async function loader({ request }: LoaderFunctionArgs) {

  const user = await getUser(request);

  const allClassrooms = await db.select().from(classrooms);
  return { user, allClassrooms };
}

export async function action({ request }: ActionFunctionArgs) {

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const classroomId = formData.get("classroomId");
    if (typeof classroomId !== "string" || classroomId.length === 0) {
      return ({ errors: { classroomId: "Classroom ID is required" }  });
    }
    await db.delete(classrooms).where(eq(classrooms.id, Number(classroomId)));
    return redirect("/classrooms");
  } else if (intent === "create") {
    const name = formData.get("name");
    if (typeof name !== "string" || name.length === 0) {
      return ({ errors: { name: "Name is required" } });
    }
    await db.insert(classrooms).values({ name });
    formData.delete("name");
    return redirect("/classrooms");
  }

  return ({ errors: { general: "Invalid intent" } });
}

export default function Classrooms() {
  const { user, allClassrooms } = useLoaderData<typeof loader>();
  const actionData = useActionData< typeof action>();

  return (
    <div>
      <h1 className="text-2xl font-bold">Classrooms Page</h1>
      <p>Welcome, {user?.email}!</p>

      <h2 className="text-xl font-bold mt-8">Create New Classroom</h2>
      <ClassroomForm errors={actionData?.errors} />

      <h2 className="text-xl font-bold mt-8">Existing Classrooms</h2>
      {allClassrooms.length === 0 ? (
        <p>No classrooms created yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {allClassrooms.map((classroom) => (
            <li key={classroom.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center">
              <span>{classroom.name}</span>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="classroomId" value={classroom.id} />
                <button
                  type="submit"
                  className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-1 px-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </Form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}