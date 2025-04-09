import { useEffect, useState } from 'react';
import { FaShoppingCart, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [menu, setMenu] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [mostrarAlmuerzo, setMostrarAlmuerzo] = useState(true);
  const [mostrarEspecial, setMostrarEspecial] = useState(false);

  useEffect(() => {
    fetch('/menu.json')
      .then((res) => res.json())
      .then(setMenu)
      .catch((err) => console.error('Error cargando menú:', err));
  }, []);

  const seleccionarOpcion = (grupoId, opcion) => {
    const opcionConPrecio = {
      nombre: typeof opcion === 'object' ? opcion.nombre : opcion,
      precio: grupoId === 'especial' ? 20000 : (opcion.precio || 0)
    };

    setSelecciones((prev) => ({
      ...prev,
      [grupoId]: opcionConPrecio
    }));
  };

  const agregarAlCarrito = () => {
    const descripcion = [];
    let precioTotal = 0;

    menu.forEach(({ id, nombre }) => {
      const opcion = selecciones[id];
      if (opcion) {
        descripcion.push(`${nombre}: ${opcion.nombre}`);
        precioTotal += opcion.precio;
      }
    });

    if (selecciones['cubiertos']) {
      descripcion.push(`Cubiertos: ${selecciones['cubiertos'].nombre}`);
      if (selecciones['cubiertos'].nombre === 'Sí') {
        precioTotal += 1000;
      }
    }

    if (descripcion.length === 0) return;

    const nuevoItem = {
      id: `orden-${Date.now()}`,
      nombre: descripcion.join(', '),
      precio: precioTotal,
      cantidad: 1
    };

    setCarrito((prev) => [...prev, nuevoItem]);
    setSelecciones({});
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const menuNormal = menu.filter((item) => item.id !== 'especial');
  const menuEspecial = menu.find((item) => item.id === 'especial');

  const variants = {
    hidden: { height: 0, opacity: 0, overflow: 'hidden' },
    visible: { height: 'auto', opacity: 1, overflow: 'hidden', transition: { duration: 0.3 } },
    exit: { height: 0, opacity: 0, overflow: 'hidden', transition: { duration: 0.2 } }
  };

  return (
    <div style={styles.container}>
      <img src="../src/logo.png" alt="Logo del restaurante" style={styles.logo} />
      <h1 style={styles.titulo}>Menú del Restaurante</h1>

      <div style={styles.card}>
        <h2
          style={styles.desplegableTitulo}
          onClick={() => setMostrarAlmuerzo(!mostrarAlmuerzo)}
        >
          <span>🥗 Almuerzo del Día</span>
          {mostrarAlmuerzo ? <FaChevronUp /> : <FaChevronDown />}
        </h2>

        <AnimatePresence initial={false}>
          {mostrarAlmuerzo && (
            <motion.div
              key="almuerzo"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
            >
              {menuNormal.map(({ id, nombre, opciones }) => (
                <div key={id}>
                  <h3 style={styles.grupo}>{nombre}</h3>
                  {opciones.map((opcion, idx) => {
                    const opcionObj = typeof opcion === 'object' ? opcion : { nombre: opcion, precio: 0 };
                    const seleccionado = selecciones[id]?.nombre;
                    const isSelected = seleccionado === opcionObj.nombre;

                    return (
                      <label key={idx} style={styles.opcion}>
                        <input
                          type="radio"
                          name={`grupo-${id}`}
                          checked={isSelected}
                          onChange={() => seleccionarOpcion(id, opcionObj)}
                        />
                        {opcionObj.nombre}
                      </label>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {menuEspecial && (
        <div style={{ ...styles.card, borderColor: '#e91e63', background: '#f9f9f9' }}>
          <h2
            style={{ ...styles.desplegableTitulo, color: '#e91e63' }}
            onClick={() => setMostrarEspecial(!mostrarEspecial)}
          >
            <span>🍽️ Especial del Día</span>
            {mostrarEspecial ? <FaChevronUp /> : <FaChevronDown />}
          </h2>

          <AnimatePresence initial={false}>
            {mostrarEspecial && (
              <motion.div
                key="especial"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
              >
                <h3 style={styles.grupo}>{menuEspecial.nombre}</h3>
                {menuEspecial.opciones.map((opcion, idx) => {
                  const opcionObj = typeof opcion === 'object' ? opcion : { nombre: opcion, precio: 20000 };
                  const seleccionado = selecciones[menuEspecial.id]?.nombre;
                  const isSelected = seleccionado === opcionObj.nombre;

                  return (
                    <label key={idx} style={styles.opcion}>
                      <input
                        type="radio"
                        name={`grupo-${menuEspecial.id}`}
                        checked={isSelected}
                        onChange={() => seleccionarOpcion(menuEspecial.id, opcionObj)}
                      />
                      {opcionObj.nombre} - ${opcionObj.precio.toLocaleString()}
                    </label>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.subtitulo}>🧂 ¿Desea cubiertos y desechable?</h2>
        {['Sí', 'No'].map((opcion, idx) => (
          <label key={idx} style={styles.opcion}>
            <input
              type="radio"
              name="cubiertos"
              checked={selecciones['cubiertos']?.nombre === opcion}
              onChange={() =>
                seleccionarOpcion('cubiertos', { nombre: opcion, precio: opcion === 'Sí' ? 1000 : 0 })
              }
            />
            {opcion} {opcion === 'Sí' && '(+ $1.000)'}
          </label>
        ))}
      </div>

      <button onClick={agregarAlCarrito} style={styles.botonAgregar}>
        Agregar al carrito
      </button>

      <h2 style={styles.subtitulo}>
        <FaShoppingCart style={{ marginRight: 8 }} />
        Carrito
      </h2>
      <ul style={styles.lista}>
        {carrito.map(({ id, nombre, cantidad, precio }) => (
          <li key={id} style={styles.item}>
            <span>{nombre} x{cantidad} - ${precio * cantidad}</span>
            <button onClick={() => eliminarDelCarrito(id)} style={styles.botonEliminar}>
              <FaTrashAlt />
            </button>
          </li>
        ))}
      </ul>

      <h3>Total: ${total.toLocaleString()}</h3>

      {total > 0 && (
        <button
          onClick={() =>
            window.open(
              'https://clientes.nequi.com.co/recargas?_ga=2.144634032.449479165.1743980502-904981973.1743980502',
              '_blank'
            )
          }
          style={styles.botonPagar}
        >
          Pagar con Nequi
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    maxWidth: 700,
    margin: '0 auto',
    textAlign: 'center',
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  titulo: {
    marginBottom: 20,
    fontSize: '2em',
  },
  subtitulo: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: '1.5em',
  },
  grupo: {
    fontSize: '1.2em',
    marginBottom: 6,
    color: '#333',
  },
  card: {
    border: '2px solid #ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlign: 'left',
    background: '#f9f9f9',
  },
  opcion: {
    display: 'block',
    marginBottom: 8,
    paddingLeft: 10,
  },
  lista: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 8,
    background: '#fff',
  },
  botonAgregar: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: 5,
    cursor: 'pointer',
    marginTop: 20,
  },
  botonEliminar: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 5,
    cursor: 'pointer',
  },
  botonPagar: {
    marginTop: 20,
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#8f00ff',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  desplegableTitulo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1.5em',
    marginBottom: 10,
  },
};

export default App;