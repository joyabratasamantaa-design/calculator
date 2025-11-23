let display = document.getElementById('display');
let currentInput = '';
let lastResult = null;

function appendNumber(number) {
    currentInput += number;
    updateDisplay();
}

function appendOperator(operator) {
    if (currentInput === '' && lastResult !== null && operator !== '(') {
        currentInput = lastResult.toString();
    }
    currentInput += operator;
    updateDisplay();
}

function updateDisplay() {
    display.value = currentInput || '0';
}

function clearDisplay() {
    currentInput = '';
    lastResult = null;
    updateDisplay();
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function calculate() {
    try {
        if (currentInput === '') return;

        let expression = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/%/g, '/100');

        let result = eval(expression);

        if (!isFinite(result)) {
            throw new Error('Invalid calculation');
        }

        result = Math.round(result * 100000000) / 100000000;

        saveToHistory(currentInput, result);

        lastResult = result;
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            currentInput = '';
            updateDisplay();
        }, 1500);
    }
}

function calculateScientific(func) {
    try {
        let value;

        if (currentInput === '') {
            if (lastResult !== null) {
                value = lastResult;
            } else {
                return;
            }
        } else {
            let expression = currentInput
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/%/g, '/100');
            value = eval(expression);
        }

        let result;
        let operation;

        switch(func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                operation = `sin(${value})`;
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                operation = `cos(${value})`;
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                operation = `tan(${value})`;
                break;
            case 'log':
                result = Math.log10(value);
                operation = `log(${value})`;
                break;
            case 'ln':
                result = Math.log(value);
                operation = `ln(${value})`;
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                operation = `√(${value})`;
                break;
            case 'square':
                result = Math.pow(value, 2);
                operation = `(${value})²`;
                break;
            case 'reciprocal':
                result = 1 / value;
                operation = `1/(${value})`;
                break;
            case 'exp':
                result = Math.exp(value);
                operation = `e^(${value})`;
                break;
        }

        if (!isFinite(result)) {
            throw new Error('Invalid calculation');
        }

        result = Math.round(result * 100000000) / 100000000;

        saveToHistory(operation, result);

        lastResult = result;
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            currentInput = '';
            updateDisplay();
        }, 1500);
    }
}

function saveToHistory(expression, result) {
    let history = getHistory();

    history.unshift({
        expression: expression,
        result: result,
        timestamp: new Date().toISOString()
    });

    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    displayHistory();
}

function getHistory() {
    const historyData = localStorage.getItem('calculatorHistory');
    return historyData ? JSON.parse(historyData) : [];
}

function displayHistory() {
    const historyList = document.getElementById('history-list');
    const history = getHistory();

    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="reuseCalculation(${index})">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `).join('');
}

function reuseCalculation(index) {
    const history = getHistory();
    const item = history[index];
    currentInput = item.result.toString();
    lastResult = item.result;
    updateDisplay();
}

function clearHistory() {
    if (confirm('Clear all calculation history?')) {
        localStorage.removeItem('calculatorHistory');
        displayHistory();
    }
}

document.addEventListener('keydown', function(event) {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber(key);
    } else if (key === '+' || key === '-') {
        appendOperator(key);
    } else if (key === '*') {
        appendOperator('×');
    } else if (key === '/') {
        appendOperator('÷');
        event.preventDefault();
    } else if (key === '%') {
        appendOperator('%');
    } else if (key === '(' || key === ')') {
        appendOperator(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
        event.preventDefault();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

window.addEventListener('load', function() {
    displayHistory();
    updateDisplay();
});
