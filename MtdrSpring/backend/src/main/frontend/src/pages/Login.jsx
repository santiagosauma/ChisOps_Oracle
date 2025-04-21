import React, { useState } from 'react';
import '../styles/login-styles.css';
import logo from '../resources/logo.png';

function Login({ onLogin, toggleAuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica del lado del cliente
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Verificar si el servidor respondió con éxito
      if (response.ok) {
        const userData = await response.json();
        
        // Validar que userData tiene la estructura esperada
        if (!userData || !userData.rol) {
          setError('Error: Respuesta del servidor inválida');
          return;
        }
        
        // Guardar los datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Llamar a onLogin con los datos completos del usuario
        onLogin(userData);

        // ← Aquí se separa por rol
        if (userData.rol === 'admin') {
          console.log('👑 Admin logueado → irá a Home');
        } else {
          console.log('👤 Usuario normal logueado → irá a Blank');
        }
        return;
      } else {
        // Manejar específicamente los diferentes tipos de errores
        if (response.status === 401) {
          setError('Email o contraseña incorrectos');
        } else if (response.status === 400) {
          setError('Datos de inicio de sesión inválidos');
        } else {
          const errorText = await response.text();
          setError(errorText || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión. Por favor, intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-sidebar">
        <img src={logo} alt="Logo" className="login-logo" />
        <div className="login-sidebar-content">
          <h1>Sign In to Your Workspace</h1>
          <p>Access your team's tools, automate workflows, and drive productivity. Leverage emerging technologies to make work decisions more efficiently. Let's get back to building great things.</p>
        </div>
      </div>
      
      <div className="login-form">
        <div className="login-card">
          <h2>Welcome back!</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="8"
                />
                <span className="eye-icon" onClick={togglePassword}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                  </svg>
                </span>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: '#312D2A' }}>Forgot Password?</a>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Login'}
            </button>
            
            <div className="login-footer">
              Don't have an account? <a href="#" onClick={toggleAuthMode}>Sign up!</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;