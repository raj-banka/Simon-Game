let starter = false;

let gameSeq = [];
let userSeq = [];

let level = 0;
let highS = document.querySelector(".highS");
let highScr = highS.innerText;
let btns = ["red", "yellow", "blue", "green"];

let h3 = document.querySelector("h3");
document.addEventListener("keydown", function () {
  if (starter == false) {
    starter = true;
    levelUp();
  }
});

function btnflash(btn) {
  btn.classList.add("flash");
  setTimeout(function () {
    btn.classList.remove("flash");
  }, 250);
}

function userflash(btn) {
  btn.classList.add("userflash");
  setTimeout(function () {
    btn.classList.remove("userflash");
  }, 250);
}

function levelUp() {
  userSeq = [];
  level++;
  h3.innerText = `Level ${level}`;

  let ranIndex = Math.floor(Math.random() * 4);
  let ranCol = btns[ranIndex];
  let ranBtn = document.querySelector(`.${ranCol}`);
  btnflash(ranBtn);
  gameSeq.push(ranCol);
//   console.log(gameSeq);
}

function checkAns(idx) {
  if (gameSeq[idx] === userSeq[idx]) {
    if (gameSeq.length === userSeq.length) {
      setTimeout(levelUp, 500);
      setHighScore(level);
    }
  } else {
      let body = document.querySelector("body");
      body.style.backgroundColor = "rgb(252, 109, 109)";
      h3.innerHTML = `Game Over!!! your score was <b> ${level - 1}</b> <br> Press any key to Restart.`;
    setTimeout(function () {
      body.style.backgroundColor = "white";
    }, 250);
    reset();
  }
}

function btnPress() {
  let btn = this;
  userflash(btn);

  let usercolor = btn.getAttribute("id");
  userSeq.push(usercolor);
//   console.log(usercolor);
  checkAns(userSeq.length - 1);
}

let Btns = document.querySelectorAll(".btn");
for (btn of Btns) {
  btn.addEventListener("click", btnPress);
}

function reset() {
  starter = false;
  gameSeq = [];
  userSeq = [];
  level = 0;
}

function setHighScore(lev){
    if(highScr < lev ){
        highScr = lev ;
        highS.innerText = highScr;
    }
}