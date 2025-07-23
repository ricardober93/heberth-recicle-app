'use client';

import { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Table from '../../../components/Table';

interface Grado {
  id: number;
  nombre: string;
}

export default function GradoPage() {
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nombre: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Cargar grados
  const fetchGrados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grados');
      if (!response.ok) throw new Error('Error al cargar los grados');
      const data = await response.json();
      setGrados(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los grados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrados();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      const url = editingId ? `/api/grados/${editingId}` : '/api/grados';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar el grado');

      // Actualizar la lista de grados
      await fetchGrados();
      
      // Resetear el formulario
      setFormData({ nombre: '' });
      setEditingId(null);
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el grado');
    } finally {
      setLoading(false);
    }
  };

  // Editar un grado
  const handleEdit = (grado: Grado) => {
    setFormData({ nombre: grado.nombre });
    setEditingId(grado.id);
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({ nombre: '' });
    setEditingId(null);
    setError('');
  };

  // Eliminar un grado
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este grado?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/grados/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el grado');

      // Actualizar la lista de grados
      await fetchGrados();
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el grado');
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (row: Grado) => (
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
      <h1 className="text-2xl font-bold text-green-700">Gestión de Grados</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title={editingId ? 'Editar Grado' : 'Nuevo Grado'}>
            <form onSubmit={handleSubmit}>
              <Input
                label="Nombre del Grado"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Primero, Segundo, etc."
                error={error}
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
          <Card title="Lista de Grados">
            {loading && <p className="text-center py-4">Cargando...</p>}
            {!loading && grados.length === 0 && (
              <p className="text-center py-4 text-gray-500">No hay grados registrados</p>
            )}
            {!loading && grados.length > 0 && (
              <Table columns={columns} data={grados} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}