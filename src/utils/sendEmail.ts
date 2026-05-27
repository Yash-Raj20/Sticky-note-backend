interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions) => {
  // Use Brevo (Sendinblue) HTTP API which is completely free and works without a custom domain.
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error("BREVO_API_KEY is missing in environment variables");
    return;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Sticky Notes', email: process.env.EMAIL_USER || 'hello@stickynotes.com' },
      to: [{ email: options.email }],
      subject: options.subject,
      textContent: options.message,
      htmlContent: options.html,
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send email via Brevo');
  }
};

export default sendEmail;
