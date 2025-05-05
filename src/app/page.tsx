// src/app/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';

// Define interfaces based on Prisma schema
interface Classroom {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  classroomId: string;
  recyclingRecords: RecyclingRecord[]; // Include records for display
}

interface RecyclingRecord {
  id: string;
  kilos: number;
  date: string; // Or Date object if preferred
  studentId: string;
}

export default function HomePage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [kilos, setKilos] = useState<string>('');
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch classrooms on component mount
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Fetch students when a classroom is selected
  useEffect(() => {
    if (selectedClassroom) {
      fetchStudentsByClassroom(selectedClassroom);
    } else {
      setStudents([]); // Clear students if no classroom is selected
    }
  }, [selectedClassroom]);

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

  const fetchStudentsByClassroom = async (classroomId: string) => {
    setLoadingStudents(true);
    try {
      // TODO: Implement API endpoint to fetch students by classroom
      const response = await fetch(`/api/students?classroomId=${classroomId}`);
      const data = await response.json();
      console.log(data);
      
      setStudents(data);
      console.log(`Fetching students for classroom ${classroomId}...`); // Placeholder
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]); // Placeholder
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddRecycling = async (e: FormEvent) => {
    e.preventDefault();
    const kilosValue = parseFloat(kilos);
    if (!selectedStudent || isNaN(kilosValue) || kilosValue <= 0) {
      alert('Por favor, selecciona un estudiante e ingresa una cantidad válida de kilos.');
      return;
    }

    try {
      // TODO: Implement API endpoint to add recycling record
       const response = await fetch('/api/recycling', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ studentId: selectedStudent, kilos: kilosValue }),
       });
       if (response.ok) {
         setKilos('');
         setSelectedStudent(''); // Optionally reset student selection
         fetchStudentsByClassroom(selectedClassroom); // Refresh student list
         alert('Registro agregado!');
       }
      console.log(`Adding ${kilosValue}kg for student ${selectedStudent}`); // Placeholder
      setKilos(''); // Placeholder
      setSelectedStudent(''); // Placeholder
      fetchStudentsByClassroom(selectedClassroom); // Placeholder
      alert('Registro agregado (simulado)!'); // Placeholder
    } catch (error) {
      console.error('Error adding recycling record:', error);
      alert('Error al agregar el registro.');
    }
  };

  // Helper function to calculate total kilos per student
  const getTotalKilos = (student: Student): number => {
    // TODO: Implement actual calculation when API is ready
     return student.recyclingRecords.reduce((sum, record) => sum + record.kilos, 0);
    return 0; // Placeholder
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registro de Reciclaje</h1>

      {/* Selector de Salón */}
      <section className="mb-6">
        <label htmlFor="classroom-select" className="block text-lg font-medium mb-2">Selecciona un Salón:</label>
        <select
          id="classroom-select"
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
          disabled={loadingClassrooms}
        >
          <option value="">{loadingClassrooms ? 'Cargando...' : '-- Selecciona --'}</option>
          ¨{
            JSON.stringify(classrooms)
          }
          { classrooms && classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id} className='text-black'>
                  {classroom.name}
                </option>
              ))}
        </select>
      </section>

      {/* Lista de Estudiantes y Formulario de Reciclaje */}
      {selectedClassroom && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Estudiantes</h2>
          {loadingStudents ? (
            <p>Cargando estudiantes...</p>
          ) : students.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {/* Lista de Estudiantes */}
              <div>
                <ul className="space-y-2">
                  {students.map((student) => (
                    <li key={student.id} className="border p-3 rounded shadow-sm">
                      <span className="font-medium">{student.name}</span>
                      {/* TODO: Display total kilos when API is ready */}
                       <span className="text-gray-600"> - {getTotalKilos(student).toFixed(2)} kg</span> 
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulario para Agregar Kilos */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Agregar Kilos de Reciclaje</h3>
                <form onSubmit={handleAddRecycling} className="flex flex-col gap-3 p-4 border rounded shadow-sm bg-gray-50 text-black">
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="">-- Selecciona Estudiante --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={kilos}
                    onChange={(e) => setKilos(e.target.value)}
                    placeholder="Kilos"
                    className="border p-2 rounded w-full"
                    required
                  />
                  <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                    Agregar Registro
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <p>No hay estudiantes en este salón.</p>
          )}
        </section>
      )}
    </div>
  );
}
