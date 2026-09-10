# Contact form — AJAX email integration

The portfolio now uses the **FormSubmit AJAX API** rather than a normal HTML form redirect.

Endpoint:
`https://formsubmit.co/ajax/taniyavishwakarma8844@mail.com`

FormSubmit documents that its AJAX endpoint can submit cross-origin without taking the visitor away from the website.

## What happens on taniyav.in

1. Visitor fills in the form.
2. Visitor selects discussion type, meeting date and time if needed.
3. Visitor clicks **Send message**.
4. The page stays on `taniyav.in`.
5. A sending state is shown.
6. On success, the form is cleared and a success message appears.
7. The submission is delivered to the configured email address.

## Important

The site should be deployed over HTTPS at `https://taniyav.in`.

On the first real FormSubmit submission, FormSubmit may require email activation/confirmation for the receiving address.

No API key is embedded in the website.

If you want a different provider later, Web3Forms is another static-site API option that uses an access key and supports JavaScript/AJAX submissions.
