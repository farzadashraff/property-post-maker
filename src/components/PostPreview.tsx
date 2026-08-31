import { forwardRef } from 'react'
import { CARD_WIDTH, CARD_HEIGHT } from '../lib/postRenderer'

export const PostPreview = forwardRef<HTMLCanvasElement, { description: string }>(function PostPreview(
  { description },
  ref,
) {
  return (
    <section className="flex flex-col items-center">
      <h2 className="mb-5 w-full text-base font-bold text-gray-900">2. Live preview</h2>
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
        <canvas
          ref={ref}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          className="block h-auto w-full"
          role="img"
          aria-label={description}
        />
      </div>
    </section>
  )
})
