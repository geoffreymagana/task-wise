# TaskWise - Intelligent Task Management

TaskWise is a modern, AI-powered task management application built with Next.js and the Genkit AI framework. It's designed to help you turn unstructured thoughts and plans into actionable, organized tasks with ease. With multiple dynamic views like lists, Kanban boards, timelines, and mind maps, TaskWise provides a flexible and powerful way to visualize and manage your work.

## ✨ Key Features

*   **AI-Powered Task Parsing**: Speak or type your plans in natural language, and let the AI intelligently parse, categorize, and schedule your tasks.
*   **Multiple Views**: Visualize your tasks in the way that works best for you, including:
    *   Table/List View
    *   Kanban Board
    *   Timeline View
    *   Mind Map
*   **AI Time Estimation**: Get automatic time estimates for your tasks based on their complexity and description.
*   **Local-First Storage**: Your data is stored securely in your browser's local storage, ensuring privacy and offline access.
*   **Modern Tech Stack**: Built with Next.js, TypeScript, Tailwind CSS, and ShadCN for a high-quality, maintainable, and beautiful user experience.
*   **Push Notifications**: Get reminders for upcoming tasks.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

4.  **Run the development server:**
    The application requires two processes to run concurrently: the Next.js frontend and the Genkit AI flows.

    *   **Start the Next.js app:**
        ```bash
        npm run dev
        ```
        Your application will be available at `http://localhost:9002`.

    *   **Start the Genkit flows:**
        In a separate terminal, run:
        ```bash
        npm run genkit:watch
        ```
        This will start the Genkit development server and watch for changes in your AI flows.

## 📂 Project Structure

Here's a brief overview of the key directories in the project:

```
/
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (landing)/      # Pages for the marketing site
│   │   └── dashboard/      # The main application dashboard
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # Individual AI-powered flows (e.g., parsing, estimation)
│   │   └── genkit.ts       # Genkit initialization
│   ├── components/         # Reusable React components
│   │   ├── common/         # General components (header, icons)
│   │   ├── task-manager/   # Components related to task management
│   │   ├── task-views/     # Components for different task visualizations
│   │   └── ui/             # ShadCN UI components
│   ├── hooks/              # Custom React hooks (e.g., useTaskManager)
│   ├── lib/                # Shared utilities, types, and actions
│   └── public/             # Static assets
└── ...
```

## 🛠️ Available Scripts

*   `npm run dev`: Starts the Next.js development server.
*   `npm run genkit:dev`: Starts the Genkit AI server.
*   `npm run genkit:watch`: Starts the Genkit AI server in watch mode.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase.

## 💻 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN](https://ui.shadcn.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **State Management**: React Hooks & Context API

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
# task-wise
