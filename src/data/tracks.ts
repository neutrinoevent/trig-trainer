/** Curated family bundles — the batches a course actually asks for. */
export interface Track {
  id: string
  label: string
  families: string[]
}

export const TRACKS: Track[] = [
  {
    id: 'basics',
    label: 'Trig basics',
    families: ['pythagorean', 'ratio', 'parity', 'values'],
  },
  {
    id: 'angle',
    label: 'Angle algebra',
    families: ['cofunction', 'sum-diff', 'double', 'half', 'power'],
  },
  {
    id: 'calc1',
    label: 'Calc I',
    families: ['pythagorean', 'values', 'cofunction', 'double', 'deriv', 'inv-deriv'],
  },
  {
    id: 'integration',
    label: 'Integration toolkit',
    families: ['power', 'prod-sum', 'half', 'integ', 'inv-integ', 'trigsub', 'weier', 'strategy'],
  },
  {
    id: 'ode',
    label: 'ODE prep',
    families: ['linear', 'sum-diff', 'deriv', 'euler', 'hyper'],
  },
]
