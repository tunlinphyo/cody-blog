const jsTokenPattern =
  /(\/\/[^\n\r]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b(?:await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|yield)\b|\b(?:Array|Boolean|Date|Error|JSON|Map|Math|Number|Object|Promise|RegExp|Set|String|Symbol|console|document|window)\b|#?[A-Za-z_$][\w$]*(?=\s*[:(])|\.[A-Za-z_$][\w$]*|\b(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|=>|\?\?=?|\?\.|&&=?|\|\|=?|===?|!==?|<=?|>=?|\*\*=?|[{}[\]();,.:?+\-*/%=&|!~^])/g;

const jsKeywords = new Set([
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "yield",
]);

const jsGlobals = new Set([
  "Array",
  "Boolean",
  "Date",
  "Error",
  "JSON",
  "Map",
  "Math",
  "Number",
  "Object",
  "Promise",
  "RegExp",
  "Set",
  "String",
  "Symbol",
  "console",
  "document",
  "window",
]);

const cssTokenPattern =
  /(\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|#[\da-fA-F]{3,8}\b|@[a-z-]+|\b-?\d*\.?\d+(?:px|rem|em|vh|vw|%|s|ms|deg)?\b|[.#]?[a-zA-Z_-][\w-]*(?=\s*[:,{])|[{}:;,()])/g;

const htmlTokenPattern =
  /(<!--[\s\S]*?-->|<\/?[a-zA-Z][\w:-]*|\/?>|[a-zA-Z_:][\w:.-]*(?==)|"(?:&quot;|[^"])*"|'(?:&#39;|[^'])*')/g;

const htmlEscapeChars = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => htmlEscapeChars[char]);
}

function highlightTokens(code, pattern, classify) {
  const parts = [];
  let index = 0;
  let match;
  pattern.lastIndex = 0;

  while ((match = pattern.exec(code))) {
    const token = match[0];
    parts.push(
      escapeHtml(code.slice(index, match.index)),
      `<span class="token-${classify(token)}">${escapeHtml(token)}</span>`,
    );
    index = match.index + token.length;
  }

  parts.push(escapeHtml(code.slice(index)));
  return parts.join("") || "<br>";
}

export function highlightJs(code) {
  return highlightTokens(code, jsTokenPattern, (token) => {
    if (token.startsWith("//") || token.startsWith("/*")) return "comment";
    const first = token[0];
    if (first === '"' || first === "'" || first === "`") return "string";
    if (/^\d/.test(token)) return "number";
    if (first === "." || first === "#") return "property";
    if (jsKeywords.has(token)) return "keyword";
    if (jsGlobals.has(token)) return "global";
    if (/^[A-Za-z_$]/.test(first)) return "property";
    return "punctuation";
  });
}

export function highlightCss(code) {
  return highlightTokens(code, cssTokenPattern, (token) => {
    if (token.startsWith("/*")) return "comment";
    if (token[0] === '"' || token[0] === "'") return "string";
    if (token[0] === "#") return "color";
    if (token[0] === "@") return "at-rule";
    if (/^-?\d/.test(token)) return "number";
    if (/^[{}:;,()]$/.test(token)) return "punctuation";
    if (/[.#]/.test(token[0])) return "selector";
    return "property";
  });
}

export function highlightHtml(code) {
  return highlightTokens(code, htmlTokenPattern, (token) => {
    if (token.startsWith("<!--")) return "comment";
    if (token[0] === "<" || token === ">" || token === "/>") return "tag";
    if (token[0] === '"' || token[0] === "'") return "string";
    return "attr";
  });
}

export function escapeAttribute(value) {
  return value.replace(
    /[&"]/g,
    (char) =>
      ({
        "&": "&amp;",
        '"': "&quot;",
      })[char],
  );
}
