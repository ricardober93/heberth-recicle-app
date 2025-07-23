#negocio del proyecto 
Sera un aplicacion para poder tener una lista de estudiantes, que sea de salones y de ciertos grado, yo deberia crear un grado, luego un salon de ese grado, y luego asignarle estudiantes al salon.
en la pagina principal podre adingarle una cantidad de reciclaje.
en la pagina principal tendria que listar el total de reciclaje que tiene el salon y los tres primeros estudiantes.


#estructura del proyecto
manten la siguiente estructura de carpetas:
- src
  - components
    - Header.tsx
    - Footer.tsx
    - Card.tsx
  - app
    - Home.tsx
     layout.tsx
    - admin
      - Grado.tsx
      - Salon.tsx
      - Estudiante.tsx
  - utils
    - db.ts
  - models
    - grado.ts
    - salon.ts
    - estudiante.ts


    utiliza drizzle para que te conectes a ua base da datos de neon. crea el archivo .env y espera a que cargue la url.
    tambien usa drizzle para conectate a la base de datos
