document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos do DOM ---
  const passwordInput = document.getElementById('password');
  const copyBtn = document.getElementById('copy-btn');
  const lengthSlider = document.getElementById('length');
  const lengthValue = document.getElementById('length-value');
  const uppercaseCheck = document.getElementById('uppercase');
  const lowercaseCheck = document.getElementById('lowercase');
  const numbersCheck = document.getElementById('numbers');
  const symbolsCheck = document.getElementById('symbols');
  const generateBtn = document.getElementById('generate-btn');
  const strengthLabel = document.getElementById('strength-label');
  const strengthBar = document.querySelector('.strength-bar');

  // --- Conjuntos de Caracteres ---
  const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // --- Preloader & Animações de Entrada ---
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('hide');
      }
      document.body.classList.add('loaded');
    }, 400);
  });

  // --- Gerador de Números Aleatórios Seguros ---
  function getRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  // --- Função Principal: Gerar Password ---
  function generatePassword() {
    const length = parseInt(lengthSlider.value, 10);
    let pool = '';
    let guaranteedChars = [];

    if (uppercaseCheck.checked) {
      pool += CHAR_SETS.uppercase;
      guaranteedChars.push(CHAR_SETS.uppercase[getRandomInt(CHAR_SETS.uppercase.length)]);
    }
    if (lowercaseCheck.checked) {
      pool += CHAR_SETS.lowercase;
      guaranteedChars.push(CHAR_SETS.lowercase[getRandomInt(CHAR_SETS.lowercase.length)]);
    }
    if (numbersCheck.checked) {
      pool += CHAR_SETS.numbers;
      guaranteedChars.push(CHAR_SETS.numbers[getRandomInt(CHAR_SETS.numbers.length)]);
    }
    if (symbolsCheck.checked) {
      pool += CHAR_SETS.symbols;
      guaranteedChars.push(CHAR_SETS.symbols[getRandomInt(CHAR_SETS.symbols.length)]);
    }

    // Validação: nenhuma opção selecionada
    if (pool === '') {
      passwordInput.value = 'Selecione 1 opção!';
      updateStrengthUI(0);
      return;
    }

    // Preencher o restante tamanho da password
    let resultChars = [...guaranteedChars];
    for (let i = guaranteedChars.length; i < length; i++) {
      resultChars.push(pool[getRandomInt(pool.length)]);
    }

    // Misturar os caracteres (Fisher-Yates Shuffle)
    for (let i = resultChars.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
    }

    const finalPassword = resultChars.join('');
    passwordInput.value = finalPassword;

    // Atualizar indicador de força
    calculateStrength(finalPassword);
  }

  // --- Cálculo da Força da Password ---
  function calculateStrength(password) {
    let score = 0;
    const len = password.length;

    // Critérios de tamanho
    if (len >= 8) score += 1;
    if (len >= 12) score += 1;
    if (len >= 16) score += 1;

    // Critérios de complexidade
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    updateStrengthUI(score);
  }

  function updateStrengthUI(score) {
    if (score <= 2) {
      strengthLabel.textContent = 'Fraca';
      strengthBar.style.width = '25%';
      strengthBar.style.backgroundColor = 'var(--weak-color, #ff453a)';
    } else if (score <= 4) {
      strengthLabel.textContent = 'Média';
      strengthBar.style.width = '50%';
      strengthBar.style.backgroundColor = 'var(--medium-color, #ffd60a)';
    } else if (score <= 6) {
      strengthLabel.textContent = 'Forte';
      strengthBar.style.width = '75%';
      strengthBar.style.backgroundColor = 'var(--strong-color, #30d158)';
    } else {
      strengthLabel.textContent = 'Muito Forte';
      strengthBar.style.width = '100%';
      strengthBar.style.backgroundColor = 'var(--strong-color, #30d158)';
    }
  }

  // --- Copiar para a Área de Transferência ---
  copyBtn.addEventListener('click', async () => {
    if (!passwordInput.value || passwordInput.value === 'Selecione 1 opção!') return;

    try {
      await navigator.clipboard.writeText(passwordInput.value);

      // Feedback visual temporário
      copyBtn.classList.remove('far', 'fa-clone');
      copyBtn.classList.add('fas', 'fa-check');
      copyBtn.style.color = 'var(--strong-color, #30d158)';

      setTimeout(() => {
        copyBtn.classList.remove('fas', 'fa-check');
        copyBtn.classList.add('far', 'fa-clone');
        copyBtn.style.color = '';
      }, 1500);
    } catch (err) {
      console.error('Erro ao copiar password:', err);
    }
  });

  // --- Listeners para Interatividade ---
  lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
    generatePassword();
  });

  generateBtn.addEventListener('click', generatePassword);

  [uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck].forEach((checkbox) => {
    checkbox.addEventListener('change', generatePassword);
  });

  // --- Gerar password inicial ao arrancar ---
  generatePassword();
});