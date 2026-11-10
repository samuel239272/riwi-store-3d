import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Ticket, X } from 'lucide-react';
import { useRewards } from './RewardsProvider';

export function CouponBox() {
  const { active, apply, remove, earned } = useRewards();
  const [code, setCode] = useState(active?.code ?? '');
  const [error, setError] = useState('');
  return (
    <div className="coupon-box">
      <div className="coupon-title">
        <Ticket size={18} />
        <strong>Tu código tiene recompensa.</strong>
      </div>
      {active ? (
        <div className="coupon-active" role="status">
          <CheckCircle2 size={17} />
          <span>
            <strong>{active.code}</strong>
            <small>{active.percent} % de descuento aplicado</small>
          </span>
          <button
            aria-label="Quitar descuento"
            onClick={() => {
              remove();
              setCode('');
              setError('');
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (apply(code)) setError('');
            else
              setError(
                'Este código no está desbloqueado. Gánalo superando su nivel en Code Arcade.',
              );
          }}
        >
          <label htmlFor="earned-coupon">Código de descuento</label>
          <div>
            <input
              id="earned-coupon"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              maxLength={60}
              placeholder="RIWI-DEBUG-01"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit">Aplicar</button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="coupon-error">
          {error}
        </p>
      )}
      <Link to="/retos">
        {earned.length
          ? `Tienes ${earned.length} ${earned.length === 1 ? 'código' : 'códigos'} · Ver recompensas`
          : 'Gana tu primer descuento codificando →'}
      </Link>
      <small>Un código por selección. No acumulable.</small>
    </div>
  );
}
