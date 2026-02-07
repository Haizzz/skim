import { tokenize } from "@/lib/syntax";

const TOKEN_COLORS: Record<string, string> = {
  keyword: "text-syn-keyword",
  string: "text-syn-string",
  number: "text-syn-number",
  comment: "text-syn-comment",
  type: "text-syn-type",
  punct: "text-syn-punct",
};

export default function HighlightedCode({ code }: { code: string }) {
  const tokens = tokenize(code);

  return (
    <>
      {tokens.map((tok, i) => {
        const cls = TOKEN_COLORS[tok.type];
        return cls ? (
          <span key={i} className={cls}>
            {tok.text}
          </span>
        ) : (
          <span key={i}>{tok.text}</span>
        );
      })}
    </>
  );
}
