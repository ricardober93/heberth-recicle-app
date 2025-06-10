import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/db";
import { students, recycling, classrooms } from "~/db/schema";
import { eq, sum, desc } from "drizzle-orm";

export const meta: MetaFunction = () => {
  return [
    { title: "Recicly Dashboard" },
    {
      name: "description",
      content: "Dashboard showing top recycling students",
    },
  ];
};

export async function loader() {
  const topStudents =
    (await db
      .select({
        studentId: recycling.studentId,
        studentName: sql<string | null>`students.name`,
        totalWeight: sum(recycling.weight),
      })
      .from(recycling)
      .leftJoin(students, eq(recycling.studentId, students.id))
      .groupBy(recycling.studentId, students.name)
      .orderBy(desc(sum(recycling.weight)))
      .limit(10)) || [];

  const totalRecycledWeight =
    (await db.select({ total: sum(recycling.weight) }).from(recycling)) || [];

  const recyclingByClassroom =
    (await db
      .select({
        classroomName: classrooms.name,
        totalWeight: sum(recycling.weight),
      })
      .from(recycling)
      .leftJoin(students, eq(recycling.studentId, students.id))
      .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
      .groupBy(classrooms.name)
      .orderBy(desc(sum(recycling.weight)))) || [];

  return {
    topStudents,
    totalRecycledWeight: totalRecycledWeight[0].total,
    recyclingByClassroom,
  };
}

export default function Index() {
  const { topStudents, totalRecycledWeight, recyclingByClassroom } =
    useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-300 mb-6">
        Recicly Dashboard
      </h1>

      <div className="p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Total Recycling
        </h2>
        <p className="text-lg font-medium text-gray-300">
          Total Recycled Weight: {totalRecycledWeight || 0}g
        </p>
      </div>

      <div className="p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Recycling by Classroom
        </h2>
        {recyclingByClassroom.length === 0 ? (
          <p className="text-gray-600">
            No recycling data available for classrooms yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recyclingByClassroom.map((classroom, index) => (
              <li
                key={index}
                className="py-3 flex items-center justify-between bg-gray-600 rounded-lg shadow-md p-4"
              >
                <div>
                  <p className="text-lg font-medium text-gray-300">
                    {classroom.classroomName}
                  </p>
                  <p className="text-sm text-gray-100">
                    Total Recycled: {classroom.totalWeight}g
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Top 10 Recycling Students
        </h2>
        {topStudents.length === 0 ? (
          <p className="text-gray-600">No recycling data available yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {topStudents.map((student, index) => (
              <li
                key={student.studentId}
                className="py-3 flex items-center justify-between bg-gray-600  rounded-lg shadow-md p-4"
              >
                <div>
                  <p className="text-lg font-medium text-gray-300">
                    {index + 1}. {student.studentName}
                  </p>
                  <p className="text-sm text-gray-100">
                    Total Recycled: {student.totalWeight}g
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
