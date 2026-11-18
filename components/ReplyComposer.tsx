'use client'

import { createSignal } from '@barefootjs/client'

interface ReplyComposerProps {
  number: number
  mailbox: string
  contact: string
}

export function ReplyComposer(props: ReplyComposerProps) {
  const [body, setBody] = createSignal('')
  const [preview, setPreview] = createSignal(false)

  return (
    <form action="/actions/reply" method="post">
      <input type="hidden" name="number" value={props.number} />
      <p>
        From {props.mailbox} to {props.contact}
      </p>
      <label>
        Reply
        <textarea
          name="body"
          rows={7}
          required
          onInput={(event) => setBody(event.target.value)}
        />
      </label>
      <button
        type="button"
        aria-expanded={preview()}
        onClick={() => setPreview(!preview())}
      >
        Preview reply
      </button>
      <pre hidden={!preview()}>{body()}</pre>
      <button type="submit">Send reply</button>
    </form>
  )
}
