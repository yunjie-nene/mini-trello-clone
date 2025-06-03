import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../graphqlOperations';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus, User, Lock, CheckCircle, Sparkles } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerMutation, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      login(data.register.token);
      navigate('/');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await registerMutation({
        variables: {
          username: username.trim(),
          password: password.trim()
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <UserPlus size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Join Nora Trello
          </h2>
          <p className="mt-2 text-gray-600">Create your account to get started</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 p-4 rounded-xl shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
 
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={16} />
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full px-4 py-4 pl-12 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 font-medium"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <User size={18} className="absolute left-4 top-[46px] text-gray-400" />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Lock size={16} />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-4 py-4 pl-12 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 font-medium"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Lock size={18} className="absolute left-4 top-[46px] text-gray-400" />
            </div>
            
            <div className="relative">
              <label htmlFor="confirm-password" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CheckCircle size={16} />
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="relative block w-full px-4 py-4 pl-12 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 font-medium"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <CheckCircle size={18} className="absolute left-4 top-[46px] text-gray-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <p className="text-xs text-gray-600 font-medium mb-2">Password requirements:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={`flex items-center gap-2 ${password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                At least 6 characters
              </li>
              <li className={`flex items-center gap-2 ${password === confirmPassword && password ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${password === confirmPassword && password ? 'bg-green-500' : 'bg-gray-300'}`} />
                Passwords match
              </li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <UserPlus size={18} />
                  Create Account
                  <Sparkles size={16} className="opacity-70" />
                </div>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 text-gray-600 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link 
              to="/login" 
              className="mt-4 inline-block font-semibold text-emerald-600 hover:text-emerald-500 transition-colors duration-200 hover:underline"
            >
              Sign in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;