document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    const mensaje = document.getElementById('mensaje');
    
    try {
        const response = await fetch(`${API_URLS.auth}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                contrasena: contrasena
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', data.usuario);
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('rol', data.rol);
            
            mensaje.className = 'success';
            mensaje.textContent = 'Login exitoso. Redirigiendo...';
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 1000);
        } else {
            mensaje.className = 'error';
            mensaje.textContent = data.error || 'Credenciales incorrectas';
        }
    } catch (error) {
        mensaje.className = 'error';
        mensaje.textContent = 'Error de conexión';
    }
});