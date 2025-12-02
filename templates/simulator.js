const VAR_OPTIONS = ['P', 'Q', 'R', 'S', 'T', 'X', 'Y', 'Z'];
let inputConfig = [];
let recipeSteps = [];

function init() {
    updateInputConfig();
}


/**
 * Sets up the input boxes (A, B, C) based on how many inputs you selected.
 */
function updateInputConfig() {
    const num = parseInt(document.querySelector('input[name="num-inputs"]:checked').value);
    const container = document.getElementById('input-config-container');
    container.innerHTML = '';
    inputConfig = [];

    const labels = ['A', 'B', 'C'];
    for (let i = 0; i < num; i++) {
        const label = labels[i];
        const defaultVar = VAR_OPTIONS[i];


        inputConfig.push({ id: label, var: defaultVar, not: false });


        const div = document.createElement('div');
        div.className = 'config-row';
        div.innerHTML = `
        <span style="font-weight:bold; color:var(--primary)">Input ${label}</span>
        <label class="radio-label">
            <input type="checkbox" onchange="updateInputState('${label}', 'not', this.checked)"> ¬
        </label>
        <select onchange="updateInputState('${label}', 'var', this.value)">
            ${VAR_OPTIONS.map(v => `<option value="${v}" ${v === defaultVar ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
    `;
        container.appendChild(div);
    }


    recipeSteps = [{ id: 1, op: 'AND', not1: false, not2: false }];
    renderBuilder();
}


function updateInputState(id, field, value) {
    const item = inputConfig.find(x => x.id === id);
    if (item) item[field] = value;
    renderBuilder();
}


function addRecipeStep() {
    if (recipeSteps.length >= 2) return;
    recipeSteps.push({ id: 2, op: 'AND', not2: false });
    renderBuilder();
}


function removeRecipeStep() {
    recipeSteps.pop();
    renderBuilder();
}


function updateStep(index, field, value) {
    recipeSteps[index][field] = value;
}

/**
 * Updates the screen to show the current steps for building the circuit.
 * It adds the boxes and buttons you see based on the number of inputs you selected.
 */
function renderBuilder() {
    const container = document.getElementById('builder-container');
    container.innerHTML = '';
    const numInputs = inputConfig.length;
    const btn = document.querySelector('.builder-btn');


    const step1 = recipeSteps[0];
    const step1HTML = `
    <div class="recipe-step">
        <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">Start with Inputs A & B</div>
        </div>
        <div class="recipe-row">
            <div class="fixed-input">Input ${inputConfig[0].id} (${inputConfig[0].var})</div>
            
            // <label class="radio-label"><input type="checkbox" ${step1.not1 ? 'checked' : ''} onchange="updateStep(0, 'not1', this.checked)"> ¬</label>
            
            <select class="op-select" onchange="updateStep(0, 'op', this.value)">
                <option value="AND" ${step1.op === 'AND' ? 'selected' : ''}>AND (∧)</option>
                <option value="OR" ${step1.op === 'OR' ? 'selected' : ''}>OR (∨)</option>
            </select>

            <label class="radio-label"><input type="checkbox" ${step1.not2 ? 'checked' : ''} onchange="updateStep(0, 'not2', this.checked)"> ¬</label>
            
            <div class="fixed-input">Input ${inputConfig[1].id} (${inputConfig[1].var})</div>
        </div>
        ${recipeSteps.length > 1 ? '<div class="step-connector"></div>' : ''}
    </div>
`;
    container.innerHTML += step1HTML;


    if (recipeSteps.length > 1 && numInputs === 3) {
        const step2 = recipeSteps[1];
        const step2HTML = `
        <div class="recipe-step">
            <div class="step-header">
                <div class="step-number">2</div>
                <div class="step-title">Combine Result with Input C</div>
                <button class="remove-btn" onclick="removeRecipeStep()" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">Remove</button>
            </div>
            <div class="recipe-row">
                <div class="fixed-input" style="border-style: solid; background: rgba(37, 99, 235, 0.1); border-color: var(--primary);">Result of Step 1</div>
                
                <select class="op-select" onchange="updateStep(1, 'op', this.value)">
                    <option value="AND" ${step2.op === 'AND' ? 'selected' : ''}>AND (∧)</option>
                    <option value="OR" ${step2.op === 'OR' ? 'selected' : ''}>OR (∨)</option>
                </select>

                <label class="radio-label"><input type="checkbox" ${step2.not2 ? 'checked' : ''} onchange="updateStep(1, 'not2', this.checked)"> ¬</label>
                
                <div class="fixed-input">Input ${inputConfig[2].id} (${inputConfig[2].var})</div>
            </div>
        </div>
    `;
        container.innerHTML += step2HTML;
    }


    const addBtn = document.getElementById('add-step-btn');
    if (addBtn) {
        if (numInputs === 2) {
            addBtn.style.display = 'none';
        } else {
            addBtn.style.display = 'flex';
            if (recipeSteps.length >= 2) {
                addBtn.disabled = true;
                addBtn.innerHTML = 'All inputs used ✓';
            } else {
                addBtn.disabled = false;
                addBtn.innerHTML = '+ Add Operation (Combine with C)';
                addBtn.onclick = addRecipeStep;
            }
        }
    }
}

/**
 * Reads the steps you created on the screen and turns them into a text formula that the code can work with.
 */
function buildExpressionFromGUI() {
    const inputMap = {};
    inputConfig.forEach(inp => {
        inputMap[inp.id] = inp.not ? `(¬ ${inp.var})` : inp.var;
    });

    const s1 = recipeSteps[0];
    const term1 = s1.not1 ? `(¬ ${inputMap[inputConfig[0].id]})` : inputMap[inputConfig[0].id];
    const term2 = s1.not2 ? `(¬ ${inputMap[inputConfig[1].id]})` : inputMap[inputConfig[1].id];
    let expr = `(${term1} ${s1.op} ${term2})`;

    if (recipeSteps.length > 1) {
        const s2 = recipeSteps[1];
        const term3 = s2.not2 ? `(¬ ${inputMap[inputConfig[2].id]})` : inputMap[inputConfig[2].id];
        expr = `(${expr} ${s2.op} ${term3})`;
    }

    return expr;
}

const GATE_WIDTH = 60;
const GATE_HEIGHT = 40;
const LEVEL_SPACING = 100;
const NODE_SPACING = 60;
const COLORS = {
    wire: '#475569',
    gateStroke: '#1e293b',
    gateFill: '#e2e8f0',
    text: '#1e293b'
};


function tokenize(expr) {
    expr = expr.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
    const tokens = expr.trim().split(/\s+/);
    return tokens.filter(t => t.length > 0);
}


class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek() { return this.tokens[this.pos]; }

    consume() { return this.tokens[this.pos++]; }

    parse() {
        const ast = this.parseExpression();
        if (this.pos < this.tokens.length) throw new Error("Unexpected token: " + this.peek());
        return ast;
    }

    parseExpression() {
        let left = this.parseTerm();
        while (this.peek() && this.peek().toUpperCase() === 'OR') {
            this.consume();
            const right = this.parseTerm();
            left = { type: 'OR', left, right };
        }
        return left;
    }

    parseTerm() {
        let left = this.parseFactor();
        while (this.peek() && this.peek().toUpperCase() === 'AND') {
            this.consume();
            const right = this.parseFactor();
            left = { type: 'AND', left, right };
        }
        return left;
    }

    parseFactor() {
        const token = this.peek();
        if (!token) throw new Error("Unexpected end of expression");
        if (token.toUpperCase() === '¬') {
            this.consume();
            const operand = this.parseFactor();
            return { type: '¬', right: operand };
        } else if (token === '(') {
            this.consume();
            const expr = this.parseExpression();
            if (this.peek() !== ')') throw new Error("Missing closing parenthesis");
            this.consume();
            return expr;
        } else if (/^[A-Z]$/i.test(token)) {
            return { type: 'VAR', value: this.consume().toUpperCase() };
        } else {
            throw new Error("Unexpected token: " + token);
        }
    }
}

/**
 * Calculates the final result (ON or OFF) for a specific set of inputs.
 * It follows the logic rules (AND, OR, ¬) to find the answer.
 */
function evaluate(ast, context) {
    if (ast.type === 'VAR') return context[ast.value];
    else if (ast.type === '¬') return !evaluate(ast.right, context);
    else if (ast.type === 'AND') return evaluate(ast.left, context) && evaluate(ast.right, context);
    else if (ast.type === 'OR') return evaluate(ast.left, context) || evaluate(ast.right, context);
    throw new Error("Unknown node type");
}

/**
 * Creates a list of every possible combination of inputs (like all ON, all OFF, and everything in between) and finds the result for each one.
 */
function generateTruthTable(ast, numInputs) {
    const vars = inputConfig.map(c => c.var);
    const rows = Math.pow(2, numInputs);
    const tableData = [];

    for (let i = 0; i < rows; i++) {
        const context = {};

        for (let j = 0; j < numInputs; j++) {
            const bit = (i >> (numInputs - 1 - j)) & 1;
            context[vars[j]] = bit === 1;
        }
        let result;
        try {
            result = evaluate(ast, context);
        } catch (e) { result = false; }
        tableData.push({ context, result });
    }
    return { vars, tableData };
}

/**
 * Draws the visual diagram of the circuit on the screen.
 * It connects the inputs and gates with lines to show how the signal flows.
 */
function drawCircuit(ast, canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    

    ctx.clearRect(0, 0, rect.width, rect.height);
    

    ctx.strokeStyle = COLORS.wire;
    ctx.fillStyle = COLORS.gateFill;
    ctx.lineWidth = 2;
    ctx.font = '14px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function getDepth(node) {
        if (!node || node.type === 'VAR') return 0;
        const leftDepth = node.left ? getDepth(node.left) : 0;
        const rightDepth = node.right ? getDepth(node.right) : 0;
        return Math.max(leftDepth, rightDepth) + 1;
    }

    const depth = getDepth(ast);
    const circuitWidth = depth * LEVEL_SPACING;
    const rootX = (rect.width / 2) + (circuitWidth / 2);
    const startY = rect.height / 2;

    function drawNode(node, x, y, availableHeight) {
        ctx.fillStyle = COLORS.gateFill;
        ctx.strokeStyle = COLORS.gateStroke;
        ctx.beginPath();
        

        if (node.type === 'AND') {
            ctx.moveTo(x - 30, y - 20); ctx.lineTo(x - 15, y - 20);
            ctx.arc(x - 15, y, 20, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(x - 30, y + 20); ctx.closePath();
        } else if (node.type === 'OR') {
            ctx.moveTo(x - 30, y - 20);
            ctx.quadraticCurveTo(x - 10, y - 20, x, y);
            ctx.quadraticCurveTo(x - 10, y + 20, x - 30, y + 20);
            ctx.quadraticCurveTo(x - 20, y, x - 30, y - 20); ctx.closePath();
        } else if (node.type === '¬') {
            ctx.moveTo(x - 30, y - 15); ctx.lineTo(x - 5, y); ctx.lineTo(x - 30, y + 15); ctx.closePath();
            ctx.moveTo(x, y); ctx.arc(x - 2.5, y, 2.5, 0, Math.PI * 2);
        } else if (node.type === 'VAR') {
            ctx.fillStyle = COLORS.text;
            ctx.fillText(node.value, x, y);
            return;
        }
        ctx.fill(); ctx.stroke();

        const childX = x - LEVEL_SPACING;
        if (node.type === '¬') {
            const childY = y;
            ctx.strokeStyle = COLORS.wire;
            ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(childX, childY); ctx.stroke();
            drawNode(node.right, childX, childY, availableHeight);
        } else {
            const halfHeight = availableHeight / 2;
            const topY = y - halfHeight / 2;
            const botY = y + halfHeight / 2;
            ctx.strokeStyle = COLORS.wire;
            let inputOffsetX = node.type === 'OR' ? -25 : -30;
            

            ctx.beginPath(); ctx.moveTo(x + inputOffsetX, y - 10);
            ctx.bezierCurveTo(x - 60, y - 10, x - 40, topY, childX, topY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + inputOffsetX, y + 10);
            ctx.bezierCurveTo(x - 60, y + 10, x - 40, botY, childX, botY); ctx.stroke();
            
            drawNode(node.left, childX, topY, halfHeight);
            drawNode(node.right, childX, botY, halfHeight);
        }
    }
    drawNode(ast, rootX, startY, rect.height - 40);
    

    ctx.beginPath(); ctx.moveTo(rootX, startY); ctx.lineTo(rootX + 40, startY); ctx.stroke();
    ctx.fillStyle = COLORS.text; ctx.fillText("OUT", rootX + 60, startY);
}

const generateBtn = document.getElementById('generate-btn');
const errorDisplay = document.getElementById('error-display');
const tableContainer = document.getElementById('truth-table-container');
const canvas = document.getElementById('circuit-canvas');


generateBtn.addEventListener('click', () => {
    errorDisplay.textContent = '';
    try {

        const expr = buildExpressionFromGUI();
        console.log("Generated Expression:", expr);


        const tokens = tokenize(expr);
        if (tokens.length === 0) throw new Error("Please build an expression.");


        const parser = new Parser(tokens);
        const ast = parser.parse();


        const numInputs = inputConfig.length;
        const { vars, tableData } = generateTruthTable(ast, numInputs);


        renderTable(vars, tableData);
        drawCircuit(ast, canvas);

    } catch (err) {
        errorDisplay.textContent = err.message;
        console.error(err);
    }
});


function renderTable(vars, data) {
    let html = '<table><thead><tr>';
    vars.forEach(v => html += `<th>${v}</th>`);
    html += '<th>Output</th></tr></thead><tbody>';
    data.forEach(row => {
        html += '<tr>';
        vars.forEach(v => html += `<td>${row.context[v] ? '1' : '0'}</td>`);
        html += `<td style="color: ${row.result ? 'var(--success)' : 'var(--text-muted)'}; font-weight: bold;">${row.result ? '1' : '0'}</td></tr>`;
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}


init();