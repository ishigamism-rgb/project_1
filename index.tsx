/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';

const API_KEY = process.env.API_KEY;

const codeInput = document.getElementById('codeInput') as HTMLTextAreaElement;
const runButton = document.getElementById('runButton') as HTMLButtonElement;
const clearInputButton = document.getElementById('clearInputButton') as HTMLButtonElement;
const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
const buttonText = document.getElementById('buttonText') as HTMLSpanElement;
const outputContainer = document.getElementById('outputContainer') as HTMLDivElement;
const outputDiv = document.getElementById('output') as HTMLDivElement;

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function runCode() {
  const code = codeInput.value;
  if (!code.trim()) {
    outputContainer.style.display = 'block';
    outputDiv.classList.add('error');
    outputDiv.innerHTML = `<h2>エラー</h2><pre>実行するコードを入力してください。</pre>`;
    return;
  }

  // UI updates for loading state
  runButton.disabled = true;
  buttonText.textContent = '実行中...';
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  runButton.prepend(spinner);

  outputContainer.style.display = 'block';
  outputDiv.classList.remove('error');
  outputDiv.innerHTML = '<h2>実行中...</h2>';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: code,
      config: {
        tools: [{ codeExecution: {} }],
      },
    });

    let outputHTML = '';
    
    if (response.executableCode) {
        const formattedCode = await marked.parse('```python\n' + response.executableCode + '\n```');
        outputHTML += `<h2>実行されたコード</h2>${formattedCode}`;
    }

    if (response.codeExecutionResult) {
        const formattedResult = await marked.parse('```\n' + response.codeExecutionResult + '\n```');
        outputHTML += `<h2>結果</h2>${formattedResult}`;
    } else {
        outputHTML += `<h2>結果</h2><pre>出力はありませんでした。</pre>`;
    }

    outputDiv.innerHTML = outputHTML;

  } catch (e) {
    console.error(e);
    outputDiv.classList.add('error');
    const errorMessage = e instanceof Error ? e.message : String(e);
    outputDiv.innerHTML = `<h2>エラー</h2><pre>${errorMessage}</pre>`;
  } finally {
    // Restore UI
    runButton.disabled = false;
    buttonText.textContent = '実行';
    runButton.querySelector('.spinner')?.remove();
  }
}

function clearInput() {
    codeInput.value = '';
}

function clearOutput() {
    outputContainer.style.display = 'none';
    outputDiv.innerHTML = '';
    outputDiv.classList.remove('error');
}

runButton.addEventListener('click', runCode);
clearInputButton.addEventListener('click', clearInput);
clearButton.addEventListener('click', clearOutput);