document.addEventListener('DOMContentLoaded', function() {
  const shapeElement = document.getElementById('shape');
  const questionDisplay = document.getElementById('questionDisplay');
  const userAnswerInput = document.getElementById('userAnswer');
  const submitBtn = document.getElementById('submitBtn');
  const feedbackDisplay = document.getElementById('feedback');
  const scoreDisplay = document.getElementById('score');
  const shapeSelector = document.getElementById('shapeSelector');
  const labelsContainer = document.getElementById('labelsContainer');
  const shapeContainer = document.getElementById('shapeContainer');
  
  let currentQuestion = null;
  let score = 0;
  let timer;
  let timeLeft = 45;
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timerDisplay';
  shapeContainer.appendChild(timerDisplay);
  
  const shapes = [
    { id: 'trapezium', name: 'Trapezium', params: ['parallel side a (a)', 'parallel side b (b)', 'height (h)'] },
    { id: 'parallelogram', name: 'Parallelogram', params: ['base (b)', 'height (h)', 'side (s)'] }
  ];
  
  shapes.forEach(shape => {
    const option = document.createElement('option');
    option.value = shape.id;
    option.textContent = shape.name;
    shapeSelector.appendChild(option);
  });
  
  function startTimer() {
    clearInterval(timer);
    timeLeft = 45;
    updateTimerDisplay();
    
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame(`Time's up! The correct answer was ${currentQuestion.answer.toFixed(2)}.`);
      }
    }, 1000);
  }
  
  function updateTimerDisplay() {
    timerDisplay.textContent = ` ${timeLeft}s`;
    timerDisplay.style.color = timeLeft <= 3 ? 'red' : 'black';
  }
  
  function endGame(message) {
    feedbackDisplay.textContent = message;
    feedbackDisplay.classList.add('visible', 'incorrect');
    feedbackDisplay.classList.remove('correct');
    scoreDisplay.textContent = `Final Score: ${score}`;
    score = 0;
    userAnswerInput.disabled = true;
    submitBtn.disabled = true;
    shapeSelector.disabled = true;
    
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.margin = '10px';
    playAgainBtn.addEventListener('click', function() {
      score = 0;
      userAnswerInput.disabled = false;
      submitBtn.disabled = false;
      shapeSelector.disabled = false;
      feedbackDisplay.innerHTML = '';
      newQuestion(shapeSelector.value);
      playAgainBtn.remove();
    });
    feedbackDisplay.appendChild(document.createElement('br'));
    feedbackDisplay.appendChild(playAgainBtn);
  }
  
  function newQuestion(shapeId) {
    currentQuestion = generateQuestion(shapeId);
    drawShapeWithSVG(currentQuestion);
    
    let questionText = '';
    if (currentQuestion.isReverse) {
      if (currentQuestion.calculationType === 'A_from_P' || currentQuestion.calculationType === 'P_from_A') {
        questionText = `${currentQuestion.calculationType === 'A_from_P' ? 'P → A, P' : 'A → P, A'}: ${currentQuestion.givenValue}`;
      } else {
        questionText = `${currentQuestion.type === 'A' ? 'A:' : 'P:'} ${currentQuestion.givenValue}, ${currentQuestion.hiddenParam}`;
      }
    } else {
      questionText = `${currentQuestion.type === 'A' ? 'A' : 'P'}`;
    }
    
    questionDisplay.textContent = questionText;
    userAnswerInput.value = '';
    feedbackDisplay.textContent = '';
    feedbackDisplay.className = 'feedback';
    userAnswerInput.focus();
    startTimer();
  }
  
  function checkAnswer() {
    clearInterval(timer);
    
    const userAnswer = parseFloat(userAnswerInput.value);
    if (isNaN(userAnswer)) {
      endGame(`Invalid answer. The correct answer is ${currentQuestion.answer.toFixed(2)}. Game over!`);
      return;
    }
    
    if (Math.abs(userAnswer - currentQuestion.answer) < 0.01) {
      handleCorrectAnswer();
    } else {
      endGame(`Incorrect. The correct answer is ${currentQuestion.answer.toFixed(2)}. Game over!`);
    }
  }
  
  function handleCorrectAnswer() {
    feedbackDisplay.textContent = 'Correct! Well done!';
    feedbackDisplay.classList.remove('incorrect');
    feedbackDisplay.classList.add('visible', 'correct');
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    setTimeout(() => {
      newQuestion(currentQuestion.shape);
    }, 500);
  }
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function generateQuestion(shapeId) {
    let question = { shape: shapeId };
    const calculationTypes = ['normal'];
    
    question.calculationType = calculationTypes[Math.floor(Math.random() * calculationTypes.length)];
    question.isReverse = question.calculationType === 'normal' ? Math.random() > 0.5 : true;
    question.type = Math.random() > 0.5 ? 'A' : 'P';
    
    switch (shapeId) {
      case 'trapezium':
        question.a = getRandomInt(5, 12); // Shorter parallel side
        question.b = getRandomInt(question.a + 2, question.a + 8); // Longer parallel side
        question.h = getRandomInt(4, 10); // Height
        
        const sideWidth = (question.b - question.a) / 2;
        // Calculate both non-parallel sides explicitly (they might be different)
        question.s1 = Math.sqrt(question.h * question.h + sideWidth * sideWidth);
        question.s2 = question.s1; // In this implementation, both sides are equal
        
        if (question.isReverse) {
          if (question.type === 'A') {
            const choice = Math.random();
            if (choice < 0.33) {
              question.answer = question.a;
              question.hiddenParam = 'a';
            } else if (choice < 0.67) {
              question.answer = question.b;
              question.hiddenParam = 'b';
            } else {
              question.answer = question.h;
              question.hiddenParam = 'h';
            }
            question.givenValue = 0.5 * (question.a + question.b) * question.h;
          } else {
            const choice = Math.random();
            if (choice < 0.33) {
              question.answer = question.a;
              question.hiddenParam = 'a';
            } else if (choice < 0.67) {
              question.answer = question.b;
              question.hiddenParam = 'b';
            } else {
              question.answer = question.s1;
              question.hiddenParam = 's';
            }
            question.givenValue = question.a + question.b + question.s1 + question.s2;
          }
        } else {
          question.answer = question.type === 'A' ? 
            0.5 * (question.a + question.b) * question.h : 
            question.a + question.b + question.s1 + question.s2;
        }
        break;
        
      case 'parallelogram':
        question.b = getRandomInt(6, 12); // Base
        question.h = getRandomInt(4, 10); // Height
        
        const angle = Math.PI / 6;
        question.s = question.h / Math.sin(angle);
        
        if (question.isReverse) {
          if (question.type === 'A') {
            if (Math.random() > 0.5) {
              question.answer = question.b;
              question.hiddenParam = 'b';
            } else {
              question.answer = question.h;
              question.hiddenParam = 'h';
            }
            question.givenValue = question.b * question.h;
          } else {
            if (Math.random() > 0.5) {
              question.answer = question.b;
              question.hiddenParam = 'b';
            } else {
              question.answer = question.s;
              question.hiddenParam = 's';
            }
            question.givenValue = 2 * (question.b + question.s);
          }
        } else {
          question.answer = question.type === 'A' ? question.b * question.h : 2 * (question.b + question.s);
        }
        break;
    }
    
    return question;
  }
  
  function drawShapeWithSVG(question) {
    labelsContainer.innerHTML = '';
    shapeElement.innerHTML = '';
    
    const containerWidth = shapeContainer.clientWidth;
    const containerHeight = shapeContainer.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const scale = 15;
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    svg.style.display = "block";
    
    switch (question.shape) {
      case 'trapezium': {
        let topWidth = question.a * scale;
        let bottomWidth = question.b * scale;
        let height = question.h * scale;
        
        const topLeft = { x: centerX - topWidth / 2, y: centerY - height / 2 };
        const topRight = { x: centerX + topWidth / 2, y: centerY - height / 2 };
        const bottomLeft = { x: centerX - bottomWidth / 2, y: centerY + height / 2 };
        const bottomRight = { x: centerX + bottomWidth / 2, y: centerY + height / 2 };
        
        const trapezium = document.createElementNS(svgNS, "path");
        trapezium.setAttribute("d", `M ${topLeft.x} ${topLeft.y} 
                                  L ${topRight.x} ${topRight.y} 
                                  L ${bottomRight.x} ${bottomRight.y} 
                                  L ${bottomLeft.x} ${bottomLeft.y} Z`);
        trapezium.setAttribute("fill", "#4CAF5099");
        trapezium.setAttribute("stroke", "#333");
        trapezium.setAttribute("stroke-width", "2");
        svg.appendChild(trapezium);
        
        // Height line
        const heightLine = document.createElementNS(svgNS, "line");
        heightLine.setAttribute("x1", centerX);
        heightLine.setAttribute("y1", centerY - height / 2);
        heightLine.setAttribute("x2", centerX);
        heightLine.setAttribute("y2", centerY + height / 2);
        heightLine.setAttribute("stroke", "#333");
        heightLine.setAttribute("stroke-width", "1.5");
        heightLine.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(heightLine);
        
        // Add dimension lines for sides
        addDimensionLine(svg, topLeft.x, topLeft.y - 10,
          topRight.x, topRight.y - 10,
          `${question.a}`, 'top');
        
        addDimensionLine(svg, bottomLeft.x, bottomLeft.y + 10,
          bottomRight.x, bottomRight.y + 10,
          `${question.b}`, 'bottom');
        
        addDimensionLine(svg, centerX - bottomWidth / 2 - 10, centerY - height / 2,
          centerX - bottomWidth / 2 - 10, centerY + height / 2,
          `${question.h}`, 'left');
        
        // Add labels for non-parallel sides if calculating perimeter
        if (question.type === 'P') {
          // Left non-parallel side
          addDimensionLine(svg, topLeft.x - 10, topLeft.y,
            bottomLeft.x - 10, bottomLeft.y,
            `${question.s1.toFixed(1)}`, 'left');
          
          // Right non-parallel side
          addDimensionLine(svg, topRight.x + 10, topRight.y,
            bottomRight.x + 10, bottomRight.y,
            `${question.s2.toFixed(1)}`, 'right');
        }
        
        break;
      }
      
      case 'parallelogram': {
        let width = question.b * scale;
        let height = question.h * scale;
        const skew = width / 4; // Create a consistent parallelogram shape
        
        const topLeft = { x: centerX - width / 2 + skew, y: centerY - height / 2 };
        const topRight = { x: centerX + width / 2 + skew, y: centerY - height / 2 };
        const bottomLeft = { x: centerX - width / 2, y: centerY + height / 2 };
        const bottomRight = { x: centerX + width / 2, y: centerY + height / 2 };
        
        const parallelogram = document.createElementNS(svgNS, "path");
        parallelogram.setAttribute("d", `M ${topLeft.x} ${topLeft.y} 
                                     L ${topRight.x} ${topRight.y} 
                                     L ${bottomRight.x} ${bottomRight.y} 
                                     L ${bottomLeft.x} ${bottomLeft.y} Z`);
        parallelogram.setAttribute("fill", "#2196F399");
        parallelogram.setAttribute("stroke", "#333");
        parallelogram.setAttribute("stroke-width", "2");
        svg.appendChild(parallelogram);
        
        // Height line
        const heightLine = document.createElementNS(svgNS, "line");
        heightLine.setAttribute("x1", centerX - width / 2 + skew / 2);
        heightLine.setAttribute("y1", centerY - height / 2);
        heightLine.setAttribute("x2", centerX - width / 2 + skew / 2);
        heightLine.setAttribute("y2", centerY + height / 2);
        heightLine.setAttribute("stroke", "#333");
        heightLine.setAttribute("stroke-width", "1.5");
        heightLine.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(heightLine);
        
        addDimensionLine(svg, bottomLeft.x, bottomLeft.y + 10,
          bottomRight.x, bottomRight.y + 10,
          `${question.b}`, 'bottom');
        
        addDimensionLine(svg, bottomLeft.x - 10, bottomLeft.y,
          bottomLeft.x - 10 + skew, topLeft.y,
          `${question.h}`, 'left');
        
        if (question.type === 'P') {
          addDimensionLine(svg, topLeft.x, topLeft.y - 10,
            bottomLeft.x, bottomLeft.y - 10,
            `${question.s.toFixed(1)}`, 'left');
        }
        
        break;
      }
    }
    
    shapeElement.appendChild(svg);
  }
  
  function addDimensionLine(svg, x1, y1, x2, y2, text, position) {
    const svgNS = "http://www.w3.org/2000/svg";
    
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#333");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
    
    if (position === 'top' || position === 'bottom') {
      const tick1 = document.createElementNS(svgNS, "line");
      tick1.setAttribute("x1", x1);
      tick1.setAttribute("y1", y1 - 5);
      tick1.setAttribute("x2", x1);
      tick1.setAttribute("y2", y1 + 5);
      tick1.setAttribute("stroke", "#333");
      tick1.setAttribute("stroke-width", "1");
      svg.appendChild(tick1);
      
      const tick2 = document.createElementNS(svgNS, "line");
      tick2.setAttribute("x1", x2);
      tick2.setAttribute("y1", y2 - 5);
      tick2.setAttribute("x2", x2);
      tick2.setAttribute("y2", y2 + 5);
      tick2.setAttribute("stroke", "#333");
      tick2.setAttribute("stroke-width", "1");
      svg.appendChild(tick2);
    } else {
      const tick1 = document.createElementNS(svgNS, "line");
      tick1.setAttribute("x1", x1 - 5);
      tick1.setAttribute("y1", y1);
      tick1.setAttribute("x2", x1 + 5);
      tick1.setAttribute("y2", y1);
      tick1.setAttribute("stroke", "#333");
      tick1.setAttribute("stroke-width", "1");
      svg.appendChild(tick1);
      
      const tick2 = document.createElementNS(svgNS, "line");
      tick2.setAttribute("x1", x2 - 5);
      tick2.setAttribute("y1", y2);
      tick2.setAttribute("x2", x2 + 5);
      tick2.setAttribute("y2", y2);
      tick2.setAttribute("stroke", "#333");
      tick2.setAttribute("stroke-width", "1");
      svg.appendChild(tick2);
    }
    
    const textElement = document.createElementNS(svgNS, "text");
    
    if (position === 'top') {
      textElement.setAttribute("x", (x1 + x2) / 2);
      textElement.setAttribute("y", y1 - 8);
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "auto");
    } else if (position === 'bottom') {
      textElement.setAttribute("x", (x1 + x2) / 2);
      textElement.setAttribute("y", y1 + 20);
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "hanging");
    } else if (position === 'left') {
      textElement.setAttribute("x", x1 - 8);
      textElement.setAttribute("y", (y1 + y2) / 2);
      textElement.setAttribute("text-anchor", "end");
      textElement.setAttribute("dominant-baseline", "middle");
    } else if (position === 'right') {
      textElement.setAttribute("x", x1 + 8);
      textElement.setAttribute("y", (y1 + y2) / 2);
      textElement.setAttribute("text-anchor", "start");
      textElement.setAttribute("dominant-baseline", "middle");
    }
    
    textElement.setAttribute("font-size", "18");
    textElement.setAttribute("fill", "#333");
    textElement.textContent = text;
    svg.appendChild(textElement);
  }
  
  submitBtn.addEventListener('click', checkAnswer);
  userAnswerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });
  
  shapeSelector.addEventListener('change', function() {
    newQuestion(this.value);
  });
  
  window.addEventListener('resize', function() {
    if (currentQuestion) {
      drawShapeWithSVG(currentQuestion);
    }
  });
  
  newQuestion(shapes[0].id);
});
