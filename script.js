const app = {
  teamsList: ["mer", "rbr", "fer", "mcl", "alp", "alr", "alt", "ast"],
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

  clickCard: function(card) {
    try {
      if (card.classList.contains("card--correct")) throw new Error("Cannot choose discovered pairs!")
      if (card === this.firstCard) throw new Error("Cannot choose a card twice!")
      if (this.gameState != "loading" && ++this.clickedCardsCount <= 2) {
        this.updateCardState(card, "card--initial", "card--clicked")
        if ( this.firstCard ) {
          this.checkCards(this.firstCard, card)
        } else {
          this.firstCard = card
        }
      }
    } catch(error) {
      alert(error)
    }
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
        this.updateHall()
        this.gameState = "stopped"
        this.saveGame()
      }
    }, 1500)
  },

  updateCardState: function(card, from, to) {
    card.classList.remove(from)
    card.classList.add(to)
  },

  toggleHall: function () {
    document.querySelector(".hall__list").classList.toggle("hall__list--active")
  },

  updateHall: function() {
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

    const hallList = document.querySelector(".hall__list")
    if (beatenTime) {
      hallList.insertBefore(newLap, beatenTime.parentNode)
      hallList.removeChild(hallList.lastChild)
    }
  },

  buildElement: function ({type, classname, text, eventListener}) {
    const element = document.createElement(type)
    if (classname) element.classList.add(classname)
    if (text) element.innerText = text
    if (eventListener) element.addEventListener("click", eventListener)
    return element
  },

  buildSidebar: function () {
    const startButton = this.buildElement({
      type: "button",
      classname: "controls__button",
      text: "Start Lap",
      eventListener: () => {this.start()}
    })
    const resetButton = this.buildElement({
      type: "button",
      classname: "controls__button",
      text: "Reset Game",
      eventListener: () => {this.reset()}
    })
    const lapTime = this.buildElement({type: "p", classname: "controls__title", text: "Time: 0:00.000s"})
    this.timer.setElement(lapTime)
    const controls = this.buildElement({type: "div", classname: "controls"})
    controls.append(lapTime, startButton, resetButton)

    const gameTitle = this.buildElement({type: "h1", classname: "game__title", text: "F1 Memory"})
    const hallTitle = this.buildElement({type: "h2", classname: "hall__title", text: "Hall of Fame"})
    const hallButton = this.buildElement({type: "button", classname: "hall__toggler", text: "Show/Hide", eventListener: ()=> this.toggleHall() })
    const hallList = this.buildElement({type: "ul", classname: "hall__list"})
    const hall = this.buildElement({type: "div", classname: "hall"})
    hall.append(hallTitle, hallButton, hallList)

    const sidebar = this.buildElement({type: "div", classname: "sidebar"})
    sidebar.append(gameTitle, hall, controls)
    return sidebar
  },

  buildHallLap: function({name, time}) {
    const playerName = this.buildElement({type: "p", classname: "hall__player-name"})
    playerName.innerText = name
    const playerTime = this.buildElement({type: "p", classname: "hall__player-time"})
    playerTime.innerText = time
    const newLap = this.buildElement({type: "li", classname: "hall__player", eventListener: () => { this.toggleHall()}})
    newLap.append(playerName, playerTime)
    return newLap
  },

  buildCard: function ({id, pair}) {
    const cardFront = this.buildElement({type: "div", classname: "card__front"})
    const cardBack = this.buildElement({type: "div", classname: "card__back"})
    cardBack.style.backgroundImage = `url('images/${this.teamsList[pair]}.jpg')`

    const card = this.buildElement({
      type: "div",
      classname: "card",
      eventListener: () => { this.gameState === "started" && this.clickCard(card) }
    })
    card.classList.add("card--correct")
    card.pair = pair
    card.append(cardFront, cardBack)

    const cardBox = this.buildElement({type: "div", classname: "card__box"})
    cardBox.id = id
    cardBox.appendChild(card)
    return cardBox
  },

  buildBoard: function (cardList) {
    if (!cardList) cardList = this.generateCardList(this.pairsCount)
    const board = this.buildElement({type: "div", classname: "board"})
    board.id = "board"
    board.append(...cardList)
    return board
  },

  generateCardList: function(pairs=8) {
    const cardList = []
    for (let pair = 0; pair < pairs; pair ++) {
      cardList.push(this.buildCard({id: pair, pair}))
      cardList.push(this.buildCard({id: pair + pairs , pair}))
    }
    return cardList
  },

  randomizeCardList: function (cardList) {
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

      const cardList = this.randomizeCardList(this.generateCardList())
      const newBoard = this.buildBoard(cardList)
      const board = document.getElementById("board")
      board.parentElement.replaceChild(newBoard, board)

      let input = prompt("Enter your name:")
      this.playername = (input && input.slice(0,12)) || "Player"
      this.gameState = "loading"
      this.timer.start()

      cardList.forEach(card => {
        this.updateCardState(card.children[0], "card--correct", "card--clicked")
        setTimeout(() => {
          this.updateCardState(card.children[0], "card--clicked", "card--initial")
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
    app.render()
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
    const scoreboard = document.querySelector(".hall__list")
    if (gameData){
      gameData.map(data =>  {
        const restoredLap = this.buildHallLap({name: data.name, time: data.time})
        scoreboard.appendChild(restoredLap)
      })
    }
  },

  render: function () {
    const component = document.getElementById("app")
    while (component.firstChild) component.removeChild(component.firstChild)
    const pannel = this.buildSidebar()
    const board = this.buildBoard()
    component.append(pannel, board)
    this.restoreGame()
  }
};

(() => {
   app.render();
})();
