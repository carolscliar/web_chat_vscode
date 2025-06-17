import express from 'express';
import * as http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Store connected clients and chat history
const clients = new Set<WebSocket>();
let chatHistory: string[] = [];

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  ws.on('message', (data) => {
    let text = data.toString();
    // Save all chat messages to history with Europe/Lisbon local time and mm/dd/yyyy date format
    const now = new Date();
    const lisbonTime = now.toLocaleString('en-GB', { timeZone: 'Europe/Lisbon', hour12: false });
    let [date, time] = lisbonTime.split(', ');
    if (date) {
      const [day, month, year] = date.split('/');
      date = `${month}/${day}/${year}`;
    }
    const historyLine = `[${date} ${time}] ${text}`;
    chatHistory.push(historyLine);
    // Automatically save chat history after every message
    try {
      const historyFile = path.join(process.cwd(), 'chat_history.txt');
      fs.writeFileSync(historyFile, chatHistory.join('\n'), { encoding: 'utf8' });
    } catch (err) {
      // Ignoring file write errors for now
    }
    // Checking for file creation command
    const match = text.match(/create a new file named (\S+)(?: in the (\S+) project)?/i);
    if (match) {
      const filename = match[1];
      let filePath;
      if (filename.startsWith('src/')) {
        filePath = path.join(process.cwd(), filename);
      } else {
        filePath = path.join(process.cwd(), filename);
      }
      try {
        if (!fs.existsSync(path.dirname(filePath))) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, '<!-- Created by chat command -->');
          ws.send(`File '${filename}' created successfully.`);
        } else {
          ws.send(`File '${filename}' already exists.`);
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
    // Checking for file write command
    } else {
      const writeMatch = text.match(/write (.+) to file (\S+)/i);
      if (writeMatch) {
        const content = writeMatch[1];
        const filename = writeMatch[2];
        const filePath = path.join(process.cwd(), filename);
        try {
          if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
          }
          fs.writeFileSync(filePath, content, { encoding: 'utf8' });
          ws.send(`Content written to file '${filename}' successfully.`);
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for file read command
      const readMatch = text.match(/read (?:the )?file (\S+)/i);
      if (readMatch) {
        const filename = readMatch[1];
        const filePath = path.join(process.cwd(), filename);
        try {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, { encoding: 'utf8' });
            ws.send(`Content of file '${filename}':\n${content}`);
          } else {
            ws.send(`File '${filename}' does not exist.`);
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for list files command
      const listMatch = text.match(/list files in (?:the )?folder (\S+)/i);
      if (listMatch) {
        const folder = listMatch[1];
        const folderPath = path.join(process.cwd(), folder);
        try {
          if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath);
            ws.send(`Files in folder '${folder}':\n${files.join('\n')}`);
          } else {
            ws.send(`Folder '${folder}' does not exist.`);
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for delete file command
      const deleteMatch = text.match(/delete (?:the )?file (\S+)/i);
      if (deleteMatch) {
        const filename = deleteMatch[1];
        const filePath = path.join(process.cwd(), filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            ws.send(`File '${filename}' deleted successfully.`);
          } else {
            ws.send(`File '${filename}' does not exist.`);
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for clear file command
      const clearMatch = text.match(/clear (?:the )?file (\S+)/i);
      if (clearMatch) {
        const filename = clearMatch[1];
        const filePath = path.join(process.cwd(), filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '', { encoding: 'utf8' });
            ws.send(`File '${filename}' cleared successfully.`);
          } else {
            ws.send(`File '${filename}' does not exist.`);
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for rename file command
      const renameMatch = text.match(/rename (?:the )?file (\S+) to (\S+)/i);
      if (renameMatch) {
        const oldName = renameMatch[1];
        const newName = renameMatch[2];
        const oldPath = path.join(process.cwd(), oldName);
        const newPath = path.join(process.cwd(), newName);
        try {
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            ws.send(`File '${oldName}' renamed to '${newName}' successfully.`);
          } else {
            ws.send(`File '${oldName}' does not exist.`);
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for move file command
      const moveMatch = text.match(/move (?:the )?file (\S+) to (\S+)/i);
      if (moveMatch) {
        const oldName = moveMatch[1];
        const newLocation = moveMatch[2];
        const oldPath = path.join(process.cwd(), oldName);
        const newPath = path.join(process.cwd(), newLocation);
        try {
          if (fs.existsSync(oldPath)) {
            if (!fs.existsSync(path.dirname(newPath))) {
              fs.mkdirSync(path.dirname(newPath), { recursive: true });
            }
            fs.renameSync(oldPath, newPath);
            ws.send(`File '${oldName}' moved to '${newLocation}' successfully.`);
          } else {
            ws.send(`File '${oldName}' does not exist.`);
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Checking for export chat history command
      if (/export chat history/i.test(text)) {
        try {
          const historyFile = path.join(process.cwd(), 'chat_history.txt');
          fs.writeFileSync(historyFile, chatHistory.join('\n'), { encoding: 'utf8' });
          ws.send(`Chat history exported to 'chat_history.txt'.`);
        } catch (err) {
          ws.send(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
        return;
      }
      // Broadcast message to all clients
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      }
    }
  });
  ws.on('close', () => {
    clients.delete(ws);
  });
});

app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
