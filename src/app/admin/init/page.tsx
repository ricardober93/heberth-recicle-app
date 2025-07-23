'use client';

import { useState } from 'react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';

export default function InitPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Base de datos inicializada correctamente');
        setIsSuccess(true);
      } else {
        setMessage(data.error || 'Error al inicializar la base de datos');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error de conexión');
      setIsSuccess(false);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Inicializar Base de Datos</h1>
      
      <Card>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Configuración Inicial</h2>
          <p className="text-gray-600 mb-6">
            Este proceso creará las tablas necesarias en la base de datos y agregará datos de ejemplo.
          </p>
          
          <Button
            onClick={handleInitialize}
            isLoading={isInitializing}
            variant="primary"
            size="lg"
          >
            {isInitializing ? 'Inicializando...' : 'Inicializar Base de Datos'}
          </Button>
          
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}