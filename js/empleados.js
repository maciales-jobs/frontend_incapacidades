const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', cargarEmpleados);

async function cargarEmpleados() {
    try {
        const response = await fetch(`${API_URLS.empleados}/empleados`);
        const empleados = await response.json();
        
        if (response.ok) {
            mostrarEmpleados(empleados);
        } else {
            mostrarMensaje(empleados.error || 'Error al cargar empleados', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarEmpleados(empleados) {
    const tbody = document.getElementById('tablaEmpleados');
    tbody.innerHTML = '';
    
    empleados.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.nombres}</td>
            <td>${emp.apellidos}</td>
            <td>${emp.documento}</td>
            <td>${emp.correo}</td>
            <td>${emp.telefono}</td>
            <td>${emp.cargo}</td>
            <td>${emp.area}</td>
            <td>${emp.fecha_ingreso}</td>    
            <td>${emp.estado}</td>
            <td>
                <button class="btn btn-warning" onclick="editarEmpleado(${emp.id})">Editar</button>
                <button class="btn btn-danger" onclick="cambiarEstado(${emp.id}, '${emp.estado}')">
                    ${emp.estado === 'activo' ? 'Desactivar' : 'Activar'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function buscarEmpleados() {
    const documento = document.getElementById('buscarDocumento').value;
    const area = document.getElementById('buscarArea').value;
    const estado = document.getElementById('buscarEstado').value;
    
    let url = `${API_URLS.empleados}/empleados/buscar?`;
    const params = [];
    
    if (documento) params.push(`documento=${documento}`);
    if (area) params.push(`area=${area}`);
    if (estado) params.push(`estado=${estado}`);
    
    url += params.join('&');
    
    try {
        const response = await fetch(url);
        const empleados = await response.json();
        
        if (response.ok) {
            mostrarEmpleados(empleados);
        } else {
            mostrarMensaje(empleados.error || 'Error en la búsqueda', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarFormulario() {
    document.getElementById('modalTitulo').textContent = 'Nuevo Empleado';
    document.getElementById('formEmpleado').reset();
    document.getElementById('empleadoId').value = '';
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('formEmpleado').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('empleadoId').value;
    const data = {
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        documento: document.getElementById('documento').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        cargo: document.getElementById('cargo').value,
        area: document.getElementById('area').value,
        fecha_ingreso: document.getElementById('fecha_ingreso').value
    };
    
    try {
        let response;
        
        if (id) {
            response = await fetch(`${API_URLS.empleados}/empleados/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_URLS.empleados}/empleados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje(id ? 'Empleado actualizado' : 'Empleado creado', 'success');
            cerrarModal();
            cargarEmpleados();
        } else {
            mostrarMensaje(result.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
});

async function editarEmpleado(id) {
    try {
        const response = await fetch(`${API_URLS.empleados}/empleados/${id}`);
        const emp = await response.json();
        
        if (response.ok) {
            document.getElementById('modalTitulo').textContent = 'Editar Empleado';
            document.getElementById('empleadoId').value = emp.id;
            document.getElementById('nombres').value = emp.nombres;
            document.getElementById('apellidos').value = emp.apellidos;
            document.getElementById('documento').value = emp.documento;
            document.getElementById('correo').value = emp.correo;
            document.getElementById('telefono').value = emp.telefono;
            document.getElementById('cargo').value = emp.cargo;
            document.getElementById('area').value = emp.area;
            document.getElementById('fecha_ingreso').value = emp.fecha_ingreso;
            document.getElementById('modal').style.display = 'flex';
        } else {
            mostrarMensaje(emp.error || 'Error al cargar empleado', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

async function cambiarEstado(id, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    
    try {
        const response = await fetch(`${API_URLS.empleados}/empleados/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje(`Empleado ${nuevoEstado}`, 'success');
            cargarEmpleados();
        } else {
            mostrarMensaje(result.error || 'Error al cambiar estado', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    
    setTimeout(() => {
        mensaje.className = 'mensaje';
    }, 3000);
}