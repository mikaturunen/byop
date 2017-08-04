export interface PaymentButton {
  name: string
  group: string

  html: {
    buttons: Array<HtmlPaymentButtonForm>
  }
}

// TODO after few test runs with the json schema, start using this https://mozilla-services.github.io/react-jsonschema-form/

/**
 * Generalized structure for a single render capable payment button.
 * Should generate HTML that roughly could look like this:
 *
 *   <form action="https://test.secret-bank.fi/something/api/something" method="post">
 *     <input type="hidden" name="total" value="20">
 *     <input type="hidden" name="reference" value="123">
 *     <input type="hidden" name="something" value="123">
 *     <input type="hidden" name="currency" value="EUR">
 *     <input type="hidden" name="version" value="4">
 *     <input type="hidden" name="confirmurl" value="https://payment.checkout.fi/fYBZzU28ov/fi/confirm?ORDER=123&amp;ORDERMAC=123">
 *     <input type="hidden" name="errorurl" value="https://payment.checkout.fi/fYBZzU28ov/fi/cancel">
 *     <input type="hidden" name="hash" value="test-123-test">
 *     <input type="hidden" name="duedate" value="12.12.2017">
 *     <input type="hidden" name="algorithm" value="03">
 *     <input type="hidden" name="language" value="1">
 *     <span>
 *       <input type="image" src="https://payment.checkout.fi//static/img/danskebank_140x75.png"></span>
 *     <div>Danske Bank</div>
 *   </form>
 *
 * Obviously you are free to render the buttons how ever you like, this is just an example of what it could be like and to help you understand
 * the structure of the JSON
 */
export interface HtmlPaymentButtonForm {
  // Render me as a form
  htmlElement: 'form'

  /**
   * Properties of this form
   */
  properties: {
    action: string
    method: 'post'
  }

  /**
   * Hidden inputs that will carry the form data over with the POST call to the third party (bank, loaner, etc),
   * the second element of the typle, span is the visual representation of the button
   */
  children: [Array<HtmlInputHidden>, HtmlSpanButton]
}

export interface HtmlSpanButton {
  // render me as a span
  htmlElement: 'span'

  children: Array<HtmlInputImage|HtmlInputHidden>
}

export interface HtmlButton {
  type: 'hidden'|'image'
}

export interface HtmlInputImage extends HtmlButton {
  src: string
}

export interface HtmlInputHidden extends HtmlButton {
  name: string
  value: any
}