const API_BASE = 'http://localhost:8080';

function apiUrl(path) {
    return API_BASE + path;
}

async function cargarProductos() {
    const tbody = document.getElementById('tablaProductos');
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
    try {
        const res = await fetch(apiUrl('/producto/obtener-productos'));
        if (res.status === 204) {
            tbody.innerHTML = '<tr><td colspan="6">Sin productos</td></tr>';
            return;
        }
        const productos = await res.json();
        tbody.innerHTML = '';
        productos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.precio}</td>
        <td>${p.cantidad}</td>
        <td>${p.totalProducto ?? ''}</td>
        <td><button class="danger" onclick="borrarProducto(${p.id})">Borrar</button></td>
      `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6">Error al conectar con la API</td></tr>';
    }
    cargarTotalInventario();
}

async function cargarTotalInventario() {
    const span = document.getElementById('totalInventario');
    try {
        const res = await fetch(apiUrl('/producto/total-inventario'));
        if (!res.ok) {
            span.textContent = '';
            return;
        }
        const total = await res.json();
        span.textContent = ' | Total inventario: ' + total;
    } catch (e) {
        span.textContent = '';
    }
}

async function borrarProducto(id) {
    if (!confirm('¿Borrar producto ' + id + '?')) return;

    const res = await fetch(apiUrl('/producto/borrar-producto-por-id/' + id), {
        method: 'DELETE'
    });

    if (res.ok) {
        cargarProductos();
    } else {
        alert('Error: ' + await res.text());
    }
}

document.getElementById('formCrear').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('msgCrear');

    const body = {
        nombre: document.getElementById('cNombre').value,
        precio: parseFloat(document.getElementById('cPrecio').value),
        cantidad: parseInt(document.getElementById('cCantidad').value)
    };

    try {
        const res = await fetch(apiUrl('/producto/crear'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            msg.textContent = 'Producto creado correctamente.';
            msg.className = 'msg ok';
            e.target.reset();
            cargarProductos();
        } else {
            msg.textContent = 'Error: ' + await res.text();
            msg.className = 'msg error';
        }
    } catch (err) {
        msg.textContent = 'No se pudo conectar con la API.';
        msg.className = 'msg error';
    }
});

document.getElementById('formActualizar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('msgActualizar');
    const id = document.getElementById('uId').value;

    const body = {};
    const nombre = document.getElementById('uNombre').value;
    const precio = document.getElementById('uPrecio').value;
    const cantidad = document.getElementById('uCantidad').value;

    if (nombre) body.nombre = nombre;
    if (precio) body.precio = parseFloat(precio);
    if (cantidad) body.cantidad = parseInt(cantidad);

    try {
        const res = await fetch(apiUrl('/producto/actualizar/' + id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            msg.textContent = 'Producto actualizado.';
            msg.className = 'msg ok';
            e.target.reset();
            cargarProductos();
        } else {
            msg.textContent = 'Error: ' + await res.text();
            msg.className = 'msg error';
        }
    } catch (err) {
        msg.textContent = 'No se pudo conectar con la API.';
        msg.className = 'msg error';
    }
});

async function cargarProntoAcabar() {
    const ul = document.getElementById('listaAcabarse');
    ul.innerHTML = '<li>Cargando...</li>';

    try {
        const res = await fetch(apiUrl('/producto/acabarse'));
        const lista = await res.json();

        ul.innerHTML = lista.length ? '' : '<li>Ningún producto está por acabarse</li>';

        lista.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.nombre} — quedan ${p.cantidad}`;
            ul.appendChild(li);
        });
    } catch (e) {
        ul.innerHTML = '<li>Error al conectar con la API</li>';
    }
}

function agregarDetalle() {
    const div = document.createElement('div');
    div.className = 'detalle-row';
    div.innerHTML = `
    <input type="number" placeholder="ID producto" class="detProductoId">
    <input type="number" placeholder="Cantidad" class="detCantidad">
    <button type="button" class="danger" onclick="this.parentElement.remove()">Quitar</button>
  `;
    document.getElementById('detalles').appendChild(div);
}
agregarDetalle();

async function crearFactura() {
    const msg = document.getElementById('msgFactura');
    const cliente = document.getElementById('fCliente').value;
    const filas = document.querySelectorAll('.detalle-row');
    const detalles = [];

    filas.forEach(fila => {
        const id = fila.querySelector('.detProductoId').value;
        const cantidad = fila.querySelector('.detCantidad').value;
        if (id && cantidad) {
            detalles.push({ producto: { id: parseInt(id) }, cantidad: parseInt(cantidad) });
        }
    });

    if (!cliente || detalles.length === 0) {
        msg.textContent = 'Completa el cliente y al menos un producto.';
        msg.className = 'msg error';
        return;
    }

    try {
        const res = await fetch(apiUrl('/factura/crear'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente, detalles })
        });

        if (res.ok) {
            const factura = await res.json();
            msg.textContent = 'Factura creada. Total: ' + factura.total;
            msg.className = 'msg ok';
            cargarProductos();
        } else {
            msg.textContent = 'Error: ' + await res.text();
            msg.className = 'msg error';
        }
    } catch (err) {
        msg.textContent = 'No se pudo conectar con la API.';
        msg.className = 'msg error';
    }
}

cargarProductos();