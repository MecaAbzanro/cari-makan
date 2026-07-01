// src/components/EmptyState.jsx
import { CompassIcon } from './Icons.jsx'

export default function EmptyState({ icon: Icon = CompassIcon, title, description, action }) {
  return (
    <div className="flex animate-scaleIn flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-clay bg-white/60 px-6 py-16 text-center">
      <div className="grid h-16 w-16 animate-float place-items-center rounded-full bg-gradient-to-br from-saffron-50 to-basil-50 text-basil-400 shadow-soft">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-display text-lg font-semibold text-char">{title}</p>
      {description && <p className="max-w-sm text-sm text-char-soft">{description}</p>}
      {action}
    </div>
  )
}
