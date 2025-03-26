# LocalScore

LocalScore is an open-source benchmarking tool and public database for measuring how fast Large Language Models (LLMs) run on your specific hardware.

Check out [localscore.ai](https://localscore.ai) to explore benchmark results.

<p align="center">
   <i>
      <br />
      <a href="https://builders.mozilla.org/"><img src="public/mozilla-logo.png" width="200"></a><br/>
      <a href="https://localscore.ai">LocalScore</a> is a <a href="https://builders.mozilla.org/">Mozilla Builders</a> project.
   </i>
</p>

## About

LocalScore helps answer questions like:
- Can my computer run an 8 billion parameter LLM?
- Which GPU should I buy for my local AI setup?
- How does my current hardware stack up against others?

It measures three key performance metrics:
- **Prompt Processing Speed**: How quickly your system processes input text (tokens per second)
- **Generation Speed**: How fast your system generates new text (tokens per second)
- **Time to First Token**: The latency before the response begins to appear (milliseconds)

These metrics are combined into a **LocalScore**, making it easy to compare different hardware configurations. A score of 1,000 is excellent, 250 is passable, and below 100 will likely be a poor user experience or have significant tradeoffs.

LocalScore leverages [Llamafile](https://github.com/Mozilla-Ocho/llamafile) to ensure portability and acceleration across different systems.

## Supported Hardware

- CPUs (various architectures)
- NVIDIA GPUs
- AMD GPUs
- Apple Silicon (M series)

Currently supports single-GPU setups, which represents the most practical approach for most users running LLMs locally.

## Database Submissions

LocalScore maintains a public database of benchmark results. Currently, submissions are accepted from:

- The official LocalScore CLI client

We welcome contributions from other clients in the future. If you're developing a client that would like to submit to the LocalScore database, please ensure it conforms to the submission specification defined in `src/pages/api/results`. Please reach out to [contact@localscore.ai](mailto:contact@localscore.ai) for the inclusion of your client.

The submission API expects properly formatted benchmark data including hardware details, model information, and performance metrics. Reviewing the existing implementation will provide the best guidance on the expected format.

## Stack

This is a Next.js Pages Router application. It uses SQLite (via libSQL) for the database and Drizzle ORM for database interactions. The repo ships with an example SQLite database which can be used for development and testing.

## Prerequisites

- [Bun](https://bun.sh/) / Node.js

## Local Development Setup

1. Install Bun (or the Node.js runtime of your choice) if you haven't already:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
   
   After installation, you may need to add Bun to your PATH. Follow the instructions displayed after installation.

2. Clone the repository:
   ```bash
   git clone git@github.com:cjpais/LocalScore.git
   cd LocalScore 
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

An example SQLite database is included in the repository, so there's no need to set up a database for local development. 

However if you wish to use a remote (libSQL) database. Configure the following .env vars. Currently Turso is used in production, but other libSQL remote databases can be used.

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

## Contributing

Contributions are welcome! Here's how you can help:

### Setting Up for Development

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone git@github.com:yourusername/LocalScore.git
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream git@github.com:cjpais/LocalScore.git
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Make a pull request when you're ready

### Contribution Guidelines

- **Code Style**: Follow the existing code style and use TypeScript
- **Documentation**: Update documentation for any changes you make
- **Pull Requests**: Keep PRs focused on a single feature or bug fix
- **Issues**: Check existing issues before opening a new one

## Future Work

We are thinking of some features to add in the future:

* **API Endpoints**: Add public API endpoints for querying the database. If you have ideas for what you would build and what you would want/need, please let us know.
* **Multi-GPU Support**: Add support for multi-GPU setups.
* **Upstreaming to llama.cpp**: If the changes are welcome, we would love to upstream the LocalScore CLI client to llama.cpp.

If you have any ideas for features or improvements, please open an issue or submit a pull request.

## Feedback

We would love to hear your feedback! Please open an Issue/Disccusion or reach out to [contact@localscore.ai](mailto:contact@localscore.ai) with any suggestions, questions, or comments.

## Acknowledgements

LocalScore was created with support from [Mozilla Builders](https://builders.mozilla.org/) as a resource for the AI community. It builds upon the excellent work of [llama.cpp](https://github.com/ggml-org/llama.cpp) and [Llamafile](https://github.com/Mozilla-Ocho/llamafile).

## 📄 License

This project is licensed under the [Apache 2.0 License](LICENSE).
