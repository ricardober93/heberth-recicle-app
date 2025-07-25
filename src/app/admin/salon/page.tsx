'use client';

import { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Table from '../../../components/Table';
import { AdminPageGuard } from '@/utils/auth';

interface Grado {
  id: number;
  nombre: string;
}

interface Salon {
  id: number;
  nombre: string;
  gradoId: number;
  gradoNombre?: string;
}

function SalonPageContent() {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', gradoId: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState({ nombre: '', gradoId: '' });

  // Cargar salones y grados
  const fetchData = async () => {
    try {
      setLoading(true);
      const [salonesRes, gradosRes] = await Promise.all([
        fetch('/api/salones'),
        fetch('/api/grados')
      ]);

      if (!salonesRes.ok) throw new Error('Error al cargar los salones');
      if (!gradosRes.ok) throw new Error('Error al cargar los grados');

      const salonesData = await salonesRes.json();
      const gradosData = await gradosRes.json();

      setSalones(salonesData);
      setGrados(gradosData);
    } catch (error) {
      console.error('Error:', error);
      setError({ nombre: 'Error al cargar los datos', gradoId: '' });
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
    const newErrors = { nombre: '', gradoId: '' };
    let isValid = true;

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.gradoId) {
      newErrors.gradoId = 'Debe seleccionar un grado';
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = editingId ? `/api/salones/${editingId}` : '/api/salones';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gradoId: parseInt(formData.gradoId)
        }),
      });

      if (!response.ok) throw new Error('Error al guardar el salón');

      // Actualizar la lista de salones
      await fetchData();
      
      // Resetear el formulario
      setFormData({ nombre: '', gradoId: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
      setError({ nombre: 'Error al guardar el salón', gradoId: '' });
    } finally {
      setLoading(false);
    }
  };

  // Editar un salón
  const handleEdit = (salon: Salon) => {
    setFormData({ 
      nombre: salon.nombre, 
      gradoId: salon.gradoId.toString() 
    });
    setEditingId(salon.id);
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({ nombre: '', gradoId: '' });
    setEditingId(null);
    setError({ nombre: '', gradoId: '' });
  };

  // Eliminar un salón
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este salón?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/salones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el salón');

      // Actualizar la lista de salones
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
      setError({ nombre: 'Error al eliminar el salón', gradoId: '' });
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Grado', accessor: 'gradoNombre' },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (row: Salon) => (
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
      <h1 className="text-2xl font-bold text-green-700">Gestión de Salones</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title={editingId ? 'Editar Salón' : 'Nuevo Salón'}>
            <form onSubmit={handleSubmit}>
              <Input
                label="Nombre del Salón"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: A, B, C, etc."
                error={error.nombre}
              />

              <Select
                label="Grado"
                name="gradoId"
                value={formData.gradoId}
                onChange={handleChange}
                options={grados.map(grado => ({
                  value: grado.id,
                  label: grado.nombre
                }))}
                error={error.gradoId}
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
          <Card title="Lista de Salones">
            {loading && <p className="text-center py-4">Cargando...</p>}
            {!loading && salones.length === 0 && (
              <p className="text-center py-4 text-gray-500">No hay salones registrados</p>
            )}
            {!loading && salones.length > 0 && (
              <Table columns={columns} data={salones} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SalonPage() {
  return (
    <AdminPageGuard>
      <SalonPageContent />
    </AdminPageGuard>
  );
}