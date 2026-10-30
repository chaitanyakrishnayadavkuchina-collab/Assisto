import tls from 'tls';
import 'dotenv/config';

function checkGmailImap() {
  const email = process.env.TEST_MAIL_ADDRESS || 'chaitukuchina@gmail.com';
  const password = (process.env.TEST_MAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  console.log(`Connecting to imap.gmail.com for ${email}...`);
  const client = tls.connect(993, 'imap.gmail.com', {}, () => {
    console.log('Connected to Gmail IMAP via TLS!');
  });

  let step = 0;
  client.setEncoding('utf8');

  client.on('data', (data) => {
    const str = data.toString('utf8');
    console.log('IMAP:', str.trim());
    if (step === 0 && str.includes('* OK')) {
      step = 1;
      client.write(`a1 LOGIN ${email} "${password}"\r\n`);
    } else if (step === 1 && data.includes('a1 OK')) {
      console.log('LOGIN SUCCESS!');
      step = 2;
      client.write(`a2 SELECT INBOX\r\n`);
    } else if (step === 2 && data.includes('a2 OK')) {
      console.log('INBOX SELECTED!');
      step = 3;
      client.write(`a3 FETCH 23:27 (BODY.PEEK[HEADER.FIELDS (SUBJECT TO DATE FROM)])\r\n`);
    } else if (step === 3 && data.includes('a3 OK')) {
      step = 4;
      client.write(`a4 LOGOUT\r\n`);
    }
  });

  client.on('end', () => {
    console.log('IMAP connection closed.');
  });

  client.on('error', (err) => {
    console.error('IMAP error:', err);
  });
}

checkGmailImap();
