# LocalScore

![LocalScore](public/localscore_logo.png)

LocalScore is an open-source benchmarking tool and public database for measuring how fast Large Language Models (LLMs) run on your specific hardware.

## 🚀 About

LocalScore helps answer questions like:
- Can my computer run an 8 billion parameter model smoothly?
- Which GPU should I buy for my local AI setup?
- How does my current hardware stack up against others?

It measures three key performance metrics:
- **Prompt Processing Speed**: How quickly your system processes input text (tokens per second)
- **Generation Speed**: How fast your system generates new text (tokens per second)
- **Time to First Token**: The latency before the first response appears (milliseconds)

These metrics are combined into a single **LocalScore** value, making it easy to compare different hardware configurations. A score of 1,000 is excellent, whereas a score of 100 is not so great.

LocalScore leverages [llamafile](https://github.com/Mozilla-Ocho/llamafile) to ensure portability across different systems.

## 🖥️ Supported Hardware

- CPUs (various architectures)
- NVIDIA GPUs
- AMD GPUs
- Apple Silicon (M1/M2/M3 series)

Currently supports single-GPU setups, which represents the most practical approach for most users running LLMs locally.

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Runtime**: Bun
- **Tools**: TypeScript, Drizzle-kit

## 📋 Prerequisites

- [Bun](https://bun.sh/)
- PostgreSQL database
- Node.js (optional, if not using Bun)

## 🚀 Getting Started

1. Install Bun if you haven't already:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
   
   After installation, you may need to add Bun to your PATH. Follow the instructions displayed after installation.

2. Clone the repository:
   ```bash
   git clone git@github.com:Mozilla-Ocho/LocalScore.git
   cd llamascore
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Set up environment variables by creating a `.env.local` file in the root directory with the following content:
   ```
   # Database Configuration
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   
   # Additional configuration options (if needed)
   # API_URL=http://localhost:3000/api
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

6. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Setup

LocalScore uses PostgreSQL with the Drizzle ORM. To set up the database:

1. Make sure you have PostgreSQL installed and running
2. Create a new database for LocalScore
3. Update the `.env.local` file with your database credentials
4. Run the database migrations:
   ```bash
   bun run drizzle-kit push:pg
   ```

## 📝 Project Structure

```
llamascore/
├── app/                    # App Router components (Next.js 13+)
├── drizzle/                # Drizzle ORM migrations
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── db/                 # Database models and queries
│   │   ├── index.ts        # Database connection
│   │   ├── queries.ts      # Database queries
│   │   └── schema.ts       # Database schema
│   ├── lib/                # Utility functions and hooks
│   ├── middleware.ts       # Next.js middleware
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes
│   │   ├── download/       # Download page and components
│   │   ├── _app.tsx        # Custom App component
│   │   ├── _document.tsx   # Custom Document component
│   │   ├── about.tsx       # About page
│   │   └── index.tsx       # Home page
│   └── styles/             # Global styles
├── .env.local              # Environment variables (create this file)
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore file
├── drizzle.config.ts       # Drizzle configuration
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Setting Up for Development

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone git@github.com:yourusername/LocalScore.git
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream git@github.com:Mozilla-Ocho/LocalScore.git
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. Make your changes
2. Run tests (if available):
   ```bash
   bun test
   ```
3. Make sure your code follows the project's style guidelines:
   ```bash
   bun lint
   ```
4. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```
5. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

### Contribution Guidelines

- **Code Style**: Follow the existing code style and use TypeScript properly
- **Commit Messages**: Write clear, concise commit messages
- **Documentation**: Update documentation for any changes you make
- **Tests**: Add tests for new features (when applicable)
- **Pull Requests**: Keep PRs focused on a single feature or bug fix
- **Issues**: Check existing issues before opening a new one

## 📚 Documentation

For more detailed documentation on the LocalScore benchmark, see the [official documentation](https://github.com/Mozilla-Ocho/LocalScore) or the [llamafile repository](https://github.com/cjpais/llamafile/tree/cjpais/localscore/llama.cpp/localscore).

## ⚠️ Windows Users

Due to limitations with llamafile distributions, Windows users can't run models larger than 4GB directly. Instead, you'll need to use LocalScore as a standalone utility and pass in your models in GGUF format to the benchmarking application.

## 🙏 Acknowledgements

LocalScore was created with support from [Mozilla Builders](https://builders.mozilla.org/) as a resource for the AI community. It builds upon the excellent work of [llama.cpp](https://github.com/ggml-org/llama.cpp) and [llamafile](https://github.com/Mozilla-Ocho/llamafile).

## 📄 License

This project is licensed under the [MIT License](LICENSE).