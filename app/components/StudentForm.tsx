import { Form } from "@remix-run/react";

interface StudentFormProps {
  classrooms: { id: number; name: string }[];
  errors?: {
    name?: string[];
    email?: string[];
    classroomId?: string[];
    _global?: string[];
  };
}

export default function StudentForm({ classrooms, errors }: StudentFormProps) {
  return (
    <Form method="post" className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors?.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
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
        {errors?.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
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
      {errors?._global && (
        <p className="text-red-500 text-xs mt-1">{errors._global[0]}</p>
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
  );
}