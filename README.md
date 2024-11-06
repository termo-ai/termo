# Enhanced Open Interpreter UI

A modern web interface for Open Interpreter, featuring real-time code execution, file system navigation, and a sleek chat interface.

![Open Interpreter UI](screenshot.png)

## 🌟 Features

- 💻 **Real-time Code Execution**: Execute code directly in the chat interface
- 📁 **File System Navigation**: Browse and manage your files with an intuitive sidebar
- 🌙 **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing
- 💬 **Chat Interface**: Natural conversation with the interpreter
- 📊 **Code Output Display**: Clean display of code execution results
- 📤 **Export Conversations**: Save your chat history for later reference

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- pip
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/enhanced-open-interpreter.git
cd enhanced-open-interpreter
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

#### Using Python directly:
```bash
uvicorn main:app --reload
```

#### Using Docker:
```bash
docker build -t open-interpreter-ui .
docker run -p 8000:8000 open-interpreter-ui
```

Visit `http://localhost:8000` in your browser.

## 🏗️ Project Structure

```
.
├── app
│   ├── core
│   │   ├── config.py      # Configuration settings
│   │   └── websocket.py   # WebSocket core functionality
│   ├── routers
│   │   ├── directory.py   # File system routes
│   │   └── websocket.py   # WebSocket routes
│   ├── services
│   │   ├── directory.py   # File system operations
│   │   └── interpreter.py # Interpreter service
│   ├── static
│   │   ├── css
│   │   └── js
│   └── templates
└── main.py
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Uses [Open Interpreter](https://github.com/KillianLucas/open-interpreter)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/enhanced-open-interpreter](https://github.com/yourusername/enhanced-open-interpreter)