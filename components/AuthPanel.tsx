import React from 'react';
import { Mail, Lock, Send, ArrowLeft, LogIn } from 'lucide-react';

interface AuthPanelProps {
  mode: 'login' | 'reset';
  email: string;
  password: string;
  error?: string | null;
  message?: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onReset: () => void;
  onSwitchMode: (mode: 'login' | 'reset') => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({
  mode,
  email,
  password,
  error,
  message,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onReset,
  onSwitchMode
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin();
    } else {
      onReset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 px-4 py-10">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 shadow-2xl rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur">
        <div className="p-8 md:p-10 bg-white/5 border-r border-white/10 flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.25em] text-blue-200 font-semibold">Estratega</span>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">Acceso seguro al tablero</h1>
          <p className="text-slate-200/80">
            Organiza tus tableros y avances. Inicia sesion para desbloquear la vista completa y la edicion de las paginas.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-100/80">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold">Correos corporativos</p>
              <p className="text-xs text-slate-200/70 mt-1">Validamos el formato del correo antes de iniciar sesion.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold">Recuperacion guiada</p>
              <p className="text-xs text-slate-200/70 mt-1">Enviamos un enlace temporal a tu bandeja.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
              <p className="font-semibold">Mantente conectado</p>
              <p className="text-xs text-slate-200/70 mt-1">Guardamos tu sesion localmente para que no pierdas el contexto.</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-white text-slate-900">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
            {mode === 'reset' && (
              <button
                onClick={() => onSwitchMode('login')}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                type="button"
              >
                <ArrowLeft size={16} />
                Volver a iniciar sesion
              </button>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-1">{mode === 'login' ? 'Iniciar sesion' : 'Recuperar contrasena'}</h2>
          <p className="text-slate-500 mb-6">
            {mode === 'login'
              ? 'Usa tu correo y contrasena para continuar'
              : 'Ingresa tu correo y te enviaremos un enlace seguro para restablecerla'}
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Correo electronico</label>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  className="w-full outline-none text-sm"
                  placeholder="correo@tuempresa.com"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <label>Contrasena</label>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('reset')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Olvidaste tu contrasena?
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  <Lock size={16} className="text-slate-400" />
                  <input
                    type="password"
                    className="w-full outline-none text-sm"
                    placeholder="Tu contrasena"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                Te enviaremos un correo con un enlace temporal para que puedas definir una nueva contrasena. El enlace expira en 15 minutos.
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
              >
                {mode === 'login' ? (
                  <>
                    <LogIn size={18} />
                    Iniciar sesion
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Enviar enlace
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
