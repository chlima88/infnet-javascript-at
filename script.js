const app = {
  teamsList: ["mer", "rbr", "fer", "mcl", "alp", "alr", "alt", "ast"],
  cardList: [],
  gameState: "stopped",
  firstCard: 0,
  clickedCardsCount: 0,
  correctCardsCount: 0,
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
        this.element.innerText = `Lap Time: ${this.formatTime()}`
      }, 1)
    }
  },

  updateCardState: function(card, from, to) {
    card.classList.remove(from)
    card.classList.add(to)
  },

  setHall: function() {
    const newLapPlayer = this.buildElement({type: "p", classname: "hall__player-name"})
    newLapPlayer.innerText = this.playername
    const newLapTime = this.buildElement({type: "p", classname: "hall__player-time"})
    newLapTime.innerText = document.querySelector(".pannel__title").innerText
    const newLap = this.buildElement({type: "div", classname: "hall__player"})
    newLap.append(newLapPlayer, newLapTime)

    const hall = document.querySelector(".hall")
    // hall.append(newLap)
    hall.insertBefore(newLap, hall.children[1])

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
      }
    }, 1000)
  },

  clickCard: function(card) {
    if ( !card.classList.contains("card--correct") && ++this.clickedCardsCount <= 2 && card != this.firstCard ) {
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
    const card = this.buildElement({type: "div", classname: "card", eventListener: () => { if (this.gameState === "started") this.clickCard(card) }})
    card.pair = pair
    card.id = id
    card.append(cardFront, cardBack)
    const cardBox = this.buildElement({type: "div", classname: "card-box"})
    cardBox.appendChild(card)
    this.cardList.push(card)
    return cardBox
  },

  buildControls: function () {
    const buttonStart = this.buildElement({
      type: "button",
      text: "Start Lap",
      eventListener: () => {this.start()}
    })
    const buttonQuit = this.buildElement({
      type: "button",
      text: "Restart",
      eventListener: () => {this.reset()}
    })
    const lapTime = this.buildElement({type: "p", classname: "pannel__title", text: "Lap Time: 0:00.000s"})
    this.timer.setElement(lapTime)
    const pannel = this.buildElement({type: "div", classname: "pannel"})
    pannel.append(lapTime, buttonStart, buttonQuit)

    const hall = this.buildElement({type: "div", classname: "hall"})
    const hallTitle = this.buildElement({type: "h2", classname: "hall__title", text: "Last players"})
    const player = this.buildElement({type: "div", classname: "hall__player"})
    const playerName = this.buildElement({type: "p", classname: "hall__player-name", text: "Charles"})
    const playerTime = this.buildElement({type: "p", classname: "hall__player-time", text: "Lap Time: 0:30.000s"})

    player.append(playerName, playerTime)
    hall.append(hallTitle, player)

    const sidebar = this.buildElement({type: "div", classname: "sidebar"})
    sidebar.append(hall, pannel)
    return sidebar
  },

  buildBoard: function (pairs=8) {
    this.pairsCount = pairs
    const cardList = this.generateCardList()
    const board = this.buildElement({type: "div", classname: "board"})
    board.id = "board"
    board.append(...cardList)
    return board
  },

  generateCardList: function() {
    const cardList = []
    for (let pair = 0; pair < this.pairsCount; pair ++) {
      cardList.push(this.buildCard({id: pair, pair}))
      cardList.push(this.buildCard({id: pair + this.pairsCount , pair}))
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
      this.playername = prompt("Enter you name:")
      this.gameState = "started"
      this.timer.start()
      this.cardList.forEach(card => {
        this.updateCardState(card, "card--initial", "card--clicked")
        setTimeout(() => this.updateCardState(card, "card--clicked", "card--initial"), 3000)
      })
    }
  },

  reset: function() {
    this.timer.stop()
    this.gameState = "stopped"
    this.cardList = []
    this.clickedCard = 0
    this.correctCardsCount = 0
    this.clickedCardsCount = 0
    const component = document.getElementById("app")
    const oldBoard = document.querySelector(".board")
    const board = this.buildBoard()
    component.replaceChild(board, oldBoard)
  },

  render: function () {
    const component = document.getElementById("app")
    const controls = this.buildControls()
    const board = this.buildBoard()
    component.append(controls, board)
  }
};

(() => {
   app.render();
})();
