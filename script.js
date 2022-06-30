const app = {
  teamsList: ["mer", "rbr", "fer", "mcl", "alp", "alr", "alt", "ast"],
  cardList: [],
  gameState: "stopped",
  firstCard: 0,
  clickedCardsCount: 0,
  correctCardsCount: 0,
  pairsCount: 8,
  timer: {
    milli: 0,
    seconds: 0,
    minutes: 0,
    startTime: 0,
    element: 0,
    job: 0,

    setElement: function (element) {
      this.element = element
    },

    start: function () {
      if (this.element && !this.job) {
        this.startTime = new Date()
        this.job = this.schedule()
      } else {
        return this.stop()
      }
    },

    stop: function () {
      clearInterval(this.job)
      this.job = 0
    },

    formatTime: function () {
      return `${this.minutes}:${("00"+this.seconds).slice(-2)}.${("00"+this.milli).slice(-3)}s`
    },

    schedule: function () {
      return setInterval(() => {
        const currentTime = new Date()
        const elapsedTime = currentTime - this.startTime
        this.milli = elapsedTime % 1000
        this.seconds = Math.floor((elapsedTime / 1000) % 60)
        this.minutes = Math.floor((elapsedTime / 1000) / 60)
        this.element.innerText = `Time: ${this.formatTime()}`
      }, 1)
    }
  },

  updateCardState: function(card, from, to) {
    card.classList.remove(from)
    card.classList.add(to)
  },

  setHall: function() {
    const playerTime = document.querySelector(".controls__title").innerText

    const newLap = this.buildHallLap({name: this.playername, time: playerTime})
    const currentTimeText = playerTime.split(' ')[1].slice(0, -1)
    const currentTime = new Date(`1 0:${currentTimeText}`)

    const scoreboard =  document.querySelectorAll(".hall__player-time")
    const beatenTime = Array.prototype.find.call(scoreboard, scoreboardLap => {
      const scoreboardLapText = scoreboardLap.innerText.split(' ')[1].slice(0, -1)
      const scoreboardLapTime = new Date(`1 0:${scoreboardLapText}`)
      return scoreboardLapTime > currentTime
    })

    const hall = document.querySelector(".hall")
    beatenTime
      ? hall.insertBefore(newLap, beatenTime.parentNode)
      : hall.appendChild(newLap)

    hall.childElementCount >= 11 && hall.removeChild(hall.lastChild)

  },

  checkCards: function(card1, card2) {
    setTimeout(() => {
      let newState
      if (card1.pair === card2.pair) {
        newState = "card--correct"
        this.correctCardsCount += 2
      } else {
        newState = "card--initial"
      }
      this.updateCardState(card1, "card--clicked", newState)
      this.updateCardState(card2, "card--clicked", newState)
      this.firstCard = 0
      this.clickedCardsCount = 0
      if (this.correctCardsCount  === this.pairsCount * 2) {
        this.timer.stop()
        alert("Congratulations! You won!")
        this.setHall()
        this.gameState = "stopped"
        this.saveGame()
      }
    }, 1000)
  },

  clickCard: function(card) {
    if ( !card.classList.contains("card--correct")
    && ++this.clickedCardsCount <= 2
    && card != this.firstCard
    && this.gameState != "loading" ) {
      if ( this.firstCard ) {
        this.updateCardState(card, "card--initial", "card--clicked")
        this.checkCards(this.firstCard, card)
      } else {
        this.updateCardState(card, "card--initial", "card--clicked")
        this.firstCard = card
      }
    }
  },

  buildElement: function ({type, classname, text, eventListener}) {
    const element = document.createElement(type)
    if (classname) element.classList.add(classname)
    if (text) element.innerText = text
    if (eventListener) element.addEventListener("click", eventListener)
    return element
  },

  buildCard: function ({id, pair}) {
    const cardFront = this.buildElement({type: "div", classname: "card-front"})
    const cardBack = this.buildElement({type: "div", classname: "card-back"})
    cardBack.style.backgroundImage = `url('../images/${this.teamsList[pair]}.jpg')`

    const card = this.buildElement({
      type: "div",
      classname: "card",
      eventListener: () => { this.gameState === "started" && this.clickCard(card) }})
    card.pair = pair
    card.id = id
    card.append(cardFront, cardBack)

    const cardBox = this.buildElement({type: "div", classname: "card-box"})
    cardBox.appendChild(card)
    return cardBox
  },

  buildPannel: function () {
    const buttonStart = this.buildElement({
      type: "button",
      classname: "controls__button",
      text: "Start Lap",
      eventListener: () => {this.start()}
    })
    const buttonQuit = this.buildElement({
      type: "button",
      classname: "controls__button",
      text: "Reset Game",
      eventListener: () => {this.reset()}
    })
    const lapTime = this.buildElement({type: "p", classname: "controls__title", text: "Lap Time: 0:00.000s"})
    this.timer.setElement(lapTime)
    const controls = this.buildElement({type: "div", classname: "controls"})
    controls.append(lapTime, buttonStart, buttonQuit)

    const hall = this.buildElement({type: "ul", classname: "hall"})
    const gameTitle = this.buildElement({type: "h1", classname: "game__title", text: "F1 Memory"})
    const hallTitle = this.buildElement({type: "h2", classname: "hall__title", text: "Hall of Fame"})
    // hall.append(hallTitle)

    const sidebar = this.buildElement({type: "div", classname: "sidebar"})
    sidebar.append(gameTitle, hallTitle, hall, controls)
    return sidebar
  },

  buildHallLap: function({name, time}) {
    const playerName = this.buildElement({type: "p", classname: "hall__player-name"})
    playerName.innerText = name
    const playerTime = this.buildElement({type: "p", classname: "hall__player-time"})
    playerTime.innerText = time
    const newLap = this.buildElement({type: "li", classname: "hall__player"})
    newLap.append(playerName, playerTime)
    return newLap
  },

  buildBoard: function (pairs=this.pairsCount) {
    const cardList = this.generateCardList(pairs)
    const board = this.buildElement({type: "div", classname: "board"})
    board.id = "board"
    board.append(...cardList)
    return board
  },

  generateCardList: function(pairs) {
    const cardList = []
    for (let pair = 0; pair < pairs; pair ++) {
      cardList.push(this.buildCard({id: pair, pair}))
      cardList.push(this.buildCard({id: pair + pairs , pair}))
    }
    const randomizedCardList = new Set()
    while (randomizedCardList.size != cardList.length) {
      const randomIndex = Math.floor(Math.random() * cardList.length)
      randomizedCardList.add(cardList[randomIndex])
    }
    return randomizedCardList
  },

  start: function () {
    if (this.gameState === "stopped"){
      this.reset()
      this.playername = prompt("Enter your name:").slice(0,12) || "Player"
      this.gameState = "loading"
      this.timer.start()
      const cardList = document.querySelectorAll(".card")
      Array.prototype.forEach.call(cardList, card => {
        this.updateCardState(card, "card--initial", "card--clicked")
        setTimeout(() => {
          this.updateCardState(card, "card--clicked", "card--initial")
          this.gameState = "started"
        }, 3000)
      })
    }
  },

  reset: function() {
    this.timer.stop()
    this.gameState = "stopped"
    this.clickedCard = 0
    this.correctCardsCount = 0
    this.clickedCardsCount = 0
    const component = document.getElementById("app")
    const oldBoard = document.querySelector(".board")
    const board = this.buildBoard()
    component.replaceChild(board, oldBoard)
  },

  saveGame: function () {
    const scoreboard =  document.querySelectorAll(".hall__player")
    const gameData = Array.prototype.map.call(scoreboard, data =>  ({
        name: data.children[0].innerText,
        time: data.children[1].innerText
      }))

    localStorage.setItem("f1memory", JSON.stringify(gameData))
  },

  restoreGame: function() {
    const gameData = JSON.parse(localStorage.getItem("f1memory"))
    const scoreboard = document.querySelector(".hall")

    if (gameData){
      gameData.map(data =>  {
        const restoredLap = this.buildHallLap({name: data.name, time: data.time})
        scoreboard.appendChild(restoredLap)
      })
    }
  },

  render: function () {
    const component = document.getElementById("app")
    const pannel = this.buildPannel()
    const board = this.buildBoard()
    component.append(pannel, board)
    this.restoreGame()
  }
};

(() => {
   app.render();
})();
