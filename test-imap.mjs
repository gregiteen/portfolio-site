import { ImapFlow } from 'imapflow';

const client = new ImapFlow({
  host: 'mail.ultrachat.app',
  port: 993,
  secure: true,
  auth: {
    user: 'sales@gregiteen.xyz',
    pass: 'custom webmail client'
  },
  logger: false
});

async function main() {
  try {
    await client.connect();
    console.log("SUCCESS!");
    await client.logout();
  } catch (err) {
    console.error("FAIL:", err.message);
  }
}
main();
