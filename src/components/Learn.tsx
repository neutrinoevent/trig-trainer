import { useState } from 'react'
import { FAMILIES, GROUPS, FAMILY_BY_ID } from '../data/identities'
import { statsFor, type ProgressState } from '../store/progress'
import { Tex } from './Tex'

interface Props {
  progress: ProgressState
  onDrillFamily: (familyId: string) => void
}

function familyMastery(progress: ProgressState, familyId: string): number {
  const fam = FAMILY_BY_ID.get(familyId)
  if (!fam || fam.identities.length === 0) return 0
  let sum = 0
  for (const ident of fam.identities) sum += statsFor(progress, ident.id).ema
  return sum / fam.identities.length
}

export function Learn({ progress, onDrillFamily }: Props) {
  const [selectedId, setSelectedId] = useState(FAMILIES[0].id)
  const family = FAMILY_BY_ID.get(selectedId) ?? FAMILIES[0]

  return (
    <div className="learn">
      <nav className="learn-nav" aria-label="Identity families">
        {GROUPS.map((group) => (
          <div key={group} className="learn-group">
            <div className="learn-group-title">{group}</div>
            {FAMILIES.filter((f) => f.group === group).map((f) => {
              const mastery = familyMastery(progress, f.id)
              return (
                <button
                  key={f.id}
                  className={f.id === family.id ? 'learn-item learn-item-active' : 'learn-item'}
                  onClick={() => setSelectedId(f.id)}
                >
                  <span className="learn-item-name">{f.name}</span>
                  <span className="meter learn-meter" aria-hidden="true">
                    <span className="meter-fill" style={{ width: `${Math.round(mastery * 100)}%` }} />
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="learn-body card">
        <div className="learn-head">
          <h2 className="section-title">{family.name}</h2>
          <button className="btn" onClick={() => onDrillFamily(family.id)}>
            Drill this family →
          </button>
        </div>
        <p className="learn-blurb">{family.blurb}</p>
        <ul className="identity-list">
          {family.identities.map((ident) => (
            <li key={ident.id} className="identity-row">
              <div className="identity-tex">
                <Tex tex={`${ident.prompt} \\;=\\; ${ident.answer}`} />
              </div>
              {ident.note ? <div className="identity-note muted">{ident.note}</div> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
