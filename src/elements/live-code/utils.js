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

export function removeTrailingIncompleteHtmlTag(html) {
  const lastOpen = html.lastIndexOf("<");
  if (lastOpen === -1 || html.indexOf(">", lastOpen) !== -1) return html;

  const trailing = html.slice(lastOpen);
  if (/^<(?:!--[\s\S]*|!?\w[\w:-]*(?:\s[\s\S]*)?|\/[\w:-]*(?:\s*)?)$/.test(trailing)) {
    return html.slice(0, lastOpen);
  }

  return html;
}

export async function fetchCodeFile(baseUrl, fileName) {
  try {
    const response = await fetch(`${baseUrl}/${fileName}`);
    if (!response.ok) return "";

    const isAsset = fileName.endsWith(".css") || fileName.endsWith(".js");
    if (isAsset && response.headers.get("content-type")?.includes("text/html")) return "";

    const code = await response.text();
    return isAsset && /^\s*(?:<!doctype\s+html\b|<html\b)/i.test(code) ? "" : code;
  } catch {
    return "";
  }
}

export function normalizeFilePath(filePath) {
  let path = filePath.trim().replace(/\/+$/, "");
  if (path === "public" || path === "/public") return "/";
  path = path.replace(/^\/?public\//, "");
  return path.startsWith("/") ? path : `/${path}`;
}

export function parsePathList(paths) {
  return paths
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);
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

export function buildPreviewDocument({ htmlCode, cssCode, jsCode, previewStyles, previewModules }) {
  const html = removeTrailingIncompleteHtmlTag(htmlCode);
  const escapedCss = cssCode.replaceAll("</style>", "<\\/style>");
  const style = `<style>${escapedCss}</style>`;
  const script = `<script>
      try {
        ${jsCode.replaceAll("</script>", "<\\/script>")}
      } catch (error) {
        document.body.insertAdjacentHTML('beforeend',
          '<pre style="color:red;white-space:pre-wrap;padding:1rem;background:#fff0f0;">' + error + '</pre>'
        );
      }
    </script>`;

  if (/<(?:!doctype|html|head|body)\b/i.test(html)) {
    let doc = html;
    doc = /<\/head>/i.test(doc)
      ? doc.replace(/<\/head>/i, `${previewStyles}${style}</head>`)
      : `${previewStyles}${style}${doc}`;
    return /<\/body>/i.test(doc)
      ? doc.replace(/<\/body>/i, `${previewModules}${script}</body>`)
      : `${doc}${previewModules}${script}`;
  }

  return `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            ${previewStyles}
            ${style}
            <script type="module" async>
              import {isSupported, apply} from "https://unpkg.com/invokers-polyfill@latest/invoker.js"
              if (!isSupported()) apply();
            </script>
          </head>
          <body>
            ${html}
            ${previewModules}
            ${script}
          </body>
        </html>`.trim();
}

export function applyTabIndent(editor) {
  const { selectionStart, selectionEnd, value } = editor;
  const selected = value.slice(selectionStart, selectionEnd);

  if (selected.includes("\n")) {
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const replacement = value.slice(lineStart, selectionEnd).replace(/^/gm, "  ");
    editor.value = value.slice(0, lineStart) + replacement + value.slice(selectionEnd);
    editor.selectionStart = selectionStart + 2;
    editor.selectionEnd = lineStart + replacement.length;
  } else {
    editor.value = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
    editor.selectionStart = editor.selectionEnd = selectionStart + 2;
  }

  return editor.value;
}

export function applyAutoIndent(editor) {
  const { selectionStart, selectionEnd, value } = editor;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const currentIndent = value.slice(lineStart, selectionStart).match(/^\s*/)[0];
  const before = value[selectionStart - 1];
  const after = value[selectionEnd];
  const shouldIndent = "{[(".includes(before);
  const isBalancedPair =
    (before === "{" && after === "}") ||
    (before === "[" && after === "]") ||
    (before === "(" && after === ")");
  const nextIndent = shouldIndent ? `${currentIndent}  ` : currentIndent;
  const insert = isBalancedPair ? `\n${nextIndent}\n${currentIndent}` : `\n${nextIndent}`;
  const caret = selectionStart + 1 + nextIndent.length;

  editor.value = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  editor.selectionStart = editor.selectionEnd = caret;
  return editor.value;
}

export function applyAutoClose(editor, key) {
  const pairs = { "{": "}", "[": "]", "(": ")" };
  const close = pairs[key];
  if (!close) return undefined;

  const { selectionStart, selectionEnd, value } = editor;
  const selected = value.slice(selectionStart, selectionEnd);
  editor.value = `${value.slice(0, selectionStart)}${key}${selected}${close}${value.slice(selectionEnd)}`;
  editor.selectionStart = selected ? selectionStart + 1 : selectionStart + 1;
  editor.selectionEnd = selected ? selectionEnd + 1 : selectionStart + 1;
  return editor.value;
}
