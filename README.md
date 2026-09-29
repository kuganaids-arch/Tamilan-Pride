# Tamilan Pride

A production-ready public multi-server Discord bot inspired by the vibrant Tamil culture and community.

## Project structure

```
tamilan-pride/
├── apps/
│   ├── bot/              Discord bot runtime
│   ├── api/              REST API for dashboard and integrations
│   └── dashboard/        Next.js management dashboard
├── packages/
│   ├── database/         Prisma and database utilities
│   ├── shared/           Shared logic and helpers
│   └── types/            Common TypeScript types
├── prisma/               Prisma schema and migrations
├── .env.example          Environment variables template
├── docker-compose.yml    Local development stack
└── README.md
```

## Features

- Multi-guild support with isolated configuration
- Moderation tools (ban, kick, timeout, warnings)
- Ticket system with categories
- Giveaway management
- Reaction and button roles
- AutoMod protection
- Custom commands per server
- Leveling system
- Minecraft server integration
- Web dashboard with Discord OAuth2
- PostgreSQL database
- Redis caching

## Tech Stack

- **Bot**: Node.js 22+, TypeScript, discord.js v14
- **API**: Express/Fastify
- **Dashboard**: Next.js, React, Tailwind CSS
- **Database**: PostgreSQL, Prisma ORM
- **Caching**: Redis
- **Authentication**: Discord OAuth2

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 12+
- Redis 6+
- Discord Developer Application

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/kuganaids-arch/Tamilan-Pride.git
   cd Tamilan-Pride
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```

4. Initialize the database
   ```bash
   npx prisma migrate dev
   ```

5. Start development servers
   ```bash
   npm run dev
   ```

### Using Docker

```bash
docker-compose up
```

## Database

Models include:
- Guild (per-server configuration)
- User
- ModerationCase
- Warning
- Ticket & TicketMessage
- Giveaway
- ReactionRole & ButtonRole
- CustomCommand
- WelcomeConfig & LeaveConfig
- LoggingConfig
- AutoModConfig
- LevelingConfig
- MinecraftServer
- Reminder
- Suggestion & SuggestionVote

## Multi-Guild Architecture

Every database record includes `guildId` to ensure complete data isolation between Discord servers. No configuration from Guild A will ever affect Guild B.

## Security

- Permission and role validation
- Guild ownership verification
- Discord OAuth2 authentication
- Input validation and sanitization
- Rate limiting and cooldowns
- Secure environment variable handling

## Deployment

Supported platforms:
- Docker
- Render
- Railway
- VPS with Node.js

## License

MIT

## Support

For issues and contributions, please open a GitHub issue.
