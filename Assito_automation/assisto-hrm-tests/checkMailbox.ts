import { MailSacClient } from './utils/MailSacClient';
import 'dotenv/config';

async function main() {
  const client = new MailSacClient(process.env.MAIL_SAC_API_KEY);
  const messages = await client.getMessages('assisto_test@mailsac.com');
  console.log('Messages in assisto_test@mailsac.com:', JSON.stringify(messages, null, 2));

  for (const msg of messages) {
    const text = await client.getMessageText('assisto_test@mailsac.com', msg._id);
    console.log(`Msg ${msg._id} (${msg.subject}):`, text.slice(0, 300));
  }
}

main().catch(err => console.error(err));
