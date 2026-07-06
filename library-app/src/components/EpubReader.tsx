import React from 'react';
import { Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  html: string;
  fontSize?: number;
  lineHeight?: number;
}

export function EpubReader({ html, fontSize = 17, lineHeight = 1.85 }: Props) {
  const { tokens } = useTheme();

  const themedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Georgia, serif;
          font-size: ${fontSize}px;
          line-height: ${lineHeight};
          color: ${tokens.text};
          background: ${tokens.page};
          padding: 0;
          margin: 0;
        }
        h1, h2, h3 {
          font-weight: 600;
          color: ${tokens.accent};
          margin-top: 24px;
        }
        h1 { font-size: 28px; }
        h2 { font-size: 22px; }
        h3 { font-size: ${fontSize}px; font-style: italic; }
        p { margin-bottom: 14px; }
        strong { color: ${tokens.accent}; }
        ul, ol { padding-left: 20px; margin-bottom: 14px; }
        li { margin-bottom: 6px; }
        blockquote {
          border-left: 3px solid ${tokens.accent};
          padding-left: 16px;
          margin-left: 0;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  return (
    <WebView
      source={{ html: themedHtml }}
      style={{ height: Dimensions.get('window').height * 0.55, backgroundColor: tokens.page }}
      originWhitelist={['*']}
    />
  );
}
