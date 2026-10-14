import type { CSSProperties } from 'react'

interface RollTextProps {
  text: string
  className?: string
}

/** Per-character roll-up label (after obsidianassembly.com menu links).
 *  Place inside an element with .roll-hover (or an <a>) to animate on hover. */
export default function RollText({ text, className = '' }: RollTextProps) {
  return (
    <span className={`roll ${className}`} aria-label={text}>
      {text.split('').map((c, i) => {
        const glyph = c === ' ' ? ' ' : c
        return (
          <span key={i} className="ch" style={{ '--i': i } as CSSProperties} aria-hidden>
            <span className="o">{glyph}</span>
            <span className="d">{glyph}</span>
          </span>
        )
      })}
    </span>
  )
}
