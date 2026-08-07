import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CircleX, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button, Field, Logo } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/formatters';

const loginSchema = z.object({ email: z.string().email('Ingresa un correo válido.'), password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.') });
const registerSchema = loginSchema.extend({ fullName: z.string().min(3, 'Indica nombre y apellido.') });
const recoverySchema = z.object({ email: z.string().email('Ingresa un correo válido.') });

export function LoginPage() {
  const [params] = useSearchParams();
  const mode = params.get('modo') || 'login';
  const navigate = useNavigate(); const { session, signIn, signUp, recoverPassword } = useAuth();
  const schema = mode === 'register' ? registerSchema : mode === 'recover' ? recoverySchema : loginSchema;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (values) => {
    try {
      if (mode === 'register') { const { error } = await signUp(values); if (error) throw error; navigate('/login?modo=registered'); return; }
      if (mode === 'recover') { const { error } = await recoverPassword(values.email); if (error) throw error; navigate('/login?modo=recovered'); return; }
      const { error } = await signIn(values.email, values.password); if (error) throw error;
      navigate('/');
    } catch (error) { window.alert(getErrorMessage(error)); }
  };
  if (session) return <Navigate to="/" replace />;
  if (mode === 'registered' || mode === 'recovered') return <AuthScreen><div className="auth-success"><ShieldCheck size={38} /><h1>{mode === 'registered' ? 'Cuenta creada' : 'Revisa tu correo'}</h1><p>{mode === 'registered' ? 'Confirma tu email antes de ingresar. Un administrador debe habilitar tu cuenta.' : 'Te enviamos las instrucciones para restablecer tu contraseña.'}</p><Link to="/login"><Button>Volver al acceso</Button></Link></div></AuthScreen>;
  return <AuthScreen><div className="auth-copy"><p className="eyebrow">FEDERACIÓN DE FÚTBOL PLAYA</p><h1>{mode === 'register' ? 'Crea tu acceso' : mode === 'recover' ? 'Recupera tu cuenta' : 'Bienvenido de nuevo'}</h1><p>{mode === 'register' ? 'Solicita acceso al sistema oficial de actas.' : mode === 'recover' ? 'Te enviaremos un enlace seguro para continuar.' : 'Ingresa para gestionar los partidos y actas oficiales.'}</p></div>
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      {mode === 'register' && <Field label="Nombre completo" error={errors.fullName?.message}><input autoComplete="name" placeholder="Ej. Valentina López" {...register('fullName')} /></Field>}
      <Field label="Correo electrónico" error={errors.email?.message}><span className="input-icon"><Mail size={17} /><input autoComplete="email" type="email" placeholder="tu@correo.com" {...register('email')} /></span></Field>
      {mode !== 'recover' && <Field label="Contraseña" error={errors.password?.message}><span className="input-icon"><LockKeyhole size={17} /><input autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type="password" placeholder="••••••••" {...register('password')} /></span></Field>}
      <Button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Procesando…' : mode === 'register' ? 'Solicitar acceso' : mode === 'recover' ? 'Enviar enlace' : 'Iniciar sesión'}</Button>
    </form>
    <div className="auth-links">{mode === 'login' && <><Link to="/login?modo=recover">¿Olvidaste tu contraseña?</Link><span>·</span><Link to="/login?modo=register">Crear una cuenta</Link></>}{mode !== 'login' && <Link to="/login"><ArrowLeft size={15} /> Volver al inicio de sesión</Link>}</div>
  </AuthScreen>;
}

function AuthScreen({ children }) { return <main className="auth-layout"><section className="auth-brand"><Logo /><div><h2>Gestor Oficial de Actas</h2><p>Control deportivo preciso, seguro y siempre disponible.</p></div><footer><ShieldCheck size={15} /> Acceso protegido y auditado</footer></section><section className="auth-panel"><div className="auth-card">{children}</div></section></main>; }

export function AccessRestrictedPage() {
  const { session, appUser, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const isDeactivated = Boolean(appUser?.deactivated_at);
  const leaveRestrictedPage = async () => {
    const { error } = await signOut();
    if (error) console.error('No fue posible cerrar la sesión local', error);
    navigate('/login', { replace: true });
  };

  if (loading) return <div className="app-loader"><span className="loading-spinner" />Verificando acceso…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (appUser?.status === 'active') return <Navigate to="/" replace />;

  return <main className={`restricted${isDeactivated ? ' restricted-deactivated' : ''}`}>
    {isDeactivated ? <CircleX size={42} color="#db3b48" aria-hidden="true" /> : <AlertCircle size={42} aria-hidden="true" />}
    <h1>{isDeactivated ? 'Cuenta deshabilitada' : 'Acceso pendiente de habilitación'}</h1>
    <p>{isDeactivated ? 'Un administrador deshabilitó tu cuenta. Contacta con la federación si crees que se trata de un error.' : 'Tu cuenta fue creada correctamente, pero un administrador debe asignarte un rol activo.'}</p>
    <Button onClick={leaveRestrictedPage}>Volver al inicio de sesión</Button>
  </main>;
}
