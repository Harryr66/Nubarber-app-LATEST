import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';  // Add this for redirect
import { auth } from '../firebase';  // Adjust path if needed

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // For redirect after login

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');  // Clear previous error
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');  // Redirect to dashboard on success
    } catch (err) {
      setError('Invalid credentials or error—check console');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-2 p-2 bg-gray-700 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full mb-2 p-2 bg-gray-700 rounded"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Sign In</button>
      </form>
    </div>
  );
};

export default Login;