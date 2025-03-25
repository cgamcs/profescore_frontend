import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let isValid = true;

            // Validar email
            if (!email || !isValidEmail(email)) {
                setEmailError('Por favor ingresa un correo electrónico válido');
                isValid = false;
            } else {
                setEmailError('');
            }

            // Validar contraseña
            if (!password || password.length < 6) {
                setPasswordError('La contraseña debe tener al menos 6 caracteres');
                isValid = false;
            } else {
                setPasswordError('');
            }

            if (isValid) {
                // Aquí iría la lógica de autenticación
                console.log('Login exitoso');
                navigate('/admin'); // Redirigir al dashboard
            }
            
            const response = await fetch('http://localhost:4000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token en localStorage
                localStorage.setItem('token', data.token);
                navigate('/admin');
            } else {
                // Manejar error de login
                console.error('Login failed:', data);
            }
        } catch (error) {
            console.error('Login error:', error);
        }


    };

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <a href="/" className="text-xl font-bold text-black">ProfeScore</a>
                    <a href="/" className="text-sm text-gray-600 hover:text-indigo-600">
                        Volver al inicio
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
                            <p className="text-gray-600 mt-2">Ingresa tus credenciales para acceder</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campo Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fas fa-envelope text-gray-400"></i>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className={`w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none ${emailError ? 'border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                            }`}
                                        placeholder="usuario@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                            </div>

                            {/* Campo Contraseña */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Contraseña
                                    </label>
                                    <a href="#" className="text-xs text-indigo-600 hover:text-indigo-500">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fas fa-lock text-gray-400"></i>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        className={`w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none ${passwordError ? 'border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                            }`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                            </div>

                            {/* Botón de Submit */}
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Iniciar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>&copy; ProfeScore - {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
};

export default AdminLogin;