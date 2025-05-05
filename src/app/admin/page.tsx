// src/app/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";

// Define interfaces based on Prisma schema
interface Classroom {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  classroomId: string;
}

export default function AdminPage() {
  const [classroomName, setClassroomName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Fetch classrooms and students on component mount
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const response = await fetch("/api/classrooms");
      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);

    const url = new URL("/api/students", window.location.origin);

    url.searchParams.set("classroomId", selectedClassroomId);

    try {
      const response = await fetch(url, {
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomName) return;
    try {
      // TODO: Implement API endpoint to create classroom
      const response = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: classroomName }),
      });
      if (response.ok) {
        setClassroomName("");
        fetchClassrooms(); // Refresh list
      }
      console.log("Creating classroom:", classroomName); // Placeholder
      setClassroomName(""); // Placeholder
      fetchClassrooms(); // Placeholder
    } catch (error) {
      console.error("Error creating classroom:", error);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !selectedClassroomId) return;
    try {
      // TODO: Implement API endpoint to create student
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName,
          classroomId: selectedClassroomId,
        }),
      });
      if (response.ok) {
        setStudentName("");
        setSelectedClassroomId("");
        fetchStudents(); // Refresh list
      }
      console.log(
        "Creating student:",
        studentName,
        "in classroom:",
        selectedClassroomId
      ); // Placeholder
      setStudentName(""); // Placeholder
      setSelectedClassroomId(""); // Placeholder
      fetchStudents(); // Placeholder
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  useEffect(() => {
    if (selectedClassroomId) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClassroomId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administración</h1>

      {/* Crear Salón */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Crear Salón</h2>
        <form onSubmit={handleCreateClassroom} className="flex gap-2">
          <input
            type="text"
            value={classroomName}
            onChange={(e) => setClassroomName(e.target.value)}
            placeholder="Nombre del Salón"
            className="border p-2 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Crear Salón
          </button>
        </form>
      </section>

      {/* Crear Estudiante */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Crear Estudiante</h2>
        <form onSubmit={handleCreateStudent} className="flex flex-col gap-2  ">
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Nombre del Estudiante"
            className="border p-2 rounded"
            required
          />
          <select
            id="classroomSelect"
            aria-label={"classroomSelect"}
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="border p-2 rounded"
            required
          >
            <option value="" disabled className="text-gray-100">
              Selecciona un Salón
            </option>
            {loadingClassrooms ? (
              <option disabled>Cargando salones...</option>
            ) : (
              classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id} className="text-black">
                  {classroom.name}
                </option>
              ))
            )}
          </select>
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Crear Estudiante
          </button>
        </form>
      </section>

      {/* Listar Salones (Opcional en admin) */}
      {/* ... */}

      {/* Listar Estudiantes (Opcional en admin) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Lista de Estudiantes</h2>
        {loadingStudents ? (
          <p>Cargando estudiantes...</p>
        ) : students.length > 0 ? (
          <ul className="space-y-2">
            {students.map((student) => (
              <li key={student.id} className="border p-3 rounded shadow-sm">
                <span className="font-medium">{student.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay estudiantes en este salón.</p>
        )}
      </section>
    </div>
  );
}
