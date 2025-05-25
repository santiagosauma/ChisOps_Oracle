import React, { useState } from 'react';
import logo from '../resources/logo.png';
import loginBackground from '../resources/login_paint.jpg';

function Login({ onLogin, toggleAuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      if (response.ok) {
        const userData = await response.json();

        if (!userData || !userData.rol) {
          setError('Error: Respuesta del servidor inválida');
          return;
        }

        localStorage.setItem('user', JSON.stringify(userData));
        onLogin(userData);

        return;
      } else {
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
      setError('Error de conexión. Por favor, intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex h-screen w-screen fixed top-0 left-0 z-50">
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center"
        style={{
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-12 text-white">
          <img src={logo} alt="ChisOps Logo" className="w-32 h-32 mb-8" />
          <h1 className="text-4xl font-bold mb-6 text-center text-white">Sign In to Your Workspace</h1>
          <p className="text-lg text-center max-w-md opacity-90 text-white">
            Access your team's tools, automate workflows, and drive productivity. Leverage emerging technologies to make work decisions more efficiently. Let's get back to building great things.
          </p>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-6 text-center">Welcome back!</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-700 text-red-900">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-1 font-medium text-gray-700 text-sm">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="mb-1">
                <label htmlFor="password" className="block mb-1 font-medium text-gray-700 text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="8"
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={togglePassword}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                    </svg>
                  </button>
                </div>
                <div className="text-right mt-2">
                  <a href="#" className="text-sm text-red-600 hover:text-red-800 hover:underline">Forgot Password?</a>
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`w-full py-2.5 px-4 mt-6 bg-red-600 text-white rounded-lg text-base font-medium transition-colors ${
                  isLoading ? 'bg-red-400 cursor-not-allowed' : 'hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Login'}
              </button>
              
              <div className="text-center mt-6 text-sm">
                Don't have an account? {" "}
                <button 
                  type="button"
                  onClick={toggleAuthMode} 
                  className="text-red-600 hover:text-red-800 hover:underline font-medium focus:outline-none"
                >
                  Sign up!
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;