const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', cargarIncapacidades);

async function cargarIncapacidades() {
    try {
        const response = await fetch(`${API_URLS.incapacidades}/incapacidades`);
        const incapacidades = await response.json();
        
        if (response.ok) {
            mostrarIncapacidades(incapacidades);
        } else {
            mostrarMensaje(incapacidades.error || 'Error al cargar incapacidades', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarIncapacidades(incapacidades) {
    const tbody = document.getElementById('tablaIncapacidades');
    tbody.innerHTML = '';
    
    incapacidades.forEach(inc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inc.id}</td>
            <td>${inc.empleado_id}</td>
            <td>${inc.fecha_inicio}</td>
            <td>${inc.fecha_fin}</td>
            <td>${inc.dias_incapacidad}</td>
            <td>${inc.tipo}</td>
            <td>${inc.entidad_medica}</td>
            <td><span class="estado-${inc.estado}">${inc.estado}</span></td>
            <td>
                <button class="btn btn-warning" onclick="editarIncapacidad(${inc.id})">Editar</button>
                <button class="btn btn-info" onclick="cambiarEstado(${inc.id})">Editar estado</button>
                <button class="btn btn-primary" onclick="finalizarIncapacidad(${inc.id})">Finalizar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function buscarIncapacidades() {
    const empleadoId = document.getElementById('buscarEmpleado').value;
    const fechaInicio = document.getElementById('buscarFechaInicio').value;
    const fechaFin = document.getElementById('buscarFechaFin').value;
    const estado = document.getElementById('buscarEstado').value;
    const tipo = document.getElementById('buscarTipo').value;
    
    let url = `${API_URLS.incapacidades}/incapacidades/buscar?`;
    const params = [];
    
    if (empleadoId) params.push(`empleado_id=${empleadoId}`);
    if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
    if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
    if (estado) params.push(`estado=${estado}`);
    if (tipo) params.push(`tipo=${tipo}`);
    
    url += params.join('&');
    
    try {
        const response = await fetch(url);
        const incapacidades = await response.json();
        
        if (response.ok) {
            mostrarIncapacidades(incapacidades);
        } else {
            mostrarMensaje(incapacidades.error || 'Error en la búsqueda', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarFormulario() {
    document.getElementById('modalTitulo').textContent = 'Nueva Incapacidad';
    document.getElementById('formIncapacidad').reset();
    document.getElementById('incapacidadId').value = '';
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('formIncapacidad').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('incapacidadId').value;
    const data = {
        empleado_id: parseInt(document.getElementById('empleado_id').value),
        fecha_inicio: document.getElementById('fecha_inicio').value,
        fecha_fin: document.getElementById('fecha_fin').value,
        tipo: document.getElementById('tipo').value,
        diagnostico_general: document.getElementById('diagnostico_general').value,
        entidad_medica: document.getElementById('entidad_medica').value,
        observaciones: document.getElementById('observaciones').value
    };
    
    try {
        let response;
        
        if (id) {
            response = await fetch(`${API_URLS.incapacidades}/incapacidades/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_URLS.incapacidades}/incapacidades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje(id ? 'Incapacidad actualizada' : 'Incapacidad creada', 'success');
            cerrarModal();
            cargarIncapacidades();
        } else {
            mostrarMensaje(result.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
});

async function editarIncapacidad(id) {
    try {
        const response = await fetch(`${API_URLS.incapacidades}/incapacidades/${id}`);
        const inc = await response.json();
        
        if (response.ok) {
            document.getElementById('modalTitulo').textContent = 'Editar Incapacidad';
            document.getElementById('incapacidadId').value = inc.id;
            document.getElementById('empleado_id').value = inc.empleado_id;
            document.getElementById('fecha_inicio').value = inc.fecha_inicio;
            document.getElementById('fecha_fin').value = inc.fecha_fin;
            document.getElementById('tipo').value = inc.tipo;
            document.getElementById('diagnostico_general').value = inc.diagnostico_general;
            document.getElementById('entidad_medica').value = inc.entidad_medica;
            document.getElementById('observaciones').value = inc.observaciones || '';
            document.getElementById('modal').style.display = 'flex';
        } else {
            mostrarMensaje(inc.error || 'Error al cargar incapacidad', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

// Mostrar modal para cambiar estado
function cambiarEstado(id) {
    document.getElementById('estadoIncapacidadId').value = id;
    document.getElementById('nuevoEstado').value = 'registrada';
    document.getElementById('modalEstado').style.display = 'flex';
}

// Cerrar modal de estado
function cerrarModalEstado() {
    document.getElementById('modalEstado').style.display = 'none';
}

document.getElementById('formEstado').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('estadoIncapacidadId').value;
    const nuevoEstado = document.getElementById('nuevoEstado').value;
    
    try {
        const response = await fetch(`${API_URLS.incapacidades}/incapacidades/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje(`Estado cambiado a ${nuevoEstado}`, 'success');
            cerrarModalEstado();
            cargarIncapacidades();
        } else {
            mostrarMensaje(result.error || 'Error al cambiar estado', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
});

async function finalizarIncapacidad(id) {
    if (!confirm('¿Finalizar esta incapacidad?')) return;
    
    try {
        const response = await fetch(`${API_URLS.incapacidades}/incapacidades/${id}/finalizar`, {
            method: 'PATCH'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje('Incapacidad finalizada', 'success');
            cargarIncapacidades();
        } else {
            mostrarMensaje(result.error || 'Error al finalizar', 'error');
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