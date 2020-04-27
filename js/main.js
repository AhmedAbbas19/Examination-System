// Function Constructor
var QuestionPack = function(
  ID,
  head,
  answer1,
  answer2,
  answer3,
  answer4,
  correctAnswer
) {
  this.ID = ID;
  this.head = head;
  this.answer1 = answer1;
  this.answer2 = answer2;
  this.answer3 = answer3;
  this.answer4 = answer4;
  this.correctAnswer = correctAnswer;
};

// Functions
function randomQuestions(questionsDB, count) {
  var questionsList = [];
  var idx = 1;
  while (questionsList.length < count) {
    var rand = Math.floor(Math.random() * count);
    if (questionsList.indexOf(questionsDB[rand]) === -1) {
      questionsDB[rand].ID = idx++;
      questionsList.push(questionsDB[rand]);
    }
  }
  return questionsList;
}

// Main
var Q1 = new QuestionPack(
  1,
  "The baby boy saw ... in the mirror and started to cry.",
  "itself",
  "herself",
  "himself",
  "themselvs",
  2
);

var Q2 = new QuestionPack(
  2,
  "A lot of trains ... late today due to the heavy storms.",
  "are run",
  "run",
  "are running",
  "runs",
  2
);

var Q3 = new QuestionPack(
  3,
  "... was a strong wind last night.",
  "there",
  "here",
  "this",
  "these",
  0
);

var Q4 = new QuestionPack(
  4,
  "When he saw the fish swimming ... the river, he was extremely happy.",
  "on",
  "besides",
  "in",
  "at",
  2
);

var Q5 = new QuestionPack(
  5,
  "It is our duty to get ... the truth",
  "to",
  "over",
  "at",
  "into",
  3
);

var Q6 = new QuestionPack(
  6,
  "The sparrows took no ... the bread.",
  "notice of",
  "notice about",
  "notice from",
  "notice to",
  3
);

var Q7 = new QuestionPack(
  7,
  "What are you so angry ...?",
  "about",
  "with",
  "on",
  "at",
  3
);

var Q8 = new QuestionPack(
  8,
  "Switzerland lies ... France, Italy,Austria and Germany,",
  "between",
  "across",
  "among",
  "beyond",
  3
);

var questionsDB = [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8];
var questionsList = randomQuestions(questionsDB, 5);

var session = {
  username: null,
  natID: null
};

// Data Controller
var DataController = (function() {
  // Data
  var data = {
    lists: {
      questions: [],
      unSolved: [],
      answers: []
    },
    examTime: 0 // In Minutes
  };

  // public
  return {
    addQuestion: function(question) {
      data.lists.questions.push(question);
    },
    setExamTime: function(examTime) {
      data.examTime = examTime;
    },
    addAnswer: function(answer) {
      var ansList = data.lists.answers;
      idx = -1;
      for (var i = 0; i < ansList.length; i++) {
        if (ansList[i].qID == answer.qID) {
          idx = i;
          break;
        }
      }
      if (idx == -1) {
        data.lists.answers.push(answer);
      } else {
        ansList[i].qAns = answer.qAns;
      }
    },
    addUnsolved: function(qID) {
      if (this.isUnsolved(qID) > -1) {
        return false;
      } else {
        data.lists.unSolved.push(qID);
        return true;
      }
    },
    removeUnsolved: function(qID) {
      var idx = this.isUnsolved(qID);
      if (idx > -1) {
        data.lists.unSolved.splice(idx, 1);
        return true;
      } else {
        return false;
      }
    },
    isUnsolved: function(qID) {
      return data.lists.unSolved.indexOf(qID);
    },
    isSolved: function(qID) {
      var ansList = data.lists.answers;
      var ans = -1;
      for (var i = 0; i < ansList.length; i++) {
        if (ansList[i].qID == qID) {
          ans = ansList[i].qAns;
          break;
        }
      }
      return ans;
    },
    getUnSolvedCount: function() {
      return data.lists.unSolved.length;
    },
    getQuestion: function(qID) {
      var qList = data.lists.questions;
      var ids = qList.map(function(cur) {
        return cur.ID;
      });
      var idx = ids.indexOf(qID);
      return qList[idx];
    },
    getMyResult: function() {
      var ans = data.lists.answers;
      var sum = 0;
      for (var i = 0; i < ans.length; i++) {
        var Q = this.getQuestion(parseInt(ans[i].qID));
        if (Q.correctAnswer == ans[i].qAns) {
          sum += 1;
        }
      }
      return sum;
    }
  };
})();

