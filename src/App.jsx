import { useEffect, useState } from 'react';
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa';

function App() {
  const [menu, setMenu] = useState([]);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    fetch('/menu.json')
      .then((res) => res.json())
      .then((data) => setMenu(data));
  }, []);

  const agregarAlCarrito = (plato) => {
    const existente = carrito.find(item => item.id === plato.id);
    if (existente) {
      setCarrito(
        carrito.map(item =>
          item.id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito([...carrito, { ...plato, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div style={styles.container}>
      {/* Logo */}
      <img src="../src/logo.png" alt="Logo del restaurante" style={styles.logo} />
      <h1 style={styles.titulo}>Restaurante El Sabor</h1>

      {/* Menú */}
      <h2 style={styles.subtitulo}>Menú</h2>
      <ul style={styles.lista}>
        {menu.map((plato) => (
          <li key={plato.id} style={styles.item}>
            <span>{plato.nombre} - ${plato.precio.toLocaleString()}</span>
            <button onClick={() => agregarAlCarrito(plato)} style={styles.botonAgregar}>
              Agregar
            </button>
          </li>
        ))}
      </ul>

      {/* Carrito */}
      <h2 style={styles.subtitulo}>
        <FaShoppingCart style={{ marginRight: 8 }} />
        Carrito
      </h2>
      <ul style={styles.lista}>
        {carrito.map((item) => (
          <li key={item.id} style={styles.item}>
            <span>{item.nombre} x{item.cantidad} - ${item.precio * item.cantidad}</span>
            <button onClick={() => eliminarDelCarrito(item.id)} style={styles.botonEliminar}>
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
    fontFamily: 'sans-serif',
    maxWidth: 600,
    margin: '0 auto',
    textAlign: 'center',
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  titulo: {
    marginBottom: 20,
  },
  subtitulo: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: '1.5em',
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
  },
  botonAgregar: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 5,
    cursor: 'pointer',
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
};

export default App;