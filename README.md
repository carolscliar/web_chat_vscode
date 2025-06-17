# INPUTS COPILOT CHAT

- **Create a new file:**
create a new file named src/example.txt 
(or outside the folder "example.txt")

- **Write content to a file:**
write Hello World! to file src/example.txt 
(or outside the folder "example.txt")

- **Write multi-line content to a file:**
write "<h1>Title</h1>\n<p>Paragraph</p>" to file src/example.txt 
(or outside the folder "example.txt")

- **Read a file’s content:**
read file src/example.txt
(or outside the folder "example.txt")

- **List files in a folder:**
list files in folder src

- **Delete a file:**
delete file src/example.txt
(or outside the folder "example.txt")

- **Clear a file’s content:**
clear file src/example.txt
(or outside the folder "example.txt")

- **Rename a file:**
rename file src/example.txt to src/example-renamed.txt
(or outside the folder "example.txt")

- **Move a file:**
move file src/example-renamed.txt to public/example-renamed.txt

# Limitations and AI/LLM Integration

Currently, this chat system supports only explicit, pattern-based commands for file and folder operations (see above for supported commands). It does not understand or process natural-language requests such as:

> Create a function that checks for duplicate entries in a list and returns their indices. Also, write a unit test for this function.

To enable support for natural-language, AI-powered code/file generation, you would need to integrate an AI/LLM backend (such as OpenAI, Azure OpenAI, or similar). This would allow the system to:
- Interpret user requests written in plain English
- Generate code, files, or tests based on those requests
- Automate more complex development tasks

**How to add LLM support:**
1. Sign up for an LLM API (e.g., OpenAI, Azure OpenAI, or open-source models)
2. Update the backend to send user requests to the LLM and handle the responses
3. Implement logic to create/update files with the generated code

Until such integration is added, only the listed pattern-based commands are supported.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# How to Run the Project

1. Open a terminal and start the backend server:
   ```powershell
   npm run dev:server
   ```
2. Open another terminal and start the frontend:
   ```powershell
   npm run dev
   ```

The backend will handle chat and file operations, while the frontend will launch the web-based chat UI.
