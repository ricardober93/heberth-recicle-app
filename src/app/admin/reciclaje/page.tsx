'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Table from '@/components/Table';
import { AdminPageGuard } from '@/utils/auth';

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  salonId: number;
  salonNombre?: string;
}

interface Reciclaje {
  id: number;
  cantidad: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteApellido: string;
  fecha: string;
  createdAt: string;
}

function ReciclajePageContent() {
  const [reciclajes, setReciclajes] = useState<Reciclaje[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cantidad: '',
    estudianteId: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState({ cantidad: '', estudianteId: '' });

  // Cargar reciclajes y estudiantes
  const fetchData = async () => {
    try {
      setLoading(true);
      const [reciclajesRes, estudiantesRes] = await Promise.all([
        fetch('/api/reciclaje'),
        fetch('/api/estudiantes')
      ]);

      if (!reciclajesRes.ok || !estudiantesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [reciclajesData, estudiantesData] = await Promise.all([
        reciclajesRes.json(),
        estudiantesRes.json()
      ]);

      setReciclajes(reciclajesData);
      setEstudiantes(estudiantesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newError = { cantidad: '', estudianteId: '' };
    let isValid = true;

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newError.cantidad = 'La cantidad debe ser mayor a 0';
      isValid = false;
    }

    if (!formData.estudianteId) {
      newError.estudianteId = 'Debe seleccionar un estudiante';
      isValid = false;
    }

    setError(newError);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = editingId ? `/api/reciclaje/${editingId}` : '/api/reciclaje';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el reciclaje');
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el reciclaje');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reciclaje: Reciclaje) => {
    setFormData({
      cantidad: reciclaje.cantidad.toString(),
      estudianteId: reciclaje.estudianteId.toString(),
      fecha: reciclaje.fecha.split('T')[0]
    });
    setEditingId(reciclaje.id);
  };

  const resetForm = () => {
    setFormData({
      cantidad: '',
      estudianteId: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setError({ cantidad: '', estudianteId: '' });
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro de reciclaje?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/reciclaje/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar el reciclaje');

      await fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el reciclaje');
    } finally {
      setLoading(false);
    }
  };

  const estudiantesOptions = estudiantes.map(estudiante => ({
    value: estudiante.id.toString(),
    label: `${estudiante.nombre} ${estudiante.apellido} - ${estudiante.salonNombre || 'Sin salón'}`
  }));

  const reciclajesTableData = reciclajes.map(reciclaje => ({
    id: reciclaje.id,
    estudiante: `${reciclaje.estudianteNombre} ${reciclaje.estudianteApellido}`,
    cantidad: `${reciclaje.cantidad} kg`,
    fecha: new Date(reciclaje.fecha).toLocaleDateString('es-ES'),
    acciones: (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleEdit(reciclaje)}
          disabled={loading}
        >
          Editar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(reciclaje.id)}
          disabled={loading}
        >
          Eliminar
        </Button>
      </div>
    )
  }));

  if (loading && reciclajes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">
          Administrar Reciclaje
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card title={editingId ? 'Editar Reciclaje' : 'Registrar Reciclaje'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Estudiante"
              name="estudianteId"
              value={formData.estudianteId}
              onChange={handleChange}
              options={[
                { value: '', label: 'Seleccionar estudiante' },
                ...estudiantesOptions
              ]}
              error={error.estudianteId}
              required
            />

            <Input
              label="Cantidad (kg)"
              type="number"
              step="0.01"
              min="0.01"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              error={error.cantidad}
              placeholder="Ej: 2.5"
              required
            />

            <Input
              label="Fecha"
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Estadísticas */}
        <Card title="Estadísticas">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {reciclajes.reduce((total, r) => total + r.cantidad, 0).toFixed(2)} kg
              </div>
              <div className="text-gray-600">Total Reciclado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reciclajes.length}
              </div>
              <div className="text-gray-600">Registros Totales</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de reciclajes */}
      <Card title="Historial de Reciclaje">
        {reciclajes.length > 0 ? (
          <Table
            columns={[
              { header: 'Estudiante', accessor: 'estudiante' },
              { header: 'Cantidad', accessor: 'cantidad' },
              { header: 'Fecha', accessor: 'fecha' },
              { header: 'Acciones', accessor: 'acciones' }
            ]}
            data={reciclajesTableData}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay registros de reciclaje</p>
            <p className="text-sm text-gray-600">
              Comienza registrando el primer reciclaje
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ReciclajePage() {
  return (
    <AdminPageGuard>
      <ReciclajePageContent />
    </AdminPageGuard>
  );
}