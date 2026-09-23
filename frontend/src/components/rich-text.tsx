import { Fragment } from 'react';

/** Minimal formatter for scripted AI copy: **bold** and line breaks. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <Fragment key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
          {i < arr.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}
