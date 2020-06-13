import "@material/mwc-button/mwc-button";
import "@polymer/paper-input/paper-input";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import "../../components/ha-dialog";
import "../../components/ha-switch";
import { PolymerChangedEvent } from "../../polymer-types";
import { haStyleDialog } from "../../resources/styles";
import { HomeAssistant } from "../../types";
import { DialogParams } from "./show-dialog-box";

@customElement("dialog-box")
class DialogBox extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() private _params?: DialogParams;

  @property() private _value?: string;

  public async showDialog(params: DialogParams): Promise<void> {
    this._params = params;
    if (params.prompt) {
      this._value = params.defaultValue;
    }
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }

    const confirmPrompt = this._params.confirmation || this._params.prompt;

    return html`
      <ha-dialog
        open
        scrimClickAction
        escapeKeyAction
        @close=${this._close}
        .heading=${this._params.title
          ? this._params.title
          : this._params.confirmation &&
            this.hass.localize("ui.dialogs.generic.default_confirmation_title")}
      >
        <div>
          ${this._params.text
            ? html`
                <p
                  class=${classMap({
                    "no-bottom-padding": Boolean(this._params.prompt),
                  })}
                >
                  ${this._params.text}
                </p>
              `
            : ""}
          ${this._params.prompt
            ? html`
                <paper-input
                  autofocus
                  .value=${this._value}
                  @value-changed=${this._valueChanged}
                  @keyup=${this._handleKeyUp}
                  .label=${this._params.inputLabel
                    ? this._params.inputLabel
                    : ""}
                  .type=${this._params.inputType
                    ? this._params.inputType
                    : "text"}
                ></paper-input>
              `
            : ""}
        </div>
        ${confirmPrompt &&
        html`
          <mwc-button @click=${this._dismiss} slot="secondaryAction">
            ${this._params.dismissText
              ? this._params.dismissText
              : this.hass.localize("ui.dialogs.generic.cancel")}
          </mwc-button>
        `}
        <mwc-button @click=${this._confirm} slot="primaryAction">
          ${this._params.confirmText
            ? this._params.confirmText
            : this.hass.localize("ui.dialogs.generic.ok")}
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _valueChanged(ev: PolymerChangedEvent<string>) {
    this._value = ev.detail.value;
  }

  private async _dismiss(): Promise<void> {
    if (this._params!.cancel) {
      this._params!.cancel();
    }
    this._params = undefined;
  }

  private _handleKeyUp(ev: KeyboardEvent) {
    if (ev.keyCode === 13) {
      this._confirm();
    }
  }

  private async _confirm(): Promise<void> {
    if (this._params!.confirm) {
      this._params!.confirm(this._value);
    }
    this._dismiss();
  }

  private _close(): void {
    this._params = undefined;
  }

  static get styles(): CSSResult[] {
    return [
      haStyleDialog,
      css`
        :host([inert]) {
          pointer-events: initial !important;
          cursor: initial !important;
        }
        a {
          color: var(--primary-color);
        }
        p {
          margin: 0;
          padding-top: 6px;
          padding-bottom: 24px;
          color: var(--primary-text-color);
        }
        .no-bottom-padding {
          padding-bottom: 0;
        }
        .secondary {
          color: var(--secondary-text-color);
        }
        ha-dialog {
          /* Place above other dialogs */
          --dialog-z-index: 104;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-box": DialogBox;
  }
}
