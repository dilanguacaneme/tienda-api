import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptyProduct = {
  nombre: "",
  precio: "",
  cantidad: "",
  totalProducto: "",
};

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onLogin(data);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">TIENDA DOÑA ROSA</p>
        <h1>Acceso al panel</h1>
        <p>Gestiona existencias y ventas desde un solo lugar.</p>
        <label>
          Usuario
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="alert error">{error}</p>}
        <button>Ingresar</button>
      </form>
    </main>
  );
}

function ProductForm({ selected, onSaved, onCancel }) {
  const [product, setProduct] = useState(selected || emptyProduct);
  const [error, setError] = useState("");
  useEffect(() => setProduct(selected || emptyProduct), [selected]);
  function change(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    const body = {
      ...product,
      precio: Number(product.precio),
      cantidad: Number(product.cantidad),
      totalProducto: Number(product.precio * product.cantidad),
    };
    try {
      await api(
        selected ? `/producto/actualizar/${selected.id}` : "/producto/crear",
        { method: selected ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <form className="panel form-grid" onSubmit={submit}>
      <h2>{selected ? "Editar producto" : "Nuevo producto"}</h2>
      <label>
        Nombre
        <input
          required
          name="nombre"
          value={product.nombre}
          onChange={change}
        />
      </label>
      <label>
        Precio
        <input
          required
          min="0"
          step="0.01"
          type="number"
          name="precio"
          value={product.precio}
          onChange={change}
        />
      </label>
      <label>
        Existencias
        <input
          required
          min="0"
          type="number"
          name="cantidad"
          value={product.cantidad}
          onChange={change}
        />
      </label>
      {error && <p className="alert error full">{error}</p>}
      <div className="actions full">
        <button>{selected ? "Guardar cambios" : "Crear producto"}</button>
        {selected && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function InvoiceForm({ products, onCreated }) {
  const [cliente, setCliente] = useState("");
  const [items, setItems] = useState([{ productoId: "", cantidad: 1 }]);
  const [error, setError] = useState("");
  const add = () => setItems([...items, { productoId: "", cantidad: 1 }]);
  const update = (index, field, value) =>
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const factura = await api("/factura/crear", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          detalles: items.map((i) => ({
            producto: { id: Number(i.productoId) },
            cantidad: Number(i.cantidad),
          })),
        }),
      });
      setCliente("");
      setItems([{ productoId: "", cantidad: 1 }]);
      onCreated(`Factura creada correctamente. Total: $${factura.total}`);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <form className="panel invoice" onSubmit={submit}>
      <h2>Registrar venta</h2>
      <label>
        Cliente
        <input
          required
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
      </label>
      <div className="invoice-items">
        {items.map((item, index) => (
          <div className="item-row" key={index}>
            <select
              required
              value={item.productoId}
              onChange={(e) => update(index, "productoId", e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · {p.cantidad} disponibles
                </option>
              ))}
            </select>
            <input
              required
              min="1"
              type="number"
              value={item.cantidad}
              onChange={(e) => update(index, "cantidad", e.target.value)}
            />
            {items.length > 1 && (
              <button
                type="button"
                className="icon"
                onClick={() => setItems(items.filter((_, i) => i !== index))}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="secondary" onClick={add}>
        + Añadir línea
      </button>
      {error && <p className="alert error">{error}</p>}
      <button>Crear factura</button>
    </form>
  );
}

function Dashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const lowStock = useMemo(
    () =>
      products.filter(
        (p) => p.cantidadInicial && p.cantidad <= p.cantidadInicial * 0.1,
      ),
    [products],
  );
  async function load() {
    try {
      setError("");
      const [list, value] = await Promise.all([
        api("/producto/obtener-productos"),
        api("/producto/total-inventario").catch(() => 0),
      ]);
      setProducts(list || []);
      setTotal(value || 0);
    } catch (e) {
      if (e.message.includes("autoriz")) onLogout();
      else setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function remove(id) {
    if (!confirm("¿Deseas borrar este producto?")) return;
    try {
      await api(`/producto/borrar-producto-por-id/${id}`, { method: "DELETE" });
      setNotice("Producto eliminado.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  function saved() {
    setSelected(null);
    setNotice("Producto guardado correctamente.");
    load();
  }
  return (
    <div className="app">
      <header>
        <div>
          <p className="eyebrow">PANEL DE CONTROL</p>
          <h1>Tienda Doña Rosa</h1>
        </div>
        <button className="secondary" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>
      {notice && <p className="alert success">{notice}</p>}
      {error && <p className="alert error">{error}</p>}
      <section className="metrics">
        <article>
          <span>Productos registrados</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>Valor del inventario</span>
          <strong>${Number(total).toLocaleString("es-CO")}</strong>
        </article>
        <article>
          <span>Por agotarse</span>
          <strong>{lowStock.length}</strong>
        </article>
      </section>
      <section className="layout">
        <ProductForm
          selected={selected}
          onSaved={saved}
          onCancel={() => setSelected(null)}
        />
        <InvoiceForm
          products={products}
          onCreated={(message) => {
            setNotice(message);
            load();
          }}
        />
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <h2>Inventario</h2>
            <p>Existencias actuales y valor por producto.</p>
          </div>
          <button className="secondary" onClick={load}>
            Actualizar
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Existencias</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length ? (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className={
                      lowStock.some((low) => low.id === p.id) ? "low" : ""
                    }
                  >
                    <td>{p.nombre}</td>
                    <td>${p.precio}</td>
                    <td>
                      {p.cantidad}
                      {lowStock.some((low) => low.id === p.id) && (
                        <small> Bajo stock</small>
                      )}
                    </td>
                    <td>${p.totalProducto}</td>
                    <td>
                      <button className="link" onClick={() => setSelected(p)}>
                        Editar
                      </button>
                      <button
                        className="link danger"
                        onClick={() => remove(p.id)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() =>
    localStorage.getItem("token")
      ? { username: localStorage.getItem("username") }
      : null,
  );
  function login(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    setSession(data);
  }
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setSession(null);
  }
  return session ? <Dashboard onLogout={logout} /> : <Login onLogin={login} />;
}
