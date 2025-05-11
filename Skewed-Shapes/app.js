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
    { id: 'rhombus', name: 'Rhombus', params: ['side (s)', 'height (h)', 'diagonals (d1, d2)'] },
    { id: 'kite', name: 'Kite', params: ['short side (a)', 'long side (b)', 'diagonals (d1, d2)'] }
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
      questionText = `${currentQuestion.type === 'A' ? 'A:' : 'P:'} ${currentQuestion.givenValue}, ${currentQuestion.hiddenParam}`;
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
    
    // For both shapes, we'll only do normal or reverse calculations
    question.isReverse = Math.random() > 0.5;
    question.type = Math.random() > 0.5 ? 'A' : 'P';
    
    switch (shapeId) {
      case 'rhombus': {
        // Generate integer values for the rhombus
        question.s = getRandomInt(6, 12);  // side length
        question.h = getRandomInt(5, 10);  // height
        
        // Calculate diagonals (using Pythagorean theorem)
        // For a rhombus with side s and height h:
        // half-width (w) = √(s² - h²)
        question.w = Math.sqrt(question.s * question.s - question.h * question.h);
        question.d1 = 2 * question.h;  // vertical diagonal
        question.d2 = 2 * question.w;  // horizontal diagonal
        
        if (question.isReverse) {
          if (question.type === 'A') {
            if (Math.random() > 0.5) {
              // Area given, find side
              question.answer = question.s;
              question.givenValue = question.s * question.h;
              question.hiddenParam = 's';
            } else {
              // Area given, find height
              question.answer = question.h;
              question.givenValue = question.s * question.h;
              question.hiddenParam = 'h';
            }
          } else {
            // Perimeter given, find side
            question.answer = question.s;
            question.givenValue = 4 * question.s;
            question.hiddenParam = 's';
          }
        } else {
          // Calculate area or perimeter directly
          question.answer = question.type === 'A' ? question.s * question.h : 4 * question.s;
        }
        break;
      }
      
      case 'kite': {
        // Generate integer values for the kite
        question.a = getRandomInt(5, 10);  // shorter side
        question.b = getRandomInt(question.a + 1, 15);  // longer side
        
        // Create a kite with whole number diagonals
        // Using Pythagorean triples or simple geometry to ensure clean numbers
        const kiteConfigs = [
          { a: 5, b: 8, d1: 8, d2: 12 },
          { a: 6, b: 10, d1: 12, d2: 8 },
          { a: 7, b: 11, d1: 10, d2: 16 },
          { a: 8, b: 12, d1: 16, d2: 12 },
          { a: 9, b: 13, d1: 14, d2: 18 }
        ];
        
        const config = kiteConfigs[getRandomInt(0, kiteConfigs.length - 1)];
        question.a = config.a;
        question.b = config.b;
        question.d1 = config.d1;  // vertical diagonal
        question.d2 = config.d2;  // horizontal diagonal
        
        if (question.isReverse) {
          if (question.type === 'A') {
            const rand = Math.random();
            if (rand < 0.33) {
              // Area given, find shorter side
              question.answer = question.a;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'a';
            } else if (rand < 0.66) {
              // Area given, find longer side
              question.answer = question.b;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'b';
            } else {
              // Area given, find diagonal
              question.answer = question.d1;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'd1';
            }
          } else {
            const rand = Math.random();
            if (rand < 0.5) {
              // Perimeter given, find shorter side
              question.answer = question.a;
              question.givenValue = 2 * (question.a + question.b);
              question.hiddenParam = 'a';
            } else {
              // Perimeter given, find longer side
              question.answer = question.b;
              question.givenValue = 2 * (question.a + question.b);
              question.hiddenParam = 'b';
            }
          }
        } else {
          // Calculate area or perimeter directly
          question.answer = question.type === 'A' ? (question.d1 * question.d2) / 2 : 2 * (question.a + question.b);
        }
        break;
      }
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
    const scale = 12;
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    svg.style.display = "block";
    
    switch (question.shape) {
      case 'rhombus': {
        // Calculate points for rhombus
        const halfHeight = question.h / 2 * scale;
        const halfWidth = question.w * scale;
        
        const points = [
          [centerX, centerY - halfHeight],           // top
          [centerX + halfWidth, centerY],            // right
          [centerX, centerY + halfHeight],           // bottom
          [centerX - halfWidth, centerY]             // left
        ];
        
        const rhombus = document.createElementNS(svgNS, "polygon");
        rhombus.setAttribute("points", points.map(p => p.join(',')).join(' '));
        rhombus.setAttribute("fill", "#2196F399");
        rhombus.setAttribute("stroke", "#333");
        rhombus.setAttribute("stroke-width", "2");
        svg.appendChild(rhombus);
        
        // Add diagonals
        const d1Line = document.createElementNS(svgNS, "line");
        d1Line.setAttribute("x1", centerX);
        d1Line.setAttribute("y1", centerY - halfHeight);
        d1Line.setAttribute("x2", centerX);
        d1Line.setAttribute("y2", centerY + halfHeight);
        d1Line.setAttribute("stroke", "#333");
        d1Line.setAttribute("stroke-width", "1.5");
        d1Line.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(d1Line);
        
        const d2Line = document.createElementNS(svgNS, "line");
        d2Line.setAttribute("x1", centerX - halfWidth);
        d2Line.setAttribute("y1", centerY);
        d2Line.setAttribute("x2", centerX + halfWidth);
        d2Line.setAttribute("y2", centerY);
        d2Line.setAttribute("stroke", "#333");
        d2Line.setAttribute("stroke-width", "1.5");
        d2Line.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(d2Line);
        
        // Add labels based on the question type
        if (question.isReverse) {
          if (question.hiddenParam === 's') {
            // Side is unknown
            addDimensionLine(svg, centerX, centerY - halfHeight, centerX + halfWidth, centerY, '?', 'right');
          } else if (question.hiddenParam === 'h') {
            // Height is unknown
            addDimensionLine(svg, centerX + 15, centerY - halfHeight, centerX + 15, centerY + halfHeight, '?', 'right');
          } else {
            // Default case - both shown
            addDimensionLine(svg, centerX, centerY - halfHeight, centerX + halfWidth, centerY, `${question.s}`, 'right');
            addDimensionLine(svg, centerX + 15, centerY - halfHeight, centerX + 15, centerY + halfHeight, `${question.h}`, 'right');
          }
        } else {
          // Show both dimensions
          addDimensionLine(svg, centerX, centerY - halfHeight, centerX + halfWidth, centerY, `${question.s}`, 'right');
          addDimensionLine(svg, centerX + 15, centerY - halfHeight, centerX + 15, centerY + halfHeight, `${question.h}`, 'right');
          
          // Optionally add diagonal dimensions
          const diagText1 = document.createElementNS(svgNS, "text");
          diagText1.setAttribute("x", centerX + 5);
          diagText1.setAttribute("y", centerY);
          diagText1.setAttribute("text-anchor", "start");
          diagText1.setAttribute("font-size", "12");
          diagText1.setAttribute("fill", "#333");
          diagText1.textContent = `d1: ${question.d1}`;
          svg.appendChild(diagText1);
          
          const diagText2 = document.createElementNS(svgNS, "text");
          diagText2.setAttribute("x", centerX);
          diagText2.setAttribute("y", centerY - halfHeight - 10);
          diagText2.setAttribute("text-anchor", "middle");
          diagText2.setAttribute("font-size", "12");
          diagText2.setAttribute("fill", "#333");
          diagText2.textContent = `d2: ${question.d2.toFixed(2)}`;
          svg.appendChild(diagText2);
        }
        break;
      }
      
      case 'kite': {
        // Calculate points for kite
        const d1Half = question.d1 / 2 * scale * 0.8;  // Vertical diagonal half-length
        const d2Half = question.d2 / 2 * scale * 0.8;  // Horizontal diagonal half-length
        
        const points = [
          [centerX, centerY - d1Half],              // top
          [centerX + d2Half, centerY],              // right
          [centerX, centerY + d1Half],              // bottom
          [centerX - d2Half, centerY]               // left
        ];
        
        const kite = document.createElementNS(svgNS, "polygon");
        kite.setAttribute("points", points.map(p => p.join(',')).join(' '));
        kite.setAttribute("fill", "#F4433699");
        kite.setAttribute("stroke", "#333");
        kite.setAttribute("stroke-width", "2");
        svg.appendChild(kite);
        
        // Add diagonals
        const d1Line = document.createElementNS(svgNS, "line");
        d1Line.setAttribute("x1", centerX);
        d1Line.setAttribute("y1", centerY - d1Half);
        d1Line.setAttribute("x2", centerX);
        d1Line.setAttribute("y2", centerY + d1Half);
        d1Line.setAttribute("stroke", "#333");
        d1Line.setAttribute("stroke-width", "1.5");
        d1Line.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(d1Line);
        
        const d2Line = document.createElementNS(svgNS, "line");
        d2Line.setAttribute("x1", centerX - d2Half);
        d2Line.setAttribute("y1", centerY);
        d2Line.setAttribute("x2", centerX + d2Half);
        d2Line.setAttribute("y2", centerY);
        d2Line.setAttribute("stroke", "#333");
        d2Line.setAttribute("stroke-width", "1.5");
        d2Line.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(d2Line);
        
        // Add labels based on the question type
        if (question.isReverse) {
          if (question.hiddenParam === 'a') {
            // Short side is unknown
            addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, '?', 'left');
            addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
          } else if (question.hiddenParam === 'b') {
            // Long side is unknown
            addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
            addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, '?', 'right');
          } else if (question.hiddenParam === 'd1') {
            // Vertical diagonal is unknown
            const diagText = document.createElementNS(svgNS, "text");
            diagText.setAttribute("x", centerX + 5);
            diagText.setAttribute("y", centerY);
            diagText.setAttribute("text-anchor", "start");
            diagText.setAttribute("font-size", "12");
            diagText.setAttribute("fill", "#333");
            diagText.textContent = `d1: ?`;
            svg.appendChild(diagText);
            
            addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
            addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
          } else {
            // Default case - show sides but not diagonals
            addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
            addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
          }
        } else {
          // Show both sides
          addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
          addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
          
          // Add diagonal dimensions
          const diagText1 = document.createElementNS(svgNS, "text");
          diagText1.setAttribute("x", centerX + 5);
          diagText1.setAttribute("y", centerY);
          diagText1.setAttribute("text-anchor", "start");
          diagText1.setAttribute("font-size", "12");
          diagText1.setAttribute("fill", "#333");
          diagText1.textContent = `d1: ${question.d1}`;
          svg.appendChild(diagText1);
          
          const diagText2 = document.createElementNS(svgNS, "text");
          diagText2.setAttribute("x", centerX);
          diagText2.setAttribute("y", centerY - d1Half - 10);
          diagText2.setAttribute("text-anchor", "middle");
          diagText2.setAttribute("font-size", "12");
          diagText2.setAttribute("fill", "#333");
          diagText2.textContent = `d2: ${question.d2}`;
          svg.appendChild(diagText2);
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
      textElement.setAttribute("x", (x1 + x2) / 2 - 10);
      textElement.setAttribute("y", (y1 + y2) / 2 - 10);
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "middle");
    } else if (position === 'right') {
      textElement.setAttribute("x", (x1 + x2) / 2 + 10);
      textElement.setAttribute("y", (y1 + y2) / 2 - 10);
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "middle");
    }
    
    textElement.setAttribute("font-size", "14");
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
  
  // Start with the first shape
  newQuestion(shapes[0].id);
});