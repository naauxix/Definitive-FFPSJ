import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
export function NotFoundPage() { return <div className="not-found"><p className="eyebrow">404</p><h1>Esta página no existe</h1><p>Revisa el enlace o vuelve al panel principal.</p><Link to="/"><Button>Ir al resumen</Button></Link></div>; }