// UI Controller
var UIController = (function() {
  var examArea = document.querySelector(".exam-area");
  var question = document.querySelector(".question");
  var Qhead = document.querySelector(".question__head");
  var answers = document.querySelectorAll(".question__answer input");
  var answersLabels = document.querySelectorAll(".question__answer label");
  var Qnumber = document.querySelector(".question__number");
  var curQuestion = document.querySelector("#current-question");
  var unsolvedArea = document.querySelector(".unsolved");
  var unSolved = document.querySelector(".unsolved > ul");
  var unsolvedCount = document.querySelector(".unsolved__count");
  var nextBtn = document.querySelector("#next-btn");
  var prevBtn = document.querySelector("#prev-btn");
  var finishBtn = document.querySelector("#finish-btn");
  var examResult = document.querySelector(".exam-result");

  return {
    showQuestion(Q, questionsCount, ansIdx) {
      question.id = Q.ID;
      Qnumber.textContent = "Question #" + Q.ID;
      Qhead.textContent = Q.head;
      for (var i = 0; i < answers.length; i++) {
        answers[i].value = i;
        if (i == ansIdx) {
          answers[i].checked = true;
        } else {
          answers[i].checked = false;
        }
      }
      for (var i = 0; i < answers.length; i++) {
        answersLabels[i].textContent = Q["answer" + (i + 1)];
      }
      curQuestion.textContent = Q.ID + " / " + questionsCount;
    },
    addUnsolved: function(qID, count) {
      unSolved.innerHTML +=
        "<li class='unsolved__question' id='un-" +
        qID +
        "' onclick='AppController.unSolvedHandler(" +
        qID +
        ")'>Question #" +
        qID +
        "</li>";
      unsolvedCount.textContent = count;
    },
    removeUnsolved: function(qID, count) {
      var unSolvedQ = document.getElementById("un-" + qID);
      unSolvedQ.parentNode.removeChild(unSolvedQ);
      unsolvedCount.textContent = count - 1;
    },
    addSkippedQ: function(qID, count) {
      unSolved.innerHTML +=
        "<li class='unsolved__question' id='un-" +
        qID +
        "' onclick='AppController.unSolvedHandler(" +
        qID +
        ")'>Question #" +
        qID +
        "</li>";
      unsolvedCount.textContent = count;
    },
    disableNextBtn: function() {
      nextBtn.style.display = "none";
      finishBtn.style.display = "block";
    },
    enableNextBtn: function() {
      finishBtn.style.display = "none";
      nextBtn.style.display = "block";
    },
    disablePrevBtn: function() {
      prevBtn.disabled = true;
      prevBtn.classList.add("btn--disabled");
    },
    enablePrevBtn: function() {
      prevBtn.disabled = false;
      prevBtn.classList.remove("btn--disabled");
    },
    passedExam: function(result, time) {
      examArea.style.display = "none";
      examResult.style.display = "block";
      examResult.querySelector("img").src = "images/success.png";
      examResult.querySelector(".exam-result__title").textContent =
        "Congratulation! " + session.username + " You passed the exam";
      examResult.querySelector(".exam-result__score").textContent =
        "Your score is " + result + "%";
      examResult.querySelector(".exam-result__time").textContent =
        "Time taken is " + time.min + ":" + time.sec + " (min)";
    },
    faildExam: function(result, time) {
      examArea.style.display = "none";
      examResult.style.display = "block";
      examResult.querySelector("img").src = "images/wrong.png";
      examResult.querySelector(".exam-result__title").textContent =
        "Sorry! " + session.username + " You faild";
      examResult.querySelector(".exam-result__score").textContent =
        "Your score is " + result + "%";
      examResult.querySelector(".exam-result__time").textContent =
        "Time taken is " + time.min + ":" + time.sec + " (min)";
    },
    stopTimer: function() {
      document.querySelector(".navbar__timer").textContent = "";
    },
    showUnsolvedArea: function() {
      document.querySelector(".unsolved").style.opacity = 1;
    },
    hideUnsolved: function() {
      unsolvedArea.style.opacity = "0";
    },
    setExamTitle: function(title) {
      document.querySelector("#test-title").textContent = title;
    },
    pageNotFound: function() {
      document.querySelector("body").innerHTML =
        "<h1 class='text-center'>You Don't have the Permission to view this page</h1>";
    },
    formErrors: function(errors) {
      var errorArea = document.querySelector(".error__list");
      errorArea.innerHTML = "";
      for (var i = 0; i < errors.length; i++) {
        errorArea.innerHTML += "<li> > " + errors[i] + "</li>";
      }
    }
  };
})();

