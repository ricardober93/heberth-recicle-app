import { Form } from "@remix-run/react";

interface RecyclingFormProps {
  students: { id: number; name: string; email: string; classroom?: { name: string } }[];
  classrooms: { id: number; name: string }[];
  errors?: {
    studentId?: string[];
    classroomId?: string[];
    item?: string[];
    weight?: string[];
    _global?: string[];
  };
}

export default function RecyclingForm({ students, classrooms, errors }: RecyclingFormProps) {
  return (
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
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.email}) - {student.classroom?.name}
            </option>
          ))}
        </select>
        {errors?.studentId && (
          <p className="text-red-500 text-xs mt-1">{errors.studentId[0]}</p>
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
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
        {errors?.classroomId && (
          <p className="text-red-500 text-xs mt-1">{errors.classroomId[0]}</p>
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
        {errors?.item && (
          <p className="text-red-500 text-xs mt-1">{errors.item[0]}</p>
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
        {errors?.weight && (
          <p className="text-red-500 text-xs mt-1">{errors.weight[0]}</p>
        )}
      </div>
      {errors?._global && (
        <p className="text-red-500 text-xs mt-1">{errors._global[0]}</p>
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
  );
}