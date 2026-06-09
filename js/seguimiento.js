const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', cargarSeguimientos);

async function cargarSeguimientos() {
    try {
        const response = await fetch(`${API_URLS.seguimiento}/seguimientos`);
        const seguimientos = await response.json();
        
        if (response.ok) {
            mostrarSeguimientos(seguimientos);
        } else {
            mostrarMensaje(seguimientos.error || 'Error al cargar seguimientos', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarSeguimientos(seguimientos) {
    const tbody = document.getElementById('tablaSeguimientos');
    tbody.innerHTML = '';
    
    seguimientos.forEach(seg => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${seg.id}</td>
            <td>${seg.incapacidad_id}</td>
            <td>${seg.fecha}</td>
            <td>${seg.comentario}</td>
            <td><span class="estado-${seg.estado}">${seg.estado}</span></td>
            <td>${seg.usuario_responsable}</td>
            <td>
                <button class="btn btn-primary" onclick="editarSeguimiento(${seg.id})">Editar</button>
                <button class="btn btn-danger" onclick="eliminarSeguimiento(${seg.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function buscarSeguimientos() {
    const incapacidadId = document.getElementById('buscarIncapacidad').value;
    const estado = document.getElementById('buscarEstado').value;
    
    let url = `${API_URLS.seguimiento}/seguimientos/buscar?`;
    const params = [];
    
    if (incapacidadId) params.push(`incapacidad_id=${incapacidadId}`);
    if (estado) params.push(`estado=${estado}`);
    
    url += params.join('&');
    
    try {
        const response = await fetch(url);
        const seguimientos = await response.json();
        
        if (response.ok) {
            mostrarSeguimientos(seguimientos);
        } else {
            mostrarMensaje(seguimientos.error || 'Error en la búsqueda', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function mostrarFormulario() {
    document.getElementById('modalTitulo').textContent = 'Nuevo Seguimiento';
    document.getElementById('formSeguimiento').reset();
    document.getElementById('seguimientoId').value = '';
    
    // Poner fecha de hoy por defecto
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    
    // Poner usuario del login
    const usuario = localStorage.getItem('usuario') || 'admin';
    document.getElementById('usuario_responsable').value = usuario;
    
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('formSeguimiento').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('seguimientoId').value;
    const data = {
        incapacidad_id: parseInt(document.getElementById('incapacidad_id').value),
        fecha: document.getElementById('fecha').value,
        comentario: document.getElementById('comentario').value,
        estado: document.getElementById('estado').value,
        usuario_responsable: document.getElementById('usuario_responsable').value
    };
    
    try {
        let response;
        
        if (id) {
            response = await fetch(`${API_URLS.seguimiento}/seguimientos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_URLS.seguimiento}/seguimientos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje(id ? 'Seguimiento actualizado' : 'Seguimiento creado', 'success');
            cerrarModal();
            cargarSeguimientos();
        } else {
            mostrarMensaje(result.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
});

async function editarSeguimiento(id) {
    try {
        const response = await fetch(`${API_URLS.seguimiento}/seguimientos/${id}`);
        const seg = await response.json();
        
        if (response.ok) {
            document.getElementById('modalTitulo').textContent = 'Editar Seguimiento';
            document.getElementById('seguimientoId').value = seg.id;
            document.getElementById('incapacidad_id').value = seg.incapacidad_id;
            document.getElementById('fecha').value = seg.fecha;
            document.getElementById('comentario').value = seg.comentario;
            document.getElementById('estado').value = seg.estado;
            document.getElementById('usuario_responsable').value = seg.usuario_responsable;
            document.getElementById('modal').style.display = 'flex';
        } else {
            mostrarMensaje(seg.error || 'Error al cargar seguimiento', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

async function eliminarSeguimiento(id) {
    if (!confirm('¿Eliminar este seguimiento?')) return;
    
    try {
        const response = await fetch(`${API_URLS.seguimiento}/seguimientos/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje('Seguimiento eliminado', 'success');
            cargarSeguimientos();
        } else {
            mostrarMensaje(result.error || 'Error al eliminar', 'error');
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