// APP Controller
var AppController = (function(dataCtrl, UICtrl) {
  // private
  var curQuestion = 0;
  var minutes, seconds, x;
  var setTimer = function(examTime) {
    var timer = document.getElementById("timeout");
    timer.textContent = examTime + ":00";
    var countDownDate = new Date().getTime() + examTime * 1000 * 60;
    x = setInterval(function() {
      var now = new Date().getTime();
      var distance = countDownDate - now;

      minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((distance % (1000 * 60)) / 1000);
      timer.textContent = minutes + ":" + seconds;

      if (minutes == 0) {
        document
          .querySelector(".navbar__timer")
          .classList.add("timer_finishing");
      }

      if (distance < 0) {
        captureQuestion();
        finishExam(examTime, 0);
        clearInterval(x);
        timer.textContent = "Time out";
      }
    }, 1000);
  };

  var nextQuestion = function(qCount) {
    UICtrl.enablePrevBtn();
    if (curQuestion + 1 < qCount) {
      curQuestion++;
    }
    if (curQuestion == qCount - 1) {
      UICtrl.disableNextBtn();
    }
  };

  var prevQuestion = function() {
    UICtrl.enableNextBtn();
    if (curQuestion > 0) {
      curQuestion--;
    }
    if (curQuestion == 0) {
      UICtrl.disablePrevBtn();
    }
  };

  var captureQuestion = function() {
    var questionID = document.querySelector(".question").id;
    var answers = document.getElementsByName("answer");
    var answer = -1;
    for (var i = 0; i < answers.length; i++) {
      if (answers[i].checked) {
        answer = answers[i].value;
        break;
      }
    }
    var unsolvedCount = dataCtrl.getUnSolvedCount();
    if (answer > -1) {
      dataCtrl.addAnswer({ qID: questionID, qAns: answer });
      if (dataCtrl.removeUnsolved(questionID)) {
        UICtrl.removeUnsolved(questionID, unsolvedCount);
      }
    } else {
      if (dataCtrl.addUnsolved(questionID)) {
        UICtrl.addUnsolved(questionID, unsolvedCount + 1);
      }
    }
    unsolvedCount = dataCtrl.getUnSolvedCount();
    if (unsolvedCount > 0) {
      UICtrl.showUnsolvedArea();
    } else {
      UICtrl.hideUnsolved();
    }
  };

  var finishExam = function(minutes, seconds) {
    var result = (dataCtrl.getMyResult() / questionsList.length) * 100;
    result = Math.ceil(result);
    if (result >= 50) {
      UICtrl.passedExam(result, { min: minutes, sec: seconds });
    } else {
      UICtrl.faildExam(result, { min: minutes, sec: seconds });
    }
    UICtrl.stopTimer();
  };

  //public
  return {
    init: function(questionsList, examTitle, examTime) {
      // Set Timer
      setTimer(examTime);
      // Set Exam Time (In Minutes)
      dataCtrl.setExamTime(examTime);
      // Set Exam Title
      UICtrl.setExamTitle(examTitle);
      // Add Exam Questions
      questionsList.forEach(function(q) {
        dataCtrl.addQuestion(q);
      });
      // Add Question UI
      UICtrl.showQuestion(questionsList[curQuestion], questionsList.length);

      // Next Btn
      document.querySelector("#next-btn").addEventListener("click", function() {
        captureQuestion();
        nextQuestion(questionsList.length);
        UICtrl.showQuestion(
          questionsList[curQuestion],
          questionsList.length,
          dataCtrl.isSolved(questionsList[curQuestion].ID)
        );
      });

      // Prev Btn
      document.querySelector("#prev-btn").addEventListener("click", function() {
        captureQuestion();
        prevQuestion();
        UICtrl.showQuestion(
          questionsList[curQuestion],
          questionsList.length,
          dataCtrl.isSolved(questionsList[curQuestion].ID)
        );
      });

      // Finish Btn
      document
        .querySelector("#finish-btn")
        .addEventListener("click", function() {
          captureQuestion();
          var unSolvedCount = dataCtrl.getUnSolvedCount();
          var finish = true;
          if (unSolvedCount > 0) {
            finish = confirm(
              "You have unsolved question(s), Are you sure to Finish"
            );
          }
          if (finish) {
            clearInterval(x);
            finishExam(examTime - minutes - 1, 60 - seconds);
          }
        });
    },
    unSolvedHandler: function(qID) {
      captureQuestion();
      if (curQuestion == questionsList.length - 1) {
        UICtrl.enableNextBtn();
      }
      if (qID == 1) {
        UICtrl.disablePrevBtn();
      }
      var Q = dataCtrl.getQuestion(qID);
      UICtrl.showQuestion(Q, questionsList.length, -1);
    },
    focusHandler: function(input) {
      input.previousElementSibling.classList.add("active-label");
    },
    formValidation: function() {
      var username = document.querySelector('input[name="username"]').value;
      var natID = document.querySelector('input[name="natID"]').value;
      var errors = [];
      var valid = true;
      if (username.length < 5) {
        errors.push("Username can't be less than 8 letters");
        valid = false;
      } else if (!isNaN(username)) {
        errors.push("Username MUST contain letters");
        valid = false;
      }
      if (natID.length < 15) {
        errors.push("National ID MUST consists of 15 Numbers");
        valid = false;
      } else if (isNaN(natID)) {
        errors.push("Invalid National ID");
        valid = false;
      }
      if (!valid) {
        UICtrl.formErrors(errors);
      }
      return valid;
    },
    startExam: function() {
      var url = new URL(window.location.href);
      session.username = url.searchParams.get("username");
      session.natID = url.searchParams.get("natID");
      if (session.username !== null && session.natID !== null) {
        // Initialize the exam
        AppController.init(questionsList, "English Test", 5);
      } else {
        UICtrl.pageNotFound();
      }
    }
  };
})(DataController, UIController);
