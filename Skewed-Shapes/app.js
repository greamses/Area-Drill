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
    { id: 'rhombus', name: 'Rhombus', params: ['side (s)', 'diagonals (d1, d2)'] },
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
      questionText = `${currentQuestion.type === 'A' ? 'A:' : 'P:'} ${currentQuestion.givenValue.toFixed(0)}, ${currentQuestion.hiddenParam}`;
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
        question.s = getRandomInt(6, 12); // side length
        
        // Generate diagonals with integer values
        // Pick from common Pythagorean triples to ensure integer values
        const rhombusConfigs = [
          { s: 5, d1: 8, d2: 6 },
          { s: 6, d1: 6, d2: 8 },
          { s: 7, d1: 12, d2: 8 },
          { s: 8, d1: 10, d2: 12 },
          { s: 9, d1: 12, d2: 12 },
          { s: 10, d1: 16, d2: 12 },
          { s: 11, d1: 20, d2: 10 },
          { s: 12, d1: 16, d2: 16 }
        ];
        
        const config = rhombusConfigs[getRandomInt(0, rhombusConfigs.length - 1)];
        question.s = config.s;
        question.d1 = config.d1; // vertical diagonal
        question.d2 = config.d2; // horizontal diagonal
        
        // Calculate height from diagonal (h = d1/2)
        question.h = question.d1 / 2;
        
        if (question.isReverse) {
          if (question.type === 'A') {
            const rand = Math.random();
            if (rand < 0.5) {
              // Area given, find diagonal d1
              question.answer = question.d1;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'd1';
              question.visibleDiag = 'd2';
            } else {
              // Area given, find diagonal d2
              question.answer = question.d2;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'd2';
              question.visibleDiag = 'd1';
            }
          } else {
            // Perimeter given, find side
            question.answer = question.s;
            question.givenValue = 4 * question.s;
            question.hiddenParam = 's';
          }
        } else {
          // Calculate area or perimeter directly
          question.answer = question.type === 'A' ? (question.d1 * question.d2) / 2 : 4 * question.s;
        }
        break;
      }
      
      case 'kite': {
        // Use predefined kite configurations with integer values
        const kiteConfigs = [
          { a: 5, b: 8, d1: 8, d2: 12 },
          { a: 6, b: 10, d1: 12, d2: 8 },
          { a: 7, b: 11, d1: 10, d2: 16 },
          { a: 8, b: 12, d1: 16, d2: 12 },
          { a: 9, b: 13, d1: 14, d2: 18 }
        ];
        
        const config = kiteConfigs[getRandomInt(0, kiteConfigs.length - 1)];
        question.a = config.a; // shorter side
        question.b = config.b; // longer side
        question.d1 = config.d1; // vertical diagonal
        question.d2 = config.d2; // horizontal diagonal
        
        if (question.isReverse) {
          if (question.type === 'A') {
            const rand = Math.random();
            if (rand < 0.5) {
              // Area given, find diagonal d1
              question.answer = question.d1;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'd1';
              question.visibleDiag = 'd2';
            } else {
              // Area given, find diagonal d2
              question.answer = question.d2;
              question.givenValue = (question.d1 * question.d2) / 2;
              question.hiddenParam = 'd2';
              question.visibleDiag = 'd1';
            }
          } else {
            const rand = Math.random();
            if (rand < 0.5) {
              // Perimeter given, find shorter side
              question.answer = question.a;
              question.givenValue = 2 * (question.a + question.b);
              question.hiddenParam = 'a';
              question.visibleSide = 'b';
            } else {
              // Perimeter given, find longer side
              question.answer = question.b;
              question.givenValue = 2 * (question.a + question.b);
              question.hiddenParam = 'b';
              question.visibleSide = 'a';
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
    const centerX = containerWidth/2;
    const centerY = containerHeight/2;
    const scale = 25;
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    svg.style.display = "block";
    
    switch (question.shape) {
      case 'rhombus': {
        const halfD1 = question.d1 / 2 * scale * 0.6; 
        const halfD2 = question.d2 / 2 * scale * 0.6; 
        
        const points = [
          [centerX, centerY - halfD1], // top
          [centerX + halfD2, centerY], // right
          [centerX, centerY + halfD1], // bottom
          [centerX - halfD2, centerY] // left
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
        d1Line.setAttribute("y1", centerY - halfD1);
        d1Line.setAttribute("x2", centerX);
        d1Line.setAttribute("y2", centerY + halfD1);
        d1Line.setAttribute("stroke", "#333");
        d1Line.setAttribute("stroke-width", "1.5");
        d1Line.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(d1Line);
        
        const d2Line = document.createElementNS(svgNS, "line");
        d2Line.setAttribute("x1", centerX - halfD2);
        d2Line.setAttribute("y1", centerY);
        d2Line.setAttribute("x2", centerX + halfD2);
        d2Line.setAttribute("y2", centerY);
        d2Line.setAttribute("stroke", "#333");
        d2Line.setAttribute("stroke-width", "1.5");
        d2Line.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(d2Line);
        
        // Add labels based on the question type
        if (question.isReverse) {
          if (question.type === 'A') {
            // Area given, one diagonal is hidden
            if (question.hiddenParam === 'd1') {
              // d1 is unknown, show d2
              const diagText = document.createElementNS(svgNS, "text");
              diagText.setAttribute("x", centerX);
              diagText.setAttribute("y", centerY - halfD1 - 10);
              diagText.setAttribute("text-anchor", "middle");
              diagText.setAttribute("font-size", "18");
              diagText.setAttribute("fill", "#333");
              diagText.textContent = `d2: ${question.d2}`;
              svg.appendChild(diagText);
              
              // Mark d1 as unknown
              const d1Text = document.createElementNS(svgNS, "text");
              d1Text.setAttribute("x", centerX + 5);
              d1Text.setAttribute("y", centerY);
              d1Text.setAttribute("text-anchor", "start");
              d1Text.setAttribute("font-size", "18");
              d1Text.setAttribute("fill", "#333");
              d1Text.textContent = `d1: ?`;
              svg.appendChild(d1Text);
            } else if (question.hiddenParam === 'd2') {
              // d2 is unknown, show d1
              const diagText = document.createElementNS(svgNS, "text");
              diagText.setAttribute("x", centerX + 5);
              diagText.setAttribute("y", centerY);
              diagText.setAttribute("text-anchor", "start");
              diagText.setAttribute("font-size", "18");
              diagText.setAttribute("fill", "#333");
              diagText.textContent = `d1: ${question.d1}`;
              svg.appendChild(diagText);
              
              // Mark d2 as unknown
              const d2Text = document.createElementNS(svgNS, "text");
              d2Text.setAttribute("x", centerX);
              d2Text.setAttribute("y", centerY - halfD1 - 10);
              d2Text.setAttribute("text-anchor", "middle");
              d2Text.setAttribute("font-size", "18");
              d2Text.setAttribute("fill", "#333");
              d2Text.textContent = `d2: ?`;
              svg.appendChild(d2Text);
            }
            
            // Always show side for reference
            addDimensionLine(svg, centerX, centerY - halfD1, centerX + halfD2, centerY, `${question.s}`, 'right');
          } else {
            // Perimeter is given, side is unknown
            addDimensionLine(svg, centerX, centerY - halfD1, centerX + halfD2, centerY, '?', 'right');
            
            // Show diagonals for reference
            const diagText1 = document.createElementNS(svgNS, "text");
            diagText1.setAttribute("x", centerX + 5);
            diagText1.setAttribute("y", centerY);
            diagText1.setAttribute("text-anchor", "start");
            diagText1.setAttribute("font-size", "18");
            diagText1.setAttribute("fill", "#333");
            diagText1.textContent = `d1: ${question.d1}`;
            svg.appendChild(diagText1);
            
            const diagText2 = document.createElementNS(svgNS, "text");
            diagText2.setAttribute("x", centerX);
            diagText2.setAttribute("y", centerY - halfD1 - 10);
            diagText2.setAttribute("text-anchor", "middle");
            diagText2.setAttribute("font-size", "18");
            diagText2.setAttribute("fill", "#333");
            diagText2.textContent = `d2: ${question.d2}`;
            svg.appendChild(diagText2);
          }
        } else {
          // Normal question - show all information
          // Show side length
          addDimensionLine(svg, centerX, centerY - halfD1, centerX + halfD2, centerY, `${question.s}`, 'right');
          
          // Show diagonals
          const diagText1 = document.createElementNS(svgNS, "text");
          diagText1.setAttribute("x", centerX + 5);
          diagText1.setAttribute("y", centerY);
          diagText1.setAttribute("text-anchor", "start");
          diagText1.setAttribute("font-size", "18");
          diagText1.setAttribute("fill", "#333");
          diagText1.textContent = `d1: ${question.d1}`;
          svg.appendChild(diagText1);
          
          const diagText2 = document.createElementNS(svgNS, "text");
          diagText2.setAttribute("x", centerX);
          diagText2.setAttribute("y", centerY - halfD1 - 10);
          diagText2.setAttribute("text-anchor", "middle");
          diagText2.setAttribute("font-size", "18");
          diagText2.setAttribute("fill", "#333");
          diagText2.textContent = `d2: ${question.d2}`;
          svg.appendChild(diagText2);
        }
        break;
      }
      
      case 'kite': {
        const d1Half = question.d1 / 2 * scale * 0.6; 
        const d2Half = question.d2 / 2 * scale * 0.6; 
        
        const points = [
          [centerX, centerY - d1Half], // top
          [centerX + d2Half, centerY], // right
          [centerX, centerY + d1Half], // bottom
          [centerX - d2Half, centerY] // left
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
          if (question.type === 'A') {
            // Area given, one diagonal is hidden
            if (question.hiddenParam === 'd1') {
              // d1 is unknown, show d2
              const diagText = document.createElementNS(svgNS, "text");
              diagText.setAttribute("x", centerX);
              diagText.setAttribute("y", centerY - d1Half - 10);
              diagText.setAttribute("text-anchor", "middle");
              diagText.setAttribute("font-size", "18");
              diagText.setAttribute("fill", "#333");
              diagText.textContent = `d2: ${question.d2}`;
              svg.appendChild(diagText);
              
              // Mark d1 as unknown
              const d1Text = document.createElementNS(svgNS, "text");
              d1Text.setAttribute("x", centerX + 5);
              d1Text.setAttribute("y", centerY);
              d1Text.setAttribute("text-anchor", "start");
              d1Text.setAttribute("font-size", "18");
              d1Text.setAttribute("fill", "#333");
              d1Text.textContent = `d1: ?`;
              svg.appendChild(d1Text);
              
              // Show both sides
              addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
              addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
            } else if (question.hiddenParam === 'd2') {
              // d2 is unknown, show d1
              const diagText = document.createElementNS(svgNS, "text");
              diagText.setAttribute("x", centerX + 5);
              diagText.setAttribute("y", centerY);
              diagText.setAttribute("text-anchor", "start");
              diagText.setAttribute("font-size", "18");
              diagText.setAttribute("fill", "#333");
              diagText.textContent = `d1: ${question.d1}`;
              svg.appendChild(diagText);
              
              // Mark d2 as unknown
              const d2Text = document.createElementNS(svgNS, "text");
              d2Text.setAttribute("x", centerX);
              d2Text.setAttribute("y", centerY - d1Half - 10);
              d2Text.setAttribute("text-anchor", "middle");
              d2Text.setAttribute("font-size", "18");
              d2Text.setAttribute("fill", "#333");
              d2Text.textContent = `d2: ?`;
              svg.appendChild(d2Text);
              
              // Show both sides
              addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
              addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
            }
          } else {
            // Perimeter is given, one side is hidden
            if (question.hiddenParam === 'a') {
              // Short side is unknown
              addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, '?', 'left');
              addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
            } else if (question.hiddenParam === 'b') {
              // Long side is unknown
              addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
              addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, '?', 'right');
            }
            
            // Show diagonals for reference
            const diagText1 = document.createElementNS(svgNS, "text");
            diagText1.setAttribute("x", centerX + 5);
            diagText1.setAttribute("y", centerY);
            diagText1.setAttribute("text-anchor", "start");
            diagText1.setAttribute("font-size", "18");
            diagText1.setAttribute("fill", "#333");
            diagText1.textContent = `d1: ${question.d1}`;
            svg.appendChild(diagText1);
            
            const diagText2 = document.createElementNS(svgNS, "text");
            diagText2.setAttribute("x", centerX);
            diagText2.setAttribute("y", centerY - d1Half - 10);
            diagText2.setAttribute("text-anchor", "middle");
            diagText2.setAttribute("font-size", "18");
            diagText2.setAttribute("fill", "#333");
            diagText2.textContent = `d2: ${question.d2}`;
            svg.appendChild(diagText2);
          }
        } else {
          // Normal question - show all information
          // Show both sides
          addDimensionLine(svg, centerX, centerY - d1Half, centerX - d2Half, centerY, `${question.a}`, 'left');
          addDimensionLine(svg, centerX, centerY - d1Half, centerX + d2Half, centerY, `${question.b}`, 'right');
          
          // Show diagonals
          const diagText1 = document.createElementNS(svgNS, "text");
          diagText1.setAttribute("x", centerX + 5);
          diagText1.setAttribute("y", centerY);
          diagText1.setAttribute("text-anchor", "start");
          diagText1.setAttribute("font-size", "18");
          diagText1.setAttribute("fill", "#333");
          diagText1.textContent = `d1: ${question.d1}`;
          svg.appendChild(diagText1);
          
          const diagText2 = document.createElementNS(svgNS, "text");
          diagText2.setAttribute("x", centerX);
          diagText2.setAttribute("y", centerY - d1Half - 10);
          diagText2.setAttribute("text-anchor", "middle");
          diagText2.setAttribute("font-size", "18");
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
    } else if (position === 'right')
    {
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