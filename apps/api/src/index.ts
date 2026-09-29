import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Tamilan Pride API' });
});

app.get('/api/guilds/:guildId', (req, res) => {
  res.json({
    guildId: req.params.guildId,
    status: 'ok',
    name: 'Guild',
    isMultiServer: true
  });
});

app.listen(port, () => {
  console.log(`Tamilan Pride API listening on port ${port}`);
});
