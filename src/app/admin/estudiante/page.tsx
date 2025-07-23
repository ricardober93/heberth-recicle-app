'use client';

import { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Table from '../../../components/Table';

interface Salon {
  id: number;
  nombre: string;
  gradoNombre?: string;
}

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  salonId: number;
  salonNombre?: string;
  totalReciclaje?: number;
}

export default function EstudiantePage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    salonId: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState({ nombre: '', apellido: '', salonId: '' });

  // Cargar estudiantes y salones
  const fetchData = async () => {
    try {
      setLoading(true);
      const [estudiantesRes, salonesRes] = await Promise.all([
        fetch('/api/estudiantes'),
        fetch('/api/salones')
      ]);

      if (!estudiantesRes.ok) throw new Error('Error al cargar los estudiantes');
      if (!salonesRes.ok) throw new Error('Error al cargar los salones');

      const estudiantesData = await estudiantesRes.json();
      const salonesData = await salonesRes.json();

      setEstudiantes(estudiantesData);
      setSalones(salonesData);
    } catch (error) {
      console.error('Error:', error);
      setError({ ...error, nombre: 'Error al cargar los datos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: '' });
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = { nombre: '', apellido: '', salonId: '' };
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.salonId) {
      newErrors.salonId = 'El salón es requerido';
    }
    
    setError(newErrors);
    return !newErrors.nombre && !newErrors.apellido && !newErrors.salonId;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = editingId ? `/api/estudiantes/${editingId}` : '/api/estudiantes';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          salonId: parseInt(formData.salonId)
        }),
      });

      if (!response.ok) throw new Error('Error al guardar el estudiante');

      // Actualizar la lista de estudiantes
      await fetchData();
      
      // Resetear el formulario
      setFormData({ nombre: '', apellido: '', salonId: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
      setError({ ...error, nombre: 'Error al guardar el estudiante' });
    } finally {
      setLoading(false);
    }
  };

  // Editar un estudiante
  const handleEdit = (estudiante: Estudiante) => {
    setFormData({
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      salonId: estudiante.salonId.toString()
    });
    setEditingId(estudiante.id);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({ nombre: '', apellido: '', salonId: '' });
    setEditingId(null);
    setError({ nombre: '', apellido: '', salonId: '' });
  };

  // Cancelar edición
  const handleCancel = () => {
    resetForm();
  };

  // Eliminar un estudiante
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/estudiantes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el estudiante');

      // Actualizar la lista de estudiantes
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
      setError({ ...error, nombre: 'Error al eliminar el estudiante' });
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Apellido', accessor: 'apellido' },
    { header: 'Salón', accessor: 'salonNombre' },
    {
      header: 'Total Reciclaje',
      accessor: 'totalReciclaje',
      cell: (row: Estudiante) => (
        <span>{row.totalReciclaje ? `${row.totalReciclaje.toFixed(2)} kg` : '0.00 kg'}</span>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (row: Estudiante) => (
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleEdit(row)}
          >
            Editar
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleDelete(row.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Gestión de Estudiantes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title={editingId ? 'Editar Estudiante' : 'Nuevo Estudiante'}>
            <form onSubmit={handleSubmit}>
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre del estudiante"
                error={error.nombre}
              />

              <Input
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellido del estudiante"
                error={error.apellido}
              />

              <Select
                label="Salón"
                name="salonId"
                value={formData.salonId}
                onChange={handleChange}
                options={salones.map(salon => ({
                  value: salon.id,
                  label: `${salon.nombre} - ${salon.gradoNombre}`
                }))}
                error={error.salonId}
              />

              <div className="flex justify-end space-x-2 mt-4">
                {editingId && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                )}
                <Button 
                  type="submit" 
                  isLoading={loading}
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Lista de Estudiantes">
            {loading && <p className="text-center py-4">Cargando...</p>}
            {!loading && estudiantes.length === 0 && (
              <p className="text-center py-4 text-gray-500">No hay estudiantes registrados</p>
            )}
            {!loading && estudiantes.length > 0 && (
              <Table columns={columns} data={estudiantes} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}