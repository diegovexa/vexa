# Vexa - Catálogo Mayorista

Catálogo mayorista de productos capilares Vexa con panel de administración, pedidos por WhatsApp y base de datos en Supabase.

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

---

## 1. Configurar Supabase

1. Crear un proyecto nuevo en Supabase
2. Ir a **SQL Editor** en el dashboard
3. Abrir el archivo `supabase-schema.sql` de este repo y copiar **todo** su contenido
4. Pegar en el SQL Editor y hacer clic en **Execute** (o presionar Ctrl+Enter)
5. Esto crea:
   - Tabla `productos` con 20 productos Vexa de prueba
   - Tabla `pedidos` para los pedidos de clientes
   - Tabla `config` con la configuración del catálogo
   - Bucket `productos` en Storage para imágenes
   - Políticas RLS (lectura pública, escritura solo admin)
6. Ir a **Authentication > Users** → crear un usuario con email y contraseña (este será tu login de admin)
7. Ir a **Settings > API** y copiar:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)

---

## 2. Ejecutar en local

```bash
# Clonar el repo
git clone <url-del-repo>
cd catalogo-mayorista

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env.local
```

Editar `.env.local` con tus datos de Supabase:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abrir en el navegador:
- **Catálogo:** http://localhost:5173
- **Admin:** http://localhost:5173/#/admin

---

## 3. Deploy en Vercel

1. Crear un repo en GitHub y subir el código
2. Ir a [vercel.com](https://vercel.com) → New Project → importar el repo
3. En **Environment Variables** agregar:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
4. Dejar el resto de configuración por defecto (Vite detection es automática)
5. Hacer clic en **Deploy**
6. Listo. Vercel deploya automáticamente en cada push a `main`

---

## Estructura del proyecto

```
catalogo-mayorista/
├── supabase-schema.sql        # SQL para crear tablas en Supabase
├── vercel.json                # Configuración de deploy en Vercel
├── src/
│   ├── config/
│   │   └── supabase.js        # Cliente de Supabase
│   ├── context/
│   │   └── AppContext.jsx     # Estado global (auth, productos, pedidos)
│   ├── data/
│   │   └── store.js           # Constantes (líneas, tipos, tamaños, precios)
│   ├── pages/
│   │   ├── Catalogo.jsx       # Catálogo público (lo que ven los clientes)
│   │   └── Admin.jsx          # Panel de administración
│   ├── services/
│   │   ├── productsService.js # CRUD de productos + upload de imágenes
│   │   ├── ordersService.js   # CRUD de pedidos
│   │   └── configService.js   # Configuración del catálogo
│   ├── App.jsx                # Router principal
│   └── main.jsx               # Entry point
└── index.html
```

---

## Funcionalidades

### Catálogo público (`/`)
- Productos agrupados por línea (Argan Recovery, Biotina Therapy, etc.)
- Filtros por línea, tipo y búsqueda por texto
- Carrito de compras con cantidades
- Envío de pedido por WhatsApp con resumen detallado
- Responsive (mobile-first)

### Panel de administración (`/#/admin`)
- **Login** con email y contraseña (Supabase Auth)
- **Productos:** crear, editar, eliminar, subir imágenes, activar/desactivar
- **Pedidos:** ver pedidos, cambiar estado (pendiente → confirmado → enviado), enviar confirmación por WhatsApp
- **Configuración:** nombre del negocio, teléfono, precio visible en catálogo, moneda, pedido mínimo, mensaje de bienvenida

### Pedidos
- Los clientes envían el pedido por WhatsApp
- El admin ve todos los pedidos en el panel
- Puede confirmar y enviar notificación por WhatsApp

---

## Productos incluidos

El SQL carga 20 productos reales de Vexa:

| Línea | Productos |
|---|---|
| Argan Recovery | Shampoo (1000ml, 250ml), Máscara (1000gr, 270gr), Ampollas |
| Biotina Therapy | Shampoo (1000ml, 250ml), Máscara (1000gr, 270gr), Ampollas (próximamente) |
| Keratina Revitalize | Shampoo (1000ml, 250ml), Máscara (1000gr, 270gr), Ampollas |
| Neutro Balance | Shampoo (1000ml, 250ml) |
| Extra Acida Intense | Máscara (1000gr, 270gr) |

Los productos con precio 0 son tamaños secundarios que se incluyen en el precio del tamaño principal.

---

## Comandos útiles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```
