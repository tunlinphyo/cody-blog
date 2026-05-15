import { LitElement, html } from "lit";
import { CodeJar } from "codejar";
import resetStyles from "../../assets/styles/reset.css?inline";
import utilsStyles from "../../assets/styles/utils.css?inline";
import editorStyles from "./tiny-code-editor.css?inline";
import { litStaticStyles } from "../utils.js";
import { highlightCss, highlightHtml, highlightJs } from "./utils.js";

export class TinyCodeEditor extends LitElement {
  static properties = {
    value: { type: String },
    language: { type: String, reflect: true },
    readonly: { type: Boolean, reflect: true },
  };

  static styles = litStaticStyles(resetStyles, utilsStyles, editorStyles);

  constructor() {
    super();
    this.value = "";
    this.language = "js";
    this.readonly = false;

    this.jar = null;
    this.editorElement = null;
    this.isInternalUpdate = false;
  }

  render() {
    return html` <div id="editor" class="editor" role="textbox" aria-multiline="true"></div> `;
  }

  firstUpdated() {
    this.editorElement = this.renderRoot.querySelector("#editor");

    this.jar = CodeJar(this.editorElement, (editor) => this.highlightCode(editor), {
      tab: "  ",
      spellcheck: false,
      catchTab: true,
      preserveIdent: true,
      addClosing: true,
    });
    this.configureEditorScrolling();

    this.jar.updateCode(this.value || "");

    this.jar.onUpdate((code) => {
      this.isInternalUpdate = true;
      this.value = code;

      this.dispatchEvent(
        new Event("input", {
          bubbles: true,
          composed: true,
        }),
      );

      this.dispatchEvent(
        new CustomEvent("value-change", {
          detail: { value: code },
          bubbles: true,
          composed: true,
        }),
      );

      this.isInternalUpdate = false;
    });

    this.syncReadonly();
  }

  updated(changedProperties) {
    if (
      changedProperties.has("value") &&
      this.jar &&
      !this.isInternalUpdate &&
      this.jar.toString() !== (this.value || "")
    ) {
      this.jar.updateCode(this.value || "");
    }

    if (changedProperties.has("readonly")) {
      this.syncReadonly();
    }

    if (changedProperties.has("language")) {
      this.jar?.updateCode(this.jar.toString());
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.jar?.destroy();
  }

  syncReadonly() {
    if (!this.editorElement) return;

    this.editorElement.contentEditable = String(!this.readonly);
  }

  configureEditorScrolling() {
    Object.assign(this.editorElement.style, {
      height: "var(--tiny-code-editor-height, 100%)",
      overflow: "auto",
      overflowX: "auto",
      overflowY: "auto",
      overflowWrap: "normal",
      whiteSpace: "pre",
      wordBreak: "normal",
    });
  }

  highlightCode(editor) {
    const code = editor.textContent || "";
    const language = this.language?.toLowerCase();

    if (language === "html") {
      editor.innerHTML = highlightHtml(code);
      return;
    }

    if (language === "css") {
      editor.innerHTML = highlightCss(code);
      return;
    }

    editor.innerHTML = highlightJs(code);
  }

  focus() {
    this.editorElement?.focus();
  }

  get code() {
    return this.jar?.toString() ?? this.value;
  }

  set code(nextValue) {
    this.value = String(nextValue ?? "");
  }
}

if (!customElements.get("tiny-code-editor")) {
  customElements.define("tiny-code-editor", TinyCodeEditor);
}
