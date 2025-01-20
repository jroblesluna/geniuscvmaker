// pages/api/styles.js

import fs from 'fs';
import path from 'path';

export default (req, res) => {
  const cssPath = path.join(process.cwd(), 'src', 'styles', 'globals.css');
  fs.readFile(cssPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading CSS file');
      return;
    }
    res.setHeader('Content-Type', 'text/css');
    res.send(data);
  });
};
