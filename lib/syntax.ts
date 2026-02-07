type Token = { text: string; type: string };

const KEYWORDS = new Set([
  "abstract", "as", "async", "await", "break", "case", "catch", "class",
  "const", "continue", "debugger", "default", "delete", "do", "else",
  "enum", "export", "extends", "false", "finally", "for", "from",
  "function", "get", "if", "implements", "import", "in", "instanceof",
  "interface", "let", "new", "null", "of", "package", "private",
  "protected", "public", "readonly", "return", "set", "static", "super",
  "switch", "this", "throw", "true", "try", "type", "typeof", "undefined",
  "var", "void", "while", "with", "yield",
  // Python
  "def", "elif", "except", "lambda", "pass", "raise", "with", "assert",
  "global", "nonlocal", "None", "True", "False", "and", "or", "not", "is",
  // Ruby
  "begin", "end", "module", "require", "rescue", "unless", "until", "when",
  // Go
  "func", "go", "chan", "defer", "fallthrough", "goto", "map", "range",
  "select", "struct",
  // Rust
  "fn", "impl", "mod", "pub", "self", "trait", "use", "where", "mut",
  "ref", "match", "loop", "move", "unsafe", "extern", "crate",
]);

const TYPES = new Set([
  "string", "number", "boolean", "any", "void", "never", "unknown",
  "object", "symbol", "bigint", "int", "float", "double", "char",
  "long", "short", "byte", "bool", "i32", "i64", "u32", "u64",
  "f32", "f64", "usize", "isize", "str", "String", "Vec", "Option",
  "Result", "Promise", "Array", "Map", "Set", "Record",
]);

// Regex-based tokenizer — not perfect, but good enough for highlighting
const TOKEN_RE =
  /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_$][\w$]*\b)|([{}()[\];,.])|(\S)/gm;

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let match;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(code)) !== null) {
    const [full, comment, str, num, ident, punct, other] = match;
    if (comment) {
      tokens.push({ text: full, type: "comment" });
    } else if (str) {
      tokens.push({ text: full, type: "string" });
    } else if (num) {
      tokens.push({ text: full, type: "number" });
    } else if (ident) {
      if (KEYWORDS.has(ident)) {
        tokens.push({ text: full, type: "keyword" });
      } else if (TYPES.has(ident)) {
        tokens.push({ text: full, type: "type" });
      } else {
        tokens.push({ text: full, type: "ident" });
      }
    } else if (punct) {
      tokens.push({ text: full, type: "punct" });
    } else if (other) {
      tokens.push({ text: full, type: "plain" });
    }
  }

  return tokens;
}
