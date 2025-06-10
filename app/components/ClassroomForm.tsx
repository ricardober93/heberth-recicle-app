import { Form } from "@remix-run/react";

interface ClassroomFormProps {
  errors?: {
    name?: string;
    general?: string;
  };
}

export default function ClassroomForm({ errors }: ClassroomFormProps) {
  return (
    <Form method="post" className="space-y-4 mt-4">
      <input type="hidden" name="intent" value="create" />
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Classroom Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
        {errors?.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>
      {errors?.general && (
        <p className="text-red-500 text-xs mt-1">{errors.general}</p>
      )}
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Classroom
      </button>
    </Form>
  );
